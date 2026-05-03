import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Handshake, UserRound } from 'lucide-react';

import { LoginPageShell } from '@/components/LoginPageShell';

export const metadata: Metadata = {
  title: 'Entrar | Beleza Carioca',
  description: 'Escolha a area de acesso para cliente, parceiro ou estabelecimento no Beleza Carioca.',
};

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

function sanitizeNextPath(value?: string | string[]) {
  const nextPath = Array.isArray(value) ? value[0] : value;

  return nextPath?.startsWith('/') ? nextPath : null;
}

function buildLoginHref(pathname: string, nextPath: string | null) {
  return nextPath ? `${pathname}?next=${encodeURIComponent(nextPath)}` : pathname;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params?.next);

  return (
    <LoginPageShell secondaryLink={{ href: '/cadastro-estabelecimento', label: 'Cadastrar estabelecimento' }}>
      <div className="mx-auto w-full max-w-[520px]">
        <div className="rounded-[2rem] border border-black/6 bg-white px-6 py-7 shadow-[0_24px_70px_rgba(29,35,43,0.08)] md:px-8 md:py-9">
          <span className="inline-flex rounded-full border border-[#ded1ef] bg-[#f6f0ff] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7854a2]">
            Area de acesso
          </span>

          <div className="mt-6">
            <h1 className="text-[2.6rem] font-black tracking-[-0.05em] text-[#1f232b]">Como voce quer entrar?</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#666b74]">
              Escolha sua area de acesso. Clientes acompanham agendamentos, parceiros gerenciam indicacoes e
              estabelecimentos acessam a operacao do negocio.
            </p>
          </div>

          <div className="mt-7 grid gap-3">
            <AccessOption
              href={buildLoginHref('/login-cliente', nextPath)}
              icon={<UserRound size={22} />}
              title="Entrar como cliente"
              description="Para agendar servicos, ver proximos atendimentos e acompanhar seu historico."
            />
            <AccessOption
              href={buildLoginHref('/parceiro/login', nextPath)}
              icon={<Handshake size={22} />}
              title="Entrar como parceiro"
              description="Acesse seu painel para acompanhar links, leads, conversoes e comissoes."
            />
            <AccessOption
              href={buildLoginHref('/login-estabelecimento', nextPath)}
              icon={<Building2 size={22} />}
              title="Entrar como estabelecimento"
              description="Para quem trabalha no salao. O sistema identifica sua area depois do login."
            />
          </div>

          <p className="mt-7 text-center text-xs leading-6 text-[#9aa0a7]">
            O acesso interno do salao e resolvido com seguranca apos a autenticacao.
          </p>
        </div>
      </div>
    </LoginPageShell>
  );
}

function AccessOption({
  description,
  href,
  icon,
  title,
}: {
  description: string;
  href: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[1.35rem] border border-black/10 bg-white p-4 text-left shadow-[0_12px_26px_rgba(31,35,43,0.045)] transition hover:-translate-y-0.5 hover:border-[#ded1ef] hover:shadow-[0_18px_34px_rgba(120,84,162,0.12)]"
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f6f0ff] text-[#7854a2]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-base font-black text-[#1f232b]">{title}</strong>
        <span className="mt-1 block text-sm leading-6 text-[#666b74]">{description}</span>
      </span>
      <ArrowRight size={20} className="shrink-0 text-[#9aa0a7] transition group-hover:translate-x-0.5 group-hover:text-[#7854a2]" />
    </Link>
  );
}
