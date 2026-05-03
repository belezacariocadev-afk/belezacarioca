import type { PlatformSession } from '@/lib/platform/auth/session';
import {
  createDefaultPartnerData,
  type ConversionStatus,
  type LeadStatus,
  type PartnerAreaData,
  type PartnerConversion,
  type PartnerLead,
} from '@/lib/partner/mockData';
import type { PartnerReferralSource, ReferralConversionStatus } from '@/lib/partner/program';
import {
  canUsePartnerPersistence,
  listPartnerCommissions,
  listPartnerConversions,
  listPartnerReferrals,
  listSalonsByIds,
  resolvePartnerByIdentity,
  type PartnerCommissionRow,
  type PartnerConversionRow,
  type PartnerReferralRow,
  type PartnerRow,
  type SalonNameRow,
} from '@/lib/partner/persistence';

const partnerPortalBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://belezacarioca.com';

function toCentValue(value: string | null) {
  if (!value) {
    return 0;
  }

  const numericValue = Number.parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(numericValue * 100);
}

function formatMonthLabel(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}

function mapPartnerRoleLabel(status: PartnerRow['status']) {
  if (status === 'approved') {
    return 'Parceiro aprovado';
  }

  if (status === 'pending') {
    return 'Parceiro em analise';
  }

  if (status === 'blocked') {
    return 'Parceiro bloqueado';
  }

  return 'Parceiro rejeitado';
}

function mapLeadStatus(status: ReferralConversionStatus): LeadStatus {
  if (status === 'paid') {
    return 'convertido';
  }

  if (status === 'canceled') {
    return 'nao_avancou';
  }

  if (status === 'qualified' || status === 'subscribed') {
    return 'proposta_enviada';
  }

  if (status === 'registered') {
    return 'em_contato';
  }

  return 'novo';
}

function mapConversionStatus(status: ReferralConversionStatus): ConversionStatus {
  if (status === 'paid') {
    return 'paid';
  }

  if (status === 'subscribed') {
    return 'subscribed';
  }

  if (status === 'qualified' || status === 'registered' || status === 'clicked') {
    return 'qualified';
  }

  return 'canceled';
}

function mapReferralSourceFromRow(row: PartnerReferralRow): PartnerReferralSource {
  return {
    capturedAt: row.created_at,
    channel: row.referral_source,
    landingPath: row.landing_path ?? undefined,
    partnerCode: row.referral_code,
    visitorKey: row.visitor_key ?? undefined,
  };
}

function mapReferralSourceFromConversion(
  conversion: PartnerConversionRow,
  referralsById: Map<string, PartnerReferralRow>,
): PartnerReferralSource | null {
  if (!conversion.referral_id) {
    return null;
  }

  const referral = referralsById.get(conversion.referral_id);
  return referral ? mapReferralSourceFromRow(referral) : null;
}

function buildLeadFromConversion(input: {
  conversion: PartnerConversionRow;
  referralsById: Map<string, PartnerReferralRow>;
  salonName: string;
}): PartnerLead {
  const source = mapReferralSourceFromConversion(input.conversion, input.referralsById);

  return {
    accountType: 'establishment',
    company: input.salonName,
    conversionStatus: input.conversion.conversion_status,
    createdAt: input.conversion.created_at.slice(0, 10),
    id: `lead-${input.conversion.id}`,
    name: input.salonName,
    source,
    status: mapLeadStatus(input.conversion.conversion_status),
  };
}

function buildLeadFromReferral(input: {
  referral: PartnerReferralRow;
  index: number;
}): PartnerLead {
  const source = mapReferralSourceFromRow(input.referral);

  return {
    accountType: input.referral.referred_account_type ?? 'establishment',
    company: 'Lead capturado',
    conversionStatus: 'clicked',
    createdAt: input.referral.created_at.slice(0, 10),
    id: `lead-ref-${input.referral.id}`,
    name: `Lead ${input.index + 1}`,
    source,
    status: 'novo',
  };
}

function buildConversion(input: {
  conversion: PartnerConversionRow;
  referralsById: Map<string, PartnerReferralRow>;
  salonName: string;
  commissionsByConversionId: Map<string, PartnerCommissionRow>;
}): PartnerConversion {
  const source = mapReferralSourceFromConversion(input.conversion, input.referralsById);
  const commission = input.commissionsByConversionId.get(input.conversion.id);
  const commissionCents = commission ? toCentValue(commission.amount) : 0;
  const paymentConfirmed =
    input.conversion.payment_status === 'confirmed' || input.conversion.conversion_status === 'paid';

  return {
    accountType: 'establishment',
    commissionCents,
    convertedAt: input.conversion.created_at.slice(0, 10),
    establishmentName: input.salonName,
    id: input.conversion.id,
    paymentConfirmed,
    planName: input.conversion.subscription_status === 'active' ? 'Plano ativo' : 'Plano em qualificacao',
    source,
    status: mapConversionStatus(input.conversion.conversion_status),
    subscriptionStatus: input.conversion.subscription_status ?? 'none',
  };
}

function buildPayments(commissions: PartnerCommissionRow[]) {
  return commissions
    .map((item) => ({
      date: (item.paid_at ?? item.generated_at ?? item.created_at).slice(0, 10),
      id: item.id,
      method: item.status === 'paid' ? 'PIX' : 'Transferencia',
      reference: item.conversion_id ? `Conversao ${item.conversion_id.slice(0, 8)}` : 'Comissao',
      status:
        item.status === 'paid'
          ? ('pago' as const)
          : item.status === 'canceled'
            ? ('falhou' as const)
          : item.status === 'approved'
            ? ('agendado' as const)
            : ('em_processamento' as const),
      valueCents: toCentValue(item.amount),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function buildRecentStatuses(input: {
  commissions: PartnerCommissionRow[];
  conversions: PartnerConversionRow[];
  referrals: PartnerReferralRow[];
}) {
  const conversionStatuses = input.conversions.map((conversion) => ({
    description:
      conversion.conversion_status === 'paid'
        ? 'Estabelecimento com pagamento confirmado no plano.'
        : conversion.conversion_status === 'subscribed'
          ? 'Estabelecimento avancou para etapa de assinatura.'
          : 'Conversao em andamento no funil de assinatura.',
    happenedAt: conversion.updated_at,
    id: `conversion-${conversion.id}`,
    title: 'Atualizacao de conversao',
  }));

  const commissionStatuses = input.commissions.map((commission) => ({
    description:
      commission.status === 'paid'
        ? 'Comissao paga e registrada no extrato.'
        : commission.status === 'approved'
          ? 'Comissao aprovada para pagamento.'
          : 'Comissao aguardando fechamento financeiro.',
    happenedAt: commission.updated_at,
    id: `commission-${commission.id}`,
    title: 'Atualizacao de comissao',
  }));

  const referralStatuses = input.referrals.slice(0, 5).map((referral) => ({
    description: 'Novo clique identificado no seu link de parceiro.',
    happenedAt: referral.created_at,
    id: `referral-${referral.id}`,
    title: 'Clique no link',
  }));

  return [...conversionStatuses, ...commissionStatuses, ...referralStatuses]
    .sort((a, b) => b.happenedAt.localeCompare(a.happenedAt))
    .slice(0, 4)
    .map((item) => ({
      description: item.description,
      happenedAtLabel: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
      }).format(new Date(item.happenedAt)),
      id: item.id,
      title: item.title,
    }));
}

function buildCommissionHistory(commissions: PartnerCommissionRow[]) {
  const grouped = new Map<string, { generatedCents: number; monthLabel: string; paidCents: number }>();

  for (const commission of commissions) {
    const referenceDate = commission.generated_at ?? commission.created_at;
    const monthKey = referenceDate.slice(0, 7);
    const valueCents = toCentValue(commission.amount);
    const current = grouped.get(monthKey) ?? {
      generatedCents: 0,
      monthLabel: formatMonthLabel(referenceDate),
      paidCents: 0,
    };

    if (commission.status !== 'canceled') {
      current.generatedCents += valueCents;
    }

    if (commission.status === 'paid') {
      current.paidCents += valueCents;
    }

    grouped.set(monthKey, current);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .map(([, value]) => value);
}

function buildFallbackData(session: PlatformSession) {
  const fallback = createDefaultPartnerData();
  const localName = session.email.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  const displayName = localName ? localName.replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Novo Parceiro';

  return {
    ...fallback,
    partner: {
      ...fallback.partner,
      name: displayName,
    },
  };
}

function mapSalonsById(rows: SalonNameRow[]) {
  return new Map(rows.map((row) => [row.id, row.name]));
}

function buildDashboardData(input: {
  commissions: PartnerCommissionRow[];
  conversions: PartnerConversionRow[];
  partner: PartnerRow;
  referrals: PartnerReferralRow[];
  salons: SalonNameRow[];
}): PartnerAreaData {
  const fallback = createDefaultPartnerData();
  const referralsById = new Map(input.referrals.map((referral) => [referral.id, referral]));
  const commissionsByConversionId = new Map(
    input.commissions
      .filter((commission) => Boolean(commission.conversion_id))
      .map((commission) => [commission.conversion_id as string, commission]),
  );
  const salonsById = mapSalonsById(input.salons);

  const conversions = input.conversions.map((conversion) =>
    buildConversion({
      commissionsByConversionId,
      conversion,
      referralsById,
      salonName: salonsById.get(conversion.salon_id) ?? 'Estabelecimento',
    }),
  );

  const leadsFromConversions = input.conversions.map((conversion) =>
    buildLeadFromConversion({
      conversion,
      referralsById,
      salonName: salonsById.get(conversion.salon_id) ?? 'Estabelecimento',
    }),
  );
  const remainingReferralLeads = input.referrals
    .slice(0, 8)
    .map((referral, index) =>
      buildLeadFromReferral({
        index,
        referral,
      }),
    );
  const leads = [...leadsFromConversions, ...remainingReferralLeads];

  const pendingCommissionCents = input.commissions
    .filter((commission) => commission.status === 'pending' || commission.status === 'approved')
    .reduce((total, commission) => total + toCentValue(commission.amount), 0);
  const paidCommissionCents = input.commissions
    .filter((commission) => commission.status === 'paid')
    .reduce((total, commission) => total + toCentValue(commission.amount), 0);
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const monthlyCommissionCents = input.commissions
    .filter((commission) => (commission.generated_at ?? commission.created_at).startsWith(currentMonthPrefix))
    .filter((commission) => commission.status !== 'canceled')
    .reduce((total, commission) => total + toCentValue(commission.amount), 0);

  return {
    ...fallback,
    commissionHistory: buildCommissionHistory(input.commissions),
    conversions,
    leads,
    metrics: {
      activatedPaidPlans: input.conversions.filter((conversion) => conversion.payment_status === 'confirmed').length,
      capturedLeads: leads.length,
      linkClicks: input.referrals.length,
      monthlyCommissionCents,
      paidCommissionCents,
      pendingCommissionCents,
      registeredEstablishments: input.conversions.filter((conversion) => conversion.conversion_status !== 'canceled').length,
    },
    partner: {
      disclosureText:
        fallback.partner.disclosureText.replace('BC-PARCEIRO-NEW', input.partner.code).replace(
          'https://belezacarioca.com',
          partnerPortalBaseUrl,
        ),
      name: input.partner.full_name || 'Parceiro Beleza Carioca',
      partnerCode: input.partner.code,
      referralLink: `${partnerPortalBaseUrl}/negocios?ref=${encodeURIComponent(input.partner.code)}`,
      role: mapPartnerRoleLabel(input.partner.status),
    },
    payments: buildPayments(input.commissions),
    recentStatuses: buildRecentStatuses({
      commissions: input.commissions,
      conversions: input.conversions,
      referrals: input.referrals,
    }),
  };
}

export async function loadPartnerAreaData(session: PlatformSession): Promise<PartnerAreaData> {
  if (!canUsePartnerPersistence() || session.profileId !== 'partner') {
    return buildFallbackData(session);
  }

  try {
    const partner = await resolvePartnerByIdentity({
      email: session.email,
      supabaseUserId: session.supabaseUserId,
    });

    if (!partner) {
      return buildFallbackData(session);
    }

    const [referrals, conversions, commissions] = await Promise.all([
      listPartnerReferrals(partner.id),
      listPartnerConversions(partner.id),
      listPartnerCommissions(partner.id),
    ]);
    const salons = await listSalonsByIds(conversions.map((item) => item.salon_id));

    return buildDashboardData({
      commissions,
      conversions,
      partner,
      referrals,
      salons,
    });
  } catch (error) {
    console.error('Falha ao carregar dados reais do parceiro:', error);
    return buildFallbackData(session);
  }
}
