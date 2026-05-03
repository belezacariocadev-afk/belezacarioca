'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  {
    href: '/admin/parceiros',
    label: 'Parceiros',
  },
  {
    href: '/admin/administradores',
    label: 'Administradores',
  },
];

export function AdminTopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await fetch('/api/auth/session', {
      method: 'DELETE',
    }).catch(() => null);
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:justify-end">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'inline-flex h-10 items-center rounded-full border px-4 text-xs font-black uppercase tracking-[0.12em] transition',
              isActive
                ? 'border-[rgba(120,84,162,0.32)] bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]'
                : 'border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-muted)] hover:border-[rgba(216,178,123,0.34)] hover:text-[color:var(--bc-text)]',
            ].join(' ')}
          >
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => {
          void handleLogout();
        }}
        disabled={isLoggingOut}
        className="inline-flex h-10 items-center rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-5 text-xs font-extrabold uppercase tracking-[0.14em] text-[color:var(--bc-text)] transition hover:border-[rgba(120,84,162,0.34)] hover:text-[#6e4c98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? 'Saindo...' : 'Sair'}
      </button>
    </div>
  );
}
