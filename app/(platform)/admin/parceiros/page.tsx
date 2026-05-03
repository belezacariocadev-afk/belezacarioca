import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminTopNavigation } from '@/components/admin/AdminTopNavigation';
import { PartnerRequestsAdminPanel } from '@/components/partner/admin/PartnerRequestsAdminPanel';
import {
  listPartnerAccessRequestsForAdmin,
  type PartnerApprovalStatus,
} from '@/lib/partner/approval';
import {
  parsePlatformSession,
  platformSessionCookieName,
} from '@/lib/platform/auth/session';

export const metadata: Metadata = {
  title: 'Gestao de parceiros | Admin Beleza Carioca',
  description: 'Aprove, rejeite ou bloqueie solicitacoes do programa de parceiros.',
};

type PageProps = {
  searchParams?: Promise<{
    status?: string | string[];
  }>;
};

function resolveFilter(value: string | string[] | undefined): PartnerApprovalStatus | 'all' {
  const parsed = Array.isArray(value) ? value[0] : value;

  if (!parsed) {
    return 'all';
  }

  const normalized = parsed.trim().toLowerCase();

  if (normalized === 'pending' || normalized === 'approved' || normalized === 'rejected' || normalized === 'blocked') {
    return normalized;
  }

  return 'all';
}

function isAdminProfile(profileId: string) {
  return profileId === 'platformAdmin';
}

export default async function AdminPartnerRequestsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = parsePlatformSession(cookieStore.get(platformSessionCookieName)?.value);

  if (!session) {
    redirect('/admin/login?next=/admin/parceiros');
  }

  if (!isAdminProfile(session.profileId)) {
    redirect(`/acesso-negado?from=${encodeURIComponent('/admin/parceiros')}&profile=${session.profileId}`);
  }

  const params = await searchParams;
  const initialFilter = resolveFilter(params?.status);
  const initialRequests = await listPartnerAccessRequestsForAdmin({
    status: 'all',
  });

  return (
    <main className="relative z-10 min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f6efe6_100%)]">
      <section className="bc-section pt-8 md:pt-10">
        <div className="bc-container">
          <div className="mb-5 rounded-[1.8rem] border border-[rgba(120,84,162,0.12)] bg-white/95 px-6 py-6 shadow-[0_18px_42px_rgba(110,84,144,0.09)] md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="bc-kicker">Admin</p>
                <h1 className="text-[clamp(1.6rem,3vw,2.4rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
                  Gestao de solicitacoes de parceiros
                </h1>
                <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Acompanhe novos cadastros e decida rapidamente entre aprovar, rejeitar ou bloquear acessos.
                </p>
              </div>
              <div className="md:pt-1">
                <AdminTopNavigation />
              </div>
            </div>
          </div>

          <PartnerRequestsAdminPanel
            initialFilter={initialFilter}
            initialRequests={initialRequests}
          />
        </div>
      </section>
    </main>
  );
}
