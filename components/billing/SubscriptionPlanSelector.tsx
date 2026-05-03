'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, CheckCircle2 } from 'lucide-react';

import { SubscriptionButton } from '@/app/components/SubscriptionButton';
import {
  PARTNER_COMMISSION_RULE_SUMMARY,
  PARTNER_COMMISSION_RULE_SUPPORT,
} from '@/lib/partner/program';
import { readPartnerReferralSource } from '@/lib/partner/referralAttribution';
import { type SubscriptionPlanChoice } from '@/lib/platform/billing/subscription-intent';
import {
  formatSubscriptionCurrency,
  professionalRanges,
  resolveSubscriptionPricing,
  type ProfessionalRangeId,
} from '@/lib/platform/billing/subscription-pricing';

export type SubscriptionPlanView = {
  id: SubscriptionPlanChoice;
  badge?: string;
  benefits: string[];
  description: string;
  price: string;
  priceSuffix: string;
  title: string;
  equivalentLabel?: string;
  savingsLabel?: string;
  highlightLabel?: string;
};

type SubscriptionPlanSelectorProps = {
  plans: SubscriptionPlanView[];
  reason?: string | null;
};

const planLabels: Record<SubscriptionPlanChoice, string> = {
  monthly: 'mensal',
  quarterly: 'trimestral',
  annual: 'anual',
};

export function SubscriptionPlanSelector({ plans, reason }: SubscriptionPlanSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<ProfessionalRangeId>('1-2');
  const [capturedReferralCode, setCapturedReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const referralSource = readPartnerReferralSource();
    setCapturedReferralCode(referralSource?.partnerCode ?? null);
  }, []);

  const selectedRangeLabel = professionalRanges.find((range) => range.id === selectedRange)?.label ?? 'sua equipe';

  const pricedPlans = useMemo(
    () =>
      plans.map((plan) => {
        const pricing = resolveSubscriptionPricing({
          professionalRange: selectedRange,
          selectedPlan: plan.id,
        });
        const monthlyPrice = resolveSubscriptionPricing({
          professionalRange: selectedRange,
          selectedPlan: 'monthly',
        }).amount;
        const priceValue = pricing.amount;
        const savingsAmount =
          plan.id === 'quarterly'
            ? monthlyPrice * 3 - priceValue
            : plan.id === 'annual'
              ? monthlyPrice * 12 - priceValue
              : 0;

        const equivalentLabel =
          plan.id === 'quarterly'
            ? `aprox. ${formatSubscriptionCurrency(Math.round(priceValue / 3))}/mes`
            : plan.id === 'annual'
              ? `aprox. ${formatSubscriptionCurrency(Math.round(priceValue / 12))}/mes`
              : undefined;

        const savingsLabel =
          savingsAmount > 0
            ? plan.id === 'quarterly'
              ? `Economize ${formatSubscriptionCurrency(savingsAmount)} no trimestre`
              : plan.id === 'annual'
                ? `Economize ${formatSubscriptionCurrency(savingsAmount)} no ano`
                : undefined
            : undefined;

        const highlightLabel = plan.id === 'annual' ? 'Melhor custo total' : undefined;

        return {
          ...plan,
          equivalentLabel,
          highlightLabel,
          amountCents: pricing.amountCents,
          professionalRange: selectedRange,
          professionalRangeLabel: pricing.professionalRangeLabel,
          price: formatSubscriptionCurrency(priceValue),
          savingsLabel,
        };
      }),
    [plans, selectedRange],
  );

  return (
    <div>
      <div className="rounded-[32px] border border-[rgba(120,84,162,0.14)] bg-[#fffdfa] p-6 shadow-[0_24px_60px_rgba(106,79,144,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--bc-gold-strong)]">Mude sua faixa de profissionais aqui :)</p>
            <h2 className="mt-2 text-2xl font-black text-[color:var(--bc-text)]">Valores atualizados para mensal, trimestral e anual.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--bc-muted)]">
              Escolha a faixa da sua equipe e o sistema recalcula todos os precos dos planos.
            </p>
            <p className="mt-3 text-sm font-semibold text-[color:var(--bc-text)]">
              Valores mostrados para: <span className="text-[#7854a2]">{selectedRangeLabel}</span>.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {professionalRanges.map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setSelectedRange(range.id)}
                className={[
                  'rounded-full border px-4 py-3 text-sm font-semibold transition',
                  selectedRange === range.id
                    ? 'border-[#7854a2] bg-[#7854a2] text-white shadow-[0_10px_30px_rgba(120,84,162,0.14)]'
                    : 'border-[rgba(120,84,162,0.16)] bg-white text-[color:var(--bc-text)] hover:border-[#7854a2] hover:text-[#7854a2]',
                ].join(' ')}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        {capturedReferralCode ? (
          <div className="mt-5 rounded-3xl border border-[rgba(120,84,162,0.18)] bg-[#f7f0ff] px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6e4c98]">
              Origem de parceiro detectada: {capturedReferralCode}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--bc-text)]">{PARTNER_COMMISSION_RULE_SUMMARY}</p>
            <p className="mt-1 text-xs leading-6 text-[color:var(--bc-muted)]">{PARTNER_COMMISSION_RULE_SUPPORT}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {pricedPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} reason={reason} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  reason,
}: {
  plan: SubscriptionPlanView & {
    amountCents?: number;
    professionalRange?: ProfessionalRangeId;
    professionalRangeLabel?: string;
  };
  reason?: string | null;
}) {
  const isAnnual = plan.id === 'annual';

  return (
    <article
      className={[
        'rounded-[32px] border p-6 shadow-[0_20px_60px_rgba(106,79,144,0.08)] transition duration-200',
        isAnnual
          ? 'border-[#7c3aed] bg-[#faf5ff] hover:-translate-y-1 hover:border-[#7c3aed]'
          : 'border-[rgba(120,84,162,0.14)] bg-white hover:-translate-y-1 hover:border-[#7854a2]',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{plan.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--bc-muted)]">{plan.description}</p>
          {plan.highlightLabel ? (
            <span className="mt-3 inline-flex rounded-full bg-[#ede9fe] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b21b6]">
              {plan.highlightLabel}
            </span>
          ) : null}
        </div>
        {plan.badge ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f6f0ff] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#7854a2]">
            <BadgeCheck size={14} />
            {plan.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-3">
        <strong className="text-5xl font-black tracking-[-0.05em] text-[color:var(--bc-text)]">{plan.price}</strong>
        <span className="pb-1 text-sm font-semibold text-[color:var(--bc-muted)]">{plan.priceSuffix}</span>
        {plan.equivalentLabel ? (
          <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f46e5]">
            {plan.equivalentLabel}
          </span>
        ) : null}
      </div>
      {plan.savingsLabel ? (
        <p className="mt-4 rounded-3xl bg-[#eef6ed] px-4 py-3 text-sm font-semibold text-[#235f38] shadow-[0_10px_28px_rgba(56,105,70,0.08)]">
          {plan.savingsLabel}
        </p>
      ) : null}

      <ul className="mt-8 grid gap-3">
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="flex gap-3 text-sm leading-6 text-[color:var(--bc-text)]">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#7854a2]" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <SubscriptionButton
        amountCents={plan.amountCents}
        planName={plan.title}
        professionalRange={plan.professionalRange}
        professionalRangeLabel={plan.professionalRangeLabel}
        reason={reason}
        selectedPlan={plan.id}
        className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#5f3f86] px-6 text-sm font-extrabold text-white transition hover:bg-[#4d3273] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ArrowRight size={16} />
        {plan.id === 'annual' ? 'Escolha mais economica' : `Ativar plano ${planLabels[plan.id]}`}
      </SubscriptionButton>
    </article>
  );
}
