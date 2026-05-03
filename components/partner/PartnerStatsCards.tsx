import {
  BadgeCheck,
  BadgeDollarSign,
  Building2,
  MousePointerClick,
  Coins,
  TrendingUp,
  Users,
} from 'lucide-react';

import { formatCurrencyBRL } from '@/lib/partner/mockData';
import { PARTNER_COMMISSION_RULE_SUPPORT } from '@/lib/partner/program';

type PartnerStatsCardsProps = {
  metrics: {
    activatedPaidPlans: number;
    capturedLeads: number;
    linkClicks: number;
    registeredEstablishments: number;
    pendingCommissionCents: number;
    paidCommissionCents: number;
  };
};

export function PartnerStatsCards({ metrics }: PartnerStatsCardsProps) {
  const isInitialState =
    metrics.linkClicks === 0 &&
    metrics.capturedLeads === 0 &&
    metrics.registeredEstablishments === 0 &&
    metrics.activatedPaidPlans === 0 &&
    metrics.pendingCommissionCents === 0 &&
    metrics.paidCommissionCents === 0;

  const cards = [
    {
      id: 'clicks',
      label: 'Cliques no link',
      value: metrics.linkClicks.toLocaleString('pt-BR'),
      helper: isInitialState ? 'Sem cliques registrados ainda' : 'Origem por link de parceiro',
      icon: MousePointerClick,
      accent: 'from-[#efe6ff] to-[#f3ebff]',
    },
    {
      id: 'leads',
      label: 'Leads capturados',
      value: metrics.capturedLeads.toLocaleString('pt-BR'),
      helper: isInitialState ? 'Aguardando primeiro contato' : 'Leads no funil comercial',
      icon: Users,
      accent: 'from-[#f4e7ff] to-[#efe5fb]',
    },
    {
      id: 'registered-establishments',
      label: 'Estabelecimentos cadastrados',
      value: metrics.registeredEstablishments.toLocaleString('pt-BR'),
      helper: isInitialState ? 'Nenhum cadastro qualificado ainda' : 'Cadastros de estabelecimento',
      icon: Building2,
      accent: 'from-[#e8f4ff] to-[#ecf0ff]',
    },
    {
      id: 'paid-plans',
      label: 'Planos pagos ativados',
      value: metrics.activatedPaidPlans.toLocaleString('pt-BR'),
      helper: isInitialState ? 'Sem ativacao paga no momento' : 'Planos com pagamento confirmado',
      icon: BadgeCheck,
      accent: 'from-[#e6f7ef] to-[#edf8f2]',
    },
    {
      id: 'pending',
      label: 'Comissao pendente',
      value: formatCurrencyBRL(metrics.pendingCommissionCents),
      helper: isInitialState ? 'Nenhuma comissao pendente ainda' : 'Aguardando pagamento',
      icon: BadgeDollarSign,
      accent: 'from-[#fff3e2] to-[#f9efe1]',
    },
    {
      id: 'paid',
      label: 'Comissao paga',
      value: formatCurrencyBRL(metrics.paidCommissionCents),
      helper: isInitialState ? 'Historico ainda nao iniciado' : 'Pagamentos de comissao concluidos',
      icon: Coins,
      accent: 'from-[#fff3e2] to-[#f9efe1]',
    },
  ] as const;

  return (
    <section id="dashboard" className="scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="bc-kicker">Performance</p>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
            Funil de indicacoes para estabelecimentos
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.id}
              className="relative overflow-hidden rounded-[1.6rem] border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_16px_34px_rgba(110,84,144,0.09)]"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[color:var(--bc-muted)]">{card.label}</p>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(120,84,162,0.1)] text-[#6e4c98]">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-[1.55rem] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{card.value}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--bc-muted)]">
                <TrendingUp size={13} className="text-[#8d6a39]" />
                {card.helper}
              </p>
            </article>
          );
        })}
      </div>

      <p className="mt-4 rounded-[1rem] border border-[rgba(120,84,162,0.14)] bg-white/85 px-4 py-3 text-xs font-semibold leading-6 text-[color:var(--bc-muted)]">
        {PARTNER_COMMISSION_RULE_SUPPORT}
      </p>
    </section>
  );
}
