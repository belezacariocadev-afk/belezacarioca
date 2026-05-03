import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/components/LoginForm';
import { LoginPageShell } from '@/components/LoginPageShell';

export const metadata: Metadata = {
  title: 'Login do estabelecimento | Beleza Carioca',
  description: 'Acesse o portal do estabelecimento para operar agenda, clientes e equipe.',
};

export default function EstablishmentLoginPage() {
  return (
    <LoginPageShell secondaryLink={{ href: '/login-cliente', label: 'Entrar como cliente' }}>
      <Suspense fallback={null}>
        <LoginForm mode="establishment" />
      </Suspense>
    </LoginPageShell>
  );
}
