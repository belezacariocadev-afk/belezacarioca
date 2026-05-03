'use client';

import {
  BookMarked,
  Download,
  Eye,
  FileText,
  Images,
  LayoutTemplate,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  getMaterialGalleryByMaterialId,
  type PartnerMaterialGallery,
} from '@/lib/partner/materialGallery';
import {
  buildManualWhatsappUrl,
  buildPublicManualUrl,
} from '@/lib/partner/manualShare';
import type { PartnerMaterial } from '@/lib/partner/mockData';
import { formatDateBR } from '@/lib/partner/mockData';
import {
  buildPresentationWhatsappUrl,
  buildPublicPresentationUrl,
} from '@/lib/partner/presentationShare';

import { PartnerCopyButton } from './PartnerCopyButton';
import { PartnerCommercialPresentationModal } from './PartnerCommercialPresentationModal';
import { PartnerManualModal } from './PartnerManualModal';
import { PartnerMaterialsPreviewModal } from './PartnerMaterialsPreviewModal';
import { PartnerReadyTextsSection } from './PartnerReadyTextsSection';

type PartnerMaterialsSectionProps = {
  materials: PartnerMaterial[];
};

const READY_TEXTS_LIBRARY_FILE = '/assets/partner/biblioteca_textos_beleza_carioca.pdf';

const categoryMeta = {
  story: {
    label: 'Story',
    icon: Sparkles,
    accent: 'bg-[rgba(120,84,162,0.12)] text-[#6e4c98]',
  },
  feed: {
    label: 'Feed',
    icon: Images,
    accent: 'bg-[rgba(216,178,123,0.18)] text-[#8d6a39]',
  },
  texto: {
    label: 'Texto',
    icon: FileText,
    accent: 'bg-[rgba(84,139,162,0.16)] text-[#2f6a8a]',
  },
  apresentacao: {
    label: 'Apresentacao',
    icon: LayoutTemplate,
    accent: 'bg-[rgba(107,163,98,0.18)] text-[#3e7a37]',
  },
  manual: {
    label: 'Manual',
    icon: BookMarked,
    accent: 'bg-[rgba(104,87,146,0.16)] text-[#5b4a8a]',
  },
} as const;

export function PartnerMaterialsSection({ materials }: PartnerMaterialsSectionProps) {
  const [isReadyTextsOpen, setIsReadyTextsOpen] = useState(false);
  const [isCommercialPresentationOpen, setIsCommercialPresentationOpen] = useState(false);
  const [isPartnerManualOpen, setIsPartnerManualOpen] = useState(false);
  const [activeMaterialGalleryId, setActiveMaterialGalleryId] = useState<string | null>(null);
  const [downloadReadyTextsFeedback, setDownloadReadyTextsFeedback] = useState<string | null>(null);
  const [downloadPackageFeedbackByMaterial, setDownloadPackageFeedbackByMaterial] = useState<Record<string, string | null>>({});
  const [presentationShareUrl, setPresentationShareUrl] = useState(() =>
    buildPublicPresentationUrl(),
  );
  const [presentationWhatsappUrl, setPresentationWhatsappUrl] = useState(() =>
    buildPresentationWhatsappUrl(),
  );
  const [presentationShareStatus, setPresentationShareStatus] = useState<'success' | 'error' | null>(null);
  const [manualShareUrl, setManualShareUrl] = useState(() => buildPublicManualUrl());
  const [manualWhatsappUrl, setManualWhatsappUrl] = useState(() => buildManualWhatsappUrl());
  const [manualShareStatus, setManualShareStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const origin = window.location.origin;
    setPresentationShareUrl(buildPublicPresentationUrl({ origin }));
    setPresentationWhatsappUrl(buildPresentationWhatsappUrl({ origin }));
    setManualShareUrl(buildPublicManualUrl({ origin }));
    setManualWhatsappUrl(buildManualWhatsappUrl({ origin }));
  }, []);

  function hasValidLink(url?: string) {
    return Boolean(url && url !== '#');
  }

  function handleDownloadReadyTexts() {
    const anchor = document.createElement('a');
    anchor.href = READY_TEXTS_LIBRARY_FILE;
    anchor.download = 'biblioteca_textos_beleza_carioca.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setDownloadReadyTextsFeedback('Biblioteca baixada');
    window.setTimeout(() => setDownloadReadyTextsFeedback(null), 1800);
  }

  function handleDownloadVisualPackage(gallery: PartnerMaterialGallery) {
    const anchor = document.createElement('a');
    anchor.href = gallery.packageDownloadUrl;
    anchor.download = gallery.packageFileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setDownloadPackageFeedbackByMaterial((current) => ({
      ...current,
      [gallery.materialId]: 'Pacote baixado',
    }));

    window.setTimeout(() => {
      setDownloadPackageFeedbackByMaterial((current) => ({
        ...current,
        [gallery.materialId]: null,
      }));
    }, 1800);
  }

  function showPresentationShareStatus(status: 'success' | 'error') {
    setPresentationShareStatus(status);
    window.setTimeout(() => setPresentationShareStatus(null), 2200);
  }

  function showManualShareStatus(status: 'success' | 'error') {
    setManualShareStatus(status);
    window.setTimeout(() => setManualShareStatus(null), 2200);
  }

  const activeMaterialGallery = activeMaterialGalleryId
    ? getMaterialGalleryByMaterialId(activeMaterialGalleryId) ?? null
    : null;

  return (
    <>
      <section id="materiais" className="scroll-mt-24">
        <div className="mb-4">
          <p className="bc-kicker">Materiais para divulgacao</p>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
            Conteudos prontos para acelerar suas indicacoes
          </h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">
            Organize sua comunicacao para atrair estabelecimentos com perfil de assinatura paga.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => {
            const meta = categoryMeta[material.category];
            const Icon = meta.icon;
            const isReadyTextsMaterial = material.category === 'texto';
            const isCommercialPresentationMaterial = material.id === 'material-apresentacao';
            const isPartnerManualMaterial = material.id === 'material-manual';
            const visualGallery = getMaterialGalleryByMaterialId(material.id);
            const hasVisualGallery = Boolean(visualGallery && visualGallery.images.length > 0);

            return (
              <article
                key={material.id}
                className="rounded-[1.5rem] border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_15px_34px_rgba(110,84,144,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${meta.accent}`}>
                    <Icon size={14} />
                    {meta.label}
                  </span>
                  <span className="text-xs font-semibold text-[color:var(--bc-muted)]">{material.format}</span>
                </div>

                <h3 className="mt-4 text-lg font-black tracking-[-0.03em] text-[color:var(--bc-text)]">{material.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">{material.description}</p>

                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d6a39]">
                  Atualizado em {formatDateBR(material.updatedAt)}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {isReadyTextsMaterial ? (
                    <button
                      type="button"
                      onClick={() => setIsReadyTextsOpen(true)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                    >
                      <Eye size={13} />
                      Visualizar
                    </button>
                  ) : isCommercialPresentationMaterial ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsCommercialPresentationOpen(true)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                      >
                        <Eye size={13} />
                        Visualizar
                      </button>
                      <PartnerCopyButton
                        textToCopy={presentationShareUrl}
                        label="Copiar link"
                        copiedLabel="Link copiado"
                        onCopied={() => showPresentationShareStatus('success')}
                        onCopyError={() => showPresentationShareStatus('error')}
                      />
                      <a
                        href={presentationWhatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                      >
                        <MessageCircle size={13} />
                        Enviar no WhatsApp
                      </a>
                    </>
                  ) : isPartnerManualMaterial ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPartnerManualOpen(true)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                      >
                        <Eye size={13} />
                        Visualizar
                      </button>
                      <PartnerCopyButton
                        textToCopy={manualShareUrl}
                        label="Copiar link"
                        copiedLabel="Link copiado"
                        onCopied={() => showManualShareStatus('success')}
                        onCopyError={() => showManualShareStatus('error')}
                      />
                      <a
                        href={manualWhatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                      >
                        <MessageCircle size={13} />
                        Enviar no WhatsApp
                      </a>
                    </>
                  ) : hasVisualGallery ? (
                    <button
                      type="button"
                      onClick={() => setActiveMaterialGalleryId(material.id)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                    >
                      <Eye size={13} />
                      Visualizar
                    </button>
                  ) : hasValidLink(material.previewUrl) ? (
                    <a
                      href={material.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                    >
                      <Eye size={13} />
                      Visualizar
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(120,84,162,0.04)] px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-muted)]"
                    >
                      <Eye size={13} />
                      Em breve
                    </button>
                  )}

                  {isReadyTextsMaterial ? (
                    <button
                      type="button"
                      onClick={handleDownloadReadyTexts}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                    >
                      <Download size={13} />
                      {downloadReadyTextsFeedback ?? 'Baixar'}
                    </button>
                  ) : isCommercialPresentationMaterial || isPartnerManualMaterial ? null : hasVisualGallery && visualGallery ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadVisualPackage(visualGallery)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                    >
                      <Download size={13} />
                      {downloadPackageFeedbackByMaterial[material.id] ?? 'Baixar pacote'}
                    </button>
                  ) : hasValidLink(material.downloadUrl) ? (
                    <a
                      href={material.downloadUrl}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                    >
                      <Download size={13} />
                      Baixar
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(120,84,162,0.04)] px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-muted)]"
                    >
                      <Download size={13} />
                      Em breve
                    </button>
                  )}

                  {material.copyText ? (
                    <PartnerCopyButton
                      textToCopy={material.copyText}
                      label="Copiar texto"
                      copiedLabel="Texto copiado"
                    />
                  ) : null}
                </div>

                {isCommercialPresentationMaterial && presentationShareStatus ? (
                  <p
                    className={[
                      'mt-3 text-xs font-semibold',
                      presentationShareStatus === 'success'
                        ? 'text-[color:var(--bc-purple-strong)]'
                        : 'text-red-600',
                    ].join(' ')}
                  >
                    {presentationShareStatus === 'success'
                      ? 'Link copiado com sucesso'
                      : 'Nao foi possivel copiar o link. Tente novamente.'}
                  </p>
                ) : null}

                {isPartnerManualMaterial && manualShareStatus ? (
                  <p
                    className={[
                      'mt-3 text-xs font-semibold',
                      manualShareStatus === 'success'
                        ? 'text-[color:var(--bc-purple-strong)]'
                        : 'text-red-600',
                    ].join(' ')}
                  >
                    {manualShareStatus === 'success'
                      ? 'Link copiado com sucesso'
                      : 'Nao foi possivel copiar o link. Tente novamente.'}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <PartnerReadyTextsSection
        open={isReadyTextsOpen}
        onClose={() => setIsReadyTextsOpen(false)}
        onDownloadAll={handleDownloadReadyTexts}
      />

      <PartnerMaterialsPreviewModal
        gallery={activeMaterialGallery}
        open={Boolean(activeMaterialGallery)}
        onClose={() => setActiveMaterialGalleryId(null)}
        onDownloadPackage={handleDownloadVisualPackage}
      />

      <PartnerCommercialPresentationModal
        open={isCommercialPresentationOpen}
        onClose={() => setIsCommercialPresentationOpen(false)}
      />

      <PartnerManualModal
        open={isPartnerManualOpen}
        onClose={() => setIsPartnerManualOpen(false)}
      />
    </>
  );
}
