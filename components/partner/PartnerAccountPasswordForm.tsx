'use client';

import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type PartnerAccountPasswordFormProps = {
  email: string;
};

type FeedbackState = {
  message: string;
  type: 'error' | 'success';
} | null;

export function PartnerAccountPasswordForm({ email }: PartnerAccountPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.trim().length < 8) {
      setFeedback({ type: 'error', message: 'Use uma senha com pelo menos 8 caracteres.' });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setFeedback({ type: 'error', message: 'A confirmacao precisa ser igual a nova senha.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/parceiros/account/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmPassword,
          newPassword,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel salvar a nova senha.');
      }

      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: payload?.message ?? 'Senha atualizada com sucesso.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Nao foi possivel salvar a nova senha.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-[1.3rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.05)] p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--bc-muted)]">E-mail atual</p>
        <p className="mt-1 break-all text-sm font-bold text-[color:var(--bc-text)]">{email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[color:var(--bc-text)]">Nova senha</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
            placeholder="Minimo de 8 caracteres"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[color:var(--bc-text)]">Confirmar nova senha</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
            placeholder="Repita a nova senha"
          />
        </label>
      </div>

      {feedback ? (
        <div
          className={[
            'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700',
          ].join(' ')}
          role="status"
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <CircleAlert size={18} className="mt-0.5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bc-button-primary h-12 gap-2 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
        Salvar nova senha
      </button>
    </form>
  );
}
