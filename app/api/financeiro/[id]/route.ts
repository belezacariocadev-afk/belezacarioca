import { NextResponse } from 'next/server';

import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import type { ChargeUpdateInput } from '@/lib/platform/data/schema';
import { deleteFinanceCharge, updateFinanceCharge } from '@/lib/platform/financeiro';
import { isSupabaseDataSourceRequested } from '@/lib/platform/supabase/config';

type FinanceChargeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: FinanceChargeRouteContext) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!isSupabaseDataSourceRequested()) {
    return NextResponse.json({ message: 'Fonte Supabase nao esta ativa.' }, { status: 400 });
  }

  try {
    const { id } = await params;
    const input = (await request.json()) as ChargeUpdateInput;
    const charge = await updateFinanceCharge(id, input, session);

    return NextResponse.json({ amount_cents: charge.amountCents, charge, message: 'Cobrança atualizada com sucesso.' });
  } catch (error) {
    console.error('[financeiro-update] Falha ao atualizar cobranca:', error);

    return NextResponse.json({ message: 'Não foi possível atualizar a cobrança. Tente novamente.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: FinanceChargeRouteContext) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!isSupabaseDataSourceRequested()) {
    return NextResponse.json({ message: 'Fonte Supabase nao esta ativa.' }, { status: 400 });
  }

  try {
    const { id } = await params;
    const chargeId = await deleteFinanceCharge(id, session);

    return NextResponse.json({ chargeId, message: 'Cobrança removida com sucesso.' });
  } catch (error) {
    console.error('[financeiro-delete] Falha ao remover cobranca:', error);

    return NextResponse.json({ message: 'Não foi possível remover cobrança. Tente novamente.' }, { status: 500 });
  }
}
