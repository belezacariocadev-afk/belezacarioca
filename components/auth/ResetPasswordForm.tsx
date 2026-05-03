'use client';

import Link from 'next/link';
import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

type Feedback =
  | {
      message: string;
      type: 'error' | 'success';
    }
  | null;

function readRecoveryAccessToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  const queryToken = new URLSearchParams(window.location.search).get('access_token');
  const hashToken = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('access_token');

  return queryToken ?? hashToken ?? '';
}

async function updatePasswordWithRecoveryToken(input: {
  accessToken: string;
  password: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase nao esta configurado no navegador.');
  }

  // O link de recovery do Supabase entrega um access_token temporario.
  // Com esse bearer token, a troca de senha acontece direto no Auth.
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: input.password,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export function ResetPasswordForm() {
  const [accessToken, setAccessToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAccessToken(readRecoveryAccessToken());
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setFeedback({ type: 'error', message: 'Link de recuperacao invalido ou expirado. Solicite um novo link.' });
      return;
    }

    if (password.length < 8) {
      setFeedback({ type: 'error', message: 'Use uma senha com pelo menos 8 caracteres.' });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: 'error', message: 'A confirmacao precisa ser igual a nova senha.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await updatePasswordWithRecoveryToken({
        accessToken,
        password,
      });
      setPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: 'Senha atualizada com sucesso. Voce ja pode entrar com a nova senha.' });
    } catch (error) {
      console.error('[ResetPasswordForm] erro ao atualizar senha', error);
      setFeedback({
        type: 'error',
        message: 'Nao foi possivel atualizar sua senha. Solicite um novo link e tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="rounded-[2rem] border border-black/6 bg-white px-6 py-7 shadow-[0_24px_70px_rgba(29,35,43,0.08)] md:px-8 md:py-9">
        <span className="inline-flex rounded-full border border-[#ded1ef] bg-[#f6f0ff] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7854a2]">
          Nova senha
        </span>

        <div className="mt-6">
          <h1 className="text-[2.4rem] font-black tracking-[-0.05em] text-[#1f232b]">Crie uma nova senha</h1>
          <p className="mt-3 text-[15px] leading-7 text-[#666b74]">
            Escolha uma senha segura para voltar a acessar sua conta.
          </p>
        </div>

        {feedback ? (
          <div
            className={[
              'mt-6 flex items-start gap-3 rounded-[1.35rem] border px-4 py-3 text-sm',
              feedback.type === 'success'
                ? 'border-[#b9efcb] bg-[#effcf4] text-[#1f7a3d]'
                : 'border-[#f1b7b0] bg-[#fff1f0] text-[#bd3f37]',
            ].join(' ')}
            aria-live="polite"
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        {!accessToken ? (
          <div className="mt-6 rounded-[1.35rem] border border-[#f1d6a8] bg-[#fff9ed] px-4 py-3 text-sm leading-6 text-[#8a5d1f]">
            O token de recuperacao ainda nao foi encontrado. Se voce abriu esta pagina manualmente, use o link recebido por e-mail.
          </div>
        ) : null}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#1f232b]">Nova senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua nova senha"
              autoComplete="new-password"
              className="h-13 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f232b] outline-none transition focus:border-[#7854a2] focus:ring-2 focus:ring-[#7854a2]/20"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#1f232b]">Confirmar senha</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Digite sua nova senha novamente"
              autoComplete="new-password"
              className="h-13 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f232b] outline-none transition focus:border-[#7854a2] focus:ring-2 focus:ring-[#7854a2]/20"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#7854a2] text-base font-black text-white transition hover:bg-[#684790] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle size={20} className="animate-spin" /> : null}
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#666b74]">
          Depois de salvar, entre novamente pelo{' '}
          <Link href="/login-estabelecimento" className="font-bold text-[#7854a2] transition hover:text-[#5f3f86]">
            login do estabelecimento
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
