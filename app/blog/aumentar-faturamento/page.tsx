import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Como aumentar o faturamento sem depender de mais clientes | Blog Beleza Carioca',
  description:
    'Descubra como aumentar a margem do salão com serviços estratégicos, upgrades inteligentes e rotinas comerciais mais eficientes.',
};

export default function AumentarFaturamentoPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Como aumentar o faturamento sem depender de mais clientes',
    description: 'Descubra como aumentar a margem do salão com serviços estratégicos, upgrades inteligentes e rotinas comerciais mais eficientes.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    datePublished: '2026-03-18',
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
              <h1 className="bc-title max-w-3xl">Como aumentar o faturamento sem depender de mais clientes</h1>
              <p className="max-w-2xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                Melhore sua receita com ajustes inteligentes de serviço, upgrades e vendas complementares que valorizam cada atendimento.
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
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80"
                alt="Aumentar faturamento de salão"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[color:var(--bc-muted)]">
                <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#6e4c98]">
                  Financeiro
                </span>
                <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">
                  Rotina comercial e de upsell
                </span>
                <span>18 de março de 2026</span>
                <span>7 min de leitura</span>
                <span>Equipe Beleza Carioca</span>
              </div>

              <div className="space-y-6 text-[1rem] leading-8 text-[color:var(--bc-text)]">
                <p>
                  Aumentar faturamento não é atrair mais clientes: é gerar mais valor por atendimento. Use serviços complementares e pacotes que aumentem o ticket médio sem sobrecarregar a agenda.
                </p>
                <p>
                  Treine a equipe para oferecer upgrades com convicção e sentido. Um serviço adicional que agrega resultado transforma o cliente em defensor do salão.
                </p>
                <p>
                  Estruture uma rotina de check-ins de vendas e acompanhamento de metas. Olhar para o mix de serviços com frequência ajuda a identificar quais ofertas geram mais lucro.
                </p>
              </div>

              <div className="mt-10 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-[#fbf8ff] p-6 shadow-[0_16px_36px_rgba(110,84,144,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">Dica profissional</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Escolha um serviço “porta de entrada” com alto potencial de upgrade e ofereça o complemento certo no momento certo. Isso aumenta receita sem exigir novos clientes.
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
