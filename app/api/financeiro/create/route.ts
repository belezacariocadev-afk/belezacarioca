import { NextResponse } from 'next/server';

import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import type { ChargeInput } from '@/lib/platform/data/schema';
import { createFinanceCharge } from '@/lib/platform/financeiro';
import { isSupabaseDataSourceRequested } from '@/lib/platform/supabase/config';

export async function POST(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!isSupabaseDataSourceRequested()) {
    return NextResponse.json({ message: 'Fonte Supabase nao esta ativa.' }, { status: 400 });
  }

  try {
    const input = (await request.json()) as ChargeInput;
    const charge = await createFinanceCharge(input, session);

    return NextResponse.json({ amount_cents: charge.amountCents, charge, message: 'Cobrança criada com sucesso.' }, { status: 201 });
  } catch (error) {
    console.error('[financeiro-create] Falha ao criar cobranca:', error);

    return NextResponse.json({ message: 'Não foi possível criar cobrança. Tente novamente.' }, { status: 500 });
  }
}
