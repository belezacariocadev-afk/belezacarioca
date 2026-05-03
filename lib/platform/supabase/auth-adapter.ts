import type { AccessProfileId, SubscriptionRecord } from '@/lib/platform/domain';
import {
  createPlatformSession,
  establishmentProfileIds,
  type LoginSurface,
  type PlatformSession,
} from '@/lib/platform/auth/session';
import {
  evaluateCommercialAccess,
  normalizeSubscriptionCommercialState,
  type CommercialAccessResult,
} from '@/lib/platform/billing/commercial-access-policy';
import { supabaseAuthRequest, supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type SupabasePasswordTokenResponse = {
  access_token: string;
  refresh_token?: string;
  user: {
    email?: string;
    id: string;
    user_metadata?: {
      role?: string;
      role_seed?: string;
    };
  };
};

type SupabaseRefreshTokenResponse = SupabasePasswordTokenResponse;

type SupabaseSalonUserRow = {
  customer_id: string | null;
  id: string;
  professional_id: string | null;
  profile: AccessProfileId;
  salon_id: string;
};

type SupabaseCommercialSalonRow = {
  billing_cycle?: string | null;
  current_period_end?: string | null;
  expires_at?: string | null;
  plan_code?: string | null;
  plan_label?: string | null;
  plan_name?: string | null;
  professional_range?: string | null;
  selected_plan?: string | null;
  status?: 'draft' | 'active' | 'paused' | null;
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  trial_started_at?: string | null;
};

type SupabaseCommercialSubscriptionRow = {
  billing_cycle: 'monthly' | 'quarterly' | 'annual' | null;
  current_period_end: string | null;
  id: string;
  plan: 'starter' | 'growth' | 'premium';
  salon_id: string;
  status: 'trialing' | 'active' | 'pastDue' | 'cancelled';
  trial_ends_at: string | null;
  trial_started_at: string | null;
};

export type SupabaseResolvedSession = {
  actorId: string;
  email: string;
  profileId: AccessProfileId;
  providerAccessToken: string;
  providerRefreshToken?: string;
  salonId: string;
  supabaseUserId: string;
};

export type SupabasePartnerIdentity = {
  email: string;
  providerAccessToken: string;
  providerRefreshToken?: string;
  supabaseUserId: string;
};

type SupabaseCommercialAccessInput = Pick<SupabaseResolvedSession, 'profileId' | 'providerAccessToken' | 'salonId'>;

type SupabaseProfileRow = {
  email: string | null;
  full_name: string | null;
  id: string;
  role: string | null;
  salon_id: string | null;
};

type SupabaseCustomerIdentityRow = {
  email: string | null;
  full_name?: string | null;
  id: string;
  name?: string | null;
  salon_id: string;
};

export async function authenticatePartnerWithSupabase(email: string, password: string): Promise<SupabasePartnerIdentity> {
  const token = await supabaseAuthRequest<SupabasePasswordTokenResponse>('token?grant_type=password', {
    email,
    password,
  });

  return {
    email: token.user.email ?? email,
    providerAccessToken: token.access_token,
    providerRefreshToken: token.refresh_token,
    supabaseUserId: token.user.id,
  };
}

export async function refreshSupabasePlatformSession(session: PlatformSession): Promise<PlatformSession | null> {
  if (session.authProvider !== 'supabase' || !session.providerRefreshToken) {
    return null;
  }

  const token = await supabaseAuthRequest<SupabaseRefreshTokenResponse>('token?grant_type=refresh_token', {
    refresh_token: session.providerRefreshToken,
  });

  return createPlatformSession(token.user.email ?? session.email, session.profileId, {
    actorId: session.actorId,
    authProvider: 'supabase',
    commercialAccess: session.commercialAccess,
    providerAccessToken: token.access_token,
    providerRefreshToken: token.refresh_token ?? session.providerRefreshToken,
    salonId: session.salonId,
    supabaseUserId: token.user.id || session.supabaseUserId,
  });
}

export async function authenticateWithSupabase(
  email: string,
  password: string,
  requestedProfileId?: AccessProfileId,
  accessSurface?: LoginSurface,
): Promise<SupabaseResolvedSession> {
  const token = await supabaseAuthRequest<SupabasePasswordTokenResponse>('token?grant_type=password', {
    email,
    password,
  });
  const sessionFromSalonUsers = await resolveSessionFromSalonUsers(token, email, requestedProfileId, accessSurface);

  if (sessionFromSalonUsers) {
    return sessionFromSalonUsers;
  }

  const sessionFromCustomers = await resolveSessionFromCustomers(token, email, accessSurface);

  if (sessionFromCustomers) {
    return sessionFromCustomers;
  }

  const sessionFromProfiles = await resolveSessionFromProfiles(token, email, requestedProfileId, accessSurface);

  if (sessionFromProfiles) {
    return sessionFromProfiles;
  }

  const metadataRole = normalizeRoleValue(token.user.user_metadata?.role_seed ?? token.user.user_metadata?.role);

  if (metadataRole === 'platformadmin') {
    const salonId = await resolveFallbackSalonId(token.access_token);

    return {
      actorId: token.user.id,
      email: token.user.email ?? email,
      profileId: 'platformAdmin',
      providerAccessToken: token.access_token,
      providerRefreshToken: token.refresh_token,
      salonId,
      supabaseUserId: token.user.id,
    };
  }

  throw new Error('Usuario autenticado no Supabase, mas sem perfil administrativo/membro valido para este projeto.');
}

async function resolveSessionFromCustomers(
  token: SupabasePasswordTokenResponse,
  email: string,
  accessSurface?: LoginSurface,
): Promise<SupabaseResolvedSession | null> {
  if (accessSurface !== 'client') {
    return null;
  }

  const metadataRole = normalizeRoleValue(token.user.user_metadata?.role_seed ?? token.user.user_metadata?.role);

  if (metadataRole && !['client', 'cliente', 'customer'].includes(metadataRole)) {
    return null;
  }

  const emailValue = (token.user.email ?? email).trim().toLowerCase();
  const customer = await findCustomerByEmail(emailValue);

  if (!customer) {
    return null;
  }

  return {
    actorId: customer.id,
    email: token.user.email ?? customer.email ?? email,
    profileId: 'client',
    providerAccessToken: token.access_token,
    providerRefreshToken: token.refresh_token,
    salonId: customer.salon_id,
    supabaseUserId: token.user.id,
  };
}

async function findCustomerByEmail(email: string) {
  const encodedEmail = encodeURIComponent(email.trim().toLowerCase());

  try {
    const rows = await supabaseRestRequest<SupabaseCustomerIdentityRow[]>('customers', {
      query: `email=eq.${encodedEmail}&select=id,salon_id,email,full_name&limit=1`,
      useServiceRole: true,
    });

    return rows[0] ?? null;
  } catch (error) {
    if (!isMissingColumnError(error, 'full_name')) {
      if (isMissingTableError(error, 'customers')) {
        return null;
      }

      throw error;
    }
  }

  const rows = await supabaseRestRequest<SupabaseCustomerIdentityRow[]>('customers', {
    query: `email=eq.${encodedEmail}&select=id,salon_id,email,name&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function resolveSessionFromSalonUsers(
  token: SupabasePasswordTokenResponse,
  email: string,
  requestedProfileId?: AccessProfileId,
  accessSurface?: LoginSurface,
): Promise<SupabaseResolvedSession | null> {
  const profileFilter = getProfileFilter(requestedProfileId, accessSurface);

  try {
    const memberships = await supabaseRestRequest<SupabaseSalonUserRow[]>('salon_users', {
      query: `user_id=eq.${encodeURIComponent(token.user.id)}&active=eq.true${profileFilter}&select=id,salon_id,profile,professional_id,customer_id&limit=1`,
      token: token.access_token,
    });
    const membership = memberships[0];

    if (!membership) {
      return null;
    }

    return {
      actorId: membership.professional_id ?? membership.customer_id ?? membership.id,
      email: token.user.email ?? email,
      profileId: membership.profile,
      providerAccessToken: token.access_token,
      providerRefreshToken: token.refresh_token,
      salonId: membership.salon_id,
      supabaseUserId: token.user.id,
    };
  } catch (error) {
    if (isMissingTableError(error, 'salon_users')) {
      return null;
    }

    throw error;
  }
}

async function resolveSessionFromProfiles(
  token: SupabasePasswordTokenResponse,
  email: string,
  requestedProfileId?: AccessProfileId,
  accessSurface?: LoginSurface,
): Promise<SupabaseResolvedSession | null> {
  const profileRows = await findProfileRowsBySupabaseUser(token.user.id, token.user.email ?? email, token.access_token);
  const normalizedSurface = accessSurface ?? 'establishment';
  const selected = profileRows.find((row) => {
    const mappedProfile = mapRoleToAccessProfile(row.role, normalizedSurface);

    if (!mappedProfile) {
      return false;
    }

    if (requestedProfileId && requestedProfileId !== mappedProfile) {
      return false;
    }

    if (normalizedSurface === 'client') {
      return mappedProfile === 'client';
    }

    if (normalizedSurface === 'partner') {
      return mappedProfile === 'partner';
    }

    if (normalizedSurface === 'admin') {
      return mappedProfile === 'platformAdmin';
    }

    return establishmentProfileIds.includes(mappedProfile);
  });

  if (!selected) {
    return null;
  }

  const mappedProfile = mapRoleToAccessProfile(selected.role, normalizedSurface);

  if (!mappedProfile) {
    return null;
  }

  return {
    actorId: selected.id,
    email: token.user.email ?? selected.email ?? email,
    profileId: mappedProfile,
    providerAccessToken: token.access_token,
    providerRefreshToken: token.refresh_token,
    salonId: selected.salon_id ?? (await resolveFallbackSalonId(token.access_token)),
    supabaseUserId: token.user.id,
  };
}

async function findProfileRowsBySupabaseUser(userId: string, email: string, accessToken: string) {
  const emailValue = email.trim().toLowerCase();

  try {
    const byId = await supabaseRestRequest<SupabaseProfileRow[]>('profiles', {
      query: `id=eq.${encodeURIComponent(userId)}&select=id,salon_id,role,email,full_name&limit=3`,
      token: accessToken,
    });

    if (byId.length > 0) {
      return byId;
    }

    const byEmail = await supabaseRestRequest<SupabaseProfileRow[]>('profiles', {
      query: `email=eq.${encodeURIComponent(emailValue)}&select=id,salon_id,role,email,full_name&limit=3`,
      token: accessToken,
    });

    return byEmail;
  } catch (error) {
    if (isMissingTableError(error, 'profiles')) {
      return [];
    }

    throw error;
  }
}

async function resolveFallbackSalonId(accessToken: string) {
  const salons = await supabaseRestRequest<Array<{ id: string }>>('salons', {
    query: 'select=id&order=created_at.asc&limit=1',
    token: accessToken,
  });

  if (!salons[0]?.id) {
    throw new Error('Nao foi possivel resolver o salao principal para criar sessao.');
  }

  return salons[0].id;
}

function isMissingTableError(error: unknown, tableName: string) {
  if (!(error instanceof Error)) {
    return false;
  }

  const expectedMessage = `Could not find the table 'public.${tableName}'`;
  return error.message.includes(expectedMessage);
}

function isMissingColumnError(error: unknown, columnName: string) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const normalizedColumnName = columnName.toLowerCase();

  return (
    message.includes(`'${normalizedColumnName}' column`) ||
    message.includes(`column ${normalizedColumnName}`) ||
    message.includes(`column salons.${normalizedColumnName}`) ||
    message.includes(`'${normalizedColumnName}' column of 'salons'`)
  );
}

function normalizeRoleValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function mapRoleToAccessProfile(roleValue: string | null, accessSurface?: LoginSurface): AccessProfileId | null {
  const role = normalizeRoleValue(roleValue);

  if (!role) {
    return null;
  }

  if (role === 'platformadmin' || role === 'superadmin') {
    return 'platformAdmin';
  }

  if (role === 'salonadmin' || role === 'manager' || role === 'owner') {
    return 'salonAdmin';
  }

  if (role === 'admin') {
    return accessSurface === 'admin' ? 'platformAdmin' : 'salonAdmin';
  }

  if (role === 'reception' || role === 'recepcao') {
    return 'reception';
  }

  if (role === 'professional' || role === 'profissional') {
    return 'professional';
  }

  if (role === 'client' || role === 'cliente' || role === 'customer') {
    return 'client';
  }

  if (role === 'partner' || role === 'parceiro') {
    return 'partner';
  }

  return null;
}

function getProfileFilter(requestedProfileId?: AccessProfileId, accessSurface?: LoginSurface) {
  if (requestedProfileId) {
    return `&profile=eq.${encodeURIComponent(requestedProfileId)}`;
  }

  if (accessSurface === 'client') {
    return '&profile=eq.client';
  }

  if (accessSurface === 'establishment') {
    const profiles = establishmentProfileIds.map((profileId) => encodeURIComponent(profileId)).join(',');

    return `&profile=in.(${profiles})`;
  }

  return '';
}

export async function resolveSupabaseCommercialAccess(session: SupabaseCommercialAccessInput): Promise<CommercialAccessResult> {
  const salonId = encodeURIComponent(session.salonId);
  const [salons, subscriptions] = await Promise.all([
    fetchCommercialSalon(salonId, session.providerAccessToken),
    fetchCommercialSubscriptions(salonId, session.providerAccessToken),
  ]);
  const salon = salons[0] ?? null;
  const subscription = subscriptions[0]
    ? normalizeSubscriptionCommercialState({
        id: subscriptions[0].id,
        salonId: subscriptions[0].salon_id,
        plan: subscriptions[0].plan,
        status: subscriptions[0].status,
        billingCycle: subscriptions[0].billing_cycle ?? undefined,
        trialStartedAt: subscriptions[0].trial_started_at ?? undefined,
        trialEndsAt: subscriptions[0].trial_ends_at ?? undefined,
        currentPeriodEnd: subscriptions[0].current_period_end ?? undefined,
      })
    : buildSubscriptionFromSalon(session.salonId, salon);
  const salonAccessState = salon
    ? {
        status: salon.status ?? 'active',
      }
    : null;

  const access = evaluateCommercialAccess({
    profileId: session.profileId,
    salon: salonAccessState,
    subscription,
  });

  return {
    ...access,
    planLabel: salon?.plan_label ?? salon?.plan_name ?? access.planLabel,
    professionalRange: salon?.professional_range ?? access.professionalRange,
  };
}

async function fetchCommercialSalon(salonId: string, accessToken: string) {
  try {
    return await supabaseRestRequest<SupabaseCommercialSalonRow[]>('salons', {
      query:
        `id=eq.${salonId}` +
        '&select=subscription_status,plan_name,plan_code,plan_label,professional_range,selected_plan,billing_cycle,trial_started_at,trial_ends_at,current_period_end,expires_at&limit=1',
      token: accessToken,
    });
  } catch (error) {
    if (
      !isMissingColumnError(error, 'subscription_status') &&
      !isMissingColumnError(error, 'plan_label') &&
      !isMissingColumnError(error, 'professional_range') &&
      !isMissingColumnError(error, 'selected_plan')
    ) {
      throw error;
    }
  }

  return supabaseRestRequest<SupabaseCommercialSalonRow[]>('salons', {
    query: `id=eq.${salonId}&select=status&limit=1`,
    token: accessToken,
  });
}

async function fetchCommercialSubscriptions(salonId: string, accessToken: string) {
  try {
    return await supabaseRestRequest<SupabaseCommercialSubscriptionRow[]>('subscriptions', {
      query: `salon_id=eq.${salonId}&select=id,salon_id,plan,status,billing_cycle,trial_started_at,trial_ends_at,current_period_end&limit=1`,
      token: accessToken,
    });
  } catch (error) {
    if (isMissingTableError(error, 'subscriptions')) {
      return [];
    }

    throw error;
  }
}

function buildSubscriptionFromSalon(salonId: string, salon: SupabaseCommercialSalonRow | null): SubscriptionRecord | null {
  if (!salon) {
    return null;
  }

  const normalizedStatus = normalizeRoleValue(salon.subscription_status);
  const trialEndsAt = salon.trial_ends_at ?? salon.current_period_end ?? salon.expires_at ?? undefined;
  const hasTrialWindow = Boolean(trialEndsAt);
  const status =
    normalizedStatus === 'active'
      ? 'active'
      : normalizedStatus === 'trialactive' ||
          normalizedStatus === 'trialing' ||
          normalizedStatus === 'trial' ||
          (normalizedStatus === 'none' && hasTrialWindow) ||
          (!normalizedStatus && hasTrialWindow)
        ? 'trialing'
      : normalizedStatus === 'cancelled' || normalizedStatus === 'canceled'
          ? 'cancelled'
          : normalizedStatus === 'pastdue' || normalizedStatus === 'overdue' || normalizedStatus === 'blocked' || normalizedStatus === 'expired'
            ? 'pastDue'
            : null;

  if (!status) {
    return null;
  }

  return {
    billingCycle:
      salon.selected_plan === 'quarterly' || salon.billing_cycle === 'quarterly'
        ? 'quarterly'
        : salon.selected_plan === 'annual' || salon.billing_cycle === 'annual'
          ? 'annual'
          : 'monthly',
    currentPeriodEnd: salon.current_period_end ?? salon.expires_at ?? undefined,
    id: `salon-${salonId}-subscription`,
    plan: resolvePlanFromSalon(salon),
    salonId,
    status,
    trialEndsAt,
    trialStartedAt: salon.trial_started_at ?? undefined,
  };
}

function resolvePlanFromSalon(salon: SupabaseCommercialSalonRow): SubscriptionRecord['plan'] {
  const plan = normalizeRoleValue(salon.plan_code ?? salon.plan_name);

  if (plan === 'premium') {
    return 'premium';
  }

  if (plan === 'starter') {
    return 'starter';
  }

  return 'growth';
}
