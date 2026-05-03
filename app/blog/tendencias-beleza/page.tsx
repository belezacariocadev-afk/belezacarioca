import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tendências de beleza que merecem sua atenção | Blog Beleza Carioca',
  description:
    'Conheça as tendências que ajudam seu salão a se posicionar com mais valor e atrair clientes que buscam resultados atuais.',
};

export default function TendenciasBelezaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Tendências de beleza que merecem sua atenção',
    description: 'Conheça as tendências que ajudam seu salão a se posicionar com mais valor e atrair clientes que buscam resultados atuais.',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
    datePublished: '2026-04-02',
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
              <h1 className="bc-title max-w-3xl">Tendências de beleza que merecem sua atenção</h1>
              <p className="max-w-2xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                Use tendências como ferramenta de posicionamento e mostre serviços que falam com o cliente atual, sem perder a identidade do seu salão.
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
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
                alt="Tendências de beleza"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[color:var(--bc-muted)]">
                <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#6e4c98]">
                  Tendências
                </span>
                <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">
                  Rotina de inspiração e posicionamento
                </span>
                <span>02 de abril de 2026</span>
                <span>4 min de leitura</span>
                <span>Equipe Beleza Carioca</span>
              </div>

              <div className="space-y-6 text-[1rem] leading-8 text-[color:var(--bc-text)]">
                <p>
                  Traga novidades ao seu salão com serviços que reforcem credibilidade: procedimentos naturais, resultados duradouros e um atendimento que traduz confiança.
                </p>
                <p>
                  Atualize suas vitrines digitais com referências do mercado e mostre as transformações que você entrega. A tendência não é gastar mais, é comunicar melhor o que já funciona.
                </p>
                <p>
                  Separe uma rotina de conteúdos e campanhas curtas para mostrar esses diferenciais: coleção do mês, destaque de serviço e o porquê de cada escolha.
                </p>
              </div>

              <div className="mt-10 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-[#fbf8ff] p-6 shadow-[0_16px_36px_rgba(110,84,144,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">Dica profissional</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Dedique um dia da semana para pesquisar tendências e ajustar seu portfólio. Pequenas atualizações no serviço podem gerar maior ticket e mais relevância para o cliente.
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
