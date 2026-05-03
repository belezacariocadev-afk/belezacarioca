import { NextRequest, NextResponse } from 'next/server';

import {
  canSessionAccessPath,
  getRouteAccessRequirement,
  isEstablishmentProfile,
  parsePlatformSession,
  platformSessionCookieName,
  serializePlatformSession,
} from '@/lib/platform/auth/session';
import { resolveSupabaseCommercialAccess } from '@/lib/platform/supabase/auth-adapter';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requirement = getRouteAccessRequirement(pathname);
  const isPartnerArea = requirement?.profileIds.length === 1 && requirement.profileIds[0] === 'partner';
  const isPlatformAdminArea =
    requirement?.profileIds.length === 1 && requirement.profileIds[0] === 'platformAdmin';

  if (!requirement) {
    return NextResponse.next();
  }

  let session = parsePlatformSession(request.cookies.get(platformSessionCookieName)?.value);

  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = isPartnerArea ? '/parceiro/login' : isPlatformAdminArea ? '/admin/login' : '/entrar';
    loginUrl.search = '';
    loginUrl.searchParams.set('next', pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (!canSessionAccessPath(session, pathname)) {
    if (isPartnerArea) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/parceiro/login';
      loginUrl.search = '';
      loginUrl.searchParams.set('next', pathname);
      loginUrl.searchParams.set('reason', 'sem-permissao');

      return NextResponse.redirect(loginUrl);
    }

    const deniedUrl = request.nextUrl.clone();
    deniedUrl.pathname = '/acesso-negado';
    deniedUrl.search = '';
    deniedUrl.searchParams.set('from', pathname);
    deniedUrl.searchParams.set('profile', session.profileId);

    return NextResponse.redirect(deniedUrl);
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
    } catch {
      // Keep the cookie state if Supabase is temporarily unavailable.
    }
  }

  if (
    pathname !== '/assinatura' &&
    !pathname.startsWith('/assinatura/') &&
    isEstablishmentProfile(session.profileId) &&
    session.commercialAccess?.status === 'requiresSubscription'
  ) {
    const subscriptionUrl = request.nextUrl.clone();
    subscriptionUrl.pathname = '/assinatura';
    subscriptionUrl.search = '';
    subscriptionUrl.searchParams.set('from', pathname);
    subscriptionUrl.searchParams.set('reason', session.commercialAccess.reason);

    return NextResponse.redirect(subscriptionUrl);
  }

  const response = NextResponse.next();

  if (session.authProvider === 'supabase' && session.providerAccessToken && isEstablishmentProfile(session.profileId)) {
    response.cookies.set(platformSessionCookieName, serializePlatformSession(session), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
  }

  return response;
}

export const config = {
  matcher: ['/cliente/:path*', '/admin/:path*', '/profissional/:path*', '/checkout/:path*', '/parceiro/:path*'],
};
