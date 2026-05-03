import { NextResponse } from 'next/server';

import { listClientBookingSalonAvailability } from '@/lib/client-booking';

export async function GET() {
  try {
    const result = await listClientBookingSalonAvailability();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Falha ao carregar estabelecimentos.' },
      { status: 500 },
    );
  }
}
