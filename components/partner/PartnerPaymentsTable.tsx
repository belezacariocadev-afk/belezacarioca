import { Inbox } from 'lucide-react';

import {
  formatCurrencyBRL,
  formatDateBR,
  type PartnerPayment,
} from '@/lib/partner/mockData';

import { PartnerStatusPill } from './PartnerStatusPill';

type PartnerPaymentsTableProps = {
  payments: PartnerPayment[];
};

export function PartnerPaymentsTable({ payments }: PartnerPaymentsTableProps) {
  return (
    <section id="pagamentos" className="scroll-mt-24">
      <div className="mb-4">
        <p className="bc-kicker">Extrato de pagamentos</p>
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
          Historico financeiro do parceiro
        </h2>
      </div>

      {payments.length === 0 ? (
        <EmptyState message="Sem pagamentos registrados no momento. Os repasses aparecem apos comissoes elegiveis de planos pagos confirmados." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[1.5rem] border border-[rgba(120,84,162,0.12)] bg-white shadow-[0_14px_32px_rgba(110,84,144,0.08)] md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[rgba(120,84,162,0.1)] bg-[rgba(120,84,162,0.04)] text-left">
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Data</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Valor</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Metodo</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Status</th>
                  <th className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((item) => (
                  <tr key={item.id} className="border-b border-[rgba(120,84,162,0.08)] last:border-b-0">
                    <td className="px-5 py-4 text-sm text-[color:var(--bc-muted)]">{formatDateBR(item.date)}</td>
                    <td className="px-5 py-4 text-sm font-black text-[color:var(--bc-text)]">{formatCurrencyBRL(item.valueCents)}</td>
                    <td className="px-5 py-4 text-sm text-[color:var(--bc-muted)]">{item.method}</td>
                    <td className="px-5 py-4">
                      <PartnerStatusPill status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[color:var(--bc-muted)]">{item.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {payments.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.3rem] border border-[rgba(120,84,162,0.12)] bg-white p-4 shadow-[0_10px_24px_rgba(110,84,144,0.08)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm text-[color:var(--bc-text)]">{formatCurrencyBRL(item.valueCents)}</strong>
                  <PartnerStatusPill status={item.status} />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8d6a39]">{formatDateBR(item.date)}</p>
                <p className="mt-2 text-sm text-[color:var(--bc-muted)]">{item.method}</p>
                <p className="mt-1 text-xs text-[color:var(--bc-muted)]">Ref: {item.reference}</p>
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
