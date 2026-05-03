import type { Metadata } from 'next';
import Link from 'next/link';

import { CTASection } from '@/components/CTASection';
import { SectionHeading } from '@/components/SectionHeading';
import { supportTopics } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Ajuda | Beleza Carioca',
  description:
    'Central de ajuda da Beleza Carioca com tópicos estruturais para onboarding, agenda, clientes e financeiro.',
};

export default function HelpPage() {
  return (
    <main className="relative z-10">
      <section className="bc-section pt-16 md:pt-24">
        <div className="bc-container">
          <SectionHeading
            kicker="Central de ajuda"
            title="Uma base de suporte pronta para crescer junto com a plataforma."
            description="A arquitetura pública agora já contempla uma camada de ajuda separada do marketing, seguindo a lógica de um ecossistema SaaS mais maduro."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportTopics.map((topic) => (
              <Link
                key={topic.id}
                href={topic.href}
                className="bc-card-hover rounded-[1.85rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_16px_34px_rgba(110,84,144,0.08)]"
              >
                <h2 className="text-2xl font-semibold text-[color:var(--bc-text)]">{topic.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">{topic.description}</p>
                <span className="mt-6 inline-flex text-sm font-semibold text-[#8d6a39]">Abrir caminho relacionado</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Precisa seguir para a plataforma ou entender melhor a solução?"
        description="Você pode continuar pelo conteúdo comercial, explorar as soluções ou acessar a área principal do sistema."
        primaryHref="/entrar"
        primaryLabel="Acessar plataforma"
        secondaryHref="/negocios"
        secondaryLabel="Ver negócios"
      />
    </main>
  );
}
