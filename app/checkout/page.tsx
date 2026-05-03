import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CheckoutSummary } from '@/components/billing/CheckoutSummary';

export const metadata: Metadata = {
  title: 'Checkout seguro | Beleza Carioca',
  description: 'Confira sua assinatura antes de finalizar o pagamento no Asaas.',
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#f7f0e9_100%)] px-4 py-12">
      <Suspense fallback={null}>
        <CheckoutSummary />
      </Suspense>
    </main>
  );
}
