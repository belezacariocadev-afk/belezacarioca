import { Inbox } from 'lucide-react';

import {
  formatCurrencyBRL,
  formatDateBR,
  type PartnerConversion,
} from '@/lib/partner/mockData';
import { canGeneratePartnerCommission } from '@/lib/partner/program';

import { PartnerStatusPill } from './PartnerStatusPill';

type PartnerConversionsTableProps = {
  conversions: PartnerConversion[];
};

function resolveCommissionLabel(item: PartnerConversion) {
  const commissionEligible = canGeneratePartnerCommission({
    paymentConfirmed: item.paymentConfirmed,
    referredAccountType: item.accountType,
    referralSource: item.source,
    subscriptionStatus: item.subscriptionStatus,
  });

  return commissionEligible ? formatCurrencyBRL(item.commissionCents) : 'Nao elegivel';
}

export function PartnerConversionsTable({ conversions }: PartnerConversionsTableProps) {
  return (
    <section id="conversoes" className="scroll-mt-24">
      <div className="mb-4">
        <p className="bc-kicker">Estabelecimentos convertidos</p>
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
          Conversoes com potencial de comissao
        </h2>
      </div>

      {conversions.length === 0 ? (
        <EmptyState message="Nenhum estabelecimento com plano pago confirmado ainda. Quando isso acontecer, as conversoes aparecem aqui." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[1.5rem] border border-[rgba(120,84,162,0.12)] bg-white shadow-[0_14px_32px_rgba(110,84,144,0.08)] md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[rgba(120,84,162,0.1)] bg-[rgba(120,84,162,0.04)] text-left">
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Estabelecimento</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Plano contratado</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Data da conversao</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Situacao</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Comissao gerada</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((item) => (
                  <tr key={item.id} className="border-b border-[rgba(120,84,162,0.08)] last:border-b-0">
                    <td className="px-5 py-4 text-sm font-semibold text-[color:var(--bc-text)]">{item.establishmentName}</td>
                    <td className="px-5 py-4 text-sm text-[color:var(--bc-muted)]">{item.planName}</td>
                    <td className="px-5 py-4 text-sm text-[color:var(--bc-muted)]">{formatDateBR(item.convertedAt)}</td>
                    <td className="px-5 py-4">
                      <PartnerStatusPill status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[color:var(--bc-text)]">
                      {resolveCommissionLabel(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {conversions.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.3rem] border border-[rgba(120,84,162,0.12)] bg-white p-4 shadow-[0_10px_24px_rgba(110,84,144,0.08)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-[color:var(--bc-text)]">{item.establishmentName}</h3>
                  <PartnerStatusPill status={item.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--bc-muted)]">{item.planName}</p>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-[0.12em] text-[#8d6a39]">
                    {formatDateBR(item.convertedAt)}
                  </span>
                  <span className="text-sm font-black text-[color:var(--bc-text)]">
                    {resolveCommissionLabel(item)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[rgba(120,84,162,0.2)] bg-white/80 px-5 py-8 text-center">
      <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(120,84,162,0.1)] text-[#6e4c98]">
        <Inbox size={18} />
      </span>
      <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{message}</p>
    </div>
  );
}
