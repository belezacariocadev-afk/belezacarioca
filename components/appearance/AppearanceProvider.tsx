'use client';

import {
  createContext,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { usePlatformData } from '@/components/platform/PlatformDataProvider';

export type AppearanceThemeMode = 'light' | 'dark';

type ProfessionalAvatarMap = Record<string, string>;

type AppearanceContextValue = {
  coverUrl: string;
  logoUrl: string;
  primaryColor: string;
  professionalAvatars: ProfessionalAvatarMap;
  saveChanges: () => Promise<{ ok: boolean; message: string }>;
  setAvatar: (professionalId: string, avatarUrl: string) => void;
  setCover: (coverUrl: string) => void;
  setLogo: (logoUrl: string) => void;
  setPrimaryColor: (primaryColor: string) => void;
  setThemeMode: (themeMode: AppearanceThemeMode) => void;
  themeMode: AppearanceThemeMode;
};

const defaultPrimaryColor = '#7C3AED';
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { actions, data } = usePlatformData();
  const [primaryColor, setPrimaryColorState] = useState(() => normalizeHexColor(data.salon.primaryColor));
  const [themeMode, setThemeMode] = useState<AppearanceThemeMode>(() => normalizeThemeMode(data.salon.themeMode));
  const [logoUrl, setLogo] = useState(data.salon.logoUrl ?? '');
  const [coverUrl, setCover] = useState(data.salon.coverUrl ?? '');
  const [professionalAvatars, setProfessionalAvatars] = useState<ProfessionalAvatarMap>(() => getProfessionalAvatars(data.professionals));

  useEffect(() => {
    setPrimaryColorState(normalizeHexColor(data.salon.primaryColor));
    setThemeMode(normalizeThemeMode(data.salon.themeMode));
    setLogo(data.salon.logoUrl ?? '');
    setCover(data.salon.coverUrl ?? '');
    setProfessionalAvatars(getProfessionalAvatars(data.professionals));
  }, [data.salon, data.professionals]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.dataset.theme = themeMode;

    return () => {
      document.documentElement.style.removeProperty('--primary-color');
      delete document.documentElement.dataset.theme;
    };
  }, [primaryColor, themeMode]);

  const setPrimaryColor = useCallback((value: string) => {
    setPrimaryColorState(normalizeHexColor(value));
  }, []);

  const setAvatar = useCallback((professionalId: string, avatarUrl: string) => {
    setProfessionalAvatars((current) => ({
      ...current,
      [professionalId]: avatarUrl,
    }));
  }, []);

  const saveChanges = useCallback(async () => {
    try {
      const nextPrimaryColor = normalizeHexColor(primaryColor);
      const nextThemeMode = normalizeThemeMode(themeMode);
      const appearanceResult = await actions.updateSalonAppearance({
        coverUrl: coverUrl || undefined,
        logoUrl: logoUrl || undefined,
        primaryColor: nextPrimaryColor,
        salonIdOrSlug: data.salon.id || data.salon.slug,
        themeMode: nextThemeMode,
      });

      if (!appearanceResult.ok) {
        return appearanceResult;
      }

      setPrimaryColorState(nextPrimaryColor);
      setThemeMode(nextThemeMode);

      for (const professional of data.professionals) {
        const avatarUrl = professionalAvatars[professional.id] ?? '';

        if ((professional.avatarUrl ?? '') === avatarUrl) {
          continue;
        }

        const avatarResult = await actions.updateProfessionalAvatar(professional.id, avatarUrl || undefined);

        if (!avatarResult.ok) {
          return avatarResult;
        }
      }

      return { ok: true, message: 'Aparencia salva com sucesso.' };
    } catch {
      return { ok: false, message: 'Nao foi possivel salvar a aparencia agora.' };
    }
  }, [actions, coverUrl, data.professionals, data.salon.id, data.salon.slug, logoUrl, primaryColor, professionalAvatars, themeMode]);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      coverUrl,
      logoUrl,
      primaryColor,
      professionalAvatars,
      saveChanges,
      setAvatar,
      setCover,
      setLogo,
      setPrimaryColor,
      setThemeMode,
      themeMode,
    }),
    [coverUrl, logoUrl, primaryColor, professionalAvatars, saveChanges, setAvatar, setPrimaryColor, themeMode],
  );
  const style = {
    '--primary-color': primaryColor,
  } as CSSProperties;

  return (
    <AppearanceContext.Provider value={value}>
      <div data-theme={themeMode} style={style} className="bc-appearance-scope min-h-full">
        {children}
      </div>
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);

  if (!context) {
    throw new Error('useAppearance must be used inside AppearanceProvider');
  }

  return context;
}

function getProfessionalAvatars(professionals: Array<{ avatarUrl?: string; id: string }>) {
  return professionals.reduce<ProfessionalAvatarMap>((accumulator, professional) => {
    accumulator[professional.id] = professional.avatarUrl ?? '';

    return accumulator;
  }, {});
}

function normalizeThemeMode(value?: string): AppearanceThemeMode {
  return value === 'dark' ? 'dark' : 'light';
}

function normalizeHexColor(value?: string) {
  return /^#[0-9a-f]{6}$/i.test(value ?? '') ? (value as string).toUpperCase() : defaultPrimaryColor;
}
