'use client';

import Link from 'next/link';
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutDashboard,
  Link2,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { downloadSlidesPdf } from '@/lib/partner/commercialPresentationPdf';
import { partnerManualPages, type PartnerManualPage } from '@/lib/partner/partnerManual';
import type { PublicManualTokenRecord } from '@/lib/partner/publicManualTokens';

import { PartnerManualPrint } from './PartnerManualPrint';

type PublicPartnerManualPageProps = {
  tokenData: PublicManualTokenRecord;
};

const cardIcons: LucideIcon[] = [Link2, Megaphone, LayoutDashboard, BookOpenCheck];

function getPointIcon(index: number) {
  const Icon = cardIcons[index % cardIcons.length];
  return Icon;
}

function renderDefaultPageContent(page: PartnerManualPage) {
  return (
    <div className="flex h-full flex-col">
      <div>
        <h2 className="text-[clamp(1.32rem,3.2vw,2.35rem)] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
          {page.title}
        </h2>
        <p className="mt-3 max-w-[760px] text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
          {page.body}
        </p>
      </div>

      {page.points?.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {page.points.map((point, index) => {
            const Icon = getPointIcon(index);
            return (
              <article
                key={point}
                className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/92 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
                    <Icon size={15} />
                  </span>
                  <p className="text-sm font-semibold text-[color:var(--bc-text)]">{point}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {page.highlight ? (
        <div className="mt-auto rounded-xl border border-[rgba(216,178,123,0.3)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8d6a39]">Orientacao pratica</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">{page.highlight}</p>
        </div>
      ) : null}
    </div>
  );
}

function renderCoverPage(page: PartnerManualPage) {
  return (
    <div className="grid h-full gap-4 lg:grid-cols-[1.18fr_0.82fr]">
      <div className="flex flex-col">
        <img
          src="/assets/partner/presentation/logo-horizontal.png"
          alt="Logo Beleza Carioca"
          className="h-auto w-[185px] sm:w-[250px] lg:w-[300px]"
        />

        <div className="mt-4">
          <p className="inline-flex rounded-full border border-[rgba(120,84,162,0.2)] bg-white/82 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--bc-purple-strong)]">
            Manual institucional
          </p>
          <h2 className="mt-3 text-[clamp(1.6rem,4.2vw,3.1rem)] font-black leading-[1.02] tracking-[-0.045em] text-[color:var(--bc-text)]">
            {page.title}
          </h2>
          {page.subtitle ? (
            <p className="mt-3 text-[clamp(1rem,2vw,1.24rem)] font-semibold text-[color:var(--bc-purple-strong)]">
              {page.subtitle}
            </p>
          ) : null}
          <p className="mt-3 max-w-[640px] text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
            {page.body}
          </p>
        </div>

        {page.highlight ? (
          <div className="mt-auto rounded-xl border border-[rgba(216,178,123,0.3)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8d6a39]">Ponto de partida</p>
            <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">{page.highlight}</p>
          </div>
        ) : null}
      </div>

      <aside className="hidden rounded-2xl border border-[rgba(120,84,162,0.14)] bg-[linear-gradient(160deg,rgba(120,84,162,0.08),rgba(255,255,255,0.85))] p-4 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--bc-purple-strong)]">
            Guia de operacao
          </p>
          <p className="mt-2 text-sm font-semibold text-[color:var(--bc-text)]">
            Conteudo orientativo para iniciar a parceria com padrao, consistencia e visibilidade.
          </p>
        </div>

        <div className="space-y-2">
          {[
            'Primeiros passos claros',
            'Uso correto dos materiais',
            'Acompanhamento de resultados',
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--bc-text)]"
            >
              {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function renderFollowUpPage(page: PartnerManualPage) {
  return (
    <div className="flex h-full flex-col">
      <div className="max-w-[760px]">
        <h2 className="text-[clamp(1.35rem,3.2vw,2.3rem)] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
          {page.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
          {page.body}
        </p>
      </div>

      <div className="my-auto rounded-[1.2rem] border border-[rgba(216,178,123,0.34)] bg-[linear-gradient(130deg,rgba(120,84,162,0.14),rgba(216,178,123,0.2))] px-6 py-6">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8d6a39]">Boas praticas</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(page.points ?? []).map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/92 px-3 py-3 text-xs font-semibold leading-6 text-[color:var(--bc-text)]"
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
                <CheckCircle2 size={12} />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {page.highlight ? (
        <div className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/92 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Encerramento</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">{page.highlight}</p>
        </div>
      ) : null}
    </div>
  );
}

export function PublicPartnerManualPage({ tokenData }: PublicPartnerManualPageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const printContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, partnerManualPages.length - 1));
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activePage = partnerManualPages[activeIndex];
  const isFirstPage = activeIndex === 0;
  const isLastPage = activeIndex === partnerManualPages.length - 1;
  const counterLabel = useMemo(
    () => `${activeIndex + 1} de ${partnerManualPages.length}`,
    [activeIndex],
  );

  async function handleDownloadPdf() {
    if (isDownloadingPdf || !printContentRef.current) {
      return;
    }

    setPdfError(null);
    setIsDownloadingPdf(true);

    try {
      await downloadSlidesPdf({
        rootElement: printContentRef.current,
        fileName: 'manual-do-parceiro-beleza-carioca.pdf',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF publico do manual:', error);
      setPdfError('Nao foi possivel gerar o PDF. Tente novamente.');
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  if (!activePage) {
    return null;
  }

  return (
    <main className="relative z-10">
      <section className="border-b border-[rgba(120,84,162,0.12)] bg-[linear-gradient(180deg,#fffefc_0%,#f7f0e8_100%)]">
        <div className="bc-container py-8 md:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <img
                src="/assets/partner/presentation/logo-horizontal.png"
                alt="Logo Beleza Carioca"
                className="h-auto w-[170px] sm:w-[210px]"
              />
              <p className="bc-kicker mt-5">Manual compartilhavel</p>
              <h1 className="text-[clamp(1.45rem,3vw,2.25rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
                Manual do Parceiro
              </h1>
              <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">
                Guia pratico para usar sua area, divulgar com mais consistencia e acompanhar resultados.
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--bc-purple-strong)]">
                Link compartilhado por {tokenData.partnerName}
              </p>
              {pdfError ? (
                <p className="mt-2 text-xs font-semibold text-red-600">{pdfError}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bc-button-secondary h-11 gap-2 px-5 text-xs uppercase tracking-[0.11em] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={14} />
              {isDownloadingPdf ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
          </div>
        </div>
      </section>

      <section className="bc-container py-6 md:py-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-[0.13em] text-[color:var(--bc-muted)]">
            {activePage.title}
          </p>
          <span className="rounded-full border border-[rgba(120,84,162,0.15)] bg-white px-3 py-1 text-xs font-bold text-[color:var(--bc-purple-strong)]">
            {counterLabel}
          </span>
        </div>

        <div className="relative grid place-items-center overflow-hidden rounded-[1.2rem] border border-[rgba(120,84,162,0.14)] bg-[rgba(255,255,255,0.72)] p-2 sm:p-3">
          <article className="relative aspect-[16/10] w-full max-w-[980px] overflow-hidden rounded-[1.1rem] border border-[rgba(120,84,162,0.16)] bg-white shadow-[0_16px_42px_rgba(110,84,144,0.14)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(120,84,162,0.08),transparent_42%),radial-gradient(circle_at_90%_8%,rgba(216,178,123,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(249,243,236,0.98)_100%)]" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-[4px] bg-[linear-gradient(180deg,#7b5ca7,#d8b27b)]" />

            <div className="relative z-[1] flex h-full flex-col overflow-y-auto px-5 py-5 sm:px-8 sm:py-7">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white/88 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[color:var(--bc-purple-strong)]">
                  <Sparkles size={12} />
                  Beleza Carioca
                </span>
                <span className="inline-flex rounded-full border border-[rgba(120,84,162,0.14)] bg-white/88 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">
                  Pagina {activeIndex + 1}
                </span>
              </div>

              {activePage.id === 'capa'
                ? renderCoverPage(activePage)
                : activePage.id === 'boas-praticas'
                  ? renderFollowUpPage(activePage)
                  : renderDefaultPageContent(activePage)}
            </div>
          </article>

          <button
            type="button"
            onClick={() => setActiveIndex((current) => Math.max(current - 1, 0))}
            disabled={isFirstPage}
            className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(120,84,162,0.18)] bg-white/95 text-[color:var(--bc-text)] shadow-[0_10px_22px_rgba(110,84,144,0.16)] transition disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Pagina anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => setActiveIndex((current) => Math.min(current + 1, partnerManualPages.length - 1))}
            disabled={isLastPage}
            className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(120,84,162,0.18)] bg-white/95 text-[color:var(--bc-text)] shadow-[0_10px_22px_rgba(110,84,144,0.16)] transition disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Proxima pagina"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {partnerManualPages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={[
                'min-w-[138px] rounded-xl border px-3 py-2 text-left transition sm:min-w-[164px]',
                index === activeIndex
                  ? 'border-[rgba(120,84,162,0.35)] bg-white shadow-[0_10px_24px_rgba(110,84,144,0.16)] ring-2 ring-[rgba(120,84,162,0.14)]'
                  : 'border-[rgba(120,84,162,0.12)] bg-white/88 hover:border-[rgba(120,84,162,0.24)]',
              ].join(' ')}
              aria-current={index === activeIndex}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#8d6a39]">
                Pagina {index + 1}
              </p>
              <p className="mt-1 text-xs font-semibold text-[color:var(--bc-text)]">
                {page.title}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="bc-container pb-10">
        <div className="rounded-[1.2rem] border border-[rgba(120,84,162,0.14)] bg-white/92 p-5 shadow-[0_14px_34px_rgba(110,84,144,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8d6a39]">Proximo passo</p>
              <p className="mt-1 text-sm leading-7 text-[color:var(--bc-muted)]">
                Continue no painel para aplicar o manual no dia a dia.
              </p>
            </div>
            <Link href="/parceiro" className="bc-button-primary h-11 gap-2 px-6 text-xs uppercase tracking-[0.11em]">
              <LayoutDashboard size={15} />
              Acessar area do parceiro
            </Link>
          </div>
        </div>
      </section>

      <div className="bc-commercial-print-host" aria-hidden>
        <PartnerManualPrint ref={printContentRef} pages={partnerManualPages} />
      </div>
    </main>
  );
}

