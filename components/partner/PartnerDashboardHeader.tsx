import { ArrowRight, Copy, Sparkles } from 'lucide-react';

import type { PartnerRecentStatus } from '@/lib/partner/mockData';
import { PARTNER_COMMISSION_RULE_SUMMARY } from '@/lib/partner/program';

type PartnerDashboardHeaderProps = {
  partnerName: string;
  partnerRole: string;
  copyFeedback: string | null;
  onCopyLink: () => void;
  recentStatuses: PartnerRecentStatus[];
};

const defaultRecentStatuses: PartnerRecentStatus[] = [
  {
    id: 'default-status-1',
    title: 'Configure seu primeiro passo',
    description: 'Copie seu link exclusivo e personalize seu texto de divulgacao.',
    happenedAtLabel: 'Inicio',
  },
  {
    id: 'default-status-2',
    title: 'Compartilhe com sua rede',
    description: 'Use os materiais da biblioteca para iniciar as primeiras indicacoes.',
    happenedAtLabel: 'Proximo',
  },
  {
    id: 'default-status-3',
    title: 'Acompanhe resultados aqui',
    description: 'Comissoes aparecem quando o estabelecimento indicado ativa plano pago com pagamento confirmado.',
    happenedAtLabel: 'Em breve',
  },
];

export function PartnerDashboardHeader({
  partnerName,
  partnerRole,
  copyFeedback,
  onCopyLink,
  recentStatuses,
}: PartnerDashboardHeaderProps) {
  const visibleRecentStatuses = recentStatuses.length > 0 ? recentStatuses : defaultRecentStatuses;

  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-[rgba(120,84,162,0.14)] bg-[linear-gradient(135deg,#241a35,#6e4c98_52%,#c79b5c)] p-6 text-white shadow-[0_26px_70px_rgba(36,26,53,0.22)] md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.26),transparent_70%)] blur-2xl" />

      <div className="relative grid gap-7 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f1d7b1]">Area do parceiro</p>
          <h1 className="mt-3 text-[clamp(1.85rem,4vw,3.1rem)] font-black leading-[1.03] tracking-[-0.05em]">
            Bem-vindo, {partnerName}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/84 md:text-base md:leading-8">
            Aqui voce acompanha indicacoes de estabelecimentos, acessa materiais de divulgacao e monitora comissoes
            de forma organizada.
          </p>
          <p className="mt-3 max-w-2xl text-xs font-semibold leading-6 text-white/75">{PARTNER_COMMISSION_RULE_SUMMARY}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
            <Sparkles size={14} />
            {partnerRole}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCopyLink}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-[#5f3f86] shadow-[0_10px_24px_rgba(30,18,49,0.2)] transition hover:-translate-y-0.5"
            >
              <Copy size={16} />
              {copyFeedback ?? 'Copiar link exclusivo'}
            </button>
            <a
              href="#materiais"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/28 bg-white/10 px-6 text-sm font-black text-white transition hover:bg-white/20"
            >
              Acessar materiais
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="grid gap-3">
          {visibleRecentStatuses.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.25rem] border border-white/16 bg-white/10 px-4 py-4 shadow-[0_10px_26px_rgba(24,15,38,0.2)] backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black leading-6 text-white">{item.title}</h2>
                <span className="shrink-0 rounded-full border border-white/26 bg-white/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/88">
                  {item.happenedAtLabel}
                </span>
              </div>
              <p className="mt-2 text-xs leading-6 text-white/78">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
