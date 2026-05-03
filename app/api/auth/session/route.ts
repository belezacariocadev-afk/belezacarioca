import { NextResponse } from 'next/server';

import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import {
  isEstablishmentProfile,
  platformSessionCookieName,
  platformSessionMaxAgeSeconds,
  serializePlatformSession,
} from '@/lib/platform/auth/session';
import { refreshSupabasePlatformSession, resolveSupabaseCommercialAccess } from '@/lib/platform/supabase/auth-adapter';
import { isSupabaseJwtExpiredError } from '@/lib/platform/supabase/rest-client';

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  return new URL(request.url).protocol === 'https:';
}

export async function GET(request: Request) {
  let session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ session: null }, { status: 401 });
  }

  if (session.authProvider === 'supabase' && session.providerAccessToken && isEstablishmentProfile(session.profileId)) {
    try {
      session = {
        ...session,
        commercialAccess: await resolveSupabaseCommercialAccess({
          profileId: session.profileId,
          providerAccessToken: session.providerAccessToken,
          salonId: session.salonId,
        }),
      };
    } catch (error) {
      if (!isSupabaseJwtExpiredError(error)) {
        // Return the current cookie state if Supabase is temporarily unavailable.
      } else {
        const refreshedSession = await refreshSupabasePlatformSession(session).catch((refreshError: unknown) => {
          console.error('[auth-session] Falha ao renovar sessao Supabase:', refreshError);
          return null;
        });

        if (!refreshedSession) {
          const response = NextResponse.json({ session: null, message: 'Sessao expirada.' }, { status: 401 });
          response.cookies.set(platformSessionCookieName, '', {
            httpOnly: true,
            maxAge: 0,
            path: '/',
            sameSite: 'lax',
            secure: isSecureRequest(request),
          });

          return response;
        }

        session = {
          ...refreshedSession,
          commercialAccess: await resolveSupabaseCommercialAccess({
            profileId: refreshedSession.profileId,
            providerAccessToken: refreshedSession.providerAccessToken ?? '',
            salonId: refreshedSession.salonId,
          }).catch(() => refreshedSession.commercialAccess),
        };
      }
    }
  }

  const response = NextResponse.json({ session });

  if (session.authProvider === 'supabase' && session.providerAccessToken && isEstablishmentProfile(session.profileId)) {
    response.cookies.set(platformSessionCookieName, serializePlatformSession(session), {
      httpOnly: true,
      maxAge: platformSessionMaxAgeSeconds,
      path: '/',
      sameSite: 'lax',
      secure: isSecureRequest(request),
    });
  }

  return response;
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(platformSessionCookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: isSecureRequest(request),
  });

  return response;
}
