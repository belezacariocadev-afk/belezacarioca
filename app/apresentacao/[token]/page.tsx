import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PublicCommercialPresentationPage } from '@/components/partner/PublicCommercialPresentationPage';
import {
  getPublicPresentationByToken,
  publicPresentationTokens,
} from '@/lib/partner/publicPresentationTokens';

type PublicPresentationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export function generateStaticParams() {
  return publicPresentationTokens.map((item) => ({
    token: item.token,
  }));
}

export async function generateMetadata({
  params,
}: PublicPresentationPageProps): Promise<Metadata> {
  const { token } = await params;
  const tokenData = getPublicPresentationByToken(token);

  if (!tokenData) {
    return {
      title: 'Apresentacao nao encontrada | Beleza Carioca',
      description: 'Este link de apresentacao nao esta disponivel.',
    };
  }

  return {
    title: 'Apresentacao Comercial | Beleza Carioca',
    description:
      'Deck comercial da Beleza Carioca com proposta de valor, fluxo da parceria e acompanhamento de resultados.',
  };
}

export default async function PublicPresentationPage({
  params,
}: PublicPresentationPageProps) {
  const { token } = await params;
  const tokenData = getPublicPresentationByToken(token);

  if (!tokenData) {
    notFound();
  }

  return <PublicCommercialPresentationPage tokenData={tokenData} />;
}
