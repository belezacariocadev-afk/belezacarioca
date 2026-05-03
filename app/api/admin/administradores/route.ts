import { NextResponse } from 'next/server';

import {
  createPlatformAdministrator,
  listPlatformAdministrators,
  removePlatformAdministratorAccess,
  resetPlatformAdministratorPassword,
} from '@/lib/admin/administrators';
import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';

type CreateAdministratorBody = {
  email?: string;
  temporaryPassword?: string;
};

type ResetAdministratorPasswordBody = {
  administratorEmail?: string;
  administratorId?: string;
  temporaryPassword?: string;
};

type RemoveAdministratorBody = {
  administratorEmail?: string;
  administratorId?: string;
};

function canManageAdministrators(profileId: string) {
  return profileId === 'platformAdmin';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateTemporaryPassword(password: string) {
  return password.trim().length >= 8;
}

export async function GET(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!canManageAdministrators(session.profileId)) {
    return NextResponse.json({ message: 'Sem permissao para acessar administradores.' }, { status: 403 });
  }

  try {
    const administrators = await listPlatformAdministrators();
    return NextResponse.json({
      administrators,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao listar administradores.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!canManageAdministrators(session.profileId)) {
    return NextResponse.json({ message: 'Sem permissao para criar administradores.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateAdministratorBody;
  const email = body.email?.trim().toLowerCase() ?? '';
  const temporaryPassword = body.temporaryPassword?.trim() ?? '';

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: 'Informe um e-mail valido.' }, { status: 400 });
  }

  if (!validateTemporaryPassword(temporaryPassword)) {
    return NextResponse.json(
      {
        message: 'Use uma senha temporaria com pelo menos 8 caracteres.',
      },
      { status: 400 },
    );
  }

  try {
    const result = await createPlatformAdministrator({
      email,
      requestedByEmail: session.email,
      requestedByUserId: session.supabaseUserId,
      roleSeed: 'admin',
      salonId: session.salonId,
      temporaryPassword,
    });

    return NextResponse.json({
      administrator: result.administrator,
      message: result.wasExistingUser
        ? 'Administrador atualizado e senha temporaria redefinida com sucesso.'
        : 'Administrador criado com sucesso.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao criar administrador.',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!canManageAdministrators(session.profileId)) {
    return NextResponse.json({ message: 'Sem permissao para resetar senha de administradores.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as ResetAdministratorPasswordBody;
  const temporaryPassword = body.temporaryPassword?.trim() ?? '';
  const administratorId = body.administratorId?.trim();
  const administratorEmail = body.administratorEmail?.trim().toLowerCase();

  if (!administratorId && !administratorEmail) {
    return NextResponse.json(
      {
        message: 'Informe o administrador para resetar a senha.',
      },
      { status: 400 },
    );
  }

  if (!validateTemporaryPassword(temporaryPassword)) {
    return NextResponse.json(
      {
        message: 'Use uma senha temporaria com pelo menos 8 caracteres.',
      },
      { status: 400 },
    );
  }

  try {
    const result = await resetPlatformAdministratorPassword({
      requestedByEmail: session.email,
      requestedByUserId: session.supabaseUserId,
      targetEmail: administratorEmail,
      targetUserId: administratorId,
      temporaryPassword,
    });

    return NextResponse.json({
      message: 'Senha temporaria redefinida com sucesso.',
      updated: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao resetar senha do administrador.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!canManageAdministrators(session.profileId)) {
    return NextResponse.json({ message: 'Sem permissao para remover acesso administrativo.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as RemoveAdministratorBody;
  const administratorId = body.administratorId?.trim();
  const administratorEmail = body.administratorEmail?.trim().toLowerCase();

  if (!administratorId && !administratorEmail) {
    return NextResponse.json(
      {
        message: 'Informe o administrador que tera o acesso removido.',
      },
      { status: 400 },
    );
  }

  try {
    const result = await removePlatformAdministratorAccess({
      requestedByEmail: session.email,
      requestedByUserId: session.supabaseUserId,
      targetEmail: administratorEmail,
      targetUserId: administratorId,
    });

    const messageByAction: Record<typeof result.action, string> = {
      deletedAuthAndProfile:
        'Administrador removido com exclusao de perfil e usuario Auth.',
      deletedProfileOnly:
        'Perfil administrativo removido. Usuario Auth preservado por vinculos.',
      revokedAdminOnly:
        'Acesso administrativo removido. Dados vinculados foram preservados.',
    };

    return NextResponse.json({
      message: messageByAction[result.action],
      updated: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Falha ao remover acesso administrativo.';
    const status = message.includes('proprio acesso') ? 409 : 500;

    return NextResponse.json(
      {
        message,
      },
      { status },
    );
  }
}
