import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PartnerAccountPasswordForm } from '@/components/partner/PartnerAccountPasswordForm';
import { parsePlatformSession, platformSessionCookieName } from '@/lib/platform/auth/session';

export const metadata: Metadata = {
  title: 'Minha conta | Parceiros Beleza Carioca',
  description: 'Altere sua senha de acesso ao painel de parceiros.',
};

export default async function PartnerAccountPage() {
  const cookieStore = await cookies();
  const session = parsePlatformSession(cookieStore.get(platformSessionCookieName)?.value);

  if (!session || session.profileId !== 'partner') {
    redirect('/parceiro/login?next=/parceiro/minha-conta');
  }

  return (
    <main className="relative z-10 min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f6efe6_100%)]">
      <section className="bc-section pt-8 md:pt-10">
        <div className="bc-container">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link href="/parceiro#dashboard" className="bc-button-secondary h-11 px-5 text-sm">
              Voltar ao painel
            </Link>
          </div>

          <div className="mx-auto max-w-3xl rounded-[2rem] border border-[rgba(120,84,162,0.12)] bg-white/95 p-6 shadow-[0_20px_56px_rgba(110,84,144,0.1)] md:p-10">
            <p className="bc-kicker">Minha conta</p>
            <h1 className="mt-2 text-[clamp(1.9rem,3.8vw,3rem)] font-black tracking-[-0.05em] text-[color:var(--bc-text)]">
              Alterar senha
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--bc-muted)]">
              Defina uma senha propria para acessar o painel de parceiros. O e-mail da conta nao sera alterado.
            </p>

            <div className="mt-7">
              <PartnerAccountPasswordForm email={session.email} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
