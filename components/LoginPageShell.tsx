import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { LoginBackButton } from '@/components/LoginBackButton';
import { LoginShowcase } from '@/components/LoginShowcase';

type LoginPageShellProps = {
  children: ReactNode;
  secondaryLink?: {
    href: string;
    label: string;
  };
};

export function LoginPageShell({ children, secondaryLink }: LoginPageShellProps) {
  return (
    <main className="relative z-20 min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffdfa_0%,#fff7ef_100%)]">
      <header className="border-b border-black/6 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-[min(1400px,calc(100vw-1.5rem))] items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/assets/logo-horizontal.png"
              alt="Beleza Carioca"
              width={184}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <LoginBackButton />
            {secondaryLink ? (
              <Link
                href={secondaryLink.href}
                className="hidden text-sm font-semibold text-[#5a5f67] transition hover:text-[#1f232b] md:inline-flex"
              >
                {secondaryLink.label}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-[min(1400px,calc(100vw-1.5rem))] gap-10 py-8 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-14 lg:py-0">
        <LoginShowcase />

        <div className="relative flex items-center justify-center py-4 lg:min-h-[calc(100vh-5rem)] lg:border-l lg:border-black/6 lg:py-14 lg:pl-10 xl:pl-16">
          <div className="absolute inset-0 hidden lg:block lg:bg-[radial-gradient(circle_at_top,rgba(120,84,162,0.12),transparent_28%)]" />
          <div className="relative z-10 w-full">{children}</div>
        </div>
      </section>
    </main>
  );
}
