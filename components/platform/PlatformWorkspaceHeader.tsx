'use client';

import Link from 'next/link';

import { PlatformLogoutButton } from '@/components/platform/PlatformLogoutButton';
import { usePlatformSession } from '@/components/platform/PlatformAuthProvider';

type PortalNavItem = {
  href: string;
  label: string;
  active?: boolean;
};

type PlatformWorkspaceHeaderProps = {
  navItems: PortalNavItem[];
  profileLabel: string;
};

export function PlatformWorkspaceHeader({ navItems, profileLabel }: PlatformWorkspaceHeaderProps) {
  const { isLoading, session } = usePlatformSession();

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-[rgba(120,84,162,0.12)] bg-white/92 p-5 shadow-[0_24px_70px_rgba(106,79,144,0.12)] md:p-6 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#6e4c98]">
          Beleza Carioca
        </Link>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'rounded-full px-4 py-2 text-xs font-extrabold transition',
                item.active
                  ? 'bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]'
                  : 'border border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-muted)] hover:border-[rgba(120,84,162,0.28)] hover:text-[#6e4c98]',
              ].join(' ')}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[rgba(120,84,162,0.1)] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#6e4c98]">
            {profileLabel}
          </span>
          <span className="text-sm font-semibold text-[color:var(--bc-muted)]">
            {isLoading ? 'Validando sessao...' : session?.email ?? 'Sessao nao encontrada'}
          </span>
        </div>
        <PlatformLogoutButton />
      </div>
    </div>
  );
}
