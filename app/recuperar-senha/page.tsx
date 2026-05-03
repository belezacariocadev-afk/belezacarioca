import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { LoginPageShell } from '@/components/LoginPageShell';

export const metadata: Metadata = {
  title: 'Recuperar senha | Beleza Carioca',
  description: 'Receba um link seguro para redefinir sua senha de acesso.',
};

export default function ForgotPasswordPage() {
  return (
    <LoginPageShell secondaryLink={{ href: '/login-estabelecimento', label: 'Voltar ao login' }}>
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </LoginPageShell>
  );
}
