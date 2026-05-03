import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminLoginForm } from '@/components/AdminLoginForm';
import { LoginPageShell } from '@/components/LoginPageShell';
import { parsePlatformSession, platformSessionCookieName } from '@/lib/platform/auth/session';

export const metadata: Metadata = {
  title: 'Acesso administrativo | Beleza Carioca',
  description: 'Entre para gerenciar solicitações de parceiros e operações internas.',
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = parsePlatformSession(cookieStore.get(platformSessionCookieName)?.value);

  if (session?.profileId === 'platformAdmin') {
    redirect('/admin/parceiros');
  }

  return (
    <LoginPageShell secondaryLink={{ href: '/', label: 'Voltar para o site' }}>
      <AdminLoginForm />
    </LoginPageShell>
  );
}
