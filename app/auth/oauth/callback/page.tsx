'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type CallbackState =
  | {
      message: string;
      type: 'error' | 'loading' | 'success';
    };

function readOAuthParams() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);

  return {
    accessToken: hashParams.get('access_token') ?? queryParams.get('access_token'),
    error: hashParams.get('error_description') ?? queryParams.get('error_description') ?? hashParams.get('error') ?? queryParams.get('error'),
    nextPath: queryParams.get('next'),
    refreshToken: hashParams.get('refresh_token') ?? queryParams.get('refresh_token'),
    surface: queryParams.get('surface'),
  };
}

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({
    message: 'Preparando seu acesso...',
    type: 'loading',
  });

  useEffect(() => {
    let isMounted = true;

    async function completeOAuthLogin() {
      const params = readOAuthParams();

      if (params.error) {
        setState({
          message: 'Login social nao concluido. Voltando para o login...',
          type: 'error',
        });
        router.replace('/login-estabelecimento?oauthError=1');
        return;
      }

      if (!params.accessToken) {
        setState({
          message: 'Nao foi possivel concluir o login social. Voltando para o login...',
          type: 'error',
        });
        router.replace('/login-estabelecimento?oauthError=1');
        return;
      }

      const response = await fetch('/api/auth/oauth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessSurface: params.surface ?? 'establishment',
          accessToken: params.accessToken,
          nextPath: params.nextPath,
          refreshToken: params.refreshToken,
        }),
      }).catch(() => null);
      const payload = (await response?.json().catch(() => null)) as { message?: string; redirectTo?: string } | null;

      if (!response?.ok || !payload?.redirectTo) {
        if (isMounted) {
          setState({
            message: 'Nao foi possivel concluir o login social. Voltando para o login...',
            type: 'error',
          });
        }
        router.replace(`/login-estabelecimento?oauthError=1${payload?.message ? `&message=${encodeURIComponent(payload.message)}` : ''}`);
        return;
      }

      if (isMounted) {
        setState({
          message: 'Acesso liberado. Redirecionando...',
          type: 'success',
        });
        router.replace(payload.redirectTo);
        router.refresh();
      }
    }

    void completeOAuthLogin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#fbf8f4] px-4 py-16">
      <div className="mx-auto max-w-md rounded-[2rem] border border-black/6 bg-white p-7 text-center shadow-[0_24px_70px_rgba(29,35,43,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f0ff] text-[#7854a2]">
          {state.type === 'loading' ? <LoaderCircle className="animate-spin" size={24} /> : state.type === 'success' ? <CheckCircle2 size={24} /> : <CircleAlert size={24} />}
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#1f232b]">Login social</h1>
        <p className="mt-3 text-sm leading-6 text-[#666b74]">{state.message}</p>
        {state.type === 'error' ? (
          <Link href="/login-estabelecimento" className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#7854a2] px-5 text-sm font-black text-white">
            Voltar para o login
          </Link>
        ) : null}
      </div>
    </main>
  );
}
