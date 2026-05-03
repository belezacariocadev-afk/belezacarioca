export type SupabaseRuntimeConfig = {
  anonKey: string;
  serviceRoleKey?: string;
  url: string;
};

export function getSupabaseRuntimeConfig(): SupabaseRuntimeConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return {
    anonKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: url.replace(/\/$/, ''),
  };
}

export function isSupabaseAuthEnabled() {
  return process.env.PLATFORM_AUTH_PROVIDER === 'supabase';
}

export function shouldFallbackToLocalAuth() {
  return process.env.PLATFORM_AUTH_FALLBACK_TO_LOCAL !== 'false';
}

export function isSupabaseDataSourceRequested() {
  return process.env.NEXT_PUBLIC_PLATFORM_DATA_SOURCE === 'supabase';
}
