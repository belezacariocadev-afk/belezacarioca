'use client';

import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Handshake,
  ImageIcon,
  LayoutDashboard,
  Link2,
  MessageCircle,
  Presentation,
  Target,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { commercialPresentationSlides } from '@/lib/partner/commercialPresentation';
import type { PublicPresentationTokenRecord } from '@/lib/partner/publicPresentationTokens';

import { PartnerCommercialPresentationPrint } from './PartnerCommercialPresentationPrint';

type PublicCommercialPresentationPageProps = {
  tokenData: PublicPresentationTokenRecord;
};

type VisualCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const aboutCards: VisualCard[] = [
  {
    title: 'Organizacao comercial',
    description: 'Processos mais claros para indicacao e acompanhamento.',
    icon: ClipboardList,
  },
  {
    title: 'Visibilidade continua',
    description: 'Leitura objetiva da jornada de cada oportunidade.',
    icon: BarChart3,
  },
  {
    title: 'Estrutura de crescimento',
    description: 'Base para escalar parcerias com consistencia.',
    icon: Target,
  },
];

const deliveryIcons: LucideIcon[] = [
  Link2,
  ImageIcon,
  FileText,
  Presentation,
  BookOpenCheck,
  LayoutDashboard,
];

export function PublicCommercialPresentationPage({ tokenData }: PublicCommercialPresentationPageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  const activeSlide = commercialPresentationSlides[activeIndex];
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === commercialPresentationSlides.length - 1;
  const counterLabel = `${activeIndex + 1} de ${commercialPresentationSlides.length}`;

  const whatsappHref = useMemo(() => {
    const message = encodeURIComponent(tokenData.whatsappMessage);
    return `https://wa.me/${tokenData.whatsappNumber}?text=${message}`;
  }, [tokenData.whatsappMessage, tokenData.whatsappNumber]);

  const handleGeneratePdf = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: 'apresentacao-comercial-beleza-carioca',
    onAfterPrint: () => setIsPrinting(false),
    onPrintError: () => setIsPrinting(false),
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .bc-commercial-print-root {
          width: 190mm !important;
          margin: 0 auto !important;
        }
        .bc-commercial-print-page {
          width: 190mm !important;
          height: 277mm !important;
          box-sizing: border-box !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          page-break-after: always !important;
        }
        .bc-commercial-print-page:last-child {
          break-after: auto !important;
          page-break-after: auto !important;
        }
      }
    `,
  });

  function handleDownloadPdf() {
    setIsPrinting(true);
    handleGeneratePdf();
  }

  function renderSlideContent() {
    if (!activeSlide) {
      return null;
    }

    if (activeSlide.id === 'cover') {
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
                Programa de parceiros
              </p>
              <h2 className="mt-3 text-[clamp(1.6rem,4.2vw,3.1rem)] font-black leading-[1.02] tracking-[-0.045em] text-[color:var(--bc-text)]">
                {activeSlide.title}
              </h2>
              <p className="mt-3 text-[clamp(1rem,2vw,1.28rem)] font-semibold text-[color:var(--bc-purple-strong)]">
                {activeSlide.subtitle}
              </p>
              <p className="mt-3 max-w-[640px] text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
                {activeSlide.body}
              </p>
            </div>

            <div className="mt-auto grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/88 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8d6a39]">Visao comercial</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">
                  Estrutura para divulgar e acompanhar resultados.
                </p>
              </div>
              <div className="rounded-xl border border-[rgba(216,178,123,0.28)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8d6a39]">Foco em execucao</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">
                  Mais clareza para gerar indicacoes com consistencia.
                </p>
              </div>
            </div>
          </div>

          <aside className="hidden rounded-2xl border border-[rgba(120,84,162,0.14)] bg-[linear-gradient(160deg,rgba(120,84,162,0.08),rgba(255,255,255,0.85))] p-4 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--bc-purple-strong)]">
                Deck institucional
              </p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--bc-text)]">
                Material comercial para apresentar o programa de forma objetiva e profissional.
              </p>
            </div>

            <div className="space-y-2">
              {[
                'Fluxo de parceria simplificado',
                'Recursos para divulgacao',
                'Acompanhamento e ganhos',
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

    if (activeSlide.id === 'sobre') {
      return (
        <div className="grid h-full gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col">
            <h2 className="text-[clamp(1.28rem,3.2vw,2.35rem)] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
              {activeSlide.title}
            </h2>
            <p className="mt-3 max-w-[700px] text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
              {activeSlide.body}
            </p>

            <div className="mt-4 rounded-2xl border border-[rgba(216,178,123,0.28)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8d6a39]">Posicionamento</p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)] sm:text-base">
                Plataforma pensada para conectar divulgacao, acompanhamento comercial e rotina de parceria em um unico lugar.
              </p>
            </div>

            <div className="mt-auto grid gap-2 sm:grid-cols-3">
              {(activeSlide.bullets ?? []).map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[rgba(120,84,162,0.12)] bg-white/88 px-3 py-3 text-xs font-semibold leading-6 text-[color:var(--bc-text)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            {aboutCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/90 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-black tracking-[-0.01em] text-[color:var(--bc-text)]">
                        {card.title}
                      </p>
                      <p className="mt-1 text-xs leading-6 text-[color:var(--bc-muted)]">{card.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeSlide.id === 'fluxo') {
      return (
        <div className="flex h-full flex-col">
          <h2 className="text-[clamp(1.28rem,3.2vw,2.35rem)] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
            {activeSlide.title}
          </h2>
          <p className="mt-2 max-w-[760px] text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
            {activeSlide.body}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {(activeSlide.steps ?? []).map((step, index) => (
              <div
                key={step}
                className="relative rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/92 px-3 py-3"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(120,84,162,0.12)] text-[11px] font-black text-[color:var(--bc-purple-strong)]">
                  {index + 1}
                </span>
                <p className="mt-2 text-xs font-semibold leading-6 text-[color:var(--bc-text)]">{step}</p>
                {index < (activeSlide.steps?.length ?? 0) - 1 ? (
                  <ArrowRight
                    size={13}
                    className="absolute -right-1 top-1/2 hidden -translate-y-1/2 text-[rgba(120,84,162,0.42)] lg:block"
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-xl border border-[rgba(216,178,123,0.26)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-4 py-3">
            <p className="text-sm font-semibold text-[color:var(--bc-text)]">
              Resultado: processo claro, padronizado e com visibilidade em cada etapa da parceria.
            </p>
          </div>
        </div>
      );
    }

    if (activeSlide.id === 'entregas') {
      return (
        <div className="flex h-full flex-col">
          <h2 className="text-[clamp(1.2rem,3vw,2.1rem)] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
            {activeSlide.title}
          </h2>
          <p className="mt-2 max-w-[760px] text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
            {activeSlide.body}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(activeSlide.bullets ?? []).map((item, index) => {
              const Icon = deliveryIcons[index % deliveryIcons.length];
              return (
                <div
                  key={item}
                  className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/90 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
                      <Icon size={15} />
                    </span>
                    <p className="text-sm font-semibold text-[color:var(--bc-text)]">{item}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/90 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8d6a39]">Kit comercial integrado</p>
            <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">
              Tudo centralizado para divulgar com mais padrao visual, rapidez e consistencia comercial.
            </p>
          </div>
        </div>
      );
    }

    if (activeSlide.id === 'ganhos') {
      return (
        <div className="flex h-full flex-col">
          <h2 className="text-[clamp(1.2rem,3vw,2.1rem)] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
            {activeSlide.title}
          </h2>
          {activeSlide.subtitle ? (
            <p className="mt-2 text-[clamp(0.95rem,2vw,1.18rem)] font-semibold text-[color:var(--bc-purple-strong)]">
              {activeSlide.subtitle}
            </p>
          ) : null}
          <p className="mt-2 max-w-[760px] text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
            {activeSlide.body}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(activeSlide.highlights ?? []).map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/90 px-4 py-3"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[color:var(--bc-muted)]">
                  {highlight.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">{highlight.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto grid gap-2 lg:grid-cols-[0.6fr_1.4fr]">
            <div className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/92 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Painel ativo</p>
              <div className="mt-2 space-y-1.5">
                {[
                  { icon: Handshake, label: 'Oportunidades' },
                  { icon: WalletCards, label: 'Comissoes' },
                  { icon: BarChart3, label: 'Pagamentos' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-[color:var(--bc-text)]">
                      <Icon size={14} className="text-[color:var(--bc-purple-strong)]" />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/92 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Indicadores visuais</p>
              <div className="mt-3 flex items-end gap-2">
                {[36, 54, 48, 64, 72, 68].map((height, index) => (
                  <div key={`${height}-${index}`} className="flex-1">
                    <div
                      className="rounded-t-md bg-[linear-gradient(180deg,#9a7bc3,#6a4a96)]"
                      style={{ height: `${height}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="max-w-[760px]">
          <h2 className="text-[clamp(1.35rem,3.2vw,2.3rem)] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
            {activeSlide.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
            {activeSlide.body}
          </p>
        </div>

        <div className="my-auto rounded-[1.2rem] border border-[rgba(216,178,123,0.34)] bg-[linear-gradient(130deg,rgba(120,84,162,0.14),rgba(216,178,123,0.2))] px-6 py-6">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8d6a39]">Chamada final</p>
          <p className="mt-2 text-[clamp(1.05rem,2.4vw,1.4rem)] font-black tracking-[-0.02em] text-[color:var(--bc-text)]">
            {activeSlide.cta}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.3)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-purple-strong)]"
          >
            <MessageCircle size={14} />
            Falar no WhatsApp
          </a>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {[
            'Use os materiais do painel',
            'Acompanhe o status das indicacoes',
            'Consulte ganhos com transparencia',
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[rgba(120,84,162,0.14)] bg-white/90 px-3 py-3 text-xs font-semibold leading-6 text-[color:var(--bc-text)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
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
              <p className="bc-kicker mt-5">Apresentacao compartilhavel</p>
              <h1 className="text-[clamp(1.45rem,3vw,2.25rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
                Apresentacao comercial
              </h1>
              <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">
                Deck com proposta de valor, beneficios e fluxo da parceria.
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--bc-purple-strong)]">
                Link compartilhado por {tokenData.partnerName}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPrinting}
              className="bc-button-secondary h-11 gap-2 px-5 text-xs uppercase tracking-[0.11em] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={14} />
              {isPrinting ? 'Preparando PDF...' : 'Baixar PDF'}
            </button>
          </div>
        </div>
      </section>

      <section className="bc-container py-6 md:py-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-[0.13em] text-[color:var(--bc-muted)]">
            {activeSlide?.title}
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
                  <Building2 size={12} />
                  Beleza Carioca
                </span>
                <span className="inline-flex rounded-full border border-[rgba(120,84,162,0.14)] bg-white/88 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">
                  Slide {activeIndex + 1}
                </span>
              </div>

              {renderSlideContent()}
            </div>
          </article>

          <button
            type="button"
            onClick={() => setActiveIndex((current) => Math.max(current - 1, 0))}
            disabled={isFirstSlide}
            className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(120,84,162,0.18)] bg-white/95 text-[color:var(--bc-text)] shadow-[0_10px_22px_rgba(110,84,144,0.16)] transition disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Pagina anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((current) =>
                Math.min(current + 1, commercialPresentationSlides.length - 1),
              )
            }
            disabled={isLastSlide}
            className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(120,84,162,0.18)] bg-white/95 text-[color:var(--bc-text)] shadow-[0_10px_22px_rgba(110,84,144,0.16)] transition disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Proxima pagina"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {commercialPresentationSlides.map((slide, index) => (
            <button
              key={slide.id}
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
                {slide.title}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="bc-container pb-10">
        <div className="rounded-[1.2rem] border border-[rgba(120,84,162,0.14)] bg-white/92 p-5 shadow-[0_14px_34px_rgba(110,84,144,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8d6a39]">Contato comercial</p>
              <p className="mt-1 text-sm leading-7 text-[color:var(--bc-muted)]">
                Quer saber como aplicar essa estrutura no seu negocio?
              </p>
            </div>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="bc-button-primary h-11 gap-2 px-6 text-xs uppercase tracking-[0.11em]">
              <MessageCircle size={15} />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="bc-commercial-print-host" aria-hidden>
        <PartnerCommercialPresentationPrint
          ref={printContentRef}
          slides={commercialPresentationSlides}
        />
      </div>
    </main>
  );
}
