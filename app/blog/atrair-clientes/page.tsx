import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Como atrair mais clientes para seu salão | Blog Beleza Carioca',
  description:
    'Aumente a visibilidade do salão com estratégias de captação, comunicação e atendimento que convertem mais rapidamente.',
};

export default function AtrairClientesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Como atrair mais clientes para seu salão',
    description: 'Aumente a visibilidade do salão com estratégias de captação, comunicação e atendimento que convertem mais rapidamente.',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=80',
    datePublished: '2026-04-08',
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
              <h1 className="bc-title max-w-3xl">Como atrair mais clientes para seu salão</h1>
              <p className="max-w-2xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                Descubra uma rotina prática para tornar seu salão mais visível e acolhedor, com ofertas, posicionamento e experiência que levam o cliente a dizer “sim”.
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
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=80"
                alt="Atração de clientes para salão"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[color:var(--bc-muted)]">
                <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#6e4c98]">
                  Crescimento
                </span>
                <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">
                  Rotina de captação e atendimento
                </span>
                <span>08 de abril de 2026</span>
                <span>5 min de leitura</span>
                <span>Equipe Beleza Carioca</span>
              </div>

              <div className="space-y-6 text-[1rem] leading-8 text-[color:var(--bc-text)]">
                <p>
                  Comece pela primeira impressão: atualize seus canais com fotos reais, linguagem clara e serviços destacados. Um cliente só agenda quando entende o que vai receber e sente propósito na escolha.
                </p>
                <p>
                  Use a sua rotina de atendimento para gerar valor antes mesmo do primeiro encontro. Mensagens automáticas, confirmação de horário e cards de serviço ajudam a criar confiança logo no primeiro contato.
                </p>
                <p>
                  Planeje promoções simples e limitadas para novos clientes e fidelize com um follow-up leve. A diferença entre um salão cheio e um salão sustentável está na conveniência e no cuidado contínuo.
                </p>
              </div>

              <div className="mt-10 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-[#fbf8ff] p-6 shadow-[0_16px_36px_rgba(110,84,144,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">Dica profissional</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Combine um serviço de boas-vindas com um agendamento de retorno. A primeira experiência deve ser excelente, mas a segunda conversão é o que transforma a captação em receita recorrente.
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
