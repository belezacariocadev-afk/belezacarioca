import type { AppearanceThemeMode } from '@/components/appearance/AppearanceProvider';

export type PersistSalonAppearanceInput = {
  coverUrl?: string;
  logoUrl?: string;
  primaryColor: string;
  themeMode: AppearanceThemeMode;
};

export type PersistProfessionalAvatarInput = {
  avatarUrl?: string;
  professionalId: string;
};

export async function persistSalonAppearanceToSupabase(input: PersistSalonAppearanceInput) {
  const response = await fetch('/api/platform/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'updateSalonAppearance',
      payload: input,
    }),
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel salvar a aparencia agora.');
  }

  return response.json() as Promise<unknown>;
}

export async function persistProfessionalAvatarToSupabase(input: PersistProfessionalAvatarInput) {
  const response = await fetch('/api/platform/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'updateProfessionalAvatar',
      payload: {
        avatarUrl: input.avatarUrl,
        professionalId: input.professionalId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel salvar a foto do profissional agora.');
  }

  return response.json() as Promise<unknown>;
}
