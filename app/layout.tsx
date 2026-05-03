import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Manrope, Playfair_Display } from 'next/font/google';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PartnerReferralCapture } from '@/components/partner/PartnerReferralCapture';

import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Beleza Carioca',
  description:
    'Gestão premium para salões que querem crescer com agendamento, clientes, equipe e financeiro em um só fluxo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${playfair.variable}`}>
        <Suspense fallback={null}>
          <PartnerReferralCapture />
        </Suspense>
        <div className="bc-site-bg" aria-hidden="true">
          <div className="bc-orb bc-orb-left" />
          <div className="bc-orb bc-orb-right" />
          <div className="bc-grid-fade" />
        </div>
        <Header />
        <div className="relative z-10">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
