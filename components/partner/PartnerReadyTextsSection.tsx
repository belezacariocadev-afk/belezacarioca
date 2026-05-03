'use client';

import { Download, FileText, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  getReadyTextCategoryById,
  partnerReadyTexts,
  readyTextCategories,
  type PartnerReadyTextCategoryId,
} from '@/lib/partner/readyTexts';

import { PartnerReadyTextCard } from './PartnerReadyTextCard';
import { PartnerReadyTextsTabs } from './PartnerReadyTextsTabs';

type PartnerReadyTextsSectionProps = {
  open: boolean;
  onClose: () => void;
  onDownloadAll: () => void;
};

export function PartnerReadyTextsSection({ open, onClose, onDownloadAll }: PartnerReadyTextsSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<PartnerReadyTextCategoryId>(readyTextCategories[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const filteredTexts = useMemo(
    () => partnerReadyTexts.filter((item) => item.category === activeCategoryId),
    [activeCategoryId],
  );

  const activeCategory = getReadyTextCategoryById(activeCategoryId);

  function showToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2000);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(26,16,38,0.54)] backdrop-blur-[1px]"
        aria-label="Fechar biblioteca de textos"
      />

      <div className="absolute inset-0 p-3 sm:p-5 lg:p-8">
        <section className="relative mx-auto flex h-full w-full max-w-[1180px] flex-col overflow-hidden rounded-[2rem] border border-[rgba(120,84,162,0.22)] bg-[linear-gradient(180deg,#fffefc_0%,#f6efe8_100%)] shadow-[0_30px_80px_rgba(21,14,33,0.34)]">
          <header className="border-b border-[rgba(120,84,162,0.12)] px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="bc-kicker">Biblioteca premium</p>
                <h2 className="text-[clamp(1.25rem,3vw,2rem)] font-black tracking-[-0.045em] text-[color:var(--bc-text)]">
                  Textos prontos para divulgacao
                </h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Selecione a categoria, leia o contexto e copie uma mensagem pronta para usar em segundos.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onDownloadAll}
                  className="bc-button-secondary h-10 gap-2 px-5 text-xs uppercase tracking-[0.11em]"
                >
                  <Download size={14} />
                  Baixar biblioteca
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

          <div className="border-b border-[rgba(120,84,162,0.1)] px-5 py-4 sm:px-7">
            <PartnerReadyTextsTabs
              categories={readyTextCategories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <div className="mb-4 rounded-[1.2rem] border border-[rgba(120,84,162,0.1)] bg-white px-4 py-3">
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[color:var(--bc-text)]">
                {activeCategory?.label ?? 'Categoria'}
              </h3>
              <p className="mt-1 text-sm leading-7 text-[color:var(--bc-muted)]">
                {activeCategory?.description ?? 'Selecione uma categoria para visualizar os textos.'}
              </p>
            </div>

            {filteredTexts.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-[rgba(120,84,162,0.24)] bg-white/85 px-6 py-10 text-center">
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(120,84,162,0.1)] text-[#6e4c98]">
                  <FileText size={18} />
                </span>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Ainda nao existem textos cadastrados nesta categoria.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredTexts.map((item) => (
                  <PartnerReadyTextCard
                    key={item.id}
                    item={item}
                    categoryLabel={activeCategory?.label ?? 'Categoria'}
                    onCopied={() => showToast('Texto copiado com sucesso')}
                    onCopyError={() => showToast('Nao foi possivel copiar. Tente novamente')}
                  />
                ))}
              </div>
            )}
          </div>

          {toastMessage ? (
            <div className="pointer-events-none absolute bottom-5 right-5 z-10 rounded-full border border-[rgba(120,84,162,0.2)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-purple-strong)] shadow-[0_14px_34px_rgba(110,84,144,0.14)]">
              {toastMessage}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
