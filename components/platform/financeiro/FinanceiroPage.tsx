'use client';

import { ListaCobrancas } from '@/components/platform/financeiro/ListaCobrancas';
import { NovaCobrancaForm } from '@/components/platform/financeiro/NovaCobrancaForm';
import { ResumoCard } from '@/components/platform/financeiro/ResumoCard';
import { useFinanceiro } from '@/hooks/useFinanceiro';

export function FinanceiroPage() {
  const { charges, createCharge, deleteCharge, summary, updateCharge } = useFinanceiro();

  return (
    <section className="grid gap-6">
      <ResumoCard summary={summary} />
      <NovaCobrancaForm onCreate={createCharge} />
      <div className="grid gap-4">
        <div>
          <p className="bc-kicker">Financeiro</p>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">Cobranças cadastradas</h2>
        </div>
        <ListaCobrancas charges={charges} onDelete={deleteCharge} onUpdate={updateCharge} />
      </div>
    </section>
  );
}
