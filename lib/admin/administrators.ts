import { getSupabaseRuntimeConfig } from '@/lib/platform/supabase/config';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type SupabaseAuthAdminMethod = 'DELETE' | 'GET' | 'POST' | 'PUT';
type SupabaseAdminConfig = {
  serviceRoleKey: string;
  url: string;
};

type AuthAdminUser = {
  app_metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  email?: string | null;
  id: string;
  user_metadata?: Record<string, unknown> | null;
};

type AuthAdminUsersResponse = {
  users?: AuthAdminUser[];
};

type ProfileRow = Record<string, unknown> & {
  created_at?: string | null;
  email?: string | null;
  full_name?: string | null;
  id?: string | null;
  role?: string | null;
};

export type PlatformAdministratorRecord = {
  createdAt: string | null;
  email: string;
  fullName: string | null;
  isActive: boolean | null;
  profileId: string | null;
  role: string;
  statusLabel: string;
  userId: string;
};

type CreateAdministratorInput = {
  email: string;
  requestedByEmail: string;
  requestedByUserId?: string;
  roleSeed?: string;
  salonId: string;
  temporaryPassword: string;
};

type ResetAdministratorPasswordInput = {
  requestedByEmail: string;
  requestedByUserId?: string;
  targetEmail?: string;
  targetUserId?: string;
  temporaryPassword: string;
};

type RemoveAdministratorAccessInput = {
  requestedByEmail: string;
  requestedByUserId?: string;
  targetEmail?: string;
  targetUserId?: string;
};

type AdminLinkCheck = {
  description: string;
  filter: string;
  table: string;
};

export type RemovePlatformAdministratorAccessResult = {
  action: 'deletedAuthAndProfile' | 'deletedProfileOnly' | 'revokedAdminOnly';
  email: string;
  preservedLinks: string[];
  userId: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
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

function isPlatformAdminRole(role: string | null | undefined) {
  const normalized = normalizeRoleValue(role);
  return normalized === 'platformadmin' || normalized === 'admin' || normalized === 'superadmin';
}

function isInvalidAppRoleError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes('invalid input value for enum app_role')
  );
}

function isMissingTableOrColumnError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes(`"code":"PGRST205"`) ||
    error.message.includes(`"code":"42P01"`) ||
    error.message.includes(`"code":"42703"`) ||
    error.message.includes('Could not find the table') ||
    error.message.includes('does not exist')
  );
}

function isForeignKeyViolationError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes(`"code":"23503"`) ||
      error.message.toLowerCase().includes('foreign key'))
  );
}

function roleLabel(role: string | null | undefined) {
  if (!role) {
    return 'platformAdmin';
  }

  return role;
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return null;
}

function parseString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function resolveActiveStatus(profile: ProfileRow) {
  const activeFlag = parseBoolean(profile.active) ?? parseBoolean(profile.is_active);
  const explicitStatus = parseString(profile.status);

  if (activeFlag === true) {
    return {
      isActive: true,
      statusLabel: explicitStatus ?? 'Ativo',
    };
  }

  if (activeFlag === false) {
    return {
      isActive: false,
      statusLabel: explicitStatus ?? 'Inativo',
    };
  }

  if (explicitStatus) {
    const normalized = explicitStatus.toLowerCase();
    const inferredActive =
      normalized === 'active' || normalized === 'ativo'
        ? true
        : normalized === 'inactive' || normalized === 'inativo' || normalized === 'blocked'
          ? false
          : null;

    return {
      isActive: inferredActive,
      statusLabel: explicitStatus,
    };
  }

  return {
    isActive: null,
    statusLabel: 'Ativo',
  };
}

function buildNameFromEmail(email: string) {
  const localPart = email.split('@')[0] ?? '';
  const normalized = localPart
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();

  if (!normalized) {
    return 'Administrador Plataforma';
  }

  return normalized
    .split(' ')
    .map((chunk) => `${chunk[0]!.toUpperCase()}${chunk.slice(1).toLowerCase()}`)
    .join(' ');
}

function requireSupabaseAdminConfig() {
  const config = getSupabaseRuntimeConfig();

  if (!config?.url || !config.serviceRoleKey) {
    throw new Error(
      'Supabase admin nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return {
    serviceRoleKey: config.serviceRoleKey,
    url: config.url,
  } satisfies SupabaseAdminConfig;
}

async function supabaseAuthAdminRequest<T>(
  path: string,
  options: {
    body?: unknown;
    method: SupabaseAuthAdminMethod;
  },
) {
  const config = requireSupabaseAdminConfig();
  const response = await fetch(`${config.url}/auth/v1/${path}`, {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    method: options.method,
  });

  if (!response.ok) {
    throw new Error(`Falha no Supabase Auth Admin (${response.status}): ${await response.text()}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function listAllAuthUsers() {
  const users: AuthAdminUser[] = [];
  let page = 1;

  while (page <= 20) {
    const payload = await supabaseAuthAdminRequest<AuthAdminUsersResponse>(`admin/users?page=${page}&per_page=200`, {
      method: 'GET',
    });
    const pageUsers = Array.isArray(payload?.users) ? payload.users : [];
    users.push(...pageUsers);

    if (pageUsers.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

async function findAuthUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const users = await listAllAuthUsers();
  return users.find((user) => normalizeEmail(user.email ?? '') === normalizedEmail) ?? null;
}

async function findAuthUserById(userId: string) {
  const users = await listAllAuthUsers();
  return users.find((user) => user.id === userId) ?? null;
}

async function updateAuthUserPassword(input: {
  email: string;
  roleSeed: string;
  temporaryPassword: string;
  user: AuthAdminUser;
}) {
  await supabaseAuthAdminRequest<AuthAdminUser>(`admin/users/${input.user.id}`, {
    body: {
      email: input.email,
      email_confirm: true,
      password: input.temporaryPassword,
      user_metadata: {
        ...(input.user.user_metadata ?? {}),
        role_seed: input.roleSeed,
        source: 'admin-management-ui',
      },
    },
    method: 'PUT',
  });
}

async function createAuthUser(input: {
  email: string;
  roleSeed: string;
  temporaryPassword: string;
}) {
  return supabaseAuthAdminRequest<AuthAdminUser>('admin/users', {
    body: {
      email: input.email,
      email_confirm: true,
      password: input.temporaryPassword,
      user_metadata: {
        role_seed: input.roleSeed,
        source: 'admin-management-ui',
      },
    },
    method: 'POST',
  });
}

async function findProfileByEmail(email: string) {
  const rows = await supabaseRestRequest<ProfileRow[]>('profiles', {
    query: `email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function hasLinkedRows(input: AdminLinkCheck) {
  try {
    const rows = await supabaseRestRequest<Array<{ id: string }>>(input.table, {
      query: `${input.filter}&select=id&limit=1`,
      useServiceRole: true,
    });

    return Boolean(rows[0]);
  } catch (error) {
    if (isMissingTableOrColumnError(error)) {
      return false;
    }

    return true;
  }
}

async function listKnownNonAdminRoles() {
  const rows = await supabaseRestRequest<Array<{ role?: string | null }>>('profiles', {
    query: 'select=role&limit=3000',
    useServiceRole: true,
  });
  const roles = new Set<string>();

  for (const row of rows) {
    const role = parseString(row.role);

    if (!role || isPlatformAdminRole(role)) {
      continue;
    }

    roles.add(role);
  }

  return [...roles];
}

function buildDemotionRoleCandidates(knownRoles: string[]) {
  const fallbackCandidates = [
    'salonAdmin',
    'salon_admin',
    'reception',
    'professional',
    'partner',
    'client',
    'user',
  ];
  const candidates = [...knownRoles, ...fallbackCandidates];
  const deduped: string[] = [];

  for (const role of candidates) {
    const normalized = normalizeRoleValue(role);

    if (!normalized || isPlatformAdminRole(role) || deduped.some((item) => normalizeRoleValue(item) === normalized)) {
      continue;
    }

    deduped.push(role);
  }

  return deduped;
}

async function demoteProfileRole(profileId: string) {
  const knownRoles = await listKnownNonAdminRoles().catch(() => []);
  const candidates = buildDemotionRoleCandidates(knownRoles);

  for (const role of candidates) {
    try {
      await supabaseRestRequest('profiles', {
        body: {
          role,
        },
        method: 'PATCH',
        prefer: 'return=minimal',
        query: `id=eq.${encodeURIComponent(profileId)}`,
        useServiceRole: true,
      });

      return role;
    } catch (error) {
      if (isInvalidAppRoleError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    'Nao foi possivel rebaixar o role administrativo para um valor aceito pelo enum app_role.',
  );
}

async function clearProfileRole(profileId: string) {
  try {
    await supabaseRestRequest('profiles', {
      body: {
        role: null,
      },
      method: 'PATCH',
      prefer: 'return=minimal',
      query: `id=eq.${encodeURIComponent(profileId)}`,
      useServiceRole: true,
    });

    return true;
  } catch {
    return false;
  }
}

async function markProfileInactive(profileId: string) {
  let applied = false;

  const attempts: Array<Record<string, unknown>> = [
    { active: false },
    { is_active: false },
    { status: 'inactive' },
  ];

  for (const body of attempts) {
    try {
      await supabaseRestRequest('profiles', {
        body,
        method: 'PATCH',
        prefer: 'return=minimal',
        query: `id=eq.${encodeURIComponent(profileId)}`,
        useServiceRole: true,
      });
      applied = true;
    } catch (error) {
      if (isMissingTableOrColumnError(error) || isInvalidAppRoleError(error)) {
        continue;
      }

      throw error;
    }
  }

  return applied;
}

async function revokeProfileAdminAccess(profileId: string) {
  try {
    const demotedRole = await demoteProfileRole(profileId);
    return {
      mode: 'demoted',
      roleSeed: demotedRole,
    } as const;
  } catch (error) {
    if (!isInvalidAppRoleError(error)) {
      // When no candidate role is accepted, demoteProfileRole throws this custom error.
      // Other errors should continue to fallback attempts.
    }
  }

  const roleCleared = await clearProfileRole(profileId);

  if (roleCleared) {
    return {
      mode: 'clearedRole',
      roleSeed: 'revokedAdmin',
    } as const;
  }

  const inactiveMarked = await markProfileInactive(profileId);

  if (inactiveMarked) {
    return {
      mode: 'inactivated',
      roleSeed: 'revokedAdmin',
    } as const;
  }

  throw new Error(
    'Nao foi possivel remover o role administrativo do perfil com seguranca.',
  );
}

async function findImportantUserLinks(input: {
  profileId: string;
  userId: string;
}) {
  const encodedProfileId = encodeURIComponent(input.profileId);
  const encodedUserId = encodeURIComponent(input.userId);
  const checks: AdminLinkCheck[] = [
    {
      description: 'salon_users.user_id',
      filter: `user_id=eq.${encodedUserId}`,
      table: 'salon_users',
    },
    {
      description: 'employees.user_id',
      filter: `user_id=eq.${encodedUserId}`,
      table: 'employees',
    },
    {
      description: 'professionals.user_id',
      filter: `user_id=eq.${encodedUserId}`,
      table: 'professionals',
    },
    {
      description: 'customers.user_id',
      filter: `user_id=eq.${encodedUserId}`,
      table: 'customers',
    },
    {
      description: 'partners.user_id',
      filter: `user_id=eq.${encodedUserId}`,
      table: 'partners',
    },
    {
      description: 'partner_commission_events.actor_user_id',
      filter: `actor_user_id=eq.${encodedUserId}`,
      table: 'partner_commission_events',
    },
    {
      description: 'salons.owner_profile_id',
      filter: `owner_profile_id=eq.${encodedProfileId}`,
      table: 'salons',
    },
  ];
  const links: string[] = [];

  for (const check of checks) {
    const hasLink = await hasLinkedRows(check);

    if (hasLink) {
      links.push(check.description);
    }
  }

  return links;
}

async function deleteProfileById(profileId: string) {
  await supabaseRestRequest('profiles', {
    method: 'DELETE',
    prefer: 'return=minimal',
    query: `id=eq.${encodeURIComponent(profileId)}`,
    useServiceRole: true,
  });
}

async function updateAuthUserRoleSeed(input: {
  email: string;
  roleSeed: string;
  user: AuthAdminUser;
}) {
  await supabaseAuthAdminRequest<AuthAdminUser>(`admin/users/${input.user.id}`, {
    body: {
      email: input.email,
      email_confirm: true,
      user_metadata: {
        ...(input.user.user_metadata ?? {}),
        role_seed: input.roleSeed,
        source: 'admin-management-ui',
      },
    },
    method: 'PUT',
  });
}

async function upsertProfileAsPlatformAdmin(input: {
  email: string;
  fullName: string;
  profileId: string;
  role: string;
  salonId: string;
}) {
  const existingByEmail = await findProfileByEmail(input.email);

  if (existingByEmail) {
    const rows = await supabaseRestRequest<ProfileRow[]>('profiles', {
      body: {
        email: input.email,
        full_name: existingByEmail.full_name ?? input.fullName,
        role: input.role,
        salon_id: existingByEmail.salon_id ?? input.salonId,
      },
      method: 'PATCH',
      prefer: 'return=representation',
      query: `id=eq.${encodeURIComponent(String(existingByEmail.id ?? ''))}&select=*`,
      useServiceRole: true,
    });

    return rows[0] ?? existingByEmail;
  }

  const rows = await supabaseRestRequest<ProfileRow[]>('profiles', {
    body: [
      {
        email: input.email,
        full_name: input.fullName,
        id: input.profileId,
        role: input.role,
        salon_id: input.salonId,
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    query: 'on_conflict=id&select=*',
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

function toAdministratorRecord(input: {
  authByEmail: Map<string, AuthAdminUser>;
  authById: Map<string, AuthAdminUser>;
  profile: ProfileRow;
}): PlatformAdministratorRecord | null {
  const role = parseString(input.profile.role);

  if (!isPlatformAdminRole(role)) {
    return null;
  }

  const profileEmail = parseString(input.profile.email);
  const byId = parseString(input.profile.id) ? input.authById.get(String(input.profile.id)) : undefined;
  const byEmail = profileEmail ? input.authByEmail.get(normalizeEmail(profileEmail)) : undefined;
  const authUser = byId ?? byEmail ?? null;
  const email = profileEmail ?? parseString(authUser?.email) ?? null;

  if (!email) {
    return null;
  }

  const createdAt = parseString(input.profile.created_at) ?? parseString(authUser?.created_at);
  const { isActive, statusLabel } = resolveActiveStatus(input.profile);
  const userId = authUser?.id ?? String(input.profile.id ?? '');

  if (!userId) {
    return null;
  }

  return {
    createdAt,
    email,
    fullName: parseString(input.profile.full_name),
    isActive,
    profileId: parseString(input.profile.id),
    role: roleLabel(role),
    statusLabel,
    userId,
  };
}

export async function listPlatformAdministrators() {
  const [profiles, authUsers] = await Promise.all([
    supabaseRestRequest<ProfileRow[]>('profiles', {
      query: 'select=*&limit=3000',
      useServiceRole: true,
    }),
    listAllAuthUsers(),
  ]);
  const authById = new Map<string, AuthAdminUser>();
  const authByEmail = new Map<string, AuthAdminUser>();

  for (const user of authUsers) {
    authById.set(user.id, user);
    if (user.email) {
      authByEmail.set(normalizeEmail(user.email), user);
    }
  }

  const rows = profiles
    .map((profile) =>
      toAdministratorRecord({
        authByEmail,
        authById,
        profile,
      }),
    )
    .filter((row): row is PlatformAdministratorRecord => Boolean(row));

  rows.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return rows;
}

export async function createPlatformAdministrator(input: CreateAdministratorInput) {
  const email = normalizeEmail(input.email);
  const roleSeed = input.roleSeed ?? 'admin';
  const existingUser = await findAuthUserByEmail(email);
  const authUser =
    existingUser ??
    (await createAuthUser({
      email,
      roleSeed,
      temporaryPassword: input.temporaryPassword,
    }));

  if (existingUser) {
    await updateAuthUserPassword({
      email,
      roleSeed,
      temporaryPassword: input.temporaryPassword,
      user: existingUser,
    });
  }

  const profile = await upsertProfileAsPlatformAdmin({
    email,
    fullName: buildNameFromEmail(email),
    profileId: authUser.id,
    role: 'admin',
    salonId: input.salonId,
  });

  if (!profile) {
    throw new Error('Nao foi possivel salvar o perfil administrativo em public.profiles.');
  }

  const status = resolveActiveStatus(profile);

  return {
    administrator: {
      createdAt: parseString(profile.created_at) ?? parseString(authUser.created_at),
      email,
      fullName: parseString(profile.full_name),
      isActive: status.isActive,
      profileId: parseString(profile.id),
      role: roleLabel(parseString(profile.role)),
      statusLabel: status.statusLabel,
      userId: authUser.id,
    } satisfies PlatformAdministratorRecord,
    wasExistingUser: Boolean(existingUser),
  };
}

export async function resetPlatformAdministratorPassword(input: ResetAdministratorPasswordInput) {
  const email = input.targetEmail ? normalizeEmail(input.targetEmail) : null;
  const targetUser =
    (input.targetUserId ? await findAuthUserById(input.targetUserId) : null) ??
    (email ? await findAuthUserByEmail(email) : null);

  if (!targetUser?.id || !targetUser.email) {
    throw new Error('Administrador nao encontrado no Supabase Auth.');
  }

  await updateAuthUserPassword({
    email: normalizeEmail(targetUser.email),
    roleSeed: 'admin',
    temporaryPassword: input.temporaryPassword,
    user: targetUser,
  });

  return {
    email: normalizeEmail(targetUser.email),
    userId: targetUser.id,
  };
}

export async function removePlatformAdministratorAccess(
  input: RemoveAdministratorAccessInput,
): Promise<RemovePlatformAdministratorAccessResult> {
  const actorEmail = normalizeEmail(input.requestedByEmail);
  const targetEmail = input.targetEmail ? normalizeEmail(input.targetEmail) : null;
  const targetUser =
    (input.targetUserId ? await findAuthUserById(input.targetUserId) : null) ??
    (targetEmail ? await findAuthUserByEmail(targetEmail) : null);

  if (!targetUser?.id || !targetUser.email) {
    throw new Error('Administrador nao encontrado no Supabase Auth.');
  }

  if (
    (input.requestedByUserId && targetUser.id === input.requestedByUserId) ||
    normalizeEmail(targetUser.email) === actorEmail
  ) {
    throw new Error('Nao e permitido remover o proprio acesso administrativo.');
  }

  const normalizedTargetEmail = normalizeEmail(targetUser.email);
  const profile = await findProfileByEmail(normalizedTargetEmail);

  if (!profile) {
    throw new Error('Perfil do administrador nao encontrado em public.profiles.');
  }

  const profileId = String(profile.id ?? '');

  if (!profileId) {
    throw new Error('Perfil do administrador sem identificador valido em public.profiles.');
  }
  const importantLinks = await findImportantUserLinks({
    profileId,
    userId: targetUser.id,
  });

  if (importantLinks.length === 0) {
    await deleteProfileById(profileId);

    try {
      await supabaseAuthAdminRequest<null>(`admin/users/${targetUser.id}`, {
        method: 'DELETE',
      });

      return {
        action: 'deletedAuthAndProfile',
        email: normalizedTargetEmail,
        preservedLinks: [],
        userId: targetUser.id,
      };
    } catch (error) {
      if (!isForeignKeyViolationError(error)) {
        throw error;
      }

      await updateAuthUserRoleSeed({
        email: normalizedTargetEmail,
        roleSeed: 'revokedAdmin',
        user: targetUser,
      });

      return {
        action: 'deletedProfileOnly',
        email: normalizedTargetEmail,
        preservedLinks: ['auth_user_preservado_por_vinculo'],
        userId: targetUser.id,
      };
    }
  }

  const revocation = await revokeProfileAdminAccess(profileId);

  await updateAuthUserRoleSeed({
    email: normalizedTargetEmail,
    roleSeed: revocation.roleSeed,
    user: targetUser,
  });

  return {
    action: 'revokedAdminOnly',
    email: normalizedTargetEmail,
    preservedLinks: importantLinks,
    userId: targetUser.id,
  };
}
