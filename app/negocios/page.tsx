import type { Metadata } from 'next';

import { BusinessSection } from '@/components/BusinessSection';
import { BusinessSearchResults } from '@/components/BusinessSearchResults';
import { CTASection } from '@/components/CTASection';

export const metadata: Metadata = {
  title: 'Beleza para Negócios',
  description:
    'Conheça a solução Beleza Carioca para salões que precisam de agenda, clientes, financeiro, equipe e relatórios em um sistema premium.',
};

type BusinessPageProps = {
  searchParams: Promise<{
    servico?: string;
    local?: string;
  }>;
};

export default async function BusinessPage({ searchParams }: BusinessPageProps) {
  const params = await searchParams;
  const service = params.servico?.trim();
  const location = params.local?.trim();
  const hasSearch = Boolean(service || location);

  if (hasSearch) {
    return (
      <main className="relative z-10">
        <BusinessSearchResults service={service} location={location} />
      </main>
    );
  }

  return (
    <main className="relative z-10">
      <BusinessSection />
      <CTASection
        title="Comece grátis e veja a diferença em poucos dias."
        description="A Beleza Carioca foi desenhada para transformar a operação do salão em uma experiência mais organizada, bonita e comercialmente forte."
        primaryHref="/cadastro-estabelecimento"
        primaryLabel="Testar grátis"
        secondaryHref="/blog"
        secondaryLabel="Explorar conteúdo"
      />
    </main>
  );
}
