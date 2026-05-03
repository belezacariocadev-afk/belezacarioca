'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, CircleAlert, LoaderCircle, Mail } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

type Feedback =
  | {
      message: string;
      recoveryLink?: string;
      type: 'error' | 'success';
    }
  | null;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setFeedback({ type: 'error', message: 'Informe um e-mail valido para receber o link.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        ok?: boolean;
        recoveryLink?: string;
      } | null;

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.message ?? 'Nao foi possivel enviar o link agora.');
      }

      setFeedback({
        type: 'success',
        message: 'Enviamos um link de recuperacao para este e-mail. Verifique sua caixa de entrada.',
        recoveryLink: payload?.recoveryLink,
      });
    } catch (error) {
      console.error('[ForgotPasswordForm] erro ao solicitar recuperacao', error);
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Nao foi possivel enviar o link agora. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="rounded-[2rem] border border-black/6 bg-white px-6 py-7 shadow-[0_24px_70px_rgba(29,35,43,0.08)] md:px-8 md:py-9">
        <span className="inline-flex rounded-full border border-[#ded1ef] bg-[#f6f0ff] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7854a2]">
          Recuperar acesso
        </span>

        <div className="mt-6">
          <h1 className="text-[2.4rem] font-black tracking-[-0.05em] text-[#1f232b]">Esqueceu sua senha?</h1>
          <p className="mt-3 text-[15px] leading-7 text-[#666b74]">
            Digite o e-mail da sua conta e enviaremos um link seguro para criar uma nova senha.
          </p>
        </div>

        {feedback ? (
          <div
            className={[
              'mt-6 rounded-[1.35rem] border px-4 py-3 text-sm',
              feedback.type === 'success'
                ? 'border-[#b9efcb] bg-[#effcf4] text-[#1f7a3d]'
                : 'border-[#f1b7b0] bg-[#fff1f0] text-[#bd3f37]',
            ].join(' ')}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              ) : (
                <CircleAlert size={18} className="mt-0.5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            {feedback.recoveryLink ? (
              <Link href={feedback.recoveryLink} className="mt-3 inline-flex font-bold underline underline-offset-4">
                Abrir link gerado no ambiente local
              </Link>
            ) : null}
          </div>
        ) : null}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#1f232b]">E-mail</span>
            <span className="relative block">
              <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8d9299]" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu email"
                autoComplete="email"
                className="h-13 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pl-12 text-sm text-[#1f232b] outline-none transition focus:border-[#7854a2] focus:ring-2 focus:ring-[#7854a2]/20"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#7854a2] text-base font-black text-white transition hover:bg-[#684790] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle size={20} className="animate-spin" /> : null}
            {isSubmitting ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#666b74]">
          Lembrou sua senha?{' '}
          <Link href="/login-estabelecimento" className="font-bold text-[#7854a2] transition hover:text-[#5f3f86]">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
