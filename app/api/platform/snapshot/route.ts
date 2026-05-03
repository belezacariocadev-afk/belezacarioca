import { NextResponse } from 'next/server';

import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import { platformSessionCookieName, platformSessionMaxAgeSeconds, serializePlatformSession } from '@/lib/platform/auth/session';
import { loadSupabasePlatformSnapshot } from '@/lib/platform/data/adapters/supabase-platform-adapter';
import { refreshSupabasePlatformSession } from '@/lib/platform/supabase/auth-adapter';
import { isSupabaseDataSourceRequested } from '@/lib/platform/supabase/config';
import { isSupabaseJwtExpiredError } from '@/lib/platform/supabase/rest-client';

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  return new URL(request.url).protocol === 'https:';
}

export async function GET(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!isSupabaseDataSourceRequested()) {
    return NextResponse.json({ message: 'Fonte Supabase nao esta ativa.' }, { status: 400 });
  }

  try {
    const snapshot = await loadSupabasePlatformSnapshot(session);

    return NextResponse.json({ snapshot });
  } catch (error) {
    if (isSupabaseJwtExpiredError(error)) {
      const refreshedSession = await refreshSupabasePlatformSession(session).catch((refreshError: unknown) => {
        console.error('[platform-snapshot] Falha ao renovar sessao Supabase:', refreshError);
        return null;
      });

      if (refreshedSession) {
        try {
          const snapshot = await loadSupabasePlatformSnapshot(refreshedSession);
          const response = NextResponse.json({ snapshot });

          response.cookies.set(platformSessionCookieName, serializePlatformSession(refreshedSession), {
            httpOnly: true,
            maxAge: platformSessionMaxAgeSeconds,
            path: '/',
            sameSite: 'lax',
            secure: isSecureRequest(request),
          });

          return response;
        } catch (retryError) {
          console.error('[platform-snapshot] Falha ao carregar snapshot apos renovar sessao:', retryError);
        }
      }

      const response = NextResponse.json({ message: 'Sessao expirada. Entre novamente para continuar.' }, { status: 401 });
      response.cookies.set(platformSessionCookieName, '', {
        httpOnly: true,
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
        secure: isSecureRequest(request),
      });

      return response;
    }

    console.error('[platform-snapshot] Falha ao carregar snapshot:', error);

    return NextResponse.json(
      {
        message: 'Nao foi possivel carregar os dados do painel agora. Tente novamente em instantes.',
      },
      { status: 503 },
    );
  }
}
