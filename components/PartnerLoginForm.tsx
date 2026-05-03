'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CircleAlert, Info, LockKeyhole, Mail } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';

type PartnerLoginValues = {
  email: string;
  password: string;
};

type PartnerLoginErrors = Partial<Record<keyof PartnerLoginValues, string>>;

type LoginFailurePayload = {
  message?: string;
  partnerStatus?: 'blocked' | 'pending' | 'rejected' | 'notFound' | 'unavailable';
};

type LoginSuccessPayload = {
  redirectTo: string;
};

type FeedbackState =
  | {
      type: 'error' | 'info' | 'success';
      message: string;
    }
  | null;

function validate(values: PartnerLoginValues): PartnerLoginErrors {
  const nextErrors: PartnerLoginErrors = {};
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

function getFeedbackTypeByStatus(status?: LoginFailurePayload['partnerStatus']): 'error' | 'info' {
  if (status === 'pending' || status === 'notFound' || status === 'unavailable') {
    return 'info';
  }

  return 'error';
}

export function PartnerLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<PartnerLoginValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<PartnerLoginErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const isBusy = isSubmitting || isPending;
  const showLocalTestHint = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    const reason = params.get('reason');

    if (next?.startsWith('/')) {
      setNextPath(next);
    }

    if (reason === 'sem-permissao') {
      setFeedback({
        type: 'info',
        message: 'Entre com uma conta de parceiro aprovada para acessar essa area.',
      });
    }
  }, []);

  function handleFieldChange(field: keyof PartnerLoginValues) {
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
          accessSurface: 'partner',
          email: values.email.trim().toLowerCase(),
          nextPath,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as LoginFailurePayload | null;
        setFeedback({
          type: getFeedbackTypeByStatus(payload?.partnerStatus),
          message: payload?.message ?? 'Nao foi possivel entrar agora. Tente novamente.',
        });
        return;
      }

      const payload = (await response.json()) as LoginSuccessPayload;
      setFeedback({
        type: 'success',
        message: 'Acesso liberado. Redirecionando para o painel do parceiro...',
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
          Area do parceiro
        </span>

        <div className="mt-6">
          <h1 className="text-[2.6rem] font-black tracking-[-0.05em] text-[#1f232b]">Area do parceiro</h1>
          <p className="mt-3 text-[15px] leading-7 text-[#666b74]">
            Entre para acessar seu painel, materiais, leads e comissoes.
          </p>
        </div>

        {feedback ? (
          <div
            className={[
              'mt-6 flex items-start gap-3 rounded-[1.35rem] border px-4 py-3 text-sm',
              feedback.type === 'success'
                ? 'border-[#b9efcb] bg-[#effcf4] text-[#1f7a3d]'
                : feedback.type === 'info'
                  ? 'border-[#c7d8ff] bg-[#f3f8ff] text-[#255ab1]'
                  : 'border-[#f1b7b0] bg-[#fff1f0] text-[#bd3f37]',
            ].join(' ')}
            aria-live="polite"
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : feedback.type === 'info' ? (
              <Info size={18} className="mt-0.5 shrink-0" />
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
                placeholder="parceiro@belezacarioca.com"
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

          <div className="flex items-center justify-between gap-4 text-sm">
            <Link href="/ajuda" className="font-semibold text-[#7854a2] transition hover:text-[#5f3f86]">
              Esqueci minha senha
            </Link>
            <Link href="/entrar" className="font-semibold text-[#5a5f67] transition hover:text-[#1f232b]">
              Voltar para acessos
            </Link>
          </div>

          <Button type="submit" loading={isBusy} disabled={isBusy} className="h-14 w-full">
            {isBusy ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-7 text-center text-xs leading-6 text-[#9aa0a7]">
          Acesso exclusivo para parceiros aprovados pela equipe Beleza Carioca.
        </p>
        {showLocalTestHint ? (
          <p className="mt-2 text-center text-[11px] leading-5 text-[#b090cf]">
            Teste: parceiroteste@belezacarioca.com / Parceiro123!
          </p>
        ) : null}
      </div>
    </div>
  );
}
