'use client';

import { type FormEvent, useState } from 'react';

import type { ChargeInput } from '@/lib/platform/data/schema';

const inputClassName = 'h-11 rounded-lg border border-[rgba(120,84,162,0.18)] bg-white px-3 text-sm font-semibold text-[color:var(--bc-text)] outline-none transition focus:border-[color:var(--primary-color)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary-color)_18%,transparent)]';

type NovaCobrancaFormProps = {
  onCreate: (input: ChargeInput) => Promise<{ ok: boolean; message: string }>;
};

export function NovaCobrancaForm({ onCreate }: NovaCobrancaFormProps) {
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<ChargeInput['status']>('pending');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const result = await onCreate({
      amountCents: Math.round(Number(amount || 0) * 100),
      clientName,
      dueDate: dueDate || undefined,
      serviceName,
      status,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setClientName('');
    setServiceName('');
    setAmount('');
    setDueDate('');
    setStatus('pending');
    setMessage('Cobrança criada com sucesso.');
  }

  return (
    <form className="grid gap-4 rounded-lg border border-[rgba(120,84,162,0.14)] bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <p className="bc-kicker">Nova cobrança</p>
        <h2 className="text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">Criar cobrança manual</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[color:var(--bc-text)]">
          Cliente
          <input className={inputClassName} value={clientName} onChange={(event) => setClientName(event.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[color:var(--bc-text)]">
          Servico
          <input className={inputClassName} value={serviceName} onChange={(event) => setServiceName(event.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[color:var(--bc-text)]">
          Valor
          <input className={inputClassName} type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[color:var(--bc-text)]">
          Vencimento
          <input className={inputClassName} type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[color:var(--bc-text)]">
          Status
          <select className={inputClassName} value={status} onChange={(event) => setStatus(event.target.value as ChargeInput['status'])}>
            <option value="draft">Rascunho</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={isSubmitting} className="bc-admin-primary-button" style={{ backgroundColor: 'var(--primary-color)' }}>
        {isSubmitting ? 'Salvando...' : 'Criar cobrança'}
      </button>
      {message ? <p className="rounded-lg bg-[rgba(120,84,162,0.08)] px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)]">{message}</p> : null}
    </form>
  );
}
