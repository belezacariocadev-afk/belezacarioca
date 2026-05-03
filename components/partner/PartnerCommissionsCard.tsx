import type { ComponentType } from 'react';

import { BadgeDollarSign, Coins, Wallet } from 'lucide-react';

import { formatCurrencyBRL } from '@/lib/partner/mockData';
import { PARTNER_COMMISSION_RULE_SUMMARY, PARTNER_COMMISSION_RULE_SUPPORT } from '@/lib/partner/program';

type PartnerCommissionsCardProps = {
  monthlyCommissionCents: number;
  pendingCommissionCents: number;
  paidCommissionCents: number;
  commissionHistory: Array<{
    monthLabel: string;
    generatedCents: number;
    paidCents: number;
  }>;
};

export function PartnerCommissionsCard({
  monthlyCommissionCents,
  pendingCommissionCents,
  paidCommissionCents,
  commissionHistory,
}: PartnerCommissionsCardProps) {
  const maxGenerated = Math.max(...commissionHistory.map((item) => item.generatedCents), 1);

  return (
    <section id="comissoes" className="scroll-mt-24">
      <div className="mb-4">
        <p className="bc-kicker">Comissoes</p>
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
          Comissao por estabelecimentos com plano pago
        </h2>
      </div>

      <div className="rounded-[1.85rem] border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_18px_40px_rgba(110,84,144,0.1)]">
        <div className="mb-5 rounded-[1.1rem] border border-[rgba(120,84,162,0.14)] bg-[rgba(120,84,162,0.06)] px-4 py-3">
          <p className="text-sm font-semibold text-[color:var(--bc-text)]">{PARTNER_COMMISSION_RULE_SUMMARY}</p>
          <p className="mt-1 text-xs leading-6 text-[color:var(--bc-muted)]">{PARTNER_COMMISSION_RULE_SUPPORT}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MetricChip
            label="Comissao do mes"
            value={formatCurrencyBRL(monthlyCommissionCents)}
            icon={BadgeDollarSign}
          />
          <MetricChip
            label="Total pendente/aprovado"
            value={formatCurrencyBRL(pendingCommissionCents)}
            icon={Wallet}
          />
          <MetricChip
            label="Total ja pago"
            value={formatCurrencyBRL(paidCommissionCents)}
            icon={Coins}
          />
        </div>

        <div className="mt-6 rounded-[1.25rem] border border-[rgba(120,84,162,0.1)] bg-[rgba(120,84,162,0.05)] p-4">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Historico resumido</h3>
          {commissionHistory.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[rgba(120,84,162,0.22)] bg-white/85 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-[color:var(--bc-muted)]">
                Sem historico de comissoes ainda. Os valores aparecem apos confirmacao de pagamento de plano dos
                estabelecimentos indicados.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {commissionHistory.map((item) => {
                const generatedRatio = Math.max(10, Math.round((item.generatedCents / maxGenerated) * 100));
                const paidRatio = item.generatedCents > 0 ? Math.round((item.paidCents / item.generatedCents) * generatedRatio) : 0;

                return (
                  <article
                    key={item.monthLabel}
                    className="rounded-xl border border-[rgba(120,84,162,0.12)] bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm text-[color:var(--bc-text)]">{item.monthLabel}</strong>
                      <span className="text-xs font-semibold text-[color:var(--bc-muted)]">
                        Gerado {formatCurrencyBRL(item.generatedCents)}
                      </span>
                    </div>
                    <div className="mt-3 h-2.5 rounded-full bg-[rgba(120,84,162,0.1)]">
                      <div
                        className="h-full rounded-full bg-[rgba(120,84,162,0.3)]"
                        style={{ width: `${generatedRatio}%` }}
                      />
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-[rgba(216,178,123,0.18)]">
                      <div
                        className="h-full rounded-full bg-[rgba(216,178,123,0.55)]"
                        style={{ width: `${Math.max(0, Math.min(100, paidRatio))}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[color:var(--bc-muted)]">
                      <span>Pago {formatCurrencyBRL(item.paidCents)}</span>
                      <span>Pendente {formatCurrencyBRL(Math.max(0, item.generatedCents - item.paidCents))}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MetricChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <article className="rounded-[1.15rem] border border-[rgba(120,84,162,0.12)] bg-[linear-gradient(180deg,#fff,#f8f2eb)] px-4 py-4 shadow-[0_8px_22px_rgba(110,84,144,0.08)]">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(120,84,162,0.1)] text-[#6e4c98]">
        <Icon size={16} />
      </span>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">{label}</p>
      <p className="mt-1 text-lg font-black tracking-[-0.02em] text-[color:var(--bc-text)]">{value}</p>
    </article>
  );
}
