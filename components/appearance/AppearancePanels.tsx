'use client';

import { type ReactNode, useState } from 'react';
import { ImagePlus } from 'lucide-react';

import { useAppearance } from '@/components/appearance/AppearanceProvider';
import { usePlatformData } from '@/components/platform/PlatformDataProvider';

type UploadAssetType = 'cover' | 'logo' | 'professionalAvatar';

export function AdminAppearancePanel() {
  const appearance = useAppearance();
  const { dataSource } = usePlatformData();
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const result = await appearance.saveChanges();
    setIsSaving(false);

    setMessage({ kind: result.ok ? 'success' : 'error', text: result.message });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <AppearancePanel title="Aparencia do salao" eyebrow="Identidade visual">
        <div className="grid gap-5">
          <AppearanceUploadField
            assetType="logo"
            disabled={dataSource !== 'supabase'}
            label="Logo do salao"
            onUploaded={(url) => {
              appearance.setLogo(url);
              setMessage({ kind: 'success', text: 'Logo atualizado com sucesso.' });
            }}
          />
          <AppearanceUploadField
            assetType="cover"
            disabled={dataSource !== 'supabase'}
            label="Capa do salao"
            onUploaded={(url) => {
              appearance.setCover(url);
              setMessage({ kind: 'success', text: 'Capa atualizada com sucesso.' });
            }}
          />
          {dataSource !== 'supabase' ? <AppearanceNotice>Uploads ficam disponiveis quando o painel esta no modo online.</AppearanceNotice> : null}
          <label className="grid gap-2">
            <span className="text-sm font-black text-[color:var(--bc-text)]">Tema</span>
            <select
              value={appearance.themeMode}
              onChange={(event) => appearance.setThemeMode(event.target.value === 'dark' ? 'dark' : 'light')}
              className="h-11 rounded-lg border border-[rgba(120,84,162,0.16)] bg-white px-3 text-sm font-semibold text-[color:var(--bc-text)] outline-none focus:border-[var(--primary-color)]"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black text-[color:var(--bc-text)]">Cor principal</span>
            <div className="grid gap-3 sm:grid-cols-[64px_1fr]">
              <input
                type="color"
                value={appearance.primaryColor}
                onChange={(event) => appearance.setPrimaryColor(event.target.value)}
                className="h-11 w-full rounded-lg border border-[rgba(120,84,162,0.16)] bg-white p-1"
              />
              <input
                value={appearance.primaryColor}
                onChange={(event) => appearance.setPrimaryColor(event.target.value)}
                className="h-11 rounded-lg border border-[rgba(120,84,162,0.16)] bg-white px-3 text-sm font-semibold text-[color:var(--bc-text)] outline-none focus:border-[var(--primary-color)]"
                placeholder="#7C3AED"
              />
            </div>
          </label>
          {message ? (
            message.kind === 'success' ? <AppearanceSuccess>{message.text}</AppearanceSuccess> : <AppearanceError>{message.text}</AppearanceError>
          ) : null}
          <button type="button" onClick={() => void handleSave()} disabled={isSaving} className="bc-admin-primary-button disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? 'Salvando...' : 'Salvar aparencia'}
          </button>
        </div>
      </AppearancePanel>

      <AppearancePanel title="Preview para cliente" eyebrow="Como o salao aparece">
        <ClientAppearancePreview />
      </AppearancePanel>
    </section>
  );
}

export function ProfessionalAvatarField({ professionalId }: { professionalId: string }) {
  const { setAvatar } = useAppearance();

  return (
    <AppearanceUploadField
      assetType="professionalAvatar"
      label="Foto do profissional"
      professionalId={professionalId}
      onUploaded={(url) => setAvatar(professionalId, url)}
    />
  );
}

export function ClientAppearancePreview() {
  const { coverUrl, logoUrl, primaryColor, themeMode } = useAppearance();
  const { data } = usePlatformData();
  const isDark = themeMode === 'dark';

  return (
    <div className={['overflow-hidden rounded-lg border shadow-[0_18px_42px_rgba(110,84,144,0.08)]', isDark ? 'border-white/10 bg-[#171321] text-white' : 'border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-text)]'].join(' ')}>
      <div className="relative h-44 bg-[linear-gradient(135deg,#f7eefc,#fff0cf)]">
        {coverUrl ? <img src={coverUrl} alt="" className="h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/42 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-white text-lg font-black shadow-lg" style={{ color: primaryColor }}>
            {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : getInitials(data.salon.name)}
          </span>
          <div>
            <h3 className="text-2xl font-black text-white">{data.salon.name || 'Seu salao'}</h3>
            <p className="text-sm font-semibold text-white/82">Beleza | Agendamento online</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5">
        <p className={isDark ? 'text-sm leading-7 text-white/72' : 'text-sm leading-7 text-[color:var(--bc-muted)]'}>
          Cor, tema, logo e capa sao aplicados automaticamente na experiencia do cliente.
        </p>
        <button type="button" className="h-11 rounded-lg px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)]" style={{ backgroundColor: primaryColor }}>
          Agendar
        </button>
      </div>
    </div>
  );
}

function AppearanceUploadField({
  assetType,
  disabled,
  label,
  onUploaded,
  professionalId,
}: {
  assetType: UploadAssetType;
  disabled?: boolean;
  label: string;
  onUploaded: (url: string) => void;
  professionalId?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file?: File) {
    setError(null);

    if (!file) {
      return;
    }

    const body = new FormData();
    body.set('file', file);
    body.set('assetType', assetType);

    if (professionalId) {
      body.set('professionalId', professionalId);
    }

    setIsUploading(true);
    const response = await fetch('/api/platform/assets', { method: 'POST', body }).catch(() => null);
    setIsUploading(false);

    if (!response?.ok) {
      const payload = (await response?.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? 'Nao foi possivel enviar a imagem.');
      return;
    }

    const payload = (await response.json()) as { url: string };
    onUploaded(payload.url);
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-black text-[color:var(--bc-text)]">{label}</span>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[rgba(120,84,162,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)] transition hover:border-[var(--primary-color)]">
        <span className="inline-flex items-center gap-2">
          <ImagePlus size={18} className="text-[var(--primary-color)]" />
          {isUploading ? 'Enviando imagem...' : 'Selecionar imagem'}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || isUploading}
          onChange={(event) => void handleFile(event.target.files?.[0])}
          className="sr-only"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-[#ad352d]">{error}</p> : null}
    </div>
  );
}

function AppearancePanel({ children, eyebrow, title }: { children: ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="rounded-lg border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_18px_42px_rgba(110,84,144,0.08)]">
      <p className="bc-kicker">{eyebrow}</p>
      <h2 className="mb-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{title}</h2>
      {children}
    </section>
  );
}

function AppearanceNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[rgba(120,84,162,0.24)] bg-[rgba(120,84,162,0.05)] p-4 text-sm font-semibold text-[color:var(--bc-muted)]">
      {children}
    </div>
  );
}

function AppearanceSuccess({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-[#b9efcb] bg-[#effcf4] p-4 text-sm font-semibold text-[#1f7a3d]">{children}</div>;
}

function AppearanceError({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-[#f0b8b8] bg-[#fff5f5] p-4 text-sm font-semibold text-[#a83232]">{children}</div>;
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BC';
}
