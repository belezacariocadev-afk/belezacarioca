import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PublicPartnerManualPage } from '@/components/partner/PublicPartnerManualPage';
import { getPublicManualByToken, publicManualTokens } from '@/lib/partner/publicManualTokens';

type PublicManualPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export function generateStaticParams() {
  return publicManualTokens.map((item) => ({
    token: item.token,
  }));
}

export async function generateMetadata({
  params,
}: PublicManualPageProps): Promise<Metadata> {
  const { token } = await params;
  const tokenData = getPublicManualByToken(token);

  if (!tokenData) {
    return {
      title: 'Manual nao encontrado | Beleza Carioca',
      description: 'Este link de manual nao esta disponivel.',
    };
  }

  return {
    title: 'Manual do Parceiro | Beleza Carioca',
    description:
      'Guia pratico do parceiro Beleza Carioca para usar a area, divulgar com consistencia e acompanhar resultados.',
  };
}

export default async function PublicManualPage({ params }: PublicManualPageProps) {
  const { token } = await params;
  const tokenData = getPublicManualByToken(token);

  if (!tokenData) {
    notFound();
  }

  return <PublicPartnerManualPage tokenData={tokenData} />;
}

