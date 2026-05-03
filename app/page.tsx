import { HomeLanding } from '@/components/HomeLanding';
import { listFeaturedPublicSalons } from '@/lib/public-salons';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const featuredSalons = await listFeaturedPublicSalons(24);

  return (
    <main className="relative z-10">
      <HomeLanding featuredSalons={featuredSalons} />
    </main>
  );
}
