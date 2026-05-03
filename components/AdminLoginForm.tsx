'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CircleAlert, LockKeyhole, Mail } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';

type AdminLoginValues = {
  email: string;
  password: string;
};

type AdminLoginErrors = Partial<Record<keyof AdminLoginValues, string>>;

type LoginFailurePayload = {
  message?: string;
};

type LoginSuccessPayload = {
  redirectTo: string;
};

type FeedbackState =
  | {
      type: 'error' | 'success';
      message: string;
    }
  | null;

function validate(values: AdminLoginValues): AdminLoginErrors {
  const nextErrors: AdminLoginErrors = {};
  const email = values.email.trim();
  const password = values.password.trim();

  if (!email) {
    nextErrors.email = 'Informe um e-mail para continuar.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nextErrors.email = 'Use um e-mail valido.';
  }

  if (!password) {
    nextErrors.password = 'Informe sua senha.';
  } else if (password.length < 6) {
    nextErrors.password = 'Use pelo menos 6 caracteres.';
  }

  return nextErrors;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<AdminLoginValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<AdminLoginErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const isBusy = isSubmitting || isPending;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');

    setNextPath(next?.startsWith('/') ? next : null);
  }, []);

  function handleFieldChange(field: keyof AdminLoginValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setValues((current) => ({
        ...current,
        [field]: nextValue,
      }));

      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));

      if (feedback) {
        setFeedback(null);
      }
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback({
        type: 'error',
        message: 'Revise os campos destacados para continuar.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessSurface: 'admin',
          email: values.email.trim().toLowerCase(),
          nextPath,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as LoginFailurePayload | null;
        setFeedback({
          type: 'error',
          message: payload?.message ?? 'Nao foi possivel entrar agora. Tente novamente.',
        });
        return;
      }

      const payload = (await response.json()) as LoginSuccessPayload;
      setFeedback({
        type: 'success',
        message: 'Acesso liberado. Redirecionando para o painel administrativo...',
      });

      startTransition(() => {
        router.push(payload.redirectTo);
        router.refresh();
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Nao foi possivel conectar ao servidor. Tente novamente em instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="rounded-[2rem] border border-black/6 bg-white px-6 py-7 shadow-[0_24px_70px_rgba(29,35,43,0.08)] md:px-8 md:py-9">
        <span className="inline-flex rounded-full border border-[#ded1ef] bg-[#f6f0ff] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7854a2]">
          Acesso administrativo
        </span>

        <div className="mt-6">
          <h1 className="text-[2.6rem] font-black tracking-[-0.05em] text-[#1f232b]">Acesso administrativo</h1>
          <p className="mt-3 text-[15px] leading-7 text-[#666b74]">
            Entre para gerenciar solicitações de parceiros e operações internas.
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

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1f232b]">E-mail</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa0a7]" />
              <input
                type="email"
                value={values.email}
                onChange={handleFieldChange('email')}
                autoComplete="email"
                placeholder="admin@belezacarioca.com"
                className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm text-[#1f232b] outline-none transition focus:border-[#cdb7eb] focus:ring-2 focus:ring-[#ede3fa]"
              />
            </div>
            {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1f232b]">Senha</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa0a7]" />
              <input
                type="password"
                value={values.password}
                onChange={handleFieldChange('password')}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm text-[#1f232b] outline-none transition focus:border-[#cdb7eb] focus:ring-2 focus:ring-[#ede3fa]"
              />
            </div>
            {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
          </div>

          <Button type="submit" loading={isBusy} disabled={isBusy} className="h-14 w-full">
            {isBusy ? 'Entrando...' : 'Entrar como admin'}
          </Button>
        </form>

        <p className="mt-7 text-center text-sm leading-6 text-[#666b74]">
          <Link href="/" className="font-semibold text-[#5a5f67] transition hover:text-[#1f232b]">
            Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}
