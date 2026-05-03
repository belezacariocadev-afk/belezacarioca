'use client';

import { usePlatformSession } from '@/components/platform/PlatformAuthProvider';

export function PlatformLogoutButton() {
  const { logout, isLoading, session } = usePlatformSession();

  if (!session) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={isLoading}
      className="rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-4 py-2 text-xs font-extrabold text-[color:var(--bc-text)] transition hover:border-[rgba(120,84,162,0.28)] hover:text-[#6e4c98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      Sair
    </button>
  );
}
