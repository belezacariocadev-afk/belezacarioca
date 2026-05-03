import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SalonPremiumShowcase } from '@/components/salons/SalonPremiumShowcase';
import { VenueProfile } from '@/components/VenueProfile';
import { getPublicSalonProfileByIdOrSlug } from '@/lib/public-salons';
import { getVenueById, venues } from '@/lib/venues';

// Dados de identidade visual mudam no admin; manter a rota dinamica evita capa/cor antigas em cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type VenuePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    servico?: string;
  }>;
};

export function generateStaticParams() {
  return venues.map((venue) => ({
    slug: venue.id,
  }));
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const publicSalon = await getPublicSalonProfileByIdOrSlug(slug);

  if (publicSalon) {
    return {
      title: `${publicSalon.name} | Beleza Carioca`,
      description: publicSalon.description ?? `Conheca ${publicSalon.name}, estabelecimento parceiro da Beleza Carioca.`,
      openGraph: {
        images: publicSalon.coverUrl ? [publicSalon.coverUrl] : undefined,
      },
    };
  }

  const venue = getVenueById(slug);

  if (!venue) {
    return {
      title: 'Estabelecimento nao encontrado | Beleza Carioca',
    };
  }

  return {
    title: `${venue.name} | Beleza Carioca`,
    description: `${venue.description} Agende servicos em ${venue.neighborhood}, ${venue.city}.`,
  };
}

export default async function VenuePage({ params, searchParams }: VenuePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const publicSalon = await getPublicSalonProfileByIdOrSlug(slug);

  if (publicSalon) {
    return <SalonPremiumShowcase salon={publicSalon} />;
  }

  const venue = getVenueById(slug);

  if (!venue) {
    notFound();
  }

  return (
    <main className="relative z-10">
      <VenueProfile venue={venue} selectedService={query.servico} />
    </main>
  );
}
