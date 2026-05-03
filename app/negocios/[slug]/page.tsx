import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CTASection } from '@/components/CTASection';
import { DashboardMockup } from '@/components/DashboardMockup';
import { FeaturesSection } from '@/components/FeaturesSection';
import { businessFeatures, businessSegments } from '@/lib/data';

type SegmentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return businessSegments.map((segment) => ({ slug: segment.slug }));
}

export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const segment = businessSegments.find((item) => item.slug === slug);

  if (!segment) {
    return {
      title: 'Segmento | Beleza Carioca',
    };
  }

  return {
    title: `${segment.label} | Beleza Carioca`,
    description: segment.description,
  };
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { slug } = await params;
  const segment = businessSegments.find((item) => item.slug === slug);

  if (!segment) {
    notFound();
  }

  return (
    <main className="relative z-10">
      <section className="bc-section pt-16 md:pt-24">
        <div className="bc-container">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="bc-kicker">{segment.eyebrow}</p>
              <h1 className="bc-display text-[clamp(2.1rem,4vw,3.9rem)] leading-[1.02]">{segment.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
                {segment.description}
              </p>

              <div className="mt-8 grid gap-3">
                {segment.highlights.map((item, index) => (
                  <div
                    key={`${segment.slug}-${index}`}
                    className="rounded-[1.2rem] border border-[rgba(120,84,162,0.1)] bg-white px-4 py-3 text-sm text-[color:var(--bc-muted)] shadow-[0_10px_24px_rgba(110,84,144,0.05)]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/entrar" className="bc-button-primary h-14 px-7 text-sm">
                  Testar grátis
                </Link>
                <Link href="/negocios" className="bc-button-secondary h-14 px-7 text-sm">
                  Voltar para negócios
                </Link>
              </div>
            </div>

            <DashboardMockup />
          </div>
        </div>
      </section>

      <FeaturesSection
        kicker="Base funcional"
        title={`Recursos essenciais para ${segment.label.toLowerCase()}.`}
        description="A mesma fundação premium da plataforma pode ser reaproveitada em páginas segmentadas, mantendo consistência de mensagem e visual."
        items={businessFeatures}
      />

      <CTASection
        title={`Quer ver ${segment.label.toLowerCase()} operando com mais clareza?`}
        description="A Beleza Carioca já fica preparada para uma família de landing pages por segmento, sem duplicar estrutura desnecessária."
        primaryHref="/entrar"
        primaryLabel="Começar agora"
        secondaryHref="/solucoes"
        secondaryLabel="Ver soluções"
      />
    </main>
  );
}
