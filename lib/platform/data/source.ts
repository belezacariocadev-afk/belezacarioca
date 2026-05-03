export type PlatformDataSource = 'local' | 'supabase';

export function getBrowserPlatformDataSource(): PlatformDataSource {
  return process.env.NEXT_PUBLIC_PLATFORM_DATA_SOURCE === 'supabase' ? 'supabase' : 'local';
}
