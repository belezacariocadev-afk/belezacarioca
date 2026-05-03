import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { LoginPageShell } from '@/components/LoginPageShell';

export const metadata: Metadata = {
  title: 'Criar nova senha | Beleza Carioca',
  description: 'Defina uma nova senha segura para sua conta.',
};

export default function ResetPasswordPage() {
  return (
    <LoginPageShell secondaryLink={{ href: '/login-estabelecimento', label: 'Voltar ao login' }}>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </LoginPageShell>
  );
}
