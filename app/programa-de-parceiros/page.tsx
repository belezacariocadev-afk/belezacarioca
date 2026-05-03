import type { Metadata } from 'next';
import {
  ArrowDown,
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  CircleHelp,
  ChevronDown,
  Code2,
  GraduationCap,
  Handshake,
  Megaphone,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { PartnerProgramForm } from '@/components/PartnerProgramForm';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Programa de Parceiros | Beleza Carioca',
  description: 'Faça parte do programa de parceiros da Beleza Carioca e gere novas oportunidades no mercado da beleza.',
};

const benefits = [
  {
    title: 'Comissao recorrente',
    description: 'Ganhe comissao quando estabelecimentos indicados ativarem plano pago com pagamento confirmado.',
    icon: BadgeDollarSign,
  },
  {
    title: 'Suporte comercial',
    description: 'Conte com orientacao pratica da nossa equipe para abordar saloes e profissionais.',
    icon: Handshake,
  },
  {
    title: 'Material de divulgacao',
    description: 'Receba textos, argumentos e criativos para acelerar suas conversas com o mercado.',
    icon: Megaphone,
  },
  {
    title: 'Autoridade no mercado',
    description: 'Associe seu nome a uma plataforma de crescimento para o setor de beleza.',
    icon: ShieldCheck,
  },
  {
    title: 'Networking com o setor',
    description: 'Conecte-se com tomadores de decisao e profissionais ativos no ecossistema.',
    icon: Network,
  },
  {
    title: 'Novas oportunidades',
    description: 'Abra novas frentes de parceria com potencial de escala em diferentes regioes.',
    icon: Rocket,
  },
];

const partnerProfiles = [
  { title: 'Consultores', icon: Briefcase },
  { title: 'Mentores', icon: Users },
  { title: 'Educadores', icon: GraduationCap },
  { title: 'Agencias', icon: Building2 },
  { title: 'Criadores de conteudo', icon: Megaphone },
  { title: 'Profissionais de tecnologia', icon: Code2 },
  { title: 'Representantes comerciais', icon: BookOpen },
  { title: 'Contadores', icon: Calculator },
  { title: 'Outros perfis com conexao no setor da beleza', icon: Sparkles },
];

const onboardingSteps = [
  {
    step: '01',
    title: 'Voce se cadastra',
    description: 'Preencha o formulario com seus dados e a forma como pretende atuar.',
  },
  {
    step: '02',
    title: 'Nossa equipe analisa seu perfil',
    description: 'Avaliamos seu momento e como potencializar sua atuacao na parceria.',
  },
  {
    step: '03',
    title: 'Voce recebe orientacoes e material',
    description: 'Enviamos diretrizes comerciais para voce iniciar com clareza.',
  },
  {
    step: '04',
    title: 'Comeca a indicar e gerar resultados',
    description: 'Voce ativa sua rede e acompanha os resultados da parceria.',
  },
];

const faqs = [
  {
    question: 'Quem pode participar?',
    answer:
      'O programa foi pensado para profissionais que tenham relacionamento com saloes, equipes de beleza ou empreendedores do setor.',
  },
  {
    question: 'Preciso pagar para entrar?',
    answer:
      'Nao. O cadastro no programa e gratuito. O foco e gerar valor por meio de indicacoes qualificadas.',
  },
  {
    question: 'Como funciona a comissao?',
    answer:
      'A comissao so e gerada quando a indicacao resulta em estabelecimento com plano pago ativo e pagamento confirmado. Cliente final nao gera comissao.',
  },
  {
    question: 'Quando entro em contato com a equipe?',
    answer:
      'Depois do envio do formulario, nossa equipe entra em contato para seguir com os proximos passos do processo.',
  },
  {
    question: 'Preciso ter empresa aberta?',
    answer:
      'Nao obrigatoriamente. Cada perfil e avaliado individualmente para definir o melhor formato de parceria.',
  },
  {
    question: 'Como recebo meu link ou codigo de parceiro?',
    answer:
      'Apos validacao, enviamos as orientacoes de uso, o material comercial e o formato de rastreio de indicacoes.',
  },
];

export default function PartnerProgramPage() {
  return (
    <main className="relative z-10">
      <section className="relative overflow-hidden border-b border-[rgba(120,84,162,0.12)] bg-[linear-gradient(180deg,#fffefb_0%,#f7f0e9_58%,#f3e9df_100%)]">
        <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(120,84,162,0.18),transparent_70%)] blur-3xl" />
        <div className="absolute -right-20 top-8 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(216,178,123,0.24),transparent_70%)] blur-3xl" />

        <div className="bc-container relative grid gap-10 py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:py-20">
          <div>
            <p className="bc-kicker">Programa de parceiros</p>
            <h1 className="max-w-[16ch] text-[clamp(2.2rem,4vw,4.15rem)] font-black leading-[1.02] tracking-[-0.055em] text-[color:var(--bc-text)]">
              Transforme sua rede de contatos em novas oportunidades
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
              Ganhe comissao por indicar estabelecimentos que ativam um plano pago na Beleza Carioca.
              Clientes que usam a plataforma apenas para agendamento nao geram comissao.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#formulario-parceiro" className="bc-button-primary h-[3.75rem] px-8 text-[0.96rem]">
                Quero ser parceiro
              </a>
              <a href="#formulario-parceiro" className="bc-button-secondary h-[3.75rem] gap-2 px-8 text-[0.96rem]">
                Ir para formulario <ArrowDown size={16} />
              </a>
            </div>
          </div>

          <aside className="rounded-[2.2rem] border border-[rgba(120,84,162,0.12)] bg-white/92 p-6 shadow-[0_24px_60px_rgba(110,84,144,0.1)] md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8d6a39]">Por que entrar agora</p>
            <div className="mt-6 grid gap-3">
              {[
                'Mercado em expansao com alta demanda por organizacao comercial.',
                'Onboarding orientado para acelerar sua primeira indicacao.',
                'Comissao valida somente para estabelecimento com plano pago confirmado.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.35rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(251,247,242,0.78)] px-4 py-4 text-sm font-semibold leading-7 text-[color:var(--bc-text)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bc-home-section">
        <div className="bc-container">
          <SectionHeading
            kicker="Beneficios"
            title="Uma parceria comercial pensada para crescer com consistencia."
            description="Comissao, suporte e posicionamento para voce transformar relacionamento em resultado real."
            center
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="bc-premium-card rounded-[1.8rem] p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(120,84,162,0.1)] text-[#6e4c98]">
                    <Icon size={20} />
                  </span>
                  <h2 className="mt-5 text-[1.3rem] font-black leading-tight tracking-[-0.035em] text-[color:var(--bc-text)]">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bc-home-section bg-[color:var(--bc-surface)]">
        <div className="bc-container">
          <SectionHeading
            kicker="Perfil ideal"
            title="Quem pode ser parceiro?"
            description="Perfis com influencia no setor da beleza e visao comercial para gerar novas oportunidades."
            center
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partnerProfiles.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.55rem] border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_14px_34px_rgba(110,84,144,0.08)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(216,178,123,0.2)] text-[#8d6a39]">
                    <Icon size={18} />
                  </span>
                  <p className="mt-4 text-sm font-black leading-7 text-[color:var(--bc-text)]">{item.title}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bc-home-section">
        <div className="bc-container">
          <SectionHeading
            kicker="Jornada"
            title="Como funciona?"
            description="Um processo simples para iniciar rapido e com direcionamento comercial."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {onboardingSteps.map((step, index) => (
              <article
                key={step.step}
                className="relative rounded-[1.7rem] border border-[rgba(120,84,162,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(110,84,144,0.08)]"
              >
                <p className="text-xs font-black uppercase tracking-[0.17em] text-[#8d6a39]">{step.step}</p>
                <h2 className="mt-4 text-[1.12rem] font-black leading-7 text-[color:var(--bc-text)]">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{step.description}</p>
                {index < onboardingSteps.length - 1 ? (
                  <ArrowRight
                    size={16}
                    className="absolute -right-2 top-8 hidden rounded-full border border-[rgba(120,84,162,0.18)] bg-white p-0.5 text-[#6e4c98] lg:block"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bc-home-section bg-[color:var(--bc-surface)]">
        <div className="bc-container">
          <SectionHeading
            kicker="Perguntas frequentes"
            title="FAQ"
            description="Respostas rapidas para voce entender como o programa funciona."
          />

          <div className="mt-8 grid gap-3">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(110,84,144,0.06)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[color:var(--bc-text)]">
                  <span className="flex items-center gap-2">
                    <CircleHelp size={17} className="text-[#8d6a39]" />
                    {item.question}
                  </span>
                  <ChevronDown size={18} className="shrink-0 text-[#6e4c98] transition group-open:rotate-180" />
                </summary>
                <p className="pt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bc-home-section pt-2">
        <div className="bc-container">
          <div className="overflow-hidden rounded-[2.3rem] border border-[rgba(120,84,162,0.12)] bg-[linear-gradient(135deg,#fffdfa,#f5efff_52%,#f4e7d8)] px-6 py-11 shadow-[0_24px_66px_rgba(110,84,144,0.12)] md:px-10 md:py-14">
            <p className="bc-kicker">Convite final</p>
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="max-w-3xl text-[clamp(2rem,4vw,3.45rem)] font-black leading-[1.03] tracking-[-0.055em] text-[color:var(--bc-text)]">
                  Vamos crescer juntos no mercado da beleza?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                  Envie seu cadastro e fale com nosso time para iniciar sua jornada como parceiro da Beleza Carioca.
                </p>
              </div>
              <a href="#formulario-parceiro" className="bc-button-primary h-[3.75rem] px-8 text-[0.96rem]">
                Quero ser parceiro
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="formulario-parceiro" className="bc-home-section scroll-mt-28">
        <div className="bc-container">
          <SectionHeading
            kicker="Cadastro"
            title="Formulario de parceria"
            description="Preencha os dados abaixo para nossa equipe avaliar seu perfil e retornar com os proximos passos."
          />
          <div className="mt-8 rounded-[2rem] border border-[rgba(120,84,162,0.12)] bg-white/95 p-5 shadow-[0_22px_54px_rgba(110,84,144,0.1)] md:p-8">
            <PartnerProgramForm />
          </div>
        </div>
      </section>
    </main>
  );
}
