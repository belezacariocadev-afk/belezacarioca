import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fidelização de clientes: crie defensores da sua marca | Blog Beleza Carioca',
  description:
    'Transforme clientes satisfeitos em promotores fiéis que indicam seu salão e retornam regularmente.',
};

export default function FidelizacaoClientesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Fidelização de clientes: crie defensores da sua marca',
    description: 'Transforme clientes satisfeitos em promotores fiéis que indicam seu salão e retornam regularmente.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    datePublished: '2026-05-05',
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
                <h1 className="bc-title max-w-3xl">Fidelização de clientes: crie defensores da sua marca</h1>
                <p className="max-w-2xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                  Transforme clientes satisfeitos em promotores fiéis que indicam seu salão e constroem sua reputação organicamente.
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
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
                  alt="Fidelização de clientes em salões"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="p-8">
                <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[color:var(--bc-muted)]">
                  <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#6e4c98]">
                    Relacionamento
                  </span>
                  <span className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">
                    Rotina de relacionamento
                  </span>
                  <span>05 de maio de 2026</span>
                  <span>5 min de leitura</span>
                  <span>Equipe Beleza Carioca</span>
                </div>

                <div className="space-y-6 text-[1rem] leading-8 text-[color:var(--bc-text)]">
                  <p>
                    Clientes fiéis valem muito mais que novos clientes. Comece oferecendo atendimento excepcional em cada visita, superando expectativas de forma consistente e criando memórias positivas.
                  </p>
                  <p>
                    Implemente um programa de fidelidade simples e atraente: acumule pontos por cada serviço realizado, ofereça desconto na décima visita, ou crie experiências exclusivas para aniversariantes.
                  </p>
                  <p>
                    Mantenha contato regular fora dos agendamentos: parabéns no aniversário, lembretes suaves de retoque, ofertas especiais para quem não vem há tempo. Mostre que você se importa verdadeiramente.
                  </p>
                </div>

                <div className="mt-10 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-[#fbf8ff] p-6 shadow-[0_16px_36px_rgba(110,84,144,0.08)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">Dica profissional</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                    Peça feedback sincero após cada atendimento e use isso para melhorar. Clientes fiéis são os melhores embaixadores da sua marca.
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