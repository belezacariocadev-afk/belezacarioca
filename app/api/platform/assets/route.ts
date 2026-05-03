import { NextResponse } from 'next/server';

import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import type { SalonAssetType } from '@/lib/platform/supabase/storage';
import { buildSalonAssetPath, uploadPublicSalonAsset, validateSalonImageFile } from '@/lib/platform/supabase/storage';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';
import { isSupabaseDataSourceRequested } from '@/lib/platform/supabase/config';

export async function POST(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (session.profileId !== 'salonAdmin' && session.profileId !== 'platformAdmin') {
    return NextResponse.json({ message: 'Perfil sem permissao para esta acao.' }, { status: 403 });
  }

  if (!isSupabaseDataSourceRequested()) {
    return NextResponse.json({ message: 'Uploads estao disponiveis apenas no modo online.' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const assetType = formData.get('assetType');
    const professionalId = formData.get('professionalId');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Selecione uma imagem para enviar.' }, { status: 400 });
    }

    if (!isSalonAssetType(assetType)) {
      return NextResponse.json({ message: 'Tipo de imagem invalido.' }, { status: 400 });
    }

    const validation = validateSalonImageFile(file);

    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const path = buildSalonAssetPath({
      assetType,
      extension: validation.extension,
      professionalId: typeof professionalId === 'string' ? professionalId : undefined,
      salonId: session.salonId,
    });
    const url = await uploadPublicSalonAsset(file, path);

    await persistAssetUrl({
      assetType,
      professionalId: typeof professionalId === 'string' ? professionalId : undefined,
      salonId: session.salonId,
      url,
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Nao foi possivel enviar a imagem. Tente novamente.' },
      { status: 500 },
    );
  }
}

async function persistAssetUrl(input: {
  assetType: SalonAssetType;
  professionalId?: string;
  salonId: string;
  url: string;
}) {
  if (input.assetType === 'logo' || input.assetType === 'cover') {
    await supabaseRestRequest<null>('salons', {
      method: 'PATCH',
      query: `id=eq.${encodeURIComponent(input.salonId)}`,
      body: input.assetType === 'logo' ? { logo_url: input.url } : { cover_url: input.url },
      prefer: 'return=minimal',
      useServiceRole: true,
    });
    return;
  }

  if (!input.professionalId) {
    throw new Error('Profissional nao encontrado para atualizar a foto.');
  }

  await supabaseRestRequest<null>('professionals', {
    method: 'PATCH',
    query: `salon_id=eq.${encodeURIComponent(input.salonId)}&id=eq.${encodeURIComponent(input.professionalId)}`,
    body: { avatar_url: input.url },
    prefer: 'return=minimal',
    useServiceRole: true,
  });

  await supabaseRestRequest<null>('employees', {
    method: 'PATCH',
    query: `salon_id=eq.${encodeURIComponent(input.salonId)}&id=eq.${encodeURIComponent(input.professionalId)}`,
    body: { avatar_url: input.url },
    prefer: 'return=minimal',
    useServiceRole: true,
  }).catch(() => null);
}

function isSalonAssetType(value: FormDataEntryValue | null): value is SalonAssetType {
  return value === 'logo' || value === 'cover' || value === 'professionalAvatar';
}
