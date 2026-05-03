'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, CircleAlert, LockKeyhole, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type CheckoutPayload = {
  amountCents?: number | null;
  checkoutUrl?: string | null;
  message?: string;
  ok?: boolean;
  paymentId?: string | null;
  planName?: string | null;
  professionalRangeLabel?: string | null;
  status?: string | null;
};

function formatCurrency(amountCents?: number | null) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format((amountCents ?? 0) / 100);
}

export function CheckoutSummary() {
  const searchParams = useSearchParams();
  const intentId = searchParams.get('intentId');
  const [payload, setPayload] = useState<CheckoutPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCheckout() {
      if (!intentId) {
        setError('Não encontramos o link de pagamento. Gere a cobrança novamente.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/billing/checkout-summary?intentId=${encodeURIComponent(intentId)}`, {
        credentials: 'include',
      }).catch(() => null);
      const data = (await response?.json().catch(() => null)) as CheckoutPayload | null;

      if (!active) {
        return;
      }

      if (!response?.ok || !data?.ok) {
        setError(data?.message ?? 'Não encontramos o link de pagamento. Gere a cobrança novamente.');
        setLoading(false);
        return;
      }

      setPayload(data);
      setLoading(false);
    }

    void loadCheckout();

    return () => {
      active = false;
    };
  }, [intentId]);

  const checkoutUrl = payload?.checkoutUrl ?? null;

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center">
      <div className="w-full rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white p-6 shadow-[0_24px_70px_rgba(106,79,144,0.1)] md:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f6f0ff] text-[#6e4c98]">
            {loading ? <LoaderCircle className="animate-spin" size={22} /> : error ? <CircleAlert size={22} /> : <LockKeyhole size={22} />}
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d6a39]">Checkout seguro</p>
            <h1 className="mt-2 text-3xl font-black text-[color:var(--bc-text)]">Revise sua assinatura</h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--bc-muted)]">
              Confira os dados antes de seguir para o ambiente seguro de pagamento do Asaas.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-xl border border-[rgba(120,84,162,0.1)] bg-[#fffdfa] p-5 text-sm font-semibold text-[color:var(--bc-muted)]">
            Carregando resumo da cobrança...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-[#f0b5ae] bg-[#fff7f5] p-5 text-sm font-semibold text-[#ad352d]">
            {error}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 rounded-xl border border-[rgba(120,84,162,0.1)] bg-[#fffdfa] p-5 sm:grid-cols-2">
              <SummaryItem label="Plano" value={payload?.planName ?? 'Plano Beleza Carioca'} />
              <SummaryItem label="Faixa" value={payload?.professionalRangeLabel ?? 'Nao informado'} />
              <SummaryItem label="Valor" value={formatCurrency(payload?.amountCents)} strong />
              <SummaryItem label="Status" value={payload?.status ?? 'pending'} />
            </div>

            {!checkoutUrl ? (
              <div className="mt-6 rounded-xl border border-[#f0b5ae] bg-[#fff7f5] p-4 text-sm font-semibold text-[#ad352d]">
                Não encontramos o link de pagamento. Gere a cobrança novamente.
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.location.href = checkoutUrl;
                }}
                className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#5f3f86] px-6 text-sm font-black text-white transition hover:bg-[#4d3273]"
              >
                <CheckCircle2 size={18} />
                Finalizar pagamento seguro
              </button>
            )}
          </>
        )}

        <Link href="/assinatura" className="mt-5 inline-flex text-sm font-black text-[#6e4c98] transition hover:text-[#8d6a39]">
          Voltar para planos
        </Link>
      </div>
    </section>
  );
}

function SummaryItem({ label, strong, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8d6a39]">{label}</p>
      <p className={['mt-1 text-[color:var(--bc-text)]', strong ? 'text-2xl font-black' : 'text-base font-bold'].join(' ')}>
        {value}
      </p>
    </div>
  );
}
