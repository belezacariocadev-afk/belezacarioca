import { NextResponse } from 'next/server';

import {
  deleteSupabaseAuthUser,
  ensureSupabaseAuthUserWithPassword,
  findSupabaseAuthUserByEmail,
} from '@/lib/platform/supabase/auth-admin';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type EstablishmentSignupRequest = {
  category?: string;
  city?: string;
  cpfCnpj?: string;
  email?: string;
  ownerName?: string;
  password?: string;
  neighborhood?: string;
  salonName?: string;
  state?: string;
  whatsapp?: string;
};

type SalonRow = {
  id: string;
};

type ProfileRow = {
  email: string | null;
  id: string;
  role: string | null;
  salon_id: string | null;
};

type AuthUserRow = Awaited<ReturnType<typeof findSupabaseAuthUserByEmail>>;

const EMAIL_EXISTS_MESSAGE = 'Este e-mail já possui cadastro. Entre no portal ou use outro e-mail.';
const PHONE_EXISTS_MESSAGE = 'Este telefone já está cadastrado. Use outro número ou faça login.';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeCpfCnpj(value: string) {
  return value.replace(/\D/g, '');
}

function isValidCpfCnpj(value: string) {
  return value.length === 11 || value.length === 14;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 54);
}

function isRecoverableEstablishmentAuthUser(user: AuthUserRow) {
  const metadata = user?.user_metadata ?? {};
  const role = String(metadata.role ?? metadata.role_seed ?? '').toLowerCase();

  return role === 'owner';
}

function errorMessageFromSignupFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  const isUniqueViolation =
    lowerMessage.includes('23505') ||
    lowerMessage.includes('duplicate') ||
    lowerMessage.includes('unique') ||
    lowerMessage.includes('already exists') ||
    lowerMessage.includes('ja existe') ||
    lowerMessage.includes('já existe');
  const mentionsPhone =
    lowerMessage.includes('telefone') ||
    lowerMessage.includes('phone') ||
    lowerMessage.includes('whatsapp') ||
    lowerMessage.includes('numero de telefone') ||
    lowerMessage.includes('número de telefone');

  if (isUniqueViolation && mentionsPhone) {
    return PHONE_EXISTS_MESSAGE;
  }

  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already registered') || lowerMessage.includes('already exists')) {
    return EMAIL_EXISTS_MESSAGE;
  }

  if (lowerMessage.includes('salons_billing_cycle_check')) {
    return 'O ciclo de cobranca do salao nao e aceito pelo schema atual. O trial sera criado sem ciclo de cobranca pago.';
  }

  if (lowerMessage.includes('salons_booking_mode_check')) {
    return 'O modo de agendamento do salao nao e aceito pelo schema atual. O cadastro inicial sera criado sem modo de agendamento definido.';
  }

  if (lowerMessage.includes('salons_plan_code_check')) {
    return 'O plano do salao nao e aceito pelo schema atual. O cadastro inicial sera criado sem plano pago definido.';
  }

  if (lowerMessage.includes('violates check constraint')) {
    return 'O cadastro encontrou uma regra de validacao do banco que precisa ser alinhada ao schema atual.';
  }

  if (lowerMessage.includes('column') && lowerMessage.includes('does not exist')) {
    return 'O cadastro encontrou uma coluna ausente no banco. Verifique as migrations do schema.';
  }

  if (lowerMessage.includes('invalid input value for enum') && lowerMessage.includes('role')) {
    return 'O perfil do responsável usa um tipo de acesso inválido para o schema atual.';
  }

  if (lowerMessage.includes('row-level security') || lowerMessage.includes('permission denied')) {
    return 'O Supabase bloqueou a gravação por permissão. Verifique a policy/RLS dessa tabela.';
  }

  if (lowerMessage.includes('null value') || lowerMessage.includes('not-null')) {
    return 'Um campo obrigatório do banco não foi enviado corretamente.';
  }

  return 'Nao foi possivel concluir o cadastro agora. Tente novamente.';
}

async function getExistingSignupState(email: string) {
  const emailFilter = encodeURIComponent(email);
  const [profiles, salons] = await Promise.all([
    supabaseRestRequest<ProfileRow[]>('profiles', {
      query: `email=eq.${emailFilter}&select=id,email,salon_id,role&limit=5`,
      useServiceRole: true,
    }),
    supabaseRestRequest<SalonRow[]>('salons', {
      query: `email=eq.${emailFilter}&select=id&limit=1`,
      useServiceRole: true,
    }),
  ]);

  return {
    hasLinkedProfile: profiles.some((profile) => Boolean(profile.salon_id)),
    hasSalon: Boolean(salons[0]?.id),
    incompleteProfile: profiles.find((profile) => !profile.salon_id) ?? null,
  };
}

async function findExistingSalonByPhone(phone: string) {
  const normalizedPhone = normalizePhone(phone);
  const phoneFilters = Array.from(new Set([phone, normalizedPhone].filter(Boolean)))
    .map((value) => `phone.eq.${encodeURIComponent(value)}`)
    .join(',');
  const query = phoneFilters
    ? `or=(${phoneFilters})&select=id&limit=1`
    : `phone=eq.${encodeURIComponent(phone)}&select=id&limit=1`;
  const rows = await supabaseRestRequest<SalonRow[]>('salons', {
    query,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function rollbackFailedSignup(input: { authUserId?: string; email: string; profileId?: string; salonId?: string }) {
  const failures: unknown[] = [];

  if (input.profileId) {
    await supabaseRestRequest('profiles', {
      method: 'DELETE',
      query: `id=eq.${encodeURIComponent(input.profileId)}`,
      useServiceRole: true,
    }).catch((error) => {
      failures.push(error);
    });
  }

  if (input.salonId) {
    await supabaseRestRequest('salons', {
      method: 'DELETE',
      query: `id=eq.${encodeURIComponent(input.salonId)}`,
      useServiceRole: true,
    }).catch((error) => {
      failures.push(error);
    });
  }

  if (input.authUserId) {
    await deleteSupabaseAuthUser(input.authUserId).catch((error) => {
      failures.push(error);
    });
  }

  if (failures.length > 0) {
    console.error('[establishment-signup] Falha ao limpar cadastro incompleto', {
      email: input.email,
      failures,
      authUserId: input.authUserId,
      profileId: input.profileId,
      salonId: input.salonId,
    });
  }
}

export async function POST(request: Request) {
  let createdAuthUserId: string | undefined;
  let createdProfileId: string | undefined;
  let createdSalonId: string | undefined;
  let emailForLog = '';

  try {
    const body = (await request.json().catch(() => ({}))) as EstablishmentSignupRequest;
    const ownerName = body.ownerName?.trim() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password?.trim() ?? '';
    const neighborhood = body.neighborhood?.trim() ?? '';
    const salonName = body.salonName?.trim() ?? '';
    const cpfCnpj = normalizeCpfCnpj(body.cpfCnpj ?? '');
    const whatsapp = body.whatsapp?.trim() ?? '';
    const whatsappDigits = normalizePhone(whatsapp);
    const city = body.city?.trim() ?? '';
    const state = body.state?.trim().toUpperCase() ?? '';
    const category = body.category?.trim() ?? '';
    emailForLog = email;

    if (!ownerName || !salonName || !cpfCnpj || !whatsapp || !neighborhood || !city || !state || !category) {
      return NextResponse.json({ message: 'Preencha todos os campos obrigatorios.' }, { status: 400 });
    }

    if (!isValidCpfCnpj(cpfCnpj)) {
      return NextResponse.json({ message: 'Informe um CPF ou CNPJ válido.' }, { status: 400 });
    }

    if (whatsappDigits.length < 10) {
      return NextResponse.json({ message: 'Informe um telefone ou WhatsApp valido.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: 'Use um e-mail valido.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'A senha precisa ter pelo menos 8 caracteres.' }, { status: 400 });
    }

    const existingUser = await findSupabaseAuthUserByEmail(email);
    const existingSignupState = await getExistingSignupState(email);
    const existingSalonByPhone = await findExistingSalonByPhone(whatsapp);

    if (existingSalonByPhone) {
      return NextResponse.json(
        {
          code: 'phone_exists',
          message: PHONE_EXISTS_MESSAGE,
        },
        { status: 409 },
      );
    }

    if (
      existingSignupState.hasSalon ||
      existingSignupState.hasLinkedProfile ||
      (existingUser && !isRecoverableEstablishmentAuthUser(existingUser) && !existingSignupState.incompleteProfile)
    ) {
      return NextResponse.json(
        {
          code: 'email_exists',
          message: EMAIL_EXISTS_MESSAGE,
        },
        { status: 409 },
      );
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const salonId = crypto.randomUUID();
    const baseSlug = slugify(salonName) || `salao-${salonId.slice(0, 8)}`;
    const slug = `${baseSlug}-${salonId.slice(0, 8)}`;

    const user = await ensureSupabaseAuthUserWithPassword({
      email,
      fullName: ownerName,
      password,
      role: 'owner',
    });
    createdAuthUserId = existingUser ? undefined : user.id;

    const salons = await supabaseRestRequest<SalonRow[]>('salons', {
      method: 'POST',
      body: [
        {
          id: salonId,
          name: salonName,
          cpf_cnpj: cpfCnpj,
          phone: whatsapp,
          email,
          city,
          state,
          neighborhood,
          category,
          slug,
          is_public: false,
          featured: false,
          subscription_status: 'trial_active',
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
          current_period_start: now.toISOString(),
          current_period_end: trialEndsAt.toISOString(),
          installation_paid: false,
          trial_used: true,
          plan_name: 'Teste gratis',
          plan_code: null,
          billing_cycle: null,
          booking_mode: null,
        },
      ],
      prefer: 'return=representation',
      useServiceRole: true,
    });

    const salon = salons[0];

    if (!salon?.id) {
      throw new Error('Nao foi possivel criar o salao.');
    }
    createdSalonId = salon.id;

    if (existingSignupState.incompleteProfile) {
      await supabaseRestRequest('profiles', {
        method: 'PATCH',
        query: `id=eq.${encodeURIComponent(existingSignupState.incompleteProfile.id)}`,
        body: {
          salon_id: salon.id,
          full_name: ownerName,
          email,
          role: 'owner',
        },
        prefer: 'return=minimal',
        useServiceRole: true,
      });
    } else {
      await supabaseRestRequest('profiles', {
        method: 'POST',
        body: [
          {
            id: user.id,
            salon_id: salon.id,
            full_name: ownerName,
            email,
            role: 'owner',
          },
        ],
        prefer: 'return=minimal',
        useServiceRole: true,
      });
      createdProfileId = user.id;
    }

    return NextResponse.json({
      email,
      salonId: salon.id,
      trialEndsAt: trialEndsAt.toISOString(),
    });
  } catch (error) {
    console.error('[establishment-signup] Falha ao criar cadastro de estabelecimento', {
      email: emailForLog,
      error,
      authUserId: createdAuthUserId,
      profileId: createdProfileId,
      salonId: createdSalonId,
    });

    if (createdSalonId || createdProfileId || createdAuthUserId) {
      await rollbackFailedSignup({
        authUserId: createdAuthUserId,
        email: emailForLog,
        profileId: createdProfileId,
        salonId: createdSalonId,
      });
    }

    const message = errorMessageFromSignupFailure(error);
    const code =
      message === EMAIL_EXISTS_MESSAGE
        ? 'email_exists'
        : message === PHONE_EXISTS_MESSAGE
          ? 'phone_exists'
          : 'signup_failed';

    return NextResponse.json(
      {
        code,
        details: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.message : undefined,
        message,
      },
      { status: code === 'signup_failed' ? 500 : 409 },
    );
  }
}
