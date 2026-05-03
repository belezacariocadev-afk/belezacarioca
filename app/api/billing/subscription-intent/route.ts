import { NextResponse } from 'next/server';

import type { PartnerReferralSource } from '@/lib/partner/program';
import {
  persistPartnerAttributionFromSubscriptionIntent,
  type PersistPartnerAttributionResult,
} from '@/lib/partner/persistence';
import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import {
  createPlatformSession,
  platformSessionCookieName,
  platformSessionMaxAgeSeconds,
  serializePlatformSession,
} from '@/lib/platform/auth/session';
import { isEstablishmentProfile } from '@/lib/platform/auth/session';
import {
  createSubscriptionIntentRecord,
  isSubscriptionPlanChoice,
  type SubscriptionIntentPayload,
  type SubscriptionIntentRecord,
  type SubscriptionIntentStatus,
  type SubscriptionPlanChoice,
} from '@/lib/platform/billing/subscription-intent';
import {
  createAsaasSubscriptionCheckout,
  isInvalidAsaasCpfCnpjError,
  isInvalidAsaasMobilePhoneError,
} from '@/lib/platform/billing/asaas-checkout';
import { evaluateCommercialAccess } from '@/lib/platform/billing/commercial-access-policy';
import {
  isProfessionalRangeId,
  resolveSubscriptionPricing,
  type ProfessionalRangeId,
} from '@/lib/platform/billing/subscription-pricing';
import {
  createLocalSubscriptionRecord,
  localSubscriptionCookieMaxAgeSeconds,
  localSubscriptionCookieName,
  serializeLocalSubscriptionCookie,
} from '@/lib/platform/billing/local-subscription';
import { isSupabaseDataSourceRequested } from '@/lib/platform/supabase/config';
import { resolveSupabaseCommercialAccess } from '@/lib/platform/supabase/auth-adapter';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';
import { createInitialPlatformData } from '@/lib/platform/data/seed';
import type { AsaasSubscriptionCheckout } from '@/lib/platform/billing/asaas-checkout';

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  return new URL(request.url).protocol === 'https:';
}

type SubscriptionIntentRequest = {
  displayedAmountCents?: number | null;
  planName?: string | null;
  partnerReferralCode?: string | null;
  partnerReferralSource?: PartnerReferralSource | null;
  professionalRange?: ProfessionalRangeId | null;
  professionalRangeLabel?: string | null;
  reason?: string | null;
  selectedPlan?: SubscriptionPlanChoice;
};

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  id: string;
  salon_id: string | null;
};

type SubscriptionIntentRow = {
  amount_cents?: number;
  id: string;
  actor_id: string;
  commercial_access: unknown | null;
  created_at: string;
  email: string;
  partner_referral_code: string | null;
  partner_referral_source: PartnerReferralSource | null;
  profile_id: string;
  professional_range?: string;
  plan_label?: string;
  reason: string | null;
  salon_id: string;
  selected_plan: SubscriptionPlanChoice;
  source: 'subscriptionPage';
  status: SubscriptionIntentStatus;
  updated_at: string;
};

type SubscriptionIntentCheckoutPayload = {
  ok: true;
  checkoutUrl: string;
  paymentId: string;
  subscriptionIntentId: string;
};

function normalizePartnerCode(value?: string | null) {
  const partnerCode = value?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 64);

  return partnerCode || undefined;
}

function normalizePartnerReferralSource(source?: PartnerReferralSource | null, fallbackCode?: string | null): PartnerReferralSource | undefined {
  const partnerCode = normalizePartnerCode(source?.partnerCode ?? fallbackCode);

  if (!partnerCode) {
    return undefined;
  }

  return {
    capturedAt: source?.capturedAt ?? new Date().toISOString(),
    channel: source?.channel ?? (fallbackCode ? 'manual' : 'unknown'),
    landingPath: source?.landingPath,
    partnerCode,
    queryParam: source?.queryParam,
    visitorKey: source?.visitorKey?.slice(0, 120),
  };
}

function isDatabaseUuidSyntaxError(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes('invalid input syntax for type uuid');
}

async function resolveCommercialAccessSnapshot(session: NonNullable<ReturnType<typeof readPlatformSessionFromRequest>>) {
  if (session.authProvider !== 'supabase' || !session.providerAccessToken) {
    return session.commercialAccess;
  }

  return resolveSupabaseCommercialAccess({
    profileId: session.profileId,
    providerAccessToken: session.providerAccessToken,
    salonId: session.salonId,
  }).catch((error: unknown) => {
    console.error('[subscription-intent] Falha ao atualizar acesso comercial:', error);
    return session.commercialAccess;
  });
}

async function findSessionProfile(session: NonNullable<ReturnType<typeof readPlatformSessionFromRequest>>) {
  const encodedSalonId = encodeURIComponent(session.salonId);
  const candidates: ProfileRow[] = [];
  const seen = new Set<string>();

  async function append(query: string) {
    const rows = await supabaseRestRequest<ProfileRow[]>('profiles', {
      query,
      useServiceRole: true,
    });

    for (const row of rows) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        candidates.push(row);
      }
    }
  }

  if (session.supabaseUserId) {
    await append(`id=eq.${encodeURIComponent(session.supabaseUserId)}&select=id,salon_id,email,full_name&limit=1`);
  }

  await append(`id=eq.${encodeURIComponent(session.actorId)}&select=id,salon_id,email,full_name&limit=1`);
  await append(`email=eq.${encodeURIComponent(session.email)}&salon_id=eq.${encodedSalonId}&select=id,salon_id,email,full_name&limit=3`);

  return candidates.find((profile) => profile.salon_id === session.salonId) ?? candidates.find((profile) => !profile.salon_id) ?? null;
}

async function markIntentSentToCheckout(intentId: string) {
  await supabaseRestRequest('subscription_intents', {
    body: {
      status: 'sentToCheckout',
      updated_at: new Date().toISOString(),
    },
    method: 'PATCH',
    prefer: 'return=minimal',
    query: `id=eq.${encodeURIComponent(intentId)}`,
    useServiceRole: true,
  });
}

async function insertSubscriptionIntentRow(row: SubscriptionIntentRow) {
  try {
    await supabaseRestRequest<null>('subscription_intents', {
      body: [row],
      method: 'POST',
      prefer: 'return=minimal',
      useServiceRole: true,
    });
  } catch (error) {
    if (!(error instanceof Error) || !isMissingSubscriptionIntentPricingColumn(error)) {
      throw error;
    }

    const { amount_cents: _amountCents, plan_label: _planLabel, professional_range: _professionalRange, ...fallbackRow } = row;

    await supabaseRestRequest<null>('subscription_intents', {
      body: [fallbackRow],
      method: 'POST',
      prefer: 'return=minimal',
      useServiceRole: true,
    });
  }
}

function isMissingSubscriptionIntentPricingColumn(error: Error) {
  const message = error.message.toLowerCase();

  return (
    message.includes('pgrst204') ||
    (message.includes('column') &&
      (message.includes('amount_cents') || message.includes('professional_range') || message.includes('plan_label')))
  );
}

export async function POST(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria para registrar a intencao.' }, { status: 401 });
  }

  if (!isEstablishmentProfile(session.profileId)) {
    return NextResponse.json({ message: 'A assinatura e exclusiva do estabelecimento.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as SubscriptionIntentRequest;

  if (!isSubscriptionPlanChoice(body.selectedPlan)) {
    return NextResponse.json({ message: 'Escolha um plano valido para continuar.' }, { status: 400 });
  }

  const professionalRange = isProfessionalRangeId(body.professionalRange) ? body.professionalRange : '1-2';
  const pricing = resolveSubscriptionPricing({
    professionalRange,
    selectedPlan: body.selectedPlan,
  });

  console.info('[subscription-intent] Preco calculado para checkout Asaas', {
    amountCents: pricing.amountCents,
    cycle: body.selectedPlan,
    planKey: body.selectedPlan,
    professionalRange: pricing.professionalRange,
  });

  if (!session.salonId) {
    return NextResponse.json({ message: 'Sessao sem salao vinculado.' }, { status: 403 });
  }

  let profile: ProfileRow | null = null;

  if (isSupabaseDataSourceRequested()) {
    try {
      profile = await findSessionProfile(session);
    } catch (error) {
      console.error('[subscription-intent] Falha ao resolver profile da sessao:', error);

      return NextResponse.json({ message: 'Nao foi possivel validar o perfil do usuario.' }, { status: 503 });
    }

    if (profile?.salon_id && profile.salon_id !== session.salonId) {
      return NextResponse.json({ message: 'Usuario sem acesso ao salao informado pela sessao.' }, { status: 403 });
    }

    if (!profile && session.authProvider === 'supabase') {
      return NextResponse.json({ message: 'Perfil do usuario nao encontrado para este salao.' }, { status: 403 });
    }
  }

  const commercialAccess = await resolveCommercialAccessSnapshot(session);
  const actorId = session.supabaseUserId ?? session.actorId;
  const profileId = profile?.id ?? session.actorId;
  const salonId = profile?.salon_id ?? session.salonId;
  const partnerReferralSource = normalizePartnerReferralSource(body.partnerReferralSource, body.partnerReferralCode);
  const intent = createSubscriptionIntentRecord({
    actorId,
    commercialAccess,
    email: session.email,
    partnerReferralSource,
    profileId,
    reason: body.reason,
    salonId,
    selectedPlan: body.selectedPlan,
  });
  let partnerAttribution: PersistPartnerAttributionResult | undefined;

  if (isSupabaseDataSourceRequested()) {
    let checkout: AsaasSubscriptionCheckout;

    try {
      await insertSubscriptionIntentRow(toSubscriptionIntentRow(intent, pricing));

      checkout = await createAsaasSubscriptionCheckout({
        actorEmail: session.email,
        actorName: profile?.full_name,
        amountCents: pricing.amountCents,
        intentId: intent.id,
        planLabel: pricing.planLabel,
        profileId,
        professionalRangeLabel: pricing.professionalRangeLabel,
        salonId,
        selectedPlan: intent.selectedPlan,
      });

      await markIntentSentToCheckout(intent.id);

      if (intent.partnerReferralSource) {
        partnerAttribution = await persistPartnerAttributionFromSubscriptionIntent({
          partnerReferralSource: intent.partnerReferralSource,
          salonId,
          selectedPlan: intent.selectedPlan,
        });
      }
    } catch (error) {
      console.error('[subscription-intent] Falha ao registrar intencao de assinatura:', error);

      if (isInvalidAsaasMobilePhoneError(error)) {
        return NextResponse.json(
          {
            message: 'O telefone do estabelecimento está inválido. Atualize o telefone no perfil antes de ativar o plano.',
          },
          { status: 400 },
        );
      }

      if (isInvalidAsaasCpfCnpjError(error)) {
        return NextResponse.json(
          {
            message: 'Informe um CPF ou CNPJ válido no cadastro do estabelecimento antes de ativar o plano.',
          },
          { status: 400 },
        );
      }

      if (isDatabaseUuidSyntaxError(error)) {
        return NextResponse.json(
          {
            message: 'Não foi possível registrar a cobrança do plano. Tente novamente em instantes.',
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          message: 'Não foi possível ativar o plano agora. Tente novamente em instantes.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json<SubscriptionIntentCheckoutPayload>({
      ok: true,
      checkoutUrl: checkout.checkoutUrl,
      paymentId: checkout.paymentId,
      subscriptionIntentId: intent.id,
    });
  }

  const subscription = createLocalSubscriptionRecord(body.selectedPlan, session.salonId);
  const localCommercialAccess = evaluateCommercialAccess({
    profileId: session.profileId,
    salon: createInitialPlatformData().salon,
    subscription,
  });

  const updatedSession = createPlatformSession(session.email, session.profileId, {
    actorId: session.actorId,
    authProvider: session.authProvider,
    providerAccessToken: session.providerAccessToken,
    providerRefreshToken: session.providerRefreshToken,
    supabaseUserId: session.supabaseUserId,
    salonId: session.salonId,
    commercialAccess: localCommercialAccess,
  });

  const response = NextResponse.json<SubscriptionIntentPayload>({
    intent,
    partnerAttribution,
    persistedTo: 'local',
  });

  response.cookies.set(platformSessionCookieName, serializePlatformSession(updatedSession), {
    httpOnly: true,
    maxAge: platformSessionMaxAgeSeconds,
    path: '/',
    sameSite: 'lax',
    secure: isSecureRequest(request),
  });

  response.cookies.set(localSubscriptionCookieName, serializeLocalSubscriptionCookie(subscription), {
    httpOnly: false,
    maxAge: localSubscriptionCookieMaxAgeSeconds,
    path: '/',
    sameSite: 'lax',
    secure: isSecureRequest(request),
  });

  return response;
}

function toSubscriptionIntentRow(
  intent: SubscriptionIntentRecord,
  pricing?: ReturnType<typeof resolveSubscriptionPricing>,
): SubscriptionIntentRow {
  return {
    amount_cents: pricing?.amountCents,
    id: intent.id,
    actor_id: intent.actorId,
    commercial_access: intent.commercialAccess ?? null,
    created_at: intent.createdAt,
    email: intent.email,
    partner_referral_code: intent.partnerReferralSource?.partnerCode ?? null,
    partner_referral_source: intent.partnerReferralSource ?? null,
    plan_label: pricing?.planLabel,
    profile_id: intent.profileId,
    professional_range: pricing?.professionalRange,
    reason: intent.reason ?? null,
    salon_id: intent.salonId,
    selected_plan: intent.selectedPlan,
    source: intent.source,
    status: intent.status,
    updated_at: intent.updatedAt,
  };
}
