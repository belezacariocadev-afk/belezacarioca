'use client';

import { useState, type ReactNode } from 'react';

import { readPartnerReferralSource } from '@/lib/partner/referralAttribution';
import type { ProfessionalRangeId } from '@/lib/platform/billing/subscription-pricing';

type SubscriptionPlan = 'monthly' | 'quarterly' | 'annual';

export type SubscriptionButtonProps = {
  amountCents?: number;
  className?: string;
  children?: ReactNode;
  planName?: string;
  professionalRange?: ProfessionalRangeId;
  professionalRangeLabel?: string;
  reason?: string | null;
  selectedPlan: SubscriptionPlan;
};

const planLabels: Record<SubscriptionPlan, string> = {
  monthly: 'mensal',
  quarterly: 'trimestral',
  annual: 'anual',
};

const genericActivationError = 'Não foi possível ativar o plano agora. Tente novamente em instantes.';
const invalidPhoneMessage = 'O telefone do estabelecimento está inválido. Atualize o telefone no perfil antes de ativar o plano.';
const invalidCpfCnpjMessage = 'Informe um CPF ou CNPJ válido no cadastro do estabelecimento antes de ativar o plano.';

export function SubscriptionButton({
  amountCents,
  children,
  className,
  planName,
  professionalRange,
  professionalRangeLabel,
  reason,
  selectedPlan,
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubscribe = async () => {
    console.log('[SubscriptionButton] clique', {
      amountCents,
      planName,
      professionalRange,
      selectedPlan,
    });
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const partnerReferralSource = readPartnerReferralSource();

      console.log('[SubscriptionButton] enviando POST /api/subscription-intents');
      const response = await fetch('/api/subscription-intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          selectedPlan,
          professionalRange,
          reason,
          displayedAmountCents: amountCents,
          planName,
          professionalRangeLabel,
          partnerReferralCode: partnerReferralSource?.partnerCode,
          partnerReferralSource,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        checkoutUrl?: string;
        ok?: boolean;
        message?: string;
        subscriptionIntentId?: string;
      } | null;

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.message ?? 'Subscription intent request failed.');
      }

      if (payload?.subscriptionIntentId) {
        window.location.href = `/checkout?intentId=${encodeURIComponent(payload.subscriptionIntentId)}`;
        return;
      }

      if (payload?.checkoutUrl) {
        window.location.href = `/checkout?checkoutUrl=${encodeURIComponent(payload.checkoutUrl)}`;
        return;
      }

      setSuccess('Plano ativado. Continue acompanhando a assinatura pelo painel.');
    } catch (err) {
      console.error('[SubscriptionButton] erro ao ativar assinatura', err);
      setError(
        err instanceof Error && (err.message === invalidPhoneMessage || err.message === invalidCpfCnpjMessage)
          ? err.message
          : genericActivationError,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className={
          className ??
          'rounded bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60'
        }
      >
        {loading ? 'Ativando...' : children ?? `Ativar plano ${planLabels[selectedPlan]}`}
      </button>
      {error ? <p className="mt-2 text-sm font-semibold text-red-500">{error}</p> : null}
      {success ? <p className="mt-2 text-sm font-semibold text-[#235f38]">{success}</p> : null}
    </div>
  );
}
