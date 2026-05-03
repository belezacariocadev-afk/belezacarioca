'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { PlatformSession } from '@/lib/platform/auth/session';

type TrialStatusBannerProps = {
  className?: string;
  session?: PlatformSession | null;
  showActivePlan?: boolean;
};

type SessionPayload = {
  session: PlatformSession | null;
};

export function TrialStatusBanner({ className = '', session: sessionProp, showActivePlan = false }: TrialStatusBannerProps) {
  const [loadedSession, setLoadedSession] = useState<PlatformSession | null>(sessionProp ?? null);
  const [isLoading, setIsLoading] = useState(sessionProp === undefined);

  useEffect(() => {
    if (sessionProp !== undefined) {
      setLoadedSession(sessionProp);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadSession() {
      const response = await fetch('/api/auth/session', { cache: 'no-store' }).catch(() => null);

      if (!isMounted) {
        return;
      }

      if (!response?.ok) {
        setLoadedSession(null);
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as SessionPayload;
      setLoadedSession(payload.session);
      setIsLoading(false);
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [sessionProp]);

  const notice = useMemo(() => buildTrialNotice(loadedSession), [loadedSession]);

  if (isLoading || !notice || (notice.kind === 'active' && !showActivePlan)) {
    return null;
  }

  const Icon = notice.kind === 'blocked' ? AlertTriangle : notice.kind === 'active' ? CheckCircle2 : Clock3;

  return (
    <div
      className={[
        'rounded-[1.6rem] border p-5 shadow-[0_18px_42px_rgba(110,84,144,0.08)]',
        notice.kind === 'blocked'
          ? 'border-[#f0b5ae] bg-[#fff7f5]'
          : notice.kind === 'active'
            ? 'border-[#bfe5d6] bg-[#f4fffa]'
            : 'border-[rgba(216,178,123,0.32)] bg-[#fffaf0]',
        className,
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <span
            className={[
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem]',
              notice.kind === 'blocked'
                ? 'bg-[#fee2dc] text-[#ad352d]'
                : notice.kind === 'active'
                  ? 'bg-[#dff7ea] text-[#326c65]'
                  : 'bg-[#fff0cf] text-[#8d6a39]',
            ].join(' ')}
          >
            <Icon size={20} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8d6a39]">{notice.eyebrow}</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[color:var(--bc-text)]">{notice.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--bc-muted)]">{notice.message}</p>
          </div>
        </div>
        {notice.cta ? (
          <Link href="/assinatura" className="bc-button-primary h-12 shrink-0 px-5 text-xs">
            {notice.cta}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function buildTrialNotice(session: PlatformSession | null) {
  const access = session?.commercialAccess;

  if (!session || !access) {
    return null;
  }

  if (access.reason === 'subscriptionActive') {
    const periodMessage = access.currentPeriodEnd
      ? `Seu plano vence dia ${formatDateLabel(access.currentPeriodEnd)}.`
      : 'Seu plano esta ativo e o salao continua liberado para operar.';
    const planMessage = access.planLabel
      ? ` Plano: ${access.planLabel}${access.professionalRange ? ` - faixa ${access.professionalRange}` : ''}.`
      : '';

    return {
      cta: 'Ver assinatura',
      eyebrow: 'Assinatura',
      kind: 'active' as const,
      message: `${periodMessage}${planMessage}`,
      title: 'Plano ativo',
    };
  }

  if (access.reason === 'trialExpired' || access.status === 'requiresSubscription') {
    return {
      cta: 'Regularizar assinatura',
      eyebrow: 'Acesso bloqueado',
      kind: 'blocked' as const,
      message: access.message || 'Renove sua assinatura para voltar a cadastrar agendamentos, clientes, profissionais e servicos.',
      title: access.reason === 'trialExpired' ? 'Teste gratis terminado' : 'Sistema congelado',
    };
  }

  if (access.reason !== 'trialActive' || !access.trialEndsAt) {
    return null;
  }

  const daysLeft = getCalendarDaysLeft(access.trialEndsAt);

  if (daysLeft <= 0) {
    return {
      cta: 'Assinar plano agora',
      eyebrow: 'Teste gratis ativo',
      kind: 'trial' as const,
      message: 'Seu teste termina hoje. Assine um plano para manter seu salao ativo.',
      title: 'Teste gratis ativo',
    };
  }

  if (daysLeft === 1) {
    return {
      cta: 'Assinar plano agora',
      eyebrow: 'Teste gratis ativo',
      kind: 'trial' as const,
      message: 'Seu teste termina amanha. Assine um plano para continuar recebendo agendamentos.',
      title: 'Teste gratis ativo',
    };
  }

  return {
    cta: 'Assinar plano agora',
    eyebrow: 'Teste gratis ativo',
    kind: 'trial' as const,
    message: `Faltam ${daysLeft} dias para seu teste acabar. Assine um plano para manter seu salao visivel e continuar recebendo agendamentos.`,
    title: 'Teste gratis ativo',
  };
}

function getCalendarDaysLeft(dateValue: string) {
  const now = new Date();
  const target = new Date(dateValue);

  if (Number.isNaN(target.getTime())) {
    return 0;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  return Math.max(0, Math.round((targetDay - today) / (24 * 60 * 60 * 1000)));
}

function formatDateLabel(dateValue: string) {
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}
