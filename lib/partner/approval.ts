import { isLocalPartnerTestEmail } from '@/lib/partner/localTestPartner';
import {
  appendPartnerTemporaryAccessMarker,
  consumePartnerTemporaryPassword,
  generateTemporaryPartnerPassword,
  stripPartnerTemporaryAccessMarker,
} from '@/lib/partner/temporaryAccess';
import { deleteSupabaseAuthUser, ensureSupabaseAuthUserWithPassword } from '@/lib/platform/supabase/auth-admin';
import { getSupabaseRuntimeConfig } from '@/lib/platform/supabase/config';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

export type PartnerApprovalStatus = 'pending' | 'approved' | 'rejected' | 'blocked';
export type PartnerApprovalResolution = PartnerApprovalStatus | 'notFound' | 'unavailable';

export type PartnerApprovalDecision = {
  isApproved: boolean;
  message: string;
  source: 'env' | 'fallback' | 'supabase';
  status: PartnerApprovalResolution;
};

type PartnerAccessRequestRow = {
  additional_message?: string | null;
  already_works_with_beauty?: boolean;
  area_of_work?: string;
  city?: string;
  created_at: string;
  email: string;
  full_name: string;
  id: string;
  referral_plan?: string;
  status: PartnerApprovalStatus;
  state?: string;
  updated_at: string;
  whatsapp: string;
  company: string | null;
};

type PartnerRow = {
  code: string;
  company_name: string | null;
  created_at: string;
  email: string;
  full_name: string | null;
  id: string;
  phone: string | null;
  status: PartnerApprovalStatus;
  updated_at: string;
  user_id: string | null;
};

export type PartnerLeadRecordInput = {
  additionalMessage?: string;
  alreadyWorksWithBeauty: '' | 'sim' | 'nao';
  areaOfWork: string;
  city: string;
  company?: string;
  email: string;
  fullName: string;
  referralPlan: string;
  state: string;
  whatsapp: string;
};

export type PartnerLeadRecordResult = {
  requestId: string;
  status: PartnerApprovalStatus;
};

export type PartnerRequestStatusDetails = {
  createdAt: string;
  email: string;
  fullName: string;
  id: string;
  status: PartnerApprovalStatus;
  temporaryPassword: string | null;
  temporaryPasswordViewedAt: string | null;
  updatedAt: string;
};

export type PartnerAdminRequestRecord = {
  additionalMessage: string | null;
  alreadyWorksWithBeauty: boolean;
  areaOfWork: string;
  city: string;
  company: string | null;
  createdAt: string;
  email: string;
  fullName: string;
  id: string;
  partnerCode: string | null;
  referralPlan: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  reviewedBy: string | null;
  status: PartnerApprovalStatus;
  state: string;
  updatedAt: string;
  whatsapp: string;
};

export type PartnerAccessRequestDeleteResult = {
  deletedAuthUser: boolean;
  deletedPartner: boolean;
  deletedReferrals: boolean;
  requestId: string;
};

const DEFAULT_PENDING_MESSAGE =
  'Seu acesso ainda esta em analise. Assim que for aprovado, voce podera entrar no painel do parceiro.';
const DEFAULT_REJECTED_MESSAGE =
  'Sua solicitacao nao foi aprovada no momento. Se quiser, fale com o time da Beleza Carioca para uma nova analise.';
const DEFAULT_BLOCKED_MESSAGE =
  'Seu acesso de parceiro foi bloqueado. Entre em contato com o suporte para verificar os proximos passos.';
const DEFAULT_UNAVAILABLE_MESSAGE =
  'Nao foi possivel validar seu status de parceiro agora. Tente novamente em instantes ou fale com o suporte.';

const partnerRequestSelect =
  'id,email,full_name,whatsapp,company,status,created_at,updated_at';
const partnerRequestStatusSelect =
  'id,email,full_name,whatsapp,company,status,review_notes,created_at,updated_at';
const partnerRequestAdminSelect =
  'id,email,full_name,whatsapp,city,state,company,area_of_work,referral_plan,already_works_with_beauty,additional_message,status,reviewed_by,reviewed_at,review_notes,created_at,updated_at';
const partnerSelect =
  'id,user_id,code,full_name,email,phone,company_name,status,created_at,updated_at';

function parseEmailList(value?: string) {
  if (!value) {
    return new Set<string>();
  }

  return new Set(
    value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePartnerName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPartnerCodePrefix(input: { email: string; fullName: string }) {
  const fromName = normalizePartnerName(input.fullName)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .join('-')
    .toUpperCase();
  const fromEmail = input.email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() ?? 'PARCEIRO';
  const base = fromName || fromEmail || 'PARCEIRO';

  return `BC-${base.slice(0, 14)}`;
}

function randomCodeSuffix() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';

  for (let index = 0; index < 4; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return suffix;
}

function canUsePartnerPersistence() {
  const config = getSupabaseRuntimeConfig();
  return Boolean(config?.serviceRoleKey);
}

function getStatusFromEnvironment(email: string): PartnerApprovalStatus | null {
  const blockedEmails = parseEmailList(process.env.PARTNER_BLOCKED_EMAILS);
  const approvedEmails = parseEmailList(process.env.PARTNER_APPROVED_EMAILS);
  const rejectedEmails = parseEmailList(process.env.PARTNER_REJECTED_EMAILS);

  if (blockedEmails.has(email)) {
    return 'blocked';
  }

  if (rejectedEmails.has(email)) {
    return 'rejected';
  }

  if (approvedEmails.has(email)) {
    return 'approved';
  }

  return null;
}

async function findPartnerByEmail(email: string) {
  const partners = await supabaseRestRequest<PartnerRow[]>('partners', {
    query: `email=eq.${encodeURIComponent(email)}&select=${partnerSelect}&limit=1`,
    useServiceRole: true,
  });

  return partners[0] ?? null;
}

function isMissingTableError(error: unknown, tableName: string) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes(`Could not find the table 'public.${tableName}'`) ||
    error.message.includes(`Could not find the table '${tableName}'`)
  );
}

async function findPartnerStatusByEmail(email: string): Promise<PartnerApprovalStatus | 'notFound'> {
  const partner = await findPartnerByEmail(email);

  if (partner) {
    return partner.status;
  }

  const accessRequests = await supabaseRestRequest<PartnerAccessRequestRow[]>('partner_access_requests', {
    query: `email=eq.${encodeURIComponent(email)}&select=email,status&limit=1`,
    useServiceRole: true,
  });

  return accessRequests[0]?.status ?? 'notFound';
}

function buildDecisionByStatus(
  status: PartnerApprovalResolution,
  source: PartnerApprovalDecision['source'],
): PartnerApprovalDecision {
  if (status === 'approved') {
    return {
      isApproved: true,
      message: 'Acesso liberado. Entrando no painel do parceiro...',
      source,
      status,
    };
  }

  if (status === 'rejected') {
    return {
      isApproved: false,
      message: DEFAULT_REJECTED_MESSAGE,
      source,
      status,
    };
  }

  if (status === 'blocked') {
    return {
      isApproved: false,
      message: DEFAULT_BLOCKED_MESSAGE,
      source,
      status,
    };
  }

  if (status === 'unavailable') {
    return {
      isApproved: false,
      message: DEFAULT_UNAVAILABLE_MESSAGE,
      source,
      status,
    };
  }

  return {
    isApproved: false,
    message: DEFAULT_PENDING_MESSAGE,
    source,
    status,
  };
}

async function ensureUniquePartnerCode(input: { email: string; fullName: string }) {
  const prefix = toPartnerCodePrefix(input);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = `${prefix}-${randomCodeSuffix()}`;
    const matches = await supabaseRestRequest<Array<{ id: string }>>('partners', {
      query: `code=eq.${encodeURIComponent(candidate)}&select=id&limit=1`,
      useServiceRole: true,
    });

    if (!matches[0]) {
      return candidate;
    }
  }

  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

async function upsertPartnerFromApproval(input: {
  email: string;
  fullName: string;
  status: PartnerApprovalStatus;
  whatsapp: string;
  company?: string | null;
  userId?: string | null;
}) {
  const current = await findPartnerByEmail(input.email);
  const partnerCode = current?.code ?? (await ensureUniquePartnerCode({ email: input.email, fullName: input.fullName }));

  await supabaseRestRequest('partners', {
    body: [
      {
        code: partnerCode,
        company_name: input.company ?? null,
        email: input.email,
        full_name: input.fullName,
        phone: input.whatsapp,
        status: input.status,
        user_id: input.userId ?? current?.user_id ?? null,
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    query: 'on_conflict=email',
    useServiceRole: true,
  });
}

async function patchExistingPartnerStatus(email: string, status: PartnerApprovalStatus) {
  await supabaseRestRequest('partners', {
    body: {
      status,
    },
    method: 'PATCH',
    query: `email=eq.${encodeURIComponent(email)}`,
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

async function safeSelectRows<T>(table: string, query: string) {
  try {
    return await supabaseRestRequest<T[]>(table, {
      query,
      useServiceRole: true,
    });
  } catch (error) {
    if (isMissingTableError(error, table)) {
      return [];
    }

    throw error;
  }
}

async function safeDeleteRows(table: string, query: string) {
  try {
    await supabaseRestRequest<null>(table, {
      method: 'DELETE',
      prefer: 'return=minimal',
      query,
      useServiceRole: true,
    });
    return true;
  } catch (error) {
    if (isMissingTableError(error, table)) {
      return false;
    }

    throw error;
  }
}

async function canDeletePartnerAuthUser(userId: string, partnerEmail: string) {
  const normalizedEmail = partnerEmail.trim().toLowerCase();
  const [profiles, salonUsers, otherPartners] = await Promise.all([
    safeSelectRows<{ id: string; role?: string | null }>(
      'profiles',
      `id=eq.${encodeURIComponent(userId)}&select=id,role&limit=1`,
    ),
    safeSelectRows<{ id: string }>(
      'salon_users',
      `user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`,
    ),
    safeSelectRows<{ id: string }>(
      'partners',
      `user_id=eq.${encodeURIComponent(userId)}&email=neq.${encodeURIComponent(normalizedEmail)}&select=id&limit=1`,
    ),
  ]);

  if (salonUsers.length > 0 || otherPartners.length > 0) {
    return false;
  }

  if (profiles.length === 0) {
    return true;
  }

  return profiles.every((profile) => {
    const role = profile.role?.trim().toLowerCase().replace(/[\s_-]+/g, '');
    return role === 'partner' || role === 'parceiro';
  });
}

export async function resolvePartnerApprovalDecision(email: string): Promise<PartnerApprovalDecision> {
  const normalizedEmail = normalizeEmail(email);

  if (isLocalPartnerTestEmail(normalizedEmail)) {
    return buildDecisionByStatus('approved', 'fallback');
  }

  const envStatus = getStatusFromEnvironment(normalizedEmail);

  if (envStatus) {
    return buildDecisionByStatus(envStatus, 'env');
  }

  if (!canUsePartnerPersistence()) {
    return buildDecisionByStatus('unavailable', 'fallback');
  }

  try {
    const status = await findPartnerStatusByEmail(normalizedEmail);
    return buildDecisionByStatus(status, 'supabase');
  } catch (error) {
    console.error('Falha ao validar status de parceiro:', error);
    return buildDecisionByStatus('unavailable', 'supabase');
  }
}

export async function upsertPartnerLeadRecord(payload: PartnerLeadRecordInput): Promise<PartnerLeadRecordResult | null> {
  if (!canUsePartnerPersistence()) {
    return null;
  }

  const normalizedEmail = normalizeEmail(payload.email);
  const existingRows = await supabaseRestRequest<PartnerAccessRequestRow[]>('partner_access_requests', {
    query: `email=eq.${encodeURIComponent(normalizedEmail)}&select=${partnerRequestSelect}&limit=1`,
    useServiceRole: true,
  });
  const existing = existingRows[0] ?? null;
  const targetStatus: PartnerApprovalStatus =
    existing?.status === 'approved' || existing?.status === 'blocked' ? existing.status : 'pending';

  const rows = await supabaseRestRequest<PartnerAccessRequestRow[]>('partner_access_requests', {
    body: [
      {
        additional_message: payload.additionalMessage || null,
        already_works_with_beauty: payload.alreadyWorksWithBeauty === 'sim',
        area_of_work: payload.areaOfWork,
        city: payload.city,
        company: payload.company || null,
        email: normalizedEmail,
        full_name: payload.fullName,
        referral_plan: payload.referralPlan,
        review_notes: targetStatus === 'pending' ? null : undefined,
        reviewed_at: targetStatus === 'pending' ? null : undefined,
        reviewed_by: targetStatus === 'pending' ? null : undefined,
        state: payload.state,
        status: targetStatus,
        whatsapp: payload.whatsapp,
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    query: 'on_conflict=email',
    useServiceRole: true,
  });

  const inserted = rows[0] ?? existing;

  if (!inserted) {
    return null;
  }

  return {
    requestId: inserted.id,
    status: inserted.status,
  };
}

export async function getPartnerRequestStatusById(requestId: string): Promise<PartnerRequestStatusDetails | null> {
  if (!canUsePartnerPersistence()) {
    return null;
  }

  const rows = await supabaseRestRequest<Array<PartnerAccessRequestRow & { review_notes: string | null }>>('partner_access_requests', {
    query: `id=eq.${encodeURIComponent(requestId)}&select=${partnerRequestStatusSelect}&limit=1`,
    useServiceRole: true,
  });
  const row = rows[0];

  if (!row) {
    return null;
  }

  const temporaryAccess =
    row.status === 'approved'
      ? consumePartnerTemporaryPassword(row.review_notes)
      : {
          nextReviewNotes: row.review_notes,
          password: null,
          viewedAt: null,
        };

  if (row.status === 'approved' && temporaryAccess.nextReviewNotes !== row.review_notes) {
    await supabaseRestRequest('partner_access_requests', {
      body: {
        review_notes: temporaryAccess.nextReviewNotes,
      },
      method: 'PATCH',
      query: `id=eq.${encodeURIComponent(row.id)}`,
      prefer: 'return=minimal',
      useServiceRole: true,
    });
  }

  return {
    createdAt: row.created_at,
    email: row.email,
    fullName: row.full_name,
    id: row.id,
    status: row.status,
    temporaryPassword: temporaryAccess.password,
    temporaryPasswordViewedAt: temporaryAccess.viewedAt ?? null,
    updatedAt: row.updated_at,
  };
}

export async function listPartnerAccessRequestsForAdmin(input?: {
  status?: PartnerApprovalStatus | 'all';
}): Promise<PartnerAdminRequestRecord[]> {
  if (!canUsePartnerPersistence()) {
    return [];
  }

  const queryParts = [`select=${partnerRequestAdminSelect}`, 'order=created_at.desc', 'limit=500'];

  if (input?.status && input.status !== 'all') {
    queryParts.unshift(`status=eq.${encodeURIComponent(input.status)}`);
  }

  const [requests, partners] = await Promise.all([
    supabaseRestRequest<
      Array<
        PartnerAccessRequestRow & {
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
        }
      >
    >('partner_access_requests', {
      query: queryParts.join('&'),
      useServiceRole: true,
    }),
    supabaseRestRequest<PartnerRow[]>('partners', {
      query: `select=${partnerSelect}&limit=2000`,
      useServiceRole: true,
    }),
  ]);
  const partnerByEmail = new Map(partners.map((partner) => [partner.email, partner]));

  return requests.map((request) => ({
    additionalMessage: request.additional_message ?? null,
    alreadyWorksWithBeauty: Boolean(request.already_works_with_beauty),
    areaOfWork: request.area_of_work ?? '',
    city: request.city ?? '',
    company: request.company,
    createdAt: request.created_at,
    email: request.email,
    fullName: request.full_name,
    id: request.id,
    partnerCode: partnerByEmail.get(request.email)?.code ?? null,
    referralPlan: request.referral_plan ?? '',
    reviewedAt: request.reviewed_at,
    reviewNotes: stripPartnerTemporaryAccessMarker(request.review_notes),
    reviewedBy: request.reviewed_by,
    status: request.status,
    state: request.state ?? '',
    updatedAt: request.updated_at,
    whatsapp: request.whatsapp,
  }));
}

export async function updatePartnerAccessRequestStatusForAdmin(input: {
  requestId: string;
  reviewedBy: string;
  reviewNotes?: string;
  status: PartnerApprovalStatus;
}): Promise<PartnerAdminRequestRecord | null> {
  if (!canUsePartnerPersistence()) {
    return null;
  }

  const requests = await supabaseRestRequest<PartnerAccessRequestRow[]>('partner_access_requests', {
    query: `id=eq.${encodeURIComponent(input.requestId)}&select=${partnerRequestSelect}&limit=1`,
    useServiceRole: true,
  });
  const request = requests[0];

  if (!request) {
    return null;
  }

  const reviewNotes = input.reviewNotes?.trim() ? input.reviewNotes.trim().slice(0, 1400) : null;
  const reviewedBy = input.reviewedBy.trim().slice(0, 120);
  const nowIso = new Date().toISOString();
  const temporaryPassword = input.status === 'approved' ? generateTemporaryPartnerPassword() : null;
  const authUser = temporaryPassword
    ? await ensureSupabaseAuthUserWithPassword({
        email: request.email,
        fullName: request.full_name,
        password: temporaryPassword,
        role: 'partner',
      })
    : null;
  const storedReviewNotes = temporaryPassword
    ? appendPartnerTemporaryAccessMarker({
        authUserId: authUser?.id,
        password: temporaryPassword,
        reviewNotes,
      })
    : stripPartnerTemporaryAccessMarker(reviewNotes);

  const updatedRows = await supabaseRestRequest<
    Array<
      PartnerAccessRequestRow & {
        review_notes: string | null;
        reviewed_at: string | null;
        reviewed_by: string | null;
      }
    >
  >('partner_access_requests', {
    body: {
      reviewed_at: nowIso,
      reviewed_by: reviewedBy,
      review_notes: storedReviewNotes,
      status: input.status,
    },
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(input.requestId)}&select=${partnerRequestAdminSelect}`,
    prefer: 'return=representation',
    useServiceRole: true,
  });
  const updated = updatedRows[0];

  if (!updated) {
    return null;
  }

  if (input.status === 'approved') {
    await upsertPartnerFromApproval({
      company: updated.company,
      email: updated.email,
      fullName: updated.full_name,
      status: 'approved',
      whatsapp: updated.whatsapp,
      userId: authUser?.id ?? null,
    });
  } else {
    const existingPartner = await findPartnerByEmail(updated.email);

    if (existingPartner) {
      await patchExistingPartnerStatus(updated.email, input.status);
    }
  }

  const partner = await findPartnerByEmail(updated.email);

  return {
    additionalMessage: updated.additional_message ?? null,
    alreadyWorksWithBeauty: Boolean(updated.already_works_with_beauty),
    areaOfWork: updated.area_of_work ?? '',
    city: updated.city ?? '',
    company: updated.company,
    createdAt: updated.created_at,
    email: updated.email,
    fullName: updated.full_name,
    id: updated.id,
    partnerCode: partner?.code ?? null,
    referralPlan: updated.referral_plan ?? '',
    reviewedAt: updated.reviewed_at,
    reviewNotes: stripPartnerTemporaryAccessMarker(updated.review_notes),
    reviewedBy: updated.reviewed_by,
    status: updated.status,
    state: updated.state ?? '',
    updatedAt: updated.updated_at,
    whatsapp: updated.whatsapp,
  };
}

export async function deletePartnerAccessRequestForAdmin(input: {
  requestId: string;
}): Promise<PartnerAccessRequestDeleteResult | null> {
  if (!canUsePartnerPersistence()) {
    return null;
  }

  const requests = await supabaseRestRequest<PartnerAccessRequestRow[]>('partner_access_requests', {
    query: `id=eq.${encodeURIComponent(input.requestId)}&select=${partnerRequestSelect}&limit=1`,
    useServiceRole: true,
  });
  const request = requests[0];

  if (!request) {
    return null;
  }

  const normalizedEmail = normalizeEmail(request.email);
  const partner = await findPartnerByEmail(normalizedEmail);

  if (partner) {
    const [conversions, commissions] = await Promise.all([
      safeSelectRows<{ id: string }>(
        'partner_conversions',
        `partner_id=eq.${encodeURIComponent(partner.id)}&select=id&limit=1`,
      ),
      safeSelectRows<{ id: string }>(
        'partner_commissions',
        `partner_id=eq.${encodeURIComponent(partner.id)}&select=id&limit=1`,
      ),
    ]);

    if (conversions.length > 0 || commissions.length > 0) {
      throw new Error(
        'Este parceiro possui historico financeiro ou conversoes. Para preservar auditoria, use Bloquear em vez de Excluir.',
      );
    }
  }

  const deletedReferrals = partner
    ? await safeDeleteRows('partner_referrals', `partner_id=eq.${encodeURIComponent(partner.id)}`)
    : false;

  let deletedAuthUser = false;

  if (partner?.user_id && (await canDeletePartnerAuthUser(partner.user_id, normalizedEmail))) {
    await safeDeleteRows('profiles', `id=eq.${encodeURIComponent(partner.user_id)}`);
    await deleteSupabaseAuthUser(partner.user_id);
    deletedAuthUser = true;
  }

  const deletedPartner = partner
    ? await safeDeleteRows('partners', `id=eq.${encodeURIComponent(partner.id)}`)
    : false;

  await safeDeleteRows('partner_access_requests', `id=eq.${encodeURIComponent(request.id)}`);

  return {
    deletedAuthUser,
    deletedPartner,
    deletedReferrals,
    requestId: request.id,
  };
}
