import { NextResponse } from 'next/server';

import { findSupabaseAuthUserByEmail, updateSupabaseAuthUserPassword } from '@/lib/platform/supabase/auth-admin';
import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';

type ChangePasswordBody = {
  confirmPassword?: string;
  newPassword?: string;
};

function validatePassword(password: string) {
  return password.length >= 8;
}

export async function PATCH(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session || session.profileId !== 'partner') {
    return NextResponse.json({ message: 'Sessao de parceiro obrigatoria.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ChangePasswordBody;
  const newPassword = body.newPassword?.trim() ?? '';
  const confirmPassword = body.confirmPassword?.trim() ?? '';

  if (!validatePassword(newPassword)) {
    return NextResponse.json({ message: 'Use uma senha com pelo menos 8 caracteres.' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ message: 'A confirmacao precisa ser igual a nova senha.' }, { status: 400 });
  }

  try {
    const userId = session.supabaseUserId ?? (await findSupabaseAuthUserByEmail(session.email))?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Usuario do parceiro nao encontrado no Supabase Auth.' }, { status: 404 });
    }

    await updateSupabaseAuthUserPassword({
      password: newPassword,
      userId,
    });

    return NextResponse.json({
      message: 'Senha atualizada com sucesso.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Nao foi possivel atualizar a senha.',
      },
      { status: 500 },
    );
  }
}
