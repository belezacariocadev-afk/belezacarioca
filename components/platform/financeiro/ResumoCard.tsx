import type { FinanceSummary } from '@/lib/platform/data/schema';

const summaryItems: Array<{ key: keyof FinanceSummary; label: string }> = [
  { key: 'draft', label: 'Rascunho' },
  { key: 'pending', label: 'Pendente' },
  { key: 'paid', label: 'Pago' },
  { key: 'cancelled', label: 'Cancelado' },
];

export function ResumoCard({ summary }: { summary: FinanceSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {summaryItems.map((item) => (
        <article key={item.key} className="rounded-lg border border-[rgba(120,84,162,0.14)] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: 'var(--primary-color)' }}>
            {item.label}
          </p>
          <strong className="mt-3 block text-3xl font-black text-[color:var(--bc-text)]">{summary[item.key]}</strong>
        </article>
      ))}
    </div>
  );
}
