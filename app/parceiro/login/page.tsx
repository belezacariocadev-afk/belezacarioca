import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { PartnerLoginForm } from '@/components/PartnerLoginForm';
import { LoginPageShell } from '@/components/LoginPageShell';
import { resolvePartnerApprovalDecision } from '@/lib/partner/approval';
import { parsePlatformSession, platformSessionCookieName } from '@/lib/platform/auth/session';

export const metadata: Metadata = {
  title: 'Login do parceiro | Beleza Carioca',
  description: 'Entre na area do parceiro para acompanhar materiais, leads, conversoes e comissoes.',
};

export default async function PartnerLoginPage() {
  const cookieStore = await cookies();
  const session = parsePlatformSession(cookieStore.get(platformSessionCookieName)?.value);

  if (session?.profileId === 'partner') {
    const approvalDecision = await resolvePartnerApprovalDecision(session.email);

    if (approvalDecision.isApproved) {
      redirect('/parceiro#dashboard');
    }
  }

  return (
    <LoginPageShell secondaryLink={{ href: '/entrar', label: 'Voltar para acessos' }}>
      <PartnerLoginForm />
    </LoginPageShell>
  );
}
