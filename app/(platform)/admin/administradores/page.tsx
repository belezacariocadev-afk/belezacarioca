import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdministratorsAdminPanel } from '@/components/admin/AdministratorsAdminPanel';
import { AdminTopNavigation } from '@/components/admin/AdminTopNavigation';
import { listPlatformAdministrators } from '@/lib/admin/administrators';
import {
  parsePlatformSession,
  platformSessionCookieName,
} from '@/lib/platform/auth/session';

export const metadata: Metadata = {
  title: 'Gestao de administradores | Admin Beleza Carioca',
  description: 'Crie administradores, redefina senhas e controle acessos da plataforma.',
};

function isAdminProfile(profileId: string) {
  return profileId === 'platformAdmin';
}

export default async function AdminAdministratorsPage() {
  const cookieStore = await cookies();
  const session = parsePlatformSession(cookieStore.get(platformSessionCookieName)?.value);

  if (!session) {
    redirect('/admin/login?next=/admin/administradores');
  }

  if (!isAdminProfile(session.profileId)) {
    redirect(`/acesso-negado?from=${encodeURIComponent('/admin/administradores')}&profile=${session.profileId}`);
  }

  const administrators = await listPlatformAdministrators();

  return (
    <main className="relative z-10 min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f6efe6_100%)]">
      <section className="bc-section pt-8 md:pt-10">
        <div className="bc-container">
          <div className="mb-5 rounded-[1.8rem] border border-[rgba(120,84,162,0.12)] bg-white/95 px-6 py-6 shadow-[0_18px_42px_rgba(110,84,144,0.09)] md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="bc-kicker">Admin</p>
                <h1 className="text-[clamp(1.6rem,3vw,2.4rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
                  Gestao de administradores da plataforma
                </h1>
                <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Crie novos administradores, redefina senhas temporarias e controle o acesso administrativo sem apagar usuarios.
                </p>
              </div>
              <div className="md:pt-1">
                <AdminTopNavigation />
              </div>
            </div>
          </div>

          <AdministratorsAdminPanel
            currentSessionEmail={session.email}
            currentSessionUserId={session.supabaseUserId}
            initialAdministrators={administrators}
          />
        </div>
      </section>
    </main>
  );
}
