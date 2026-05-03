import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ReceiptText,
  Scissors,
  ShieldCheck,
  UserRound,
  Users2,
} from 'lucide-react';

import { SubscriptionPlanSelector, type SubscriptionPlanView } from '@/components/billing/SubscriptionPlanSelector';
import { TrialStatusBanner } from '@/components/billing/TrialStatusBanner';

export const metadata: Metadata = {
  title: 'Assinatura do estabelecimento | Beleza Carioca',
  description: 'Ative um plano para continuar usando o portal do estabelecimento.',
};

type SubscriptionPageProps = {
  searchParams?: Promise<{
    reason?: string | string[];
  }>;
};

const reasonMessages: Record<string, string> = {
  salonUnavailable: 'O estabelecimento precisa regularizar o acesso para continuar usando o portal.',
  subscriptionBlocked: 'O status do plano precisa ser regularizado para liberar agenda, equipe e financeiro.',
  subscriptionMissing: 'Ative um plano para liberar o sistema do estabelecimento.',
  trialExpired: 'Seu teste gratis terminou. Escolha um plano para continuar operando o salao.',
};

const planBenefits = {
  monthly: ['Agenda, clientes e equipe em um só lugar', 'Fechamento e controle financeiro', 'Portal do cliente para agendamentos', 'Sem custo para cliente final'],
  quarterly: ['Tudo do plano mensal com ciclo trimestral', 'Mais tempo para avaliar o salão', 'Mais flexibilidade que anual', 'Sem compromisso imediato'],
  annual: ['Tudo do plano mensal', 'Economia no valor anual', 'Prioridade em suporte e renovacoes', 'Preparado para evoluir com o seu salao'],
};

const subscriptionPlans: SubscriptionPlanView[] = [
  {
    id: 'monthly',
    benefits: planBenefits.monthly,
    description: 'Ative agora o portal do salão e pague mês a mês.',
    price: 'R$ 149',
    priceSuffix: '/mês',
    title: 'Plano mensal',
  },
  {
    id: 'quarterly',
    benefits: planBenefits.quarterly,
    description: 'Ciclo trimestral para salões que querem mais tempo sem comprometer o fluxo.',
    price: 'R$ 399',
    priceSuffix: '/trimestre',
    title: 'Plano trimestral',
    badge: 'Mais flexível',
  },
  {
    id: 'annual',
    badge: 'Mais vantajoso',
    benefits: planBenefits.annual,
    description: 'Melhor custo para quem quer previsibilidade no salão.',
    price: 'R$ 1.490',
    priceSuffix: '/ano',
    title: 'Plano anual',
  },
];

const productBenefits = [
  {
    icon: <CalendarDays size={18} />,
    title: 'Agenda inteligente',
    text: 'Controle de horários, bloqueios e jornadas de cada profissional.',
  },
  {
    icon: <Users2 size={18} />,
    title: 'Base de clientes',
    text: 'Cadastro rápido, histórico de atendimentos e comunicação fácil.',
  },
  {
    icon: <ReceiptText size={18} />,
    title: 'Fechamento simplificado',
    text: 'Feche o caixa com pagamentos, descontos e histórico financeiro.',
  },
  {
    icon: <CreditCard size={18} />,
    title: 'Área do cliente',
    text: 'Clientes agendam, consultam histórico e recebem confirmações.',
  },
  {
    icon: <ShieldCheck size={18} />,
    title: 'Acesso seguro',
    text: 'O sistema do salão é protegido e só funciona com plano ativo.',
  },
  {
    icon: <Users2 size={18} />,
    title: 'Suporte inicial',
    text: 'Plano anual com atendimento prioritário e mais estabilidade.',
  },
];

export default async function SubscriptionPage({ searchParams }: SubscriptionPageProps) {
  const params = await searchParams;
  const reason = Array.isArray(params?.reason) ? params?.reason[0] : params?.reason;
  const reasonMessage = reason ? reasonMessages[reason] : null;

  return (
    <main className="relative z-20 min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#f7f0e9_100%)] px-4 py-10 md:py-14">
      <section className="mx-auto w-full max-w-7xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-5 text-sm font-black text-[color:var(--bc-text)] shadow-[0_12px_30px_rgba(106,79,144,0.06)] transition hover:-translate-y-0.5 hover:border-[#7854a2] hover:text-[#7854a2]"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <TrialStatusBanner className="mb-8" showActivePlan />

        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div>
            <p className="bc-kicker">Assinatura do estabelecimento</p>
            <h1 className="bc-title max-w-3xl">
              Assine um plano que libera agenda, clientes, profissionais e financeiro em um só lugar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--bc-muted)]">
              O cliente agenda sem pagar. Seu salão começa com 7 dias gratuitos e só precisa confirmar o plano quando estiver pronto.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="mailto:comercial@belezacarioca.com?subject=Ativar%20plano%20Beleza%20Carioca"
                className="bc-button-primary h-14 px-7"
              >
                Quero contratar
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login-estabelecimento"
                className="bc-button-secondary h-14 px-7"
              >
                Trocar acesso
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-[rgba(120,84,162,0.14)] bg-white p-6 shadow-[0_18px_42px_rgba(106,79,144,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--bc-gold-strong)]">Grátis para cliente</p>
                <p className="mt-4 text-2xl font-black text-[color:var(--bc-text)]">Sempre</p>
                <p className="mt-3 text-sm text-[color:var(--bc-muted)]">A área de cliente segue livre mesmo com o plano do salão em avaliação.</p>
              </div>
              <div className="rounded-[28px] border border-[rgba(120,84,162,0.14)] bg-white p-6 shadow-[0_18px_42px_rgba(106,79,144,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--bc-gold-strong)]">Trial</p>
                <p className="mt-4 text-2xl font-black text-[color:var(--bc-text)]">7 dias</p>
                <p className="mt-3 text-sm text-[color:var(--bc-muted)]">O salão usa o sistema completo antes de definir o plano.</p>
              </div>
              <div className="rounded-[28px] border border-[rgba(120,84,162,0.14)] bg-white p-6 shadow-[0_18px_42px_rgba(106,79,144,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--bc-gold-strong)]">Ativacao simples</p>
                <p className="mt-4 text-2xl font-black text-[color:var(--bc-text)]">Rapida</p>
                <p className="mt-3 text-sm text-[color:var(--bc-muted)]">O salao pode comecar a organizar a rotina sem configuracoes complicadas.</p>
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-[rgba(120,84,162,0.16)] bg-[#fffdfa] p-10 shadow-[0_36px_120px_rgba(106,79,144,0.12)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--bc-gold-strong)]">Uso do salão</p>
                <p className="mt-3 text-3xl font-black text-[color:var(--bc-text)]">Ativado imediatamente</p>
              </div>
              <span className="inline-flex rounded-full bg-[#7854a2] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                7 dias grátis
              </span>
            </div>

            <div className="mt-8 grid gap-4">
              <StatusRow text="Clientes sem pagar assinatura" />
              <StatusRow text="Trial funcional por 7 dias" />
              <StatusRow text="Bloqueio automático se não renovar" />
            </div>
          </aside>
        </div>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[32px] bg-white p-8 shadow-[0_24px_60px_rgba(106,79,144,0.08)]">
            <p className="bc-kicker">Por que escolher</p>
            <h2 className="text-3xl font-black text-[color:var(--bc-text)]">Tudo pronto para o salão rodar.</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">Um plano transparente para agenda, clientes e financeiro, com ativação simples e controle seguro.</p>
          </div>
          <div className="rounded-[32px] bg-[#f6f0ff] p-8 shadow-[0_24px_60px_rgba(106,79,144,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--bc-gold-strong)]">Fluxo claro</p>
            <ul className="mt-6 space-y-4 text-sm text-[color:var(--bc-text)]">
              <li className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 text-[#326c65]" />Teste de 7 dias ativado para o estabelecimento.</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 text-[#326c65]" />Plano ativado automaticamente ao escolher mensal ou anual.</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 text-[#326c65]" />Bloqueio seguro se o pagamento não for identificado.</li>
            </ul>
          </div>
          <div className="rounded-[32px] bg-white p-8 shadow-[0_24px_60px_rgba(106,79,144,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--bc-gold-strong)]">Para quem</p>
            <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">Ideal para salões que precisam de um modelo de assinatura simples, cliente gratuito e ativação rápida de portal.</p>
            <div className="mt-6 grid gap-3 text-sm">
              <p className="rounded-2xl border border-[rgba(120,84,162,0.14)] bg-[#fffdfa] px-4 py-3">Salão</p>
              <p className="rounded-2xl border border-[rgba(120,84,162,0.14)] bg-[#fffdfa] px-4 py-3">Recepção</p>
              <p className="rounded-2xl border border-[rgba(120,84,162,0.14)] bg-[#fffdfa] px-4 py-3">Profissional</p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="bc-kicker">Planos do salão</p>
              <h2 className="text-3xl font-black tracking-[-0.05em] text-[color:var(--bc-text)] md:text-4xl">
                Preço atualizado para o tamanho da sua equipe.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--bc-muted)]">
              Selecione a faixa de profissionais e veja as opções de plano mudarem automaticamente para o seu salão.
              Os valores sao claros e o fluxo foi pensado para o tamanho da sua operacao.
            </p>
          </div>

          <div className="mt-8">
            <SubscriptionPlanSelector plans={subscriptionPlans} reason={reason} />
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="bc-kicker">O que o plano libera</p>
              <h2 className="text-3xl font-black tracking-[-0.05em] text-[color:var(--bc-text)] md:text-4xl">
                Recursos pensados para um salão completo.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productBenefits.map((benefit) => (
              <BenefitCard key={benefit.title} {...benefit} />
            ))}
          </div>
        </section>
      </section>

      <a
        href="https://wa.me/5511999999999?text=Ol%C3%A1%20Beleza%20Carioca%2C%20tenho%20d%C3%BAvidas%20sobre%20o%20plano."
        target="_blank"
        rel="noreferrer"
        className="fixed right-4 bottom-6 z-50 flex max-w-[11rem] items-center gap-3 rounded-[24px] border border-[#d1fae5] bg-white px-3 py-2.5 shadow-[0_16px_50px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#25d366] text-white shadow-[0_6px_16px_rgba(37,211,102,0.18)]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M20.52 3.48A11.6 11.6 0 0 0 12 0C5.373 0 .014 5.354 0 11.97c0 2.114.55 4.18 1.595 6.005L0 24l6.258-1.634A11.91 11.91 0 0 0 12 23.94C18.627 23.94 24 18.587 24 12.01a11.86 11.86 0 0 0-3.48-8.53Zm-2.46 12.47c-.19.53-1.11 1.03-1.63 1.1-.42.06-.9.08-1.79-.1a8.59 8.59 0 0 1-4.3-2.1 9.2 9.2 0 0 1-2.15-3.16c-.15-.34-.35-.56-.35-.56-.04-.09-.18-.17-.38-.28-.17-.1-1.23-.59-1.73-.86-.57-.31-.98-.68-1.15-.9-.2-.23-.19-.51-.19-.72 0-.22.05-.28.2-.43.14-.14.39-.33.58-.5.18-.17.24-.28.36-.46.12-.18.06-.33-.03-.5-.1-.18-.83-2.07-1.1-2.8-.29-.77-.58-.66-.8-.67h-.69c-.23 0-.6.09-.92.43-.33.35-1.25 1.22-1.25 2.96 0 1.74 1.28 3.42 1.46 3.65.18.23 2.54 3.87 6.16 5.43.86.37 1.54.59 2.07.76.87.28 1.66.24 2.29.15.7-.1 1.91-.78 2.18-1.54.27-.75.27-1.39.19-1.52-.08-.13-.29-.2-.61-.36Z" />
          </svg>
        </span>
        <div className="min-w-0 text-left">
          <p className="text-xs uppercase tracking-[0.24em] text-[#111827]/70">Dúvidas?</p>
          <p className="text-sm font-black text-[#111827]">Fale pelo WhatsApp</p>
          <p className="text-xs text-[#4b5563]">Clique e abra o atendimento</p>
        </div>
      </a>
    </main>
  );
}

function StatusRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[rgba(120,84,162,0.1)] bg-[#fffdfa] px-3 py-3 text-sm font-bold text-[color:var(--bc-text)]">
      <CheckCircle2 size={17} className="shrink-0 text-[#326c65]" />
      <span>{text}</span>
    </div>
  );
}

function BenefitCard({ icon, text, title }: { icon: ReactNode; text: string; title: string }) {
  return (
    <div className="rounded-lg border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_12px_26px_rgba(106,79,144,0.055)]">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6f0ff] text-[#7854a2]">{icon}</span>
      <h3 className="mt-4 text-lg font-black text-[color:var(--bc-text)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--bc-muted)]">{text}</p>
    </div>
  );
}
