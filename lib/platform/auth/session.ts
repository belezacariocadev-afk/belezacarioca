import { accessProfiles, canAccessModule } from '@/lib/platform/access';
import type { CommercialAccessResult } from '@/lib/platform/billing/commercial-access-policy';
import type { AccessProfileId, OperationalModuleId } from '@/lib/platform/domain';
import { getOperationalModule } from '@/lib/platform/modules';

export const platformSessionCookieName = 'bc_platform_session';
export const platformSessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export type PlatformSession = {
  id: string;
  email: string;
  profileId: AccessProfileId;
  actorId: string;
  salonId: string;
  issuedAt: string;
  expiresAt: string;
  authProvider?: 'local' | 'supabase';
  providerAccessToken?: string;
  providerRefreshToken?: string;
  supabaseUserId?: string;
  commercialAccess?: CommercialAccessResult;
};

export type LoginSurface = 'client' | 'establishment' | 'partner' | 'admin';

export type RouteAccessRequirement = {
  profileIds: AccessProfileId[];
  moduleId?: OperationalModuleId;
};

const defaultActorByProfile: Record<AccessProfileId, string> = {
  client: 'client-marina',
  partner: 'partner-approved-user',
  salonAdmin: 'profile-admin-bc',
  reception: 'profile-reception-bc',
  professional: 'pro-camila',
  platformAdmin: 'profile-platform-admin',
};

export const establishmentProfileIds: AccessProfileId[] = ['salonAdmin', 'reception', 'professional', 'platformAdmin'];

export function isEstablishmentProfile(profileId: AccessProfileId) {
  return establishmentProfileIds.includes(profileId);
}

export function resolveLocalLoginProfile(
  email: string,
  accessSurface: LoginSurface,
  requestedProfileId?: AccessProfileId,
): AccessProfileId {
  if (accessSurface === 'client') {
    return 'client';
  }

  if (accessSurface === 'partner') {
    return 'partner';
  }

  if (accessSurface === 'admin') {
    const normalizedAdminEmail = email.trim().toLowerCase();

    if (
      normalizedAdminEmail === 'admin@belezacarioca.com' ||
      normalizedAdminEmail.includes('plataforma') ||
      normalizedAdminEmail.includes('platformadmin') ||
      normalizedAdminEmail.includes('suporte')
    ) {
      return 'platformAdmin';
    }

    return 'salonAdmin';
  }

  if (requestedProfileId && isEstablishmentProfile(requestedProfileId)) {
    return requestedProfileId;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.includes('recepcao') || normalizedEmail.includes('reception')) {
    return 'reception';
  }

  if (
    normalizedEmail.includes('camila') ||
    normalizedEmail.includes('luana') ||
    normalizedEmail.includes('profissional') ||
    normalizedEmail.startsWith('pro@')
  ) {
    return 'professional';
  }

  if (normalizedEmail.includes('plataforma') || normalizedEmail.includes('suporte')) {
    return 'platformAdmin';
  }

  return 'salonAdmin';
}

function encodeBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeBase64Url(input: string) {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function createPlatformSession(
  email: string,
  profileId: AccessProfileId,
  overrides: Partial<
    Pick<
      PlatformSession,
      'actorId' | 'authProvider' | 'commercialAccess' | 'providerAccessToken' | 'providerRefreshToken' | 'salonId' | 'supabaseUserId'
    >
  > = {},
): PlatformSession {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + platformSessionMaxAgeSeconds * 1000);

  return {
    id: `session-${issuedAt.getTime()}`,
    email: email.trim().toLowerCase(),
    profileId,
    actorId: overrides.actorId ?? defaultActorByProfile[profileId],
    salonId: overrides.salonId ?? 'salon-beleza-carioca',
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    authProvider: overrides.authProvider ?? 'local',
    providerAccessToken: overrides.providerAccessToken,
    providerRefreshToken: overrides.providerRefreshToken,
    supabaseUserId: overrides.supabaseUserId,
    commercialAccess: overrides.commercialAccess,
  };
}

export function serializePlatformSession(session: PlatformSession) {
  return encodeBase64Url(JSON.stringify(session));
}

export function parsePlatformSession(value?: string | null): PlatformSession | null {
  if (!value) {
    return null;
  }

  try {
    const session = JSON.parse(decodeBase64Url(value)) as PlatformSession;

    if (!session.profileId || !accessProfiles[session.profileId]) {
      return null;
    }

    if (!session.expiresAt || new Date(session.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getRouteAccessRequirement(pathname: string): RouteAccessRequirement | null {
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return null;
  }

  if (pathname === '/parceiro/login' || pathname.startsWith('/parceiro/login/')) {
    return null;
  }

  if (pathname === '/parceiro/solicitacao' || pathname.startsWith('/parceiro/solicitacao/')) {
    return null;
  }

  if (pathname === '/parceiro' || pathname.startsWith('/parceiro/')) {
    return {
      profileIds: ['partner'],
    };
  }

  if (pathname === '/cliente' || pathname.startsWith('/cliente/')) {
    return {
      profileIds: ['client'],
    };
  }

  if (pathname === '/profissional' || pathname.startsWith('/profissional/')) {
    return {
      profileIds: ['professional'],
    };
  }

  if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
    return {
      profileIds: establishmentProfileIds,
    };
  }

  if (pathname === '/admin/parceiros' || pathname.startsWith('/admin/parceiros/')) {
    return {
      profileIds: ['platformAdmin'],
    };
  }

  if (pathname === '/admin/administradores' || pathname.startsWith('/admin/administradores/')) {
    return {
      profileIds: ['platformAdmin'],
    };
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const [moduleId] = pathname.replace(/^\/admin\/?/, '').split('/');
    const module = moduleId ? getOperationalModule(moduleId) : undefined;

    return {
      profileIds: ['salonAdmin', 'reception', 'platformAdmin'],
      moduleId: module?.id,
    };
  }

  return null;
}

export function canSessionAccessPath(session: PlatformSession | null, pathname: string) {
  const requirement = getRouteAccessRequirement(pathname);

  if (!requirement) {
    return true;
  }

  if (!session || !requirement.profileIds.includes(session.profileId)) {
    return false;
  }

  if (requirement.moduleId) {
    return canAccessModule(session.profileId, requirement.moduleId);
  }

  return true;
}

export function getEntryPathForProfile(profileId: AccessProfileId) {
  return accessProfiles[profileId].entryPath;
}

export function getPreferredProfileForPath(pathname?: string | null): AccessProfileId | null {
  if (!pathname) {
    return null;
  }

  const requirement = getRouteAccessRequirement(pathname);

  return requirement?.profileIds[0] ?? null;
}
