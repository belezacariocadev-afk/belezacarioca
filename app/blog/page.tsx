import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { BlogList } from '@/components/BlogList';
import { CTASection } from '@/components/CTASection';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Blog Beleza Carioca',
  description:
    'Conteúdo para profissionais de beleza que querem vender melhor, organizar a agenda e crescer com consistência.',
};

export default function BlogPage() {
  return (
    <main className="relative z-10">
      <section className="bc-section pt-16 md:pt-24">
        <div className="bc-container">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-start">
            <div>
              <SectionHeading
                kicker="Blog Beleza Carioca"
                title="Conteúdo para profissionais que querem crescer, se inspirar e criar operações mais inteligentes."
                description="Uma página editorial com busca, filtros e cards de artigos para reforçar a camada de conteúdo do ecossistema Beleza Carioca."
              />
            </div>

            <aside className="space-y-6">
              <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,236,250,0.92),rgba(246,239,231,0.9))] p-6 shadow-[0_20px_46px_rgba(110,84,144,0.09)]">
                <div className="absolute inset-0 bg-[url('/assets/brand-backdrop.png')] bg-cover bg-center opacity-5" />
                <div className="relative space-y-4">
                  <p className="bc-kicker">Editorial premium</p>
                  <p className="text-base leading-7 text-[color:var(--bc-muted)]">
                    Gestão, tendências, marketing e operação em uma linguagem clara para salões que querem
                    trabalhar melhor e faturar com mais consistência.
                  </p>
                  <div className="grid gap-3">
                    <div className="rounded-[1.4rem] bg-white/95 p-4 shadow-[0_14px_30px_rgba(110,84,144,0.08)]">
                      <p className="text-sm font-semibold text-[color:var(--bc-text)]">Leitura rápida</p>
                      <p className="mt-2 text-sm text-[color:var(--bc-muted)]">Postagens de 4 a 7 minutos para leitura prática.</p>
                    </div>
                    <div className="rounded-[1.4rem] bg-white/95 p-4 shadow-[0_14px_30px_rgba(110,84,144,0.08)]">
                      <p className="text-sm font-semibold text-[color:var(--bc-text)]">Conteúdo atualizado</p>
                      <p className="mt-2 text-sm text-[color:var(--bc-muted)]">Artigos organizados por gestão, marketing e tendências de salão.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white/95 p-6 shadow-[0_20px_46px_rgba(110,84,144,0.07)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8d6a39]">Último destaque</p>
                <h3 className="mt-4 text-xl font-semibold text-[color:var(--bc-text)]">
                  Como atrair mais clientes para seu salão
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Dicas práticas e direto ao ponto para tornar seu salão mais visível e mais organizado.
                </p>
                <Link
                  href="/blog"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7a58a6]"
                >
                  Ver artigo
                  <ArrowRight size={16} />
                </Link>
              </div>
            </aside>
          </div>

          <div className="mt-10">
            <BlogList />
          </div>
        </div>
      </section>

      <CTASection
        title="Quer transformar conteúdo em operação forte?"
        description="Leve a experiência do blog para dentro da sua rotina com uma plataforma feita para gestão de beleza."
        primaryHref="/negocios"
        primaryLabel="Ver a solução para negócios"
        secondaryHref="/entrar"
        secondaryLabel="Entrar"
      />
    </main>
  );
}
