import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/components/LoginForm';
import { LoginPageShell } from '@/components/LoginPageShell';

export const metadata: Metadata = {
  title: 'Login do cliente | Beleza Carioca',
  description: 'Acesse sua area de cliente para acompanhar agendamentos e historico.',
};

export default function ClientLoginPage() {
  return (
    <LoginPageShell secondaryLink={{ href: '/login-estabelecimento', label: 'Entrar como estabelecimento' }}>
      <Suspense fallback={null}>
        <LoginForm mode="client" />
      </Suspense>
    </LoginPageShell>
  );
}
