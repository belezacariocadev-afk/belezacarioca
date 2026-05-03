'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, CircleAlert, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type LoginValues = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;
type LoginFormMode = 'client' | 'establishment';
type SocialProvider = 'facebook' | 'google';

type LoginFormProps = {
  mode?: LoginFormMode;
};

type LoginFormCopy = {
  alternateHref: string;
  alternateLabel: string;
  alternateText: string;
  demoEmail: string;
  demoLabel: string;
  demoPassword: string;
  description: string;
  emailPlaceholder: string;
  eyebrow: string;
  footerHref: string;
  footerLabel: string;
  footerText: string;
  primaryLabel: string;
  successMessage: string;
  title: string;
};

type FeedbackState =
  | {
      type: 'error' | 'success';
      message: string;
    }
  | null;

const demoDelayMs = 850;

const loginFormCopy: Record<LoginFormMode, LoginFormCopy> = {
  client: {
    alternateHref: '/login-estabelecimento',
    alternateLabel: 'Entrar como estabelecimento',
    alternateText: 'Trabalha em um salao?',
    demoEmail: 'marina@cliente.com',
    demoLabel: 'Usar acesso de cliente demo',
    demoPassword: 'cliente-demo',
    description: 'Acompanhe seus proximos atendimentos, historico e novas solicitacoes de agendamento.',
    emailPlaceholder: 'marina@cliente.com',
    eyebrow: 'Area do cliente',
    footerHref: '/#buscar',
    footerLabel: 'Buscar servicos',
    footerText: 'Ainda nao escolheu um atendimento?',
    primaryLabel: 'Entrar na minha area',
    successMessage: 'Acesso liberado. Abrindo sua area de cliente...',
    title: 'Entrar como cliente',
  },
  establishment: {
    alternateHref: '/login-cliente',
    alternateLabel: 'Entrar como cliente',
    alternateText: 'Quer agendar um servico?',
    demoEmail: 'contato@belezacarioca.com',
    demoLabel: 'Usar acesso do estabelecimento demo',
    demoPassword: 'Beleza123!',
    description: 'Use seu e-mail do salao. A area correta da equipe e identificada automaticamente depois do login.',
    emailPlaceholder: 'contato@belezacarioca.com',
    eyebrow: 'Portal do estabelecimento',
    footerHref: '/cadastro-estabelecimento',
    footerLabel: 'Cadastrar estabelecimento',
    footerText: 'Ainda nao usa o Beleza Carioca?',
    primaryLabel: 'Entrar no portal',
    successMessage: 'Acesso liberado. Abrindo a area correta do estabelecimento...',
    title: 'Entrar como estabelecimento',
  },
};

function validate(values: LoginValues): LoginErrors {
  const nextErrors: LoginErrors = {};
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

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildHref(pathname: string, nextPath: string | null) {
  return nextPath ? `${pathname}?next=${encodeURIComponent(nextPath)}` : pathname;
}

export function LoginForm({ mode = 'establishment' }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<LoginValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const copy = loginFormCopy[mode];

  useEffect(() => {
    if (mode === 'establishment' && searchParams.get('cadastro') === 'sucesso') {
      setFeedback({
        type: 'success',
        message: 'Cadastro criado com sucesso. Entre com seu e-mail e senha para abrir o painel.',
      });
      return;
    }

    if (mode === 'establishment' && searchParams.get('oauthError')) {
      setFeedback({
        type: 'error',
        message: 'Nao foi possivel concluir o login social. Tente novamente ou entre com e-mail e senha.',
      });
    }
  }, [mode, searchParams]);
  const isBusy = isSubmitting || isPending;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');

    setNextPath(next?.startsWith('/') ? next : null);
  }, []);

  function handleFieldChange(field: keyof LoginValues) {
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

  async function authenticate(credentials: LoginValues) {
    setIsSubmitting(true);
    setFeedback(null);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...credentials,
        accessSurface: mode,
        nextPath,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const payload = (await response?.json().catch(() => null)) as { message?: string } | null;
      setIsSubmitting(false);
      setFeedback({
        type: 'error',
        message: payload?.message ?? 'Nao foi possivel entrar. Tente novamente.',
      });
      return;
    }

    const payload = (await response.json()) as { redirectTo: string };

    await wait(Math.min(demoDelayMs, 300));
    setFeedback({
      type: 'success',
      message: copy.successMessage,
    });
    startTransition(() => {
      router.push(payload.redirectTo);
      router.refresh();
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback({
        type: 'error',
        message: 'Revise os campos destacados para entrar.',
      });
      return;
    }

    await authenticate(values);
  }

  async function handleDemoLogin() {
    const demoCredentials = {
      email: copy.demoEmail,
      password: copy.demoPassword,
    };

    setValues(demoCredentials);
    setErrors({});
    await authenticate(demoCredentials);
  }

  function handleSocialLogin(provider: SocialProvider) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');

    if (!supabaseUrl) {
      setFeedback({
        type: 'error',
        message: 'Login social indisponivel no momento.',
      });
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    const callbackUrl = new URL('/auth/oauth/callback', window.location.origin);
    callbackUrl.searchParams.set('surface', mode);

    if (nextPath) {
      callbackUrl.searchParams.set('next', nextPath);
    }

    const authorizeUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
    authorizeUrl.searchParams.set('provider', provider);
    authorizeUrl.searchParams.set('redirect_to', callbackUrl.toString());

    window.location.assign(authorizeUrl.toString());
  }

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="rounded-[2rem] border border-black/6 bg-white px-6 py-7 shadow-[0_24px_70px_rgba(29,35,43,0.08)] md:px-8 md:py-9">
        <span className="inline-flex rounded-full border border-[#ded1ef] bg-[#f6f0ff] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7854a2]">
          {copy.eyebrow}
        </span>

        <div className="mt-6">
          <h1 className="text-[2.6rem] font-black tracking-[-0.05em] text-[#1f232b]">{copy.title}</h1>
          <p className="mt-3 text-[15px] leading-7 text-[#666b74]">{copy.description}</p>
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
          <Input
            label="E-mail"
            type="email"
            value={values.email}
            onChange={handleFieldChange('email')}
            placeholder={copy.emailPlaceholder}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Senha"
            type="password"
            icon="password"
            value={values.password}
            onChange={handleFieldChange('password')}
            placeholder="Digite sua senha"
            error={errors.password}
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[#9aa0a7]">Acesso seguro para sua area.</span>
            <Link
              href={values.email.trim() ? `/recuperar-senha?email=${encodeURIComponent(values.email.trim())}` : '/recuperar-senha'}
              className="font-semibold text-[#7854a2] transition hover:text-[#5f3f86]"
            >
              Esqueci a senha
            </Link>
          </div>

          <Button
            type="submit"
            loading={isBusy}
            disabled={isBusy}
            className="w-full h-14"
          >
            {isBusy ? 'Entrando...' : copy.primaryLabel}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-4 text-sm text-[#8d9299]">
          <span className="h-px flex-1 bg-black/8" />
          <span>ou</span>
          <span className="h-px flex-1 bg-black/8" />
        </div>

        {mode === 'establishment' ? (
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isBusy}
              className="inline-flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white text-sm font-black text-[#1f232b] shadow-[0_10px_24px_rgba(29,35,43,0.05)] transition hover:border-[#7854a2]/35 hover:bg-[#fbf8ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6f0ff] text-xs font-black text-[#7854a2]">G</span>
              Entrar com Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isBusy}
              className="inline-flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white text-sm font-black text-[#1f232b] shadow-[0_10px_24px_rgba(29,35,43,0.05)] transition hover:border-[#2374ea]/35 hover:bg-[#f7fbff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef5ff] text-xs font-black text-[#2374ea]">f</span>
              Entrar com Facebook
            </button>
            <p className="text-center text-xs leading-5 text-[#8d9299]">
              Use sua conta social para entrar com mais praticidade.
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void handleDemoLogin()}
          disabled={isBusy}
          className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#2374ea] text-base font-bold text-white transition hover:bg-[#1664d7] disabled:cursor-not-allowed disabled:bg-[#7fafef]"
        >
          <CheckCircle2 size={20} />
          {copy.demoLabel}
        </button>

        <div className="mt-9 space-y-5 text-center text-[15px] leading-7 text-[#666b74]">
          <p>
            {copy.footerText}{' '}
            <Link href={copy.footerHref} className="font-bold text-[#7854a2] transition hover:text-[#5f3f86]">
              {copy.footerLabel}
            </Link>
          </p>

          <p>
            {copy.alternateText}{' '}
            <Link
              href={buildHref(copy.alternateHref, nextPath)}
              className="font-bold text-[#1f232b] underline decoration-black/20 underline-offset-4"
            >
              {copy.alternateLabel}
            </Link>
          </p>
        </div>

        <p className="mt-7 text-center text-xs leading-6 text-[#9aa0a7]">
          Demo funcional: qualquer e-mail valido e senha com 6 ou mais caracteres criam uma sessao local protegida.
        </p>
      </div>
    </div>
  );
}
