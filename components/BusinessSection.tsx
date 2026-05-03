import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users2,
} from 'lucide-react';

import { DashboardMockup } from '@/components/DashboardMockup';
import { SectionHeading } from '@/components/SectionHeading';
import { businessFeatures, businessSegments, socialProofBrands, testimonials } from '@/lib/data';

const heroBullets = [
  'Teste grátis por 7 dias e onboarding simples',
  'Agenda, clientes, financeiro e equipe no mesmo fluxo',
  'Visual premium para transmitir mais confiança ao seu negócio',
];

const businessMetrics = [
  { id: 'metric-saloes', value: '+2.500', label: 'salões em operação com mais clareza' },
  { id: 'metric-agendas', value: '+850 mil', label: 'agendamentos organizados com rotina melhor' },
  { id: 'metric-efficiency', value: '98%', label: 'satisfação em jornadas mais profissionais' },
];

const showcaseCards = [
  {
    id: 'showcase-booking',
    title: 'Mais conversão na agenda',
    description: 'Transforme interesse em horários confirmados com uma experiência mais profissional e organizada.',
  },
  {
    id: 'showcase-operations',
    title: 'Operação sem improviso',
    description: 'Equipe, lembretes, caixa e rotina do salão alinhados em uma interface elegante e clara.',
  },
  {
    id: 'showcase-growth',
    title: 'Crescimento com leitura real',
    description: 'Tenha visão comercial do negócio para vender melhor, reter mais e evoluir com segurança.',
  },
];

const featureIcons = {
  agenda: CalendarDays,
  clients: Users2,
  finance: BarChart3,
  team: ShieldCheck,
  reminders: BellRing,
  reports: Sparkles,
} as const;

type BusinessSectionProps = {
  searchSummary?: {
    service?: string;
    location?: string;
  };
};

export function BusinessSection({ searchSummary }: BusinessSectionProps) {
  return (
    <>
      <section className="bc-section pt-12 md:pt-16">
        <div className="bc-container">
          <div className="grid items-center gap-12 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              {searchSummary ? (
                <div className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-[rgba(120,84,162,0.1)] bg-white px-4 py-2 text-sm text-[color:var(--bc-muted)] shadow-[0_12px_24px_rgba(110,84,144,0.06)]">
                  <span className="font-semibold text-[color:var(--bc-text)]">Busca recebida:</span>
                  {searchSummary.service ? <span>serviço: {searchSummary.service}</span> : null}
                  {searchSummary.location ? <span>local: {searchSummary.location}</span> : null}
                </div>
              ) : null}

              <p className="bc-kicker">Beleza para Negócios</p>
              <h1 className="bc-display max-w-[12ch] text-[clamp(2.1rem,4vw,3.8rem)] leading-[1.02] text-[color:var(--bc-text)]">
                A plataforma elegante para salões que querem crescer de verdade.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                Agenda, clientes, financeiro, equipe e relacionamento em uma experiência mais bonita,
                mais confiável e muito mais comercial para o seu negócio.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/entrar" className="bc-button-primary h-14 px-7 text-sm">
                  Testar grátis por 7 dias
                </Link>
                <Link href="/solucoes" className="bc-button-secondary h-14 px-7 text-sm">
                  Ver soluções
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-[color:var(--bc-muted)]">
                {heroBullets.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(120,84,162,0.08)] text-[#8d6a39]">
                      <CheckCircle2 size={14} />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {businessMetrics.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] border border-[rgba(120,84,162,0.1)] bg-white p-4 shadow-[0_14px_30px_rgba(110,84,144,0.07)]"
                  >
                    <strong className="block text-2xl text-[color:var(--bc-text)]">{item.value}</strong>
                    <p className="mt-2 text-xs leading-6 text-[color:var(--bc-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -left-8 top-6 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(120,84,162,0.14),transparent_70%)] blur-3xl" />
              <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(216,178,123,0.18),transparent_70%)] blur-3xl" />
              <DashboardMockup showSearchBar={false} />
              <div className="absolute -bottom-5 left-6 rounded-[1.4rem] border border-[rgba(120,84,162,0.1)] bg-white/95 px-4 py-3 shadow-[0_16px_32px_rgba(110,84,144,0.12)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8d6a39]">Experiência premium</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">Visual profissional para vender melhor</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-4 shadow-[0_18px_38px_rgba(110,84,144,0.08)] lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(120,84,162,0.12),rgba(216,178,123,0.18))] px-5 py-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8d6a39]">Confiança de mercado</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--bc-text)]">Marcas que já operam com mais clareza</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {socialProofBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="rounded-[1.3rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,233,0.92))] px-4 py-5 text-center text-sm font-semibold text-[color:var(--bc-text)]"
                >
                  {brand.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bc-section pt-0">
        <div className="bc-container">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(135deg,rgba(252,247,240,0.98),rgba(243,230,210,0.92),rgba(238,231,248,0.92))] px-6 py-10 shadow-[0_22px_50px_rgba(110,84,144,0.08)] md:px-8 md:py-12">
            <div className="pointer-events-none absolute -left-10 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[rgba(216,178,123,0.18)] blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-[rgba(120,84,162,0.14)] blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center">
              <p className="bc-kicker">Mais presença para sua marca</p>
              <h2 className="bc-display text-[clamp(1.9rem,3.8vw,3.3rem)] leading-[1.05] text-[color:var(--bc-text)]">
                Sua operação pode vender mais sem parecer improvisada.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                Um layout mais comercial para mostrar valor, reforçar confiança e transformar a página de
                negócios em uma vitrine forte da plataforma Beleza Carioca.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {showcaseCards.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.7rem] border border-[rgba(120,84,162,0.1)] bg-white/92 p-6 shadow-[0_14px_30px_rgba(110,84,144,0.07)]"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-[color:var(--bc-text)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bc-section pt-0">
        <div className="bc-container">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <SectionHeading
                kicker="Tudo em um só lugar"
                title="A estrutura certa para agenda, relacionamento e crescimento."
                description="Inspirada em páginas comerciais fortes, esta camada organiza os principais recursos em blocos claros para transmitir valor imediatamente."
              />

              <div className="mt-8 space-y-4">
                {testimonials.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[1.6rem] border border-[rgba(120,84,162,0.1)] bg-white p-5 shadow-[0_12px_28px_rgba(110,84,144,0.06)]"
                  >
                    <p className="text-sm leading-7 text-[color:var(--bc-muted)]">"{item.quote}"</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <strong className="text-sm text-[color:var(--bc-text)]">{item.name}</strong>
                        <p className="text-xs text-[color:var(--bc-muted)]">{item.role}</p>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(216,178,123,0.18)] text-[#8d6a39]">
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {businessFeatures.map((item) => {
                const Icon = featureIcons[item.icon as keyof typeof featureIcons];

                return (
                  <article
                    key={item.id}
                    className="bc-card-hover rounded-[1.7rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,236,0.92))] p-6 shadow-[0_16px_34px_rgba(110,84,144,0.07)]"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(120,84,162,0.1)] bg-white text-[#7a58a6]">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-5 text-2xl font-semibold text-[color:var(--bc-text)]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bc-section pt-0">
        <div className="bc-container">
          <SectionHeading
            kicker="Segmentos atendidos"
            title="Páginas e argumentos prontos para cada tipo de negócio."
            description="A Beleza Carioca fica mais forte quando a apresentação comercial conversa com o perfil de cada operação."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {businessSegments.map((segment) => (
              <Link
                key={segment.id}
                href={`/negocios/${segment.slug}`}
                className="bc-card-hover rounded-[1.85rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_16px_34px_rgba(110,84,144,0.08)]"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8d6a39]">{segment.eyebrow}</p>
                <h3 className="mt-4 text-2xl font-semibold text-[color:var(--bc-text)]">{segment.label}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{segment.description}</p>
                <span className="mt-6 inline-flex text-sm font-semibold text-[#7a58a6]">Ver página do segmento</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
