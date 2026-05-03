import { NextResponse } from 'next/server';

import {
  canSessionAccessPath,
  createPlatformSession,
  isEstablishmentProfile,
  platformSessionCookieName,
  platformSessionMaxAgeSeconds,
  serializePlatformSession,
  type LoginSurface,
} from '@/lib/platform/auth/session';
import type { AccessProfileId } from '@/lib/platform/domain';
import { resolveSupabaseCommercialAccess } from '@/lib/platform/supabase/auth-adapter';
import { getSupabaseRuntimeConfig } from '@/lib/platform/supabase/config';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type OAuthSessionRequest = {
  accessSurface?: LoginSurface;
  accessToken?: string;
  nextPath?: string | null;
  refreshToken?: string | null;
};

type SupabaseOAuthUser = {
  app_metadata?: {
    provider?: string;
  };
  email?: string | null;
  id: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
  };
};

type ProfileRow = {
  avatar_url?: string | null;
  email: string | null;
  full_name: string | null;
  id: string;
  role: string | null;
  salon_id: string | null;
};

type SalonIdentityRow = {
  id: string;
};

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  return new URL(request.url).protocol === 'https:';
}

function normalizeRole(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[\s_-]+/g, '') ?? null;
}

function mapProfileRole(role: string | null | undefined): AccessProfileId | null {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'adminmaster' || normalizedRole === 'platformadmin') {
    return 'platformAdmin';
  }

  if (normalizedRole === 'owner' || normalizedRole === 'admin') {
    return 'salonAdmin';
  }

  if (normalizedRole === 'employee') {
    return 'professional';
  }

  return null;
}

function buildSubscriptionRedirect(reason: string) {
  return `/assinatura?reason=${encodeURIComponent(reason)}`;
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

function buildOAuthSignupRedirect(options: { email: string | null; possibleExistingSalon?: boolean }) {
  const params = new URLSearchParams({ oauth: 'complete' });

  if (options.email) {
    params.set('email', options.email);
  }

  if (options.possibleExistingSalon) {
    params.set('possibleExistingSalon', '1');
  }

  return `/cadastro-estabelecimento?${params.toString()}`;
}

async function fetchOAuthUser(accessToken: string) {
  const config = getSupabaseRuntimeConfig();

  if (!config) {
    throw new Error('Supabase Auth nao esta configurado.');
  }

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as SupabaseOAuthUser;
}

async function findProfileByOAuthUserId(userId: string) {
  const rows = await supabaseRestRequest<ProfileRow[]>('profiles', {
    query: `id=eq.${encodeURIComponent(userId)}&select=id,salon_id,role,email,full_name,avatar_url&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function findSalonById(salonId: string) {
  const rows = await supabaseRestRequest<SalonIdentityRow[]>('salons', {
    query: `id=eq.${encodeURIComponent(salonId)}&select=id&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function hasSalonWithEmail(email: string | null) {
  if (!email || email.endsWith('.local')) {
    return false;
  }

  const rows = await supabaseRestRequest<SalonIdentityRow[]>('salons', {
    query: `email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
    useServiceRole: true,
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message.toLowerCase().includes('email')) {
      return [];
    }

    throw error;
  });

  return Boolean(rows[0]);
}

async function clearInvalidProfileSalonLink(profileId: string) {
  await supabaseRestRequest('profiles', {
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(profileId)}`,
    body: {
      salon_id: null,
    },
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

async function ensureOAuthProfile(user: SupabaseOAuthUser, email: string) {
  const profile = await findProfileByOAuthUserId(user.id);
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  if (profile) {
    await supabaseRestRequest('profiles', {
      method: 'PATCH',
      query: `id=eq.${encodeURIComponent(profile.id)}`,
      body: {
        avatar_url: profile.avatar_url ?? avatarUrl,
        email: profile.email ?? email,
        full_name: profile.full_name ?? fullName,
        role: profile.role ?? 'owner',
      },
      prefer: 'return=minimal',
      useServiceRole: true,
    });

    return {
      ...profile,
      avatar_url: profile.avatar_url ?? avatarUrl,
      email: profile.email ?? email,
      full_name: profile.full_name ?? fullName,
      role: profile.role ?? 'owner',
    };
  }

  const rows = await supabaseRestRequest<ProfileRow[]>('profiles', {
    method: 'POST',
    body: [
      {
        avatar_url: avatarUrl,
        email,
        full_name: fullName,
        id: user.id,
        role: 'owner',
        salon_id: null,
      },
    ],
    prefer: 'return=representation',
    useServiceRole: true,
  });

  return rows[0];
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as OAuthSessionRequest;
  const accessSurface = body.accessSurface ?? 'establishment';
  const accessToken = body.accessToken?.trim() ?? '';
  const refreshToken = body.refreshToken?.trim() || undefined;
  const safeNextPath = body.nextPath?.startsWith('/') ? body.nextPath : null;

  if (accessSurface !== 'establishment') {
    return NextResponse.json({ message: 'Login social disponivel apenas para estabelecimento neste fluxo.' }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ message: 'Token OAuth ausente.' }, { status: 400 });
  }

  try {
    const user = await fetchOAuthUser(accessToken);
    const realEmail = normalizeEmail(user.email);
    const provider = user.app_metadata?.provider?.trim().toLowerCase() || 'facebook';
    const safeEmail = realEmail ?? `${user.id}@${provider === 'facebook' ? 'facebook' : 'oauth'}.local`;
    const profile = await ensureOAuthProfile(user, safeEmail);
    const possibleExistingSalon = await hasSalonWithEmail(realEmail);

    if (!profile?.salon_id) {
      return NextResponse.json({
        redirectTo: buildOAuthSignupRedirect({
          email: realEmail,
          possibleExistingSalon,
        }),
        status: 'profile_without_salon',
      });
    }

    const salon = await findSalonById(profile.salon_id);

    if (!salon) {
      await clearInvalidProfileSalonLink(profile.id);

      return NextResponse.json({
        redirectTo: buildOAuthSignupRedirect({
          email: realEmail,
          possibleExistingSalon,
        }),
        status: 'invalid_profile_salon',
      });
    }

    const profileId = mapProfileRole(profile.role);

    if (!profileId || !isEstablishmentProfile(profileId)) {
      return NextResponse.json({ message: 'Perfil social autenticado, mas sem permissao de estabelecimento.' }, { status: 403 });
    }

    const commercialAccess = profileId === 'platformAdmin'
      ? undefined
      : await resolveSupabaseCommercialAccess({
          profileId,
          providerAccessToken: accessToken,
          salonId: profile.salon_id,
        });
    const session = createPlatformSession(safeEmail, profileId, {
      actorId: profile.id,
      authProvider: 'supabase',
      commercialAccess,
      providerAccessToken: accessToken,
      providerRefreshToken: refreshToken,
      salonId: profile.salon_id,
      supabaseUserId: user.id,
    });
    const redirectTo =
      commercialAccess?.status === 'requiresSubscription'
        ? buildSubscriptionRedirect(commercialAccess.reason)
        : safeNextPath && canSessionAccessPath(session, safeNextPath)
          ? safeNextPath
          : '/admin';
    const response = NextResponse.json({
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
  } catch (error) {
    console.error('[oauth-establishment-login] Falha ao concluir OAuth de estabelecimento', error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Nao foi possivel concluir o login social.',
      },
      { status: 500 },
    );
  }
}
