import type { SubscriptionPlanChoice } from '@/lib/platform/billing/subscription-intent';

export const professionalRanges = [
  { id: '1-2', label: '1 a 2 profissionais' },
  { id: '3-4', label: '3 a 4 profissionais' },
  { id: '5-10', label: '5 a 10 profissionais' },
  { id: '11-20', label: '11 a 20 profissionais' },
  { id: '21+', label: '21 ou mais profissionais' },
] as const;

export type ProfessionalRangeId = (typeof professionalRanges)[number]['id'];

const priceMatrix: Record<ProfessionalRangeId, Record<SubscriptionPlanChoice, number>> = {
  '1-2': { monthly: 149, quarterly: 399, annual: 1490 },
  '3-4': { monthly: 189, quarterly: 519, annual: 1890 },
  '5-10': { monthly: 239, quarterly: 649, annual: 2390 },
  '11-20': { monthly: 289, quarterly: 779, annual: 2890 },
  '21+': { monthly: 349, quarterly: 949, annual: 3490 },
};

const planLabels: Record<SubscriptionPlanChoice, string> = {
  monthly: 'Plano mensal',
  quarterly: 'Plano trimestral',
  annual: 'Plano anual',
};

export function isProfessionalRangeId(value: unknown): value is ProfessionalRangeId {
  return professionalRanges.some((range) => range.id === value);
}

export function resolveSubscriptionPricing(input: {
  professionalRange: ProfessionalRangeId;
  selectedPlan: SubscriptionPlanChoice;
}) {
  const amount = priceMatrix[input.professionalRange][input.selectedPlan];
  const range = professionalRanges.find((item) => item.id === input.professionalRange) ?? professionalRanges[0];

  return {
    amount,
    amountCents: amount * 100,
    planLabel: planLabels[input.selectedPlan],
    professionalRange: range.id,
    professionalRangeLabel: range.label,
  };
}

export function formatSubscriptionCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}
