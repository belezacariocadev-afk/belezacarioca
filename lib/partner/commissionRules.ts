import type { SubscriptionPlanChoice } from '@/lib/platform/billing/subscription-intent';

export type PartnerCommissionCalculationInput = {
  paymentAmountCents: number;
  selectedPlan?: SubscriptionPlanChoice;
};

export type PartnerCommissionCalculationResult = {
  amountCents: number;
  currency: 'BRL';
  isEligible: boolean;
  reason: 'missing_payment_amount' | 'ok';
  ruleSnapshot: Record<string, unknown>;
};

export const PARTNER_COMMISSION_POLICY = {
  currency: 'BRL' as const,
  maximumAmountCents: 20_000,
  minimumAmountCents: 5_000,
  strategy: 'percentage_of_first_confirmed_payment' as const,
  percentage: 0.1,
};

export function calculatePartnerCommission(input: PartnerCommissionCalculationInput): PartnerCommissionCalculationResult {
  const baseAmount = Math.max(0, Math.floor(input.paymentAmountCents));
  const percentageAmount = Math.round(baseAmount * PARTNER_COMMISSION_POLICY.percentage);

  if (baseAmount <= 0) {
    return {
      amountCents: 0,
      currency: PARTNER_COMMISSION_POLICY.currency,
      isEligible: false,
      reason: 'missing_payment_amount',
      ruleSnapshot: {
        input_payment_amount_cents: baseAmount,
        maximum_amount_cents: PARTNER_COMMISSION_POLICY.maximumAmountCents,
        minimum_amount_cents: PARTNER_COMMISSION_POLICY.minimumAmountCents,
        percentage: PARTNER_COMMISSION_POLICY.percentage,
        selected_plan: input.selectedPlan ?? null,
        strategy: PARTNER_COMMISSION_POLICY.strategy,
      },
    };
  }

  const amountCents = Math.min(
    PARTNER_COMMISSION_POLICY.maximumAmountCents,
    Math.max(percentageAmount, PARTNER_COMMISSION_POLICY.minimumAmountCents),
  );

  return {
    amountCents,
    currency: PARTNER_COMMISSION_POLICY.currency,
    isEligible: true,
    reason: 'ok',
    ruleSnapshot: {
      input_payment_amount_cents: baseAmount,
      maximum_amount_cents: PARTNER_COMMISSION_POLICY.maximumAmountCents,
      minimum_amount_cents: PARTNER_COMMISSION_POLICY.minimumAmountCents,
      percentage: PARTNER_COMMISSION_POLICY.percentage,
      selected_plan: input.selectedPlan ?? null,
      strategy: PARTNER_COMMISSION_POLICY.strategy,
    },
  };
}
