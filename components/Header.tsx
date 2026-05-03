'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/entrar', label: 'Entrar' },
];

const hiddenChromePrefixes = [
  '/entrar',
  '/login-cliente',
  '/login-estabelecimento',
  '/assinatura',
  '/parceiro',
  '/admin',
  '/cliente',
  '/profissional',
  '/acesso-negado',
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (hiddenChromePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(120,84,162,0.12)] bg-[rgba(255,253,249,0.95)] shadow-[0_10px_32px_rgba(83,61,120,0.075)] backdrop-blur-2xl">
      <div className="bc-container">
        <div className="flex min-h-[88px] items-center gap-5 py-3.5">
          <Link
            href="/"
            className="group inline-flex shrink-0 items-center gap-3 rounded-[1.25rem] px-1 py-1 transition hover:bg-white/70"
            aria-label="Voltar para a home Beleza Carioca"
          >
            <Image
              src="/assets/logo-horizontal.png"
              alt="Beleza Carioca"
              width={232}
              height={62}
              className="h-12 w-auto transition duration-200 group-hover:scale-[1.02] md:h-[3.35rem]"
              priority
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.1)] bg-white/82 p-1.5 shadow-[0_12px_28px_rgba(104,78,140,0.07)] lg:flex" aria-label="Navegação principal">
            {navItems.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'rounded-full px-5 py-[0.85rem] text-sm font-extrabold transition-all',
                    active
                      ? 'bg-[rgba(120,84,162,0.1)] text-[color:var(--bc-purple-strong)]'
                      : 'text-[color:var(--bc-muted)] hover:bg-[rgba(120,84,162,0.06)] hover:text-[color:var(--bc-text)]',
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/cadastro-estabelecimento"
            className="ml-auto hidden rounded-full bg-gradient-to-r from-[#7854a2] via-[#9a6ec0] to-[#d8b27b] px-6 py-[0.95rem] text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(120,84,162,0.19)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(120,84,162,0.24)] lg:ml-3 lg:inline-flex"
          >
            Cadastrar meu espaco
          </Link>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(120,84,162,0.16)] bg-white text-[color:var(--bc-text)] shadow-[0_12px_26px_rgba(104,78,140,0.1)] lg:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open ? (
          <nav className="mb-5 grid gap-2 rounded-[1.75rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(255,255,255,0.98)] p-3 shadow-[0_20px_44px_rgba(104,78,140,0.12)] lg:hidden" aria-label="Navegação principal">
            {navItems.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={[
                    'rounded-2xl px-4 py-3 text-sm font-extrabold transition-colors',
                    active
                      ? 'bg-[rgba(120,84,162,0.1)] text-[color:var(--bc-purple-strong)]'
                      : 'text-[color:var(--bc-muted)] hover:bg-[rgba(120,84,162,0.05)] hover:text-[color:var(--bc-text)]',
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/cadastro-estabelecimento"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-gradient-to-r from-[#7854a2] to-[#d8b27b] px-4 py-3 text-center text-sm font-extrabold text-white shadow-[0_16px_32px_rgba(120,84,162,0.18)]"
            >
              Cadastrar meu estabelecimento
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
