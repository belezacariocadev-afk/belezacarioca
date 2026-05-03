import type { Metadata } from 'next';
import Link from 'next/link';

import { accessProfiles } from '@/lib/platform/access';
import type { AccessProfileId } from '@/lib/platform/domain';

export const metadata: Metadata = {
  title: 'Acesso negado | Beleza Carioca',
  description: 'O perfil autenticado nao tem permissao para acessar esta area.',
};

type AccessDeniedPageProps = {
  searchParams: Promise<{
    profile?: string;
    from?: string;
  }>;
};

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const { profile, from } = await searchParams;
  const profileConfig = accessProfiles[profile as AccessProfileId] ?? accessProfiles.salonAdmin;

  return (
    <main className="relative z-20 flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffdfa_0%,#f7f0e9_100%)] px-4 py-16">
      <section className="w-full max-w-2xl rounded-[2rem] border border-[rgba(120,84,162,0.12)] bg-white p-8 text-center shadow-[0_24px_70px_rgba(106,79,144,0.12)]">
        <p className="bc-kicker">Acesso protegido</p>
        <h1 className="text-4xl font-black tracking-[-0.05em] text-[color:var(--bc-text)]">Permissao insuficiente</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[color:var(--bc-muted)]">
          O perfil {profileConfig.label.toLowerCase()} esta autenticado, mas nao pode abrir {from ?? 'esta rota'}.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={profileConfig.entryPath}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#7854a2] px-5 text-sm font-extrabold text-white transition hover:bg-[#5f3f86]"
          >
            Ir para minha area
          </Link>
          <Link
            href="/entrar"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-[rgba(120,84,162,0.18)] bg-white px-5 text-sm font-extrabold text-[color:var(--bc-text)] transition hover:border-[rgba(120,84,162,0.34)]"
          >
            Entrar com outro perfil
          </Link>
        </div>
      </section>
    </main>
  );
}
