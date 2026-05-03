import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { PartnerWorkspace } from '@/components/partner/PartnerWorkspace';
import { resolvePartnerApprovalDecision } from '@/lib/partner/approval';
import { loadPartnerAreaData } from '@/lib/partner/dashboard';
import { parsePlatformSession, platformSessionCookieName } from '@/lib/platform/auth/session';

export const metadata: Metadata = {
  title: 'Area do Parceiro | Beleza Carioca',
  description: 'Painel do parceiro Beleza Carioca para acompanhar leads, conversoes, materiais e comissoes.',
};

export default async function PartnerPage() {
  const cookieStore = await cookies();
  const session = parsePlatformSession(cookieStore.get(platformSessionCookieName)?.value);

  if (!session || session.profileId !== 'partner') {
    redirect('/parceiro/login');
  }

  const partnerDecision = await resolvePartnerApprovalDecision(session.email);

  if (!partnerDecision.isApproved) {
    redirect(`/parceiro/login?reason=${encodeURIComponent('sem-permissao')}`);
  }

  const initialData = await loadPartnerAreaData(session);

  return <PartnerWorkspace initialData={initialData} />;
}
