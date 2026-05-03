import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Como organizar a agenda do salão sem perder tempo | Blog Beleza Carioca',
  description:
    'Aprenda a estruturar sua agenda para reduzir conflito, atender melhor e liberar mais tempo para focar no crescimento do salão.',
};

export default function OrganizarAgendaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Como organizar a agenda do salão sem perder tempo',
    description: 'Aprenda a estruturar sua agenda para reduzir conflito, atender melhor e liberar mais tempo para focar no crescimento do salão.',
    image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1200&q=80',
    datePublished: '2026-03-28',
    author: {
      '@type': 'Organization',
      name: 'Equipe Beleza Carioca',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Beleza Carioca',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <main className="relative z-10">
      <section className="bc-section pt-16 md:pt-24">
        <div className="bc-container">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <p className="bc-kicker">Blog Beleza Carioca</p>
              <h1 className="bc-title max-w-3xl">Como organizar a agenda do salão sem perder tempo</h1>
              <p className="max-w-2xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                Saiba como construir uma agenda inteligente que respeita horários, prepara a equipe e melhora a experiência de cada cliente.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--bc-text)] shadow-[0_12px_24px_rgba(110,84,144,0.08)] transition hover:-translate-y-[1px]"
            >
              <ArrowLeft size={16} />
              Voltar ao blog
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white shadow-[0_20px_50px_rgba(110,84,144,0.09)]">
            <div className="relative h-[28rem] w-full">
              <Image
                src="https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1200&q=80"
                alt="Organização de agenda de salão"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[color:var(--bc-muted)]">
                <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#6e4c98]">
                  Gestão
                </span>
                <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">
                  Rotina de agenda e confirmações
                </span>
                <span>28 de março de 2026</span>
                <span>6 min de leitura</span>
                <span>Equipe Beleza Carioca</span>
              </div>

              <div className="space-y-6 text-[1rem] leading-8 text-[color:var(--bc-text)]">
                <p>
                  Organizar a agenda com blocos de tempo claros reduz o risco de atrasos e ajuda a equipe a entregar resultados mais consistentes. Cada serviço deve ter espaço para preparo e finalização.
                </p>
                <p>
                  Adote confirmações inteligentes pelo WhatsApp e mantenha uma lista de espera ativa. Assim você tem mais flexibilidade sem perder a previsibilidade da operação.
                </p>
                <p>
                  Reliquide horários extras para encaixes estratégicos e crie rotinas semanais de revisão da agenda, garantindo que os agendamentos de retorno estejam sempre visíveis.
                </p>
              </div>

              <div className="mt-10 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-[#fbf8ff] p-6 shadow-[0_16px_36px_rgba(110,84,144,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">Dica profissional</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Crie um dia fixo para checar os retornos e confirmações da semana seguinte. Isso evita buracos na agenda e transforma agendamentos em oportunidades reais de crescimento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
