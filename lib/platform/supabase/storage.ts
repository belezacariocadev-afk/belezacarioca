import { getSupabaseRuntimeConfig } from '@/lib/platform/supabase/config';

export const salonAssetsBucket = 'salon-assets';
const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);
const maxImageSizeBytes = 2 * 1024 * 1024;

export type SalonAssetType = 'cover' | 'logo' | 'professionalAvatar';

export function validateSalonImageFile(file: File) {
  const extension = allowedImageTypes.get(file.type);

  if (!extension) {
    return { ok: false as const, message: 'Use uma imagem JPG, PNG ou WebP.' };
  }

  if (file.size > maxImageSizeBytes) {
    return { ok: false as const, message: 'A imagem deve ter ate 2 MB.' };
  }

  return { extension, ok: true as const };
}

export function buildSalonAssetPath(input: {
  assetType: SalonAssetType;
  extension: string;
  professionalId?: string;
  salonId: string;
}) {
  if (input.assetType === 'logo') {
    return `salons/${input.salonId}/logo.${input.extension}`;
  }

  if (input.assetType === 'cover') {
    return `salons/${input.salonId}/cover.${input.extension}`;
  }

  if (!input.professionalId) {
    throw new Error('Profissional nao encontrado para atualizar a foto.');
  }

  return `professionals/${input.salonId}/${input.professionalId}/avatar.${input.extension}`;
}

export async function uploadPublicSalonAsset(file: File, path: string) {
  const config = getSupabaseRuntimeConfig();

  if (!config?.serviceRoleKey) {
    throw new Error('Nao foi possivel preparar o envio da imagem.');
  }

  await ensureSalonAssetsBucket();

  const uploadResponse = await fetch(`${config.url}/storage/v1/object/${salonAssetsBucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: await file.arrayBuffer(),
  });

  if (!uploadResponse.ok) {
    throw new Error('Nao foi possivel enviar a imagem. Tente novamente.');
  }

  return `${config.url}/storage/v1/object/public/${salonAssetsBucket}/${path}`;
}

async function ensureSalonAssetsBucket() {
  const config = getSupabaseRuntimeConfig();

  if (!config?.serviceRoleKey) {
    throw new Error('Nao foi possivel preparar o envio da imagem.');
  }

  const existing = await fetch(`${config.url}/storage/v1/bucket/${salonAssetsBucket}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
  });

  if (existing.ok) {
    return;
  }

  const response = await fetch(`${config.url}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: salonAssetsBucket,
      name: salonAssetsBucket,
      public: true,
      file_size_limit: maxImageSizeBytes,
      allowed_mime_types: [...allowedImageTypes.keys()],
    }),
  });

  if (!response.ok && response.status !== 409) {
    const text = await response.text().catch(() => '');

    if (response.status === 400 && text.toLowerCase().includes('already')) {
      return;
    }

    throw new Error('Nao foi possivel preparar o envio da imagem.');
  }
}
