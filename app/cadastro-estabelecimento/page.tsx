import type { Metadata } from 'next';
import { Suspense } from 'react';

import { EstablishmentSignupForm } from '@/components/EstablishmentSignupForm';

export const metadata: Metadata = {
  title: 'Cadastro de estabelecimento | Beleza Carioca',
  description: 'Crie o acesso do seu salao e comece o teste gratis de 7 dias.',
};

export default function EstablishmentSignupPage() {
  return (
    <main className="relative z-10 min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f7f0e9_100%)] px-4 py-10 md:py-14">
      <Suspense fallback={null}>
        <EstablishmentSignupForm />
      </Suspense>
    </main>
  );
}
