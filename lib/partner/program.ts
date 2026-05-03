export type ReferredAccountType = 'customer' | 'establishment';

export type PartnerStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'canceled';

export type ReferralConversionStatus =
  | 'clicked'
  | 'registered'
  | 'qualified'
  | 'subscribed'
  | 'paid'
  | 'canceled';

export type SubscriptionStatus = 'none' | 'trialing' | 'active' | 'pastDue' | 'cancelled';

export type PartnerReferralSource = {
  capturedAt: string;
  channel: 'queryParam' | 'manual' | 'unknown';
  landingPath?: string;
  partnerCode: string;
  queryParam?: string;
  visitorKey?: string;
};

export type Partner = {
  code: string;
  id: string;
  name: string;
  referralLink: string;
  roleLabel: string;
  status: PartnerStatus;
};

export type PartnerLead = {
  accountType: ReferredAccountType;
  createdAt: string;
  id: string;
  name: string;
  source: PartnerReferralSource | null;
  status: ReferralConversionStatus;
};

export type PartnerReferral = {
  accountType: ReferredAccountType;
  createdAt: string;
  id: string;
  partnerCode: string;
  source: PartnerReferralSource;
  status: ReferralConversionStatus;
  subscriptionStatus: SubscriptionStatus;
  updatedAt: string;
};

export type PartnerCommission = {
  amountCents: number;
  generatedAt: string;
  id: string;
  paymentConfirmed: boolean;
  referralId: string;
  referredAccountType: ReferredAccountType;
  source: PartnerReferralSource | null;
  status: CommissionStatus;
  subscriptionStatus: SubscriptionStatus;
};

export const PARTNER_COMMISSION_RULE_SUMMARY =
  'Ganhe comissao por indicar estabelecimentos que ativam um plano pago na Beleza Carioca.';

export const PARTNER_COMMISSION_RULE_SUPPORT =
  'Clientes que utilizam a plataforma apenas para agendamento nao geram comissao.';

type CommissionEligibilityInput = {
  paymentConfirmed: boolean;
  referredAccountType: ReferredAccountType;
  referralSource: PartnerReferralSource | null | undefined;
  subscriptionStatus: SubscriptionStatus;
};

export function canGeneratePartnerCommission(input: CommissionEligibilityInput) {
  return (
    Boolean(input.referralSource?.partnerCode) &&
    input.referredAccountType === 'establishment' &&
    input.subscriptionStatus === 'active' &&
    input.paymentConfirmed
  );
}
