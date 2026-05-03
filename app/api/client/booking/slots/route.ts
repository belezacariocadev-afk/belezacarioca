import { NextResponse } from 'next/server';

import { listClientBookingSlots } from '@/lib/client-booking';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const salonId = url.searchParams.get('salonId') ?? '';
  const serviceId = url.searchParams.get('serviceId') ?? '';
  const employeeId = url.searchParams.get('employeeId') ?? '';
  const date = url.searchParams.get('date') ?? '';

  if (!salonId || !serviceId || !employeeId || !date) {
    return NextResponse.json({ message: 'Informe salao, servico, profissional e data.' }, { status: 400 });
  }

  try {
    const slots = await listClientBookingSlots({ date, employeeId, salonId, serviceId });

    return NextResponse.json({ slots });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Falha ao carregar horarios.' },
      { status: 500 },
    );
  }
}
