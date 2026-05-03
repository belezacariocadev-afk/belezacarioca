import type { SubscriptionPlanChoice } from '@/lib/platform/billing/subscription-intent';
import { getSupabaseRuntimeConfig } from '@/lib/platform/supabase/config';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';
import type { PartnerReferralSource, PartnerStatus, ReferralConversionStatus, SubscriptionStatus } from '@/lib/partner/program';

type PartnerRow = {
  code: string;
  company_name: string | null;
  created_at: string;
  email: string;
  full_name: string | null;
  id: string;
  phone: string | null;
  status: PartnerStatus;
  updated_at: string;
  user_id: string | null;
};

type PartnerReferralRow = {
  created_at: string;
  id: string;
  landing_path: string | null;
  partner_id: string;
  raw_ref: string | null;
  referral_code: string;
  referral_source: 'manual' | 'queryParam' | 'unknown';
  referred_account_type: 'customer' | 'establishment' | null;
  visitor_key: string | null;
};

type PartnerConversionRow = {
  conversion_status: ReferralConversionStatus;
  created_at: string;
  first_paid_at: string | null;
  id: string;
  partner_id: string;
  payment_status: 'canceled' | 'confirmed' | 'failed' | 'pending' | 'refunded' | null;
  referral_id: string | null;
  salon_id: string;
  subscription_status: SubscriptionStatus | null;
  updated_at: string;
};

type PartnerCommissionRow = {
  amount: string | null;
  canceled_at: string | null;
  conversion_id: string | null;
  created_at: string;
  currency: string;
  generated_at: string | null;
  id: string;
  paid_at: string | null;
  partner_id: string;
  rule_snapshot: Record<string, unknown> | null;
  salon_id: string;
  status: 'approved' | 'canceled' | 'paid' | 'pending';
  updated_at: string;
};

type SubscriptionStatusRow = {
  status: Exclude<SubscriptionStatus, 'none'>;
};

type SalonNameRow = {
  id: string;
  name: string;
};

type PersistPartnerAttributionInput = {
  partnerReferralSource: PartnerReferralSource;
  salonId: string;
  selectedPlan: SubscriptionPlanChoice;
};

export type PersistPartnerAttributionResult =
  | {
      status: 'linked';
      conversionId: string;
      partnerId: string;
      referralId?: string;
    }
  | {
      status: 'partner_not_found';
      partnerCode: string;
    }
  | {
      status: 'skipped';
      reason: 'persistence_disabled' | 'salon_missing' | 'source_missing';
    };

type ReferralCaptureInput = {
  landingPath?: string;
  partnerCode: string;
  queryParam?: string;
  rawRef?: string;
  referredAccountType?: 'customer' | 'establishment' | null;
  visitorKey?: string;
};

export type ReferralCaptureResult =
  | {
      status: 'captured';
      partnerId: string;
      referralId: string;
    }
  | {
      status: 'partner_not_found';
      partnerCode: string;
    }
  | {
      status: 'skipped';
      reason: 'persistence_disabled' | 'source_missing';
    };

const partnerSelect =
  'id,user_id,code,full_name,email,phone,company_name,status,created_at,updated_at';
const referralSelect =
  'id,partner_id,referral_code,referred_account_type,landing_path,raw_ref,visitor_key,referral_source,created_at';
const conversionSelect =
  'id,partner_id,salon_id,referral_id,conversion_status,subscription_status,payment_status,first_paid_at,created_at,updated_at';
const commissionSelect =
  'id,partner_id,salon_id,conversion_id,status,amount,currency,rule_snapshot,generated_at,paid_at,canceled_at,created_at,updated_at';

export function normalizePartnerCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 64);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function canUsePartnerPersistence() {
  const config = getSupabaseRuntimeConfig();
  return Boolean(config?.serviceRoleKey);
}

export async function resolvePartnerByCode(code: string) {
  const normalizedCode = normalizePartnerCode(code);

  if (!normalizedCode || !canUsePartnerPersistence()) {
    return null;
  }

  const rows = await supabaseRestRequest<PartnerRow[]>('partners', {
    query: `code=eq.${encodeURIComponent(normalizedCode)}&select=${partnerSelect}&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

export async function resolvePartnerByIdentity(identity: { email?: string; supabaseUserId?: string }) {
  if (!canUsePartnerPersistence()) {
    return null;
  }

  const normalizedEmail = identity.email ? normalizeEmail(identity.email) : null;

  if (identity.supabaseUserId) {
    const byUserId = await supabaseRestRequest<PartnerRow[]>('partners', {
      query: `user_id=eq.${encodeURIComponent(identity.supabaseUserId)}&select=${partnerSelect}&limit=1`,
      useServiceRole: true,
    });

    if (byUserId[0]) {
      return byUserId[0];
    }
  }

  if (!normalizedEmail) {
    return null;
  }

  const byEmail = await supabaseRestRequest<PartnerRow[]>('partners', {
    query: `email=eq.${encodeURIComponent(normalizedEmail)}&select=${partnerSelect}&limit=1`,
    useServiceRole: true,
  });

  return byEmail[0] ?? null;
}

async function createPartnerReferral(input: {
  partnerId: string;
  referralCode: string;
  landingPath?: string;
  rawRef?: string;
  referredAccountType?: 'customer' | 'establishment' | null;
  referralSource?: 'manual' | 'queryParam' | 'unknown';
  visitorKey?: string;
}) {
  const rows = await supabaseRestRequest<PartnerReferralRow[]>('partner_referrals', {
    body: [
      {
        landing_path: input.landingPath ?? null,
        partner_id: input.partnerId,
        raw_ref: input.rawRef ?? null,
        referral_code: normalizePartnerCode(input.referralCode),
        referral_source: input.referralSource ?? 'unknown',
        referred_account_type: input.referredAccountType ?? null,
        visitor_key: input.visitorKey ?? null,
      },
    ],
    method: 'POST',
    prefer: 'return=representation',
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function findLatestReferralByVisitorKey(input: {
  landingPath?: string;
  partnerId: string;
  visitorKey: string;
}) {
  const baseQuery = [
    `partner_id=eq.${encodeURIComponent(input.partnerId)}`,
    `visitor_key=eq.${encodeURIComponent(input.visitorKey)}`,
    `select=${referralSelect}`,
    'order=created_at.desc',
    'limit=1',
  ];

  if (input.landingPath) {
    baseQuery.unshift(`landing_path=eq.${encodeURIComponent(input.landingPath)}`);
  }

  const rows = await supabaseRestRequest<PartnerReferralRow[]>('partner_referrals', {
    query: baseQuery.join('&'),
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function getSubscriptionStatusBySalonId(salonId: string): Promise<SubscriptionStatus> {
  const rows = await supabaseRestRequest<SubscriptionStatusRow[]>('subscriptions', {
    query: `salon_id=eq.${encodeURIComponent(salonId)}&select=status&order=created_at.desc&limit=1`,
    useServiceRole: true,
  });

  return rows[0]?.status ?? 'none';
}

async function upsertPartnerConversion(input: {
  conversionStatus: ReferralConversionStatus;
  firstPaidAt: string | null;
  partnerId: string;
  paymentStatus: 'canceled' | 'confirmed' | 'failed' | 'pending' | 'refunded' | null;
  referralId: string | null;
  salonId: string;
  subscriptionStatus: SubscriptionStatus;
}) {
  const rows = await supabaseRestRequest<PartnerConversionRow[]>('partner_conversions', {
    body: [
      {
        conversion_status: input.conversionStatus,
        first_paid_at: input.firstPaidAt,
        partner_id: input.partnerId,
        payment_status: input.paymentStatus,
        referral_id: input.referralId,
        salon_id: input.salonId,
        subscription_status: input.subscriptionStatus,
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    query: 'on_conflict=partner_id,salon_id',
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function ensureSalonExists(salonId: string) {
  const rows = await supabaseRestRequest<Array<{ id: string }>>('salons', {
    query: `id=eq.${encodeURIComponent(salonId)}&select=id&limit=1`,
    useServiceRole: true,
  });

  return Boolean(rows[0]);
}

export async function capturePartnerReferral(input: ReferralCaptureInput): Promise<ReferralCaptureResult> {
  const normalizedCode = normalizePartnerCode(input.partnerCode);

  if (!normalizedCode) {
    return {
      status: 'skipped',
      reason: 'source_missing',
    };
  }

  if (!canUsePartnerPersistence()) {
    return {
      status: 'skipped',
      reason: 'persistence_disabled',
    };
  }

  const partner = await resolvePartnerByCode(normalizedCode);

  if (!partner || partner.status !== 'approved') {
    return {
      status: 'partner_not_found',
      partnerCode: normalizedCode,
    };
  }

  const referral = await createPartnerReferral({
    landingPath: input.landingPath,
    partnerId: partner.id,
    rawRef: input.rawRef ?? normalizedCode,
    referralCode: normalizedCode,
    referralSource: 'queryParam',
    referredAccountType: input.referredAccountType ?? null,
    visitorKey: input.visitorKey,
  });

  if (!referral) {
    return {
      status: 'skipped',
      reason: 'source_missing',
    };
  }

  return {
    status: 'captured',
    partnerId: partner.id,
    referralId: referral.id,
  };
}

export async function persistPartnerAttributionFromSubscriptionIntent(
  input: PersistPartnerAttributionInput,
): Promise<PersistPartnerAttributionResult> {
  if (!input.partnerReferralSource.partnerCode) {
    return {
      status: 'skipped',
      reason: 'source_missing',
    };
  }

  if (!canUsePartnerPersistence()) {
    return {
      status: 'skipped',
      reason: 'persistence_disabled',
    };
  }

  const salonExists = await ensureSalonExists(input.salonId);

  if (!salonExists) {
    return {
      status: 'skipped',
      reason: 'salon_missing',
    };
  }

  const normalizedCode = normalizePartnerCode(input.partnerReferralSource.partnerCode);
  const partner = await resolvePartnerByCode(normalizedCode);

  if (!partner || partner.status !== 'approved') {
    return {
      status: 'partner_not_found',
      partnerCode: normalizedCode,
    };
  }

  const visitorKey = input.partnerReferralSource.visitorKey ?? undefined;
  const existingReferral =
    visitorKey
      ? await findLatestReferralByVisitorKey({
          landingPath: input.partnerReferralSource.landingPath,
          partnerId: partner.id,
          visitorKey,
        })
      : null;
  const referral =
    existingReferral ??
    (await createPartnerReferral({
      landingPath: input.partnerReferralSource.landingPath,
      partnerId: partner.id,
      rawRef: input.partnerReferralSource.queryParam ?? normalizedCode,
      referralCode: normalizedCode,
      referralSource: input.partnerReferralSource.channel ?? 'unknown',
      referredAccountType: 'establishment',
      visitorKey,
    }));

  const subscriptionStatus = await getSubscriptionStatusBySalonId(input.salonId);
  const conversionStatus: ReferralConversionStatus = 'subscribed';
  const paymentStatus: PartnerConversionRow['payment_status'] = 'pending';
  const conversion = await upsertPartnerConversion({
    conversionStatus,
    firstPaidAt: null,
    partnerId: partner.id,
    paymentStatus,
    referralId: referral?.id ?? null,
    salonId: input.salonId,
    subscriptionStatus,
  });

  if (!conversion) {
    return {
      status: 'skipped',
      reason: 'source_missing',
    };
  }

  return {
    status: 'linked',
    conversionId: conversion.id,
    partnerId: partner.id,
    ...(referral?.id ? { referralId: referral.id } : {}),
  };
}

export async function listPartnerReferrals(partnerId: string) {
  if (!canUsePartnerPersistence()) {
    return [] as PartnerReferralRow[];
  }

  return supabaseRestRequest<PartnerReferralRow[]>('partner_referrals', {
    query: `partner_id=eq.${encodeURIComponent(partnerId)}&select=${referralSelect}&order=created_at.desc&limit=500`,
    useServiceRole: true,
  });
}

export async function listPartnerConversions(partnerId: string) {
  if (!canUsePartnerPersistence()) {
    return [] as PartnerConversionRow[];
  }

  return supabaseRestRequest<PartnerConversionRow[]>('partner_conversions', {
    query: `partner_id=eq.${encodeURIComponent(partnerId)}&select=${conversionSelect}&order=created_at.desc&limit=500`,
    useServiceRole: true,
  });
}

export async function listPartnerCommissions(partnerId: string) {
  if (!canUsePartnerPersistence()) {
    return [] as PartnerCommissionRow[];
  }

  return supabaseRestRequest<PartnerCommissionRow[]>('partner_commissions', {
    query: `partner_id=eq.${encodeURIComponent(partnerId)}&select=${commissionSelect}&order=created_at.desc&limit=500`,
    useServiceRole: true,
  });
}

export async function listSalonsByIds(salonIds: string[]) {
  if (!canUsePartnerPersistence()) {
    return [] as SalonNameRow[];
  }

  const uniqueIds = Array.from(new Set(salonIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return [] as SalonNameRow[];
  }

  const orQuery = uniqueIds.map((id) => `id.eq.${encodeURIComponent(id)}`).join(',');

  return supabaseRestRequest<SalonNameRow[]>('salons', {
    query: `or=(${orQuery})&select=id,name`,
    useServiceRole: true,
  });
}

export type {
  PartnerRow,
  PartnerReferralRow,
  PartnerConversionRow,
  PartnerCommissionRow,
  SalonNameRow,
};
