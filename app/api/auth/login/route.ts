import { NextResponse } from 'next/server';

import { resolvePartnerApprovalDecision } from '@/lib/partner/approval';
import { authenticateLocalPartnerTestAccount } from '@/lib/partner/localTestPartner';
import { accessProfiles } from '@/lib/platform/access';
import {
  evaluateCommercialAccess,
  normalizeSubscriptionCommercialState,
  type CommercialAccessResult,
} from '@/lib/platform/billing/commercial-access-policy';
import { readLocalSubscriptionFromRequest } from '@/lib/platform/billing/local-subscription';
import type { AccessProfileId, SubscriptionRecord } from '@/lib/platform/domain';
import {
  type PlatformSession,
  canSessionAccessPath,
  createPlatformSession,
  getEntryPathForProfile,
  isEstablishmentProfile,
  type LoginSurface,
  platformSessionCookieName,
  platformSessionMaxAgeSeconds,
  resolveLocalLoginProfile,
  serializePlatformSession,
} from '@/lib/platform/auth/session';
import { createInitialPlatformData } from '@/lib/platform/data/seed';
import {
  authenticatePartnerWithSupabase,
  authenticateWithSupabase,
  resolveSupabaseCommercialAccess,
} from '@/lib/platform/supabase/auth-adapter';
import { isSupabaseAuthEnabled, shouldFallbackToLocalAuth } from '@/lib/platform/supabase/config';

type LoginRequestBody = {
  accessSurface?: LoginSurface;
  email?: string;
  password?: string;
  profileId?: AccessProfileId;
  nextPath?: string | null;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  return new URL(request.url).protocol === 'https:';
}

function isLoginSurface(value?: string): value is LoginSurface {
  return value === 'client' || value === 'establishment' || value === 'partner' || value === 'admin';
}

function resolveAccessSurface(accessSurface: string | undefined, profileId?: AccessProfileId): LoginSurface | null {
  if (isLoginSurface(accessSurface)) {
    return accessSurface;
  }

  if (profileId === 'client') {
    return 'client';
  }

  if (profileId === 'partner') {
    return 'partner';
  }

  if (profileId && accessProfiles[profileId]) {
    return 'establishment';
  }

  return null;
}

function resolveLocalCommercialAccess(
  email: string,
  profileId: AccessProfileId,
  localSubscription?: SubscriptionRecord | null,
): CommercialAccessResult {
  const snapshot = createInitialPlatformData();
  const normalizedEmail = email.trim().toLowerCase();
  const expiredTrialAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const baseSubscription = localSubscription ?? snapshot.subscription;
  const subscription =
    normalizedEmail.includes('sem-plano') || normalizedEmail.includes('trial-expirado')
      ? normalizeSubscriptionCommercialState({
          ...snapshot.subscription,
          status: 'trialing',
          trialStartedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          trialEndsAt: expiredTrialAt,
          currentPeriodEnd: expiredTrialAt,
          asaasCustomerId: undefined,
          asaasSubscriptionId: undefined,
        })
      : normalizedEmail.includes('plano-bloqueado') || normalizedEmail.includes('pastdue')
        ? normalizeSubscriptionCommercialState({
            ...snapshot.subscription,
            status: 'pastDue',
          })
        : normalizeSubscriptionCommercialState(baseSubscription);

  return evaluateCommercialAccess({
    profileId,
    salon: snapshot.salon,
    subscription,
  });
}

function buildSubscriptionRedirect(reason: string) {
  return `/assinatura?reason=${encodeURIComponent(reason)}`;
}

function buildResponseWithSession(request: Request, session: PlatformSession, redirectTo: string, extra?: Record<string, unknown>) {
  const response = NextResponse.json({
    ...extra,
    redirectTo,
    session,
  });

  response.cookies.set(platformSessionCookieName, serializePlatformSession(session), {
    httpOnly: true,
    maxAge: platformSessionMaxAgeSeconds,
    path: '/',
    sameSite: 'lax',
    secure: isSecureRequest(request),
  });

  return response;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginRequestBody;
  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password?.trim() ?? '';
  const profileId = body.profileId;
  const requestedProfileId = profileId && accessProfiles[profileId] ? profileId : undefined;
  const accessSurface = resolveAccessSurface(body.accessSurface, requestedProfileId);

  if (
    !email ||
    !isValidEmail(email) ||
    password.length < 6 ||
    !accessSurface ||
    (profileId && !accessProfiles[profileId]) ||
    (accessSurface === 'client' && requestedProfileId && requestedProfileId !== 'client') ||
    (accessSurface === 'partner' && requestedProfileId && requestedProfileId !== 'partner') ||
    (accessSurface === 'establishment' && requestedProfileId && !isEstablishmentProfile(requestedProfileId)) ||
    (accessSurface === 'admin' && requestedProfileId && requestedProfileId !== 'platformAdmin')
  ) {
    return NextResponse.json(
      {
        message: 'Credenciais invalidas.',
      },
      { status: 400 },
    );
  }

  const safeNextPath = body.nextPath?.startsWith('/') ? body.nextPath : null;

  if (accessSurface === 'partner') {
    let resolvedEmail = email;
    let session: PlatformSession;
    const localTestAuth = authenticateLocalPartnerTestAccount(email, password);

    if (!isSupabaseAuthEnabled() && localTestAuth.emailMatched && !localTestAuth.isAuthenticated) {
      return NextResponse.json(
        {
          message: 'Credenciais invalidas.',
        },
        { status: 401 },
      );
    }

    if (isSupabaseAuthEnabled()) {
      try {
        const identity = await authenticatePartnerWithSupabase(email, password);
        resolvedEmail = identity.email.trim().toLowerCase();
        const approvalDecision = await resolvePartnerApprovalDecision(resolvedEmail);

        if (!approvalDecision.isApproved) {
          return NextResponse.json(
            {
              message: approvalDecision.message,
              partnerStatus: approvalDecision.status,
            },
            { status: 403 },
          );
        }

        session = createPlatformSession(resolvedEmail, 'partner', {
          actorId: identity.supabaseUserId,
          authProvider: 'supabase',
          providerAccessToken: identity.providerAccessToken,
          providerRefreshToken: identity.providerRefreshToken,
          salonId: 'partner-program',
          supabaseUserId: identity.supabaseUserId,
        });
      } catch (error) {
        return NextResponse.json(
          {
            message: error instanceof Error ? error.message : 'Falha ao autenticar parceiro.',
          },
          { status: 401 },
        );
      }
    } else {
      if (localTestAuth.isAuthenticated) {
        session = createPlatformSession(resolvedEmail, 'partner', {
          actorId: 'partner-local-test',
          authProvider: 'local',
          salonId: 'partner-program',
        });

        const redirectTo =
          safeNextPath && canSessionAccessPath(session, safeNextPath) ? safeNextPath : getEntryPathForProfile(session.profileId);

        return buildResponseWithSession(request, session, redirectTo, {
          partnerStatus: 'approved',
        });
      }

      const approvalDecision = await resolvePartnerApprovalDecision(resolvedEmail);

      if (!approvalDecision.isApproved) {
        return NextResponse.json(
          {
            message: approvalDecision.message,
            partnerStatus: approvalDecision.status,
          },
          { status: 403 },
        );
      }

      session = createPlatformSession(resolvedEmail, 'partner', {
        actorId: `partner-${resolvedEmail.replace(/[^a-z0-9]+/g, '-')}`,
        authProvider: 'local',
        salonId: 'partner-program',
      });
    }

    const redirectTo =
      safeNextPath && canSessionAccessPath(session, safeNextPath) ? safeNextPath : getEntryPathForProfile(session.profileId);

    return buildResponseWithSession(request, session, redirectTo, {
      partnerStatus: 'approved',
    });
  }

  const profileForSupabase =
    accessSurface === 'client'
      ? 'client'
      : accessSurface === 'admin'
        ? 'platformAdmin'
        : requestedProfileId && isEstablishmentProfile(requestedProfileId)
          ? requestedProfileId
          : undefined;
  const localProfileId = resolveLocalLoginProfile(email, accessSurface, requestedProfileId);
  const localSubscription = readLocalSubscriptionFromRequest(request);
  let session = createPlatformSession(email, localProfileId, {
    commercialAccess: resolveLocalCommercialAccess(email, localProfileId, localSubscription),
  });

  if (isSupabaseAuthEnabled()) {
    try {
      const resolvedSession = await authenticateWithSupabase(email, password, profileForSupabase, accessSurface);
      const commercialAccess =
        accessSurface === 'admin' ? undefined : await resolveSupabaseCommercialAccess(resolvedSession);
      session = createPlatformSession(resolvedSession.email, resolvedSession.profileId, {
        actorId: resolvedSession.actorId,
        authProvider: 'supabase',
        commercialAccess,
        providerAccessToken: resolvedSession.providerAccessToken,
        providerRefreshToken: resolvedSession.providerRefreshToken,
        salonId: resolvedSession.salonId,
        supabaseUserId: resolvedSession.supabaseUserId,
      });
    } catch (error) {
      if (!shouldFallbackToLocalAuth()) {
        return NextResponse.json(
          {
            message: error instanceof Error ? error.message : 'Falha ao autenticar no Supabase.',
          },
          { status: 401 },
        );
      }
    }
  }

  if (accessSurface === 'admin' && session.profileId !== 'platformAdmin') {
    return NextResponse.json(
      {
        message: 'Permissão insuficiente para acessar o painel administrativo.',
      },
      { status: 403 },
    );
  }

  const redirectTo =
    accessSurface === 'admin'
      ? safeNextPath && canSessionAccessPath(session, safeNextPath)
        ? safeNextPath
        : '/admin/parceiros'
      : accessSurface === 'establishment' && session.commercialAccess?.status === 'requiresSubscription'
      ? buildSubscriptionRedirect(session.commercialAccess.reason)
      : safeNextPath && canSessionAccessPath(session, safeNextPath)
        ? safeNextPath
        : getEntryPathForProfile(session.profileId);

  return buildResponseWithSession(request, session, redirectTo);
}
