import { NextResponse } from 'next/server';

import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import { getFinanceSummary } from '@/lib/platform/financeiro';
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
    return NextResponse.json({ summary: await getFinanceSummary(session) });
  } catch (error) {
    console.error('[financeiro-summary] Falha ao carregar resumo:', error);

    return NextResponse.json({ message: 'Nao foi possivel carregar o resumo financeiro.' }, { status: 500 });
  }
}
