import { NextResponse } from 'next/server';

import { createClientBooking, listClientBookingAppointments } from '@/lib/client-booking';

type BookingRequest = {
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  date?: string;
  employeeId?: string;
  notes?: string;
  salonId?: string;
  serviceId?: string;
  time?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as BookingRequest;

  if (
    !body.salonId ||
    !body.serviceId ||
    !body.employeeId ||
    !body.date ||
    !body.time ||
    !body.customerName?.trim() ||
    (!body.customerEmail?.trim() && !body.customerPhone?.trim())
  ) {
    return NextResponse.json({ message: 'Informe seu WhatsApp ou e-mail para confirmar o agendamento.' }, { status: 400 });
  }

  try {
    const appointment = await createClientBooking({
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      date: body.date,
      employeeId: body.employeeId,
      notes: body.notes,
      salonId: body.salonId,
      serviceId: body.serviceId,
      time: body.time,
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Nao foi possivel criar o agendamento.' },
      { status: 409 },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') ?? undefined;
  const phone = url.searchParams.get('phone') ?? undefined;

  if (!email?.trim() && !phone?.trim()) {
    return NextResponse.json({ appointments: [] });
  }

  try {
    const appointments = await listClientBookingAppointments({ email, phone });

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Falha ao carregar seus agendamentos.' },
      { status: 500 },
    );
  }
}
