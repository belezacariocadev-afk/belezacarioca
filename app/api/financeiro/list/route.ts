import { NextResponse } from 'next/server';

import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import { listFinanceCharges } from '@/lib/platform/financeiro';
import { isSupabaseDataSourceRequested } from '@/lib/platform/supabase/config';

export async function GET(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!isSupabaseDataSourceRequested()) {
    return NextResponse.json({ message: 'Fonte Supabase nao esta ativa.' }, { status: 400 });
  }

  try {
    return NextResponse.json({ charges: await listFinanceCharges(session) });
  } catch (error) {
    console.error('[financeiro-list] Falha ao listar cobrancas:', error);

    return NextResponse.json({ message: 'Nao foi possivel carregar as cobrancas.' }, { status: 500 });
  }
}
