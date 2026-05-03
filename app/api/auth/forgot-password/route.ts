import { NextResponse } from 'next/server';

import { generateSupabasePasswordRecoveryLink } from '@/lib/platform/supabase/auth-admin';
import { getSupabaseRuntimeConfig } from '@/lib/platform/supabase/config';

type ForgotPasswordPayload = {
  email?: unknown;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let payload: ForgotPasswordPayload;

  try {
    payload = (await request.json()) as ForgotPasswordPayload;
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload invalido.' }, { status: 400 });
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'Informe um e-mail valido.' }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const redirectTo = `${origin}/reset-password`;
    const config = getSupabaseRuntimeConfig();

    if (!config) {
      return NextResponse.json({ ok: false, message: 'Supabase nao esta configurado.' }, { status: 500 });
    }

    const recovery = await generateSupabasePasswordRecoveryLink({
      email,
      redirectTo,
    });
    const recoverResponse = await fetch(`${config.url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!recoverResponse.ok) {
      throw new Error(await recoverResponse.text());
    }

    // Em ambiente local, retornamos o link para facilitar teste manual. Em producao,
    // o e-mail e enviado pelo Supabase conforme os templates configurados no Auth.
    return NextResponse.json({
      ok: true,
      recoveryLink: process.env.NODE_ENV === 'production' ? undefined : recovery.action_link,
    });
  } catch (error) {
    console.error('[forgot-password] Falha ao gerar link de recuperacao', error);

    return NextResponse.json(
      {
        ok: false,
        message: 'Nao foi possivel enviar o link agora. Tente novamente em instantes.',
      },
      { status: 500 },
    );
  }
}
