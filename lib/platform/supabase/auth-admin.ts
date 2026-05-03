import { getSupabaseRuntimeConfig } from '@/lib/platform/supabase/config';

type SupabaseAdminUser = {
  email?: string;
  id: string;
  user_metadata?: Record<string, unknown>;
};

type SupabaseAdminUsersResponse = {
  users?: SupabaseAdminUser[];
};

function getAdminConfig() {
  const config = getSupabaseRuntimeConfig();

  if (!config?.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY e obrigatoria para administrar usuarios no Supabase Auth.');
  }

  return {
    ...config,
    serviceRoleKey: config.serviceRoleKey,
  };
}

async function supabaseAdminAuthRequest<T>(path: string, options: RequestInit = {}) {
  const config = getAdminConfig();
  const response = await fetch(`${config.url}/auth/v1/${path.replace(/^\//, '')}`, {
    ...options,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || 'Falha ao acessar Supabase Auth.');
  }

  return (text ? JSON.parse(text) : null) as T;
}

export async function findSupabaseAuthUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const payload = await supabaseAdminAuthRequest<SupabaseAdminUsersResponse>(
      `admin/users?page=${page}&per_page=1000`,
    );
    const users = payload.users ?? [];
    const match = users.find((user) => user.email?.trim().toLowerCase() === normalizedEmail);

    if (match) {
      return match;
    }

    if (users.length < 1000) {
      return null;
    }
  }

  return null;
}

export async function ensureSupabaseAuthUserWithPassword(input: {
  email: string;
  fullName: string;
  password: string;
  role: string;
}) {
  const email = input.email.trim().toLowerCase();
  const existingUser = await findSupabaseAuthUserByEmail(email);
  const userMetadata = {
    ...(existingUser?.user_metadata ?? {}),
    full_name: input.fullName,
    role: input.role,
    role_seed: input.role,
  };

  if (!existingUser) {
    return supabaseAdminAuthRequest<SupabaseAdminUser>('admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        email_confirm: true,
        password: input.password,
        user_metadata: userMetadata,
      }),
    });
  }

  return supabaseAdminAuthRequest<SupabaseAdminUser>(`admin/users/${existingUser.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      email_confirm: true,
      password: input.password,
      user_metadata: userMetadata,
    }),
  });
}

export async function updateSupabaseAuthUserPassword(input: {
  password: string;
  userId: string;
}) {
  return supabaseAdminAuthRequest<SupabaseAdminUser>(`admin/users/${encodeURIComponent(input.userId)}`, {
    method: 'PUT',
    body: JSON.stringify({
      password: input.password,
    }),
  });
}

export async function generateSupabasePasswordRecoveryLink(input: {
  email: string;
  redirectTo: string;
}) {
  return supabaseAdminAuthRequest<{ action_link?: string; email_otp?: string; hashed_token?: string }>('admin/generate_link', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      redirect_to: input.redirectTo,
      type: 'recovery',
    }),
  });
}

export async function deleteSupabaseAuthUser(userId: string) {
  await supabaseAdminAuthRequest<null>(`admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}
