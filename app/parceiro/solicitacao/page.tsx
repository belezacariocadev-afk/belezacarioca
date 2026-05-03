import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock3, ShieldAlert } from 'lucide-react';

import { PartnerTemporaryPasswordCard } from '@/components/partner/PartnerTemporaryPasswordCard';
import {
  getPartnerRequestStatusById,
  type PartnerApprovalStatus,
} from '@/lib/partner/approval';

export const metadata: Metadata = {
  title: 'Status da solicitacao | Parceiros Beleza Carioca',
  description: 'Acompanhe o andamento da sua solicitacao no Programa de Parceiros Beleza Carioca.',
};

type PageProps = {
  searchParams?: Promise<{
    id?: string | string[];
  }>;
};

function resolveStatusPresentation(status: PartnerApprovalStatus) {
  if (status === 'approved') {
    return {
      icon: CheckCircle2,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      title: 'Seu acesso foi aprovado',
      description: 'Seu acesso foi aprovado. Voce ja pode entrar na area do parceiro.',
    };
  }

  if (status === 'rejected') {
    return {
      icon: AlertCircle,
      tone: 'border-red-200 bg-red-50 text-red-700',
      title: 'Solicitacao nao aprovada',
      description: 'Sua solicitacao nao foi aprovada no momento.',
    };
  }

  if (status === 'blocked') {
    return {
      icon: ShieldAlert,
      tone: 'border-amber-200 bg-amber-50 text-amber-800',
      title: 'Acesso bloqueado',
      description: 'Seu acesso foi bloqueado. Entre em contato com o suporte.',
    };
  }

  return {
    icon: Clock3,
    tone: 'border-sky-200 bg-sky-50 text-sky-800',
    title: 'Solicitacao em analise',
    description:
      'Seu cadastro foi recebido e esta em analise. Assim que for aprovado, voce podera acessar sua area de parceiro.',
  };
}

function resolveRequestId(value: string | string[] | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Array.isArray(value) ? value[0] : value;
  const normalized = parsed.trim();

  return normalized || null;
}

export default async function PartnerRequestStatusPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestId = resolveRequestId(params?.id);
  const statusDetails = requestId ? await getPartnerRequestStatusById(requestId) : null;
  const presentation = statusDetails ? resolveStatusPresentation(statusDetails.status) : null;

  return (
    <main className="relative z-10 min-h-[74vh]">
      <section className="bc-home-section pt-12">
        <div className="bc-container">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-[rgba(120,84,162,0.12)] bg-white/95 p-6 shadow-[0_20px_56px_rgba(110,84,144,0.1)] md:p-10">
            <p className="bc-kicker">Programa de parceiros</p>
            <h1 className="mt-2 text-[clamp(1.9rem,3.8vw,3rem)] font-black tracking-[-0.05em] text-[color:var(--bc-text)]">
              Status da sua solicitacao
            </h1>

            {!requestId ? (
              <div className="mt-6 rounded-[1.2rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.06)] p-5 text-sm leading-7 text-[color:var(--bc-muted)]">
                Para acompanhar sua solicitacao, abra este link pelo redirecionamento do formulario ou envie uma nova
                solicitacao.
              </div>
            ) : !statusDetails ? (
              <div className="mt-6 rounded-[1.2rem] border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-700">
                Nao encontramos esta solicitacao de parceiro. Verifique o link ou envie um novo cadastro.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {statusDetails.status === 'approved' && statusDetails.temporaryPassword ? (
                  <PartnerTemporaryPasswordCard
                    email={statusDetails.email}
                    temporaryPassword={statusDetails.temporaryPassword}
                  />
                ) : (
                  <article className={`rounded-[1.25rem] border p-5 ${presentation?.tone ?? ''}`}>
                    <div className="flex items-start gap-3">
                      {presentation?.icon ? <presentation.icon size={20} className="mt-0.5 shrink-0" /> : null}
                      <div>
                        <h2 className="text-base font-black tracking-[-0.02em]">{presentation?.title}</h2>
                        <p className="mt-1 text-sm leading-7">{presentation?.description}</p>
                        {statusDetails.status === 'approved' ? (
                          <p className="mt-2 text-xs font-semibold leading-6">
                            A senha temporaria ja foi exibida anteriormente. Se precisar de uma nova senha, fale com a
                            equipe da Beleza Carioca para regenerar o acesso.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )}

                <div className="rounded-[1.2rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(255,255,255,0.8)] p-5 text-sm leading-7 text-[color:var(--bc-muted)]">
                  <p>
                    <strong className="text-[color:var(--bc-text)]">Solicitacao:</strong> {statusDetails.id}
                  </p>
                  <p>
                    <strong className="text-[color:var(--bc-text)]">E-mail:</strong> {statusDetails.email}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {statusDetails?.status === 'approved' ? (
                <Link href="/parceiro/login" className="bc-button-primary h-12 px-6 text-sm">
                  Ir para login do parceiro
                </Link>
              ) : null}
              <Link href="/programa-de-parceiros#formulario-parceiro" className="bc-button-secondary h-12 px-6 text-sm">
                Novo cadastro
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
