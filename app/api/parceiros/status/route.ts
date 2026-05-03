import { NextResponse } from 'next/server';

import { getPartnerRequestStatusById } from '@/lib/partner/approval';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestId = url.searchParams.get('id')?.trim();

  if (!requestId) {
    return NextResponse.json(
      {
        message: 'Informe o identificador da solicitacao.',
      },
      { status: 400 },
    );
  }

  try {
    const statusDetails = await getPartnerRequestStatusById(requestId);

    if (!statusDetails) {
      return NextResponse.json(
        {
          message: 'Solicitacao de parceiro nao encontrada.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      statusDetails,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao consultar status da solicitacao.',
      },
      { status: 500 },
    );
  }
}

