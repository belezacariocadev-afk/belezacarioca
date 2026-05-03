'use client';

import { ChevronLeft, ChevronRight, Download, ImageOff, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { PartnerMaterialGallery } from '@/lib/partner/materialGallery';

type PartnerMaterialsPreviewModalProps = {
  gallery: PartnerMaterialGallery | null;
  open: boolean;
  onClose: () => void;
  onDownloadPackage: (gallery: PartnerMaterialGallery) => void;
};

export function PartnerMaterialsPreviewModal({
  gallery,
  open,
  onClose,
  onDownloadPackage,
}: PartnerMaterialsPreviewModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeImageRatio, setActiveImageRatio] = useState(1);

  const images = gallery?.images ?? [];
  const totalImages = images.length;
  const activeImage = images[activeIndex];

  const canOpen = open && Boolean(gallery) && totalImages > 0;

  useEffect(() => {
    if (!canOpen) {
      return;
    }

    setActiveIndex(0);
    setImageLoading(true);
    setImageError(null);
  }, [canOpen, gallery?.materialId]);

  useEffect(() => {
    if (!canOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % totalImages);
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + totalImages) % totalImages);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canOpen, onClose, totalImages]);

  useEffect(() => {
    if (!canOpen) {
      return;
    }

    setImageLoading(true);
    setImageError(null);
    setActiveImageRatio(1);
  }, [activeIndex, canOpen]);

  const counterLabel = useMemo(() => {
    if (!canOpen) {
      return '';
    }
    return `${activeIndex + 1} de ${totalImages}`;
  }, [activeIndex, canOpen, totalImages]);

  const imageOrientation = useMemo(() => {
    if (activeImageRatio < 0.9) {
      return 'portrait' as const;
    }

    if (activeImageRatio > 1.1) {
      return 'landscape' as const;
    }

    return 'square' as const;
  }, [activeImageRatio]);

  function goToPreviousImage() {
    setActiveIndex((current) => (current - 1 + totalImages) % totalImages);
  }

  function goToNextImage() {
    setActiveIndex((current) => (current + 1) % totalImages);
  }

  function handleDownloadCurrentImage() {
    if (!activeImage) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = activeImage.downloadSrc;
    anchor.download = `${gallery?.materialId ?? 'material'}-${activeImage.id}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  function handleOpenCurrentImage() {
    if (!activeImage) {
      return;
    }

    window.open(activeImage.previewSrc, '_blank', 'noopener,noreferrer');
  }

  if (!canOpen || !gallery || !activeImage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[85] overflow-hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(23,13,35,0.62)] backdrop-blur-[1px]"
        aria-label="Fechar preview de materiais"
      />

      <div className="absolute inset-0 grid place-items-center overflow-hidden p-3 sm:p-5 lg:p-8">
        <section className="bc-preview-modal-shell relative flex w-full flex-col rounded-[2rem] border border-[rgba(120,84,162,0.22)] bg-[linear-gradient(180deg,#fffefc_0%,#f6efe8_100%)] shadow-[0_30px_80px_rgba(21,14,33,0.34)]">
          <header className="border-b border-[rgba(120,84,162,0.12)] px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="bc-kicker">Preview interno</p>
                <h2 className="text-[clamp(1.25rem,3vw,2rem)] font-black tracking-[-0.045em] text-[color:var(--bc-text)]">
                  {gallery.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">{gallery.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onDownloadPackage(gallery)}
                  className="bc-button-secondary h-10 gap-2 px-5 text-xs uppercase tracking-[0.11em]"
                >
                  <Download size={14} />
                  Baixar pacote completo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.34)]"
                >
                  <X size={14} />
                  Fechar
                </button>
              </div>
            </div>
          </header>

          <div className="bc-preview-body relative flex flex-1 flex-col px-5 py-5 sm:px-7 sm:py-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.13em] text-[color:var(--bc-muted)]">
                {activeImage.title}
              </p>
              <span className="rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-3 py-1 text-xs font-bold text-[color:var(--bc-purple-strong)]">
                {counterLabel}
              </span>
            </div>

            <div className="bc-preview-stage">
              <div
                className={['bc-preview-media-viewer', `preview--${imageOrientation}`].join(' ')}
                style={{ ['--bc-preview-aspect' as string]: String(activeImageRatio) }}
              >
                <div className="bc-preview-media-frame">
                  {imageLoading ? (
                    <div className="absolute inset-0 animate-pulse bg-[linear-gradient(90deg,rgba(120,84,162,0.08),rgba(120,84,162,0.04),rgba(120,84,162,0.08))]" />
                  ) : null}

                  {imageError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(120,84,162,0.1)] text-[#6e4c98]">
                        <ImageOff size={18} />
                      </span>
                      <p className="text-sm font-semibold text-[color:var(--bc-muted)]">{imageError}</p>
                    </div>
                  ) : (
                    <img
                      src={activeImage.previewSrc}
                      alt={activeImage.alt}
                      className="bc-preview-image"
                      onLoad={(event) => {
                        setImageLoading(false);
                        const element = event.currentTarget;
                        if (element.naturalWidth > 0 && element.naturalHeight > 0) {
                          setActiveImageRatio(element.naturalWidth / element.naturalHeight);
                        }
                      }}
                      onError={() => {
                        setImageLoading(false);
                        setImageError('Nao foi possivel carregar a imagem selecionada.');
                      }}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={goToPreviousImage}
                  className="bc-preview-arrow bc-preview-arrow-left"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={goToNextImage}
                  className="bc-preview-arrow bc-preview-arrow-right"
                  aria-label="Proxima imagem"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="bc-preview-thumbs no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {images.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    'overflow-hidden rounded-xl border p-1.5 transition',
                    index === activeIndex
                      ? 'border-[rgba(120,84,162,0.35)] bg-white shadow-[0_10px_24px_rgba(110,84,144,0.16)] ring-2 ring-[rgba(120,84,162,0.14)]'
                      : 'border-[rgba(120,84,162,0.14)] bg-white/88 hover:border-[rgba(120,84,162,0.24)]',
                  ].join(' ')}
                  aria-current={index === activeIndex}
                  aria-label={`Abrir ${item.title}`}
                >
                  <img
                    src={item.previewSrc}
                    alt={item.alt}
                    className="bc-preview-thumb h-20 w-20 rounded-lg sm:h-24 sm:w-24"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          <footer className="border-t border-[rgba(120,84,162,0.12)] px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleOpenCurrentImage}
                className="bc-button-secondary h-10 gap-2 px-5 text-xs uppercase tracking-[0.11em]"
              >
                Visualizar
              </button>
              <button
                type="button"
                onClick={handleDownloadCurrentImage}
                className="bc-button-primary h-10 gap-2 px-5 text-xs uppercase tracking-[0.11em]"
              >
                <Download size={14} />
                Baixar esta imagem
              </button>
              <button
                type="button"
                onClick={() => onDownloadPackage(gallery)}
                className="bc-button-secondary h-10 gap-2 px-5 text-xs uppercase tracking-[0.11em]"
              >
                <Download size={14} />
                Baixar pacote completo
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
