import { NextResponse } from 'next/server';

import { getPublicSalonProfileByIdOrSlug } from '@/lib/public-salons';

type PublicSalonRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: PublicSalonRouteContext) {
  const { slug } = await params;

  try {
    const salon = await getPublicSalonProfileByIdOrSlug(slug);

    if (!salon) {
      return NextResponse.json({ message: 'Estabelecimento nao encontrado.' }, { status: 404 });
    }

    return NextResponse.json(
      { salon },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('[public-salon-profile] Falha ao carregar perfil publico:', error);

    return NextResponse.json({ message: 'Nao foi possivel carregar este estabelecimento agora.' }, { status: 500 });
  }
}
