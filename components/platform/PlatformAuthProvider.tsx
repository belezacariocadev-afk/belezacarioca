'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { accessProfiles } from '@/lib/platform/access';
import type { AccessProfileId } from '@/lib/platform/domain';
import type { PlatformSession } from '@/lib/platform/auth/session';

type PlatformAuthContextValue = {
  session: PlatformSession | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const PlatformAuthContext = createContext<PlatformAuthContextValue | null>(null);

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<PlatformSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
      }).catch(() => null);

      if (!isMounted) {
        return;
      }

      if (!response?.ok) {
        setSession(null);
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as { session: PlatformSession | null };
      setSession(payload.session);
      setIsLoading(false);
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/session', {
      method: 'DELETE',
    }).catch(() => null);
    setSession(null);
    router.push('/entrar');
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      logout,
    }),
    [isLoading, logout, session],
  );

  return <PlatformAuthContext.Provider value={value}>{children}</PlatformAuthContext.Provider>;
}

export function usePlatformSession() {
  const context = useContext(PlatformAuthContext);

  if (!context) {
    throw new Error('usePlatformSession must be used inside PlatformAuthProvider');
  }

  return context;
}

export function SessionStatusBar({ expectedProfileId }: { expectedProfileId: AccessProfileId }) {
  const { isLoading, logout, session } = usePlatformSession();
  const expectedProfile = accessProfiles[expectedProfileId];
  const currentProfile = session ? accessProfiles[session.profileId] : null;

  return (
    <div className="rounded-lg border border-[rgba(120,84,162,0.12)] bg-white p-4 text-sm shadow-[0_12px_28px_rgba(110,84,144,0.08)]">
      {isLoading ? (
        <span className="font-semibold text-[color:var(--bc-muted)]">Validando sessao...</span>
      ) : session ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-[color:var(--bc-text)]">{session.email}</p>
            <p className="mt-1 text-xs font-semibold text-[color:var(--bc-muted)]">
              Perfil ativo: {currentProfile?.label} | area atual: {expectedProfile.label}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[rgba(120,84,162,0.16)] px-4 text-xs font-extrabold text-[color:var(--bc-text)] transition hover:border-[rgba(120,84,162,0.34)]"
          >
            Sair
          </button>
        </div>
      ) : (
        <span className="font-semibold text-[#bd3f37]">Sessao nao encontrada.</span>
      )}
    </div>
  );
}
