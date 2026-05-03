import type { PlatformSession } from '@/lib/platform/auth/session';
import { getSupabaseRuntimeConfig } from '@/lib/platform/supabase/config';

type SupabaseRequestOptions = {
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  prefer?: string;
  query?: string;
  schema?: string;
  token?: string;
  useServiceRole?: boolean;
};

export class SupabaseConfigurationError extends Error {
  constructor() {
    super('Supabase nao esta configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
}

export function isSupabaseJwtExpiredError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return message.includes('jwt expired') || (message.includes('"code":"pgrst301"') && message.includes('expired'));
}

export async function supabaseAuthRequest<T>(path: string, body: unknown) {
  const config = getSupabaseRuntimeConfig();

  if (!config) {
    throw new SupabaseConfigurationError();
  }

  const response = await fetch(`${config.url}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as T;
}

export async function supabaseRestRequest<T>(
  table: string,
  options: SupabaseRequestOptions = {},
  session?: PlatformSession | null,
) {
  const config = getSupabaseRuntimeConfig();

  if (!config) {
    throw new SupabaseConfigurationError();
  }

  if (options.useServiceRole && !config.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY e obrigatoria para gravar snapshots no Supabase.');
  }

  const token = options.token ?? (options.useServiceRole ? config.serviceRoleKey : undefined) ?? session?.providerAccessToken ?? config.serviceRoleKey ?? config.anonKey;
  const response = await fetch(`${config.url}/rest/v1/${table}${options.query ? `?${options.query}` : ''}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
      ...(options.schema ? { 'Accept-Profile': options.schema, 'Content-Profile': options.schema } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();

  return (text ? JSON.parse(text) : null) as T;
}
