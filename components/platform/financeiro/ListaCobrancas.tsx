'use client';

import { useState } from 'react';

import type { ChargeRecord, ChargeStatus } from '@/lib/platform/domain';
import type { ChargeUpdateInput } from '@/lib/platform/data/schema';

type ListaCobrancasProps = {
  charges: ChargeRecord[];
  onDelete: (chargeId: string) => Promise<{ ok: boolean; message: string }>;
  onUpdate: (chargeId: string, input: ChargeUpdateInput) => Promise<{ ok: boolean; message: string }>;
};

export function ListaCobrancas({ charges, onDelete, onUpdate }: ListaCobrancasProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(charge: ChargeRecord, status: ChargeStatus) {
    setMessage(null);
    const result = await onUpdate(charge.id, { status: status as ChargeUpdateInput['status'] });

    setMessage(result.ok ? 'Cobrança atualizada com sucesso.' : result.message);
  }

  async function deleteCharge(charge: ChargeRecord) {
    setMessage(null);

    const result = await onDelete(charge.id);

    setMessage(result.ok ? 'Cobrança removida com sucesso.' : result.message);
  }

  if (charges.length === 0) {
    return <p className="rounded-lg border border-dashed border-[rgba(120,84,162,0.24)] bg-white p-6 text-sm font-semibold text-[color:var(--bc-muted)]">Nenhuma cobrança cadastrada ainda.</p>;
  }

  return (
    <section className="grid gap-3">
      {message ? <p className="rounded-lg bg-[rgba(120,84,162,0.08)] px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)]">{message}</p> : null}
      {charges.map((charge) => (
        <article key={charge.id} className="rounded-lg border border-[rgba(120,84,162,0.14)] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-[color:var(--bc-text)]">{charge.clientName ?? 'Cliente nao informado'}</h3>
                <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ backgroundColor: getStatusColor(charge.status) }}>
                  {getStatusLabel(charge.status)}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[color:var(--bc-muted)]">{charge.serviceName ?? 'Servico nao informado'}</p>
              <p className="mt-1 text-sm text-[color:var(--bc-muted)]">
                {formatCurrency(charge.amountCents)}
                {charge.dueDate ? ` | vence em ${formatDate(charge.dueDate)}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="bc-admin-secondary-button" onClick={() => void updateStatus(charge, 'paid')}>
                Marcar pago
              </button>
              <button type="button" className="bc-admin-secondary-button" onClick={() => void updateStatus(charge, 'cancelled')}>
                Cancelar
              </button>
              <button
                type="button"
                className="bc-admin-secondary-button"
                onClick={() => void deleteCharge(charge)}
              >
                Excluir
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function getStatusLabel(status: ChargeStatus) {
  const labels: Record<ChargeStatus, string> = {
    cancelled: 'Cancelado',
    draft: 'Rascunho',
    overdue: 'Vencido',
    paid: 'Pago',
    pending: 'Pendente',
    refunded: 'Estornado',
  };

  return labels[status];
}

function getStatusColor(status: ChargeStatus) {
  if (status === 'paid') return '#17803d';
  if (status === 'cancelled') return '#8a2d25';
  if (status === 'pending') return 'var(--primary-color)';
  return '#6f6477';
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(amountCents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}
