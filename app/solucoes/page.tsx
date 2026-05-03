import type { Metadata } from 'next';
import Link from 'next/link';

import { CTASection } from '@/components/CTASection';
import { SectionHeading } from '@/components/SectionHeading';
import { solutionPillars } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Soluções | Beleza Carioca',
  description:
    'Conheça os pilares da Beleza Carioca para agenda, clientes, financeiro, marketing e área do cliente.',
};

export default function SolutionsPage() {
  return (
    <main className="relative z-10">
      <section className="bc-section pt-16 md:pt-24">
        <div className="bc-container">
          <SectionHeading
            kicker="Soluções"
            title="Uma camada de soluções pronta para crescer junto com a arquitetura do site."
            description="Inspirada na lógica comercial de um SaaS maduro, esta página organiza os pilares da plataforma em blocos claros, escaláveis e prontos para futuras expansões."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {solutionPillars.map((pillar) => (
              <article
                key={pillar.id}
                className="bc-card-hover rounded-[1.95rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,250,0.92))] p-6 shadow-[0_18px_40px_rgba(110,84,144,0.08)] md:p-7"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8d6a39]">
                  {pillar.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-[color:var(--bc-text)]">{pillar.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">{pillar.description}</p>

                <div className="mt-6 grid gap-3">
                  {pillar.bullets.map((item, index) => (
                    <div
                      key={`${pillar.slug}-${index}`}
                      className="rounded-[1.2rem] border border-[rgba(120,84,162,0.1)] bg-white px-4 py-3 text-sm text-[color:var(--bc-muted)] shadow-[0_10px_24px_rgba(110,84,144,0.05)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <Link href="/negocios" className="mt-6 inline-flex text-sm font-semibold text-[#7a58a6]">
                  Ver aplicação para negócios
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Quer conectar soluções, marca e conversão em um só fluxo?"
        description="A Beleza Carioca foi estruturada para evoluir com páginas comerciais, conteúdo, suporte e sistema sem perder consistência."
        primaryHref="/negocios"
        primaryLabel="Explorar negócios"
        secondaryHref="/entrar"
        secondaryLabel="Entrar"
      />
    </main>
  );
}
