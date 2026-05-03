import { forwardRef } from 'react';
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  FileText,
  ImageIcon,
  LayoutDashboard,
  Link2,
  Presentation,
  Target,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { CommercialPresentationSlide } from '@/lib/partner/commercialPresentation';

type PartnerCommercialPresentationPrintProps = {
  slides: CommercialPresentationSlide[];
};

const deliveryIcons: LucideIcon[] = [
  Link2,
  ImageIcon,
  FileText,
  Presentation,
  BookOpenCheck,
  LayoutDashboard,
];

export const PartnerCommercialPresentationPrint = forwardRef<
  HTMLDivElement,
  PartnerCommercialPresentationPrintProps
>(function PartnerCommercialPresentationPrint({ slides }, ref) {
  return (
    <div ref={ref} className="bc-commercial-print-root">
      {slides.map((slide, index) => (
        <section key={slide.id} className="bc-commercial-print-page">
          <div className="bc-commercial-print-accent" />

          <header className="flex items-center justify-between gap-4">
            <img
              src="/assets/partner/presentation/logo-horizontal.png"
              alt="Logo Beleza Carioca"
              className="h-auto w-[210px]"
            />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--bc-purple-strong)]">
                Apresentacao comercial
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--bc-muted)]">
                Pagina {index + 1} de {slides.length}
              </p>
            </div>
          </header>

          {slide.id === 'cover' ? (
            <div className="mt-8 flex h-full flex-col">
              <span className="inline-flex w-fit rounded-full border border-[rgba(120,84,162,0.2)] bg-[rgba(120,84,162,0.08)] px-4 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--bc-purple-strong)]">
                Programa de parceiros
              </span>
              <h1 className="mt-5 max-w-[520px] text-[38px] font-black leading-[1.02] tracking-[-0.05em] text-[color:var(--bc-text)]">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-[520px] text-[21px] font-semibold text-[color:var(--bc-purple-strong)]">
                {slide.subtitle}
              </p>
              <p className="mt-4 max-w-[620px] text-[17px] leading-[1.7] text-[color:var(--bc-muted)]">
                {slide.body}
              </p>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Visao comercial</p>
                  <p className="mt-1 text-[14px] font-semibold text-[color:var(--bc-text)]">
                    Estrutura para divulgar e acompanhar resultados.
                  </p>
                </div>
                <div className="rounded-2xl border border-[rgba(216,178,123,0.24)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Execucao</p>
                  <p className="mt-1 text-[14px] font-semibold text-[color:var(--bc-text)]">
                    Mais clareza para indicar com consistencia.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {slide.id === 'sobre' ? (
            <div className="mt-7 flex h-full flex-col">
              <h2 className="max-w-[640px] text-[33px] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
                {slide.title}
              </h2>
              <p className="mt-4 max-w-[680px] text-[17px] leading-[1.7] text-[color:var(--bc-muted)]">
                {slide.body}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {(slide.bullets ?? []).map((item) => (
                  <article
                    key={item}
                    className="rounded-2xl border border-[rgba(120,84,162,0.12)] bg-white px-4 py-4"
                  >
                    <p className="text-[14px] font-semibold leading-[1.6] text-[color:var(--bc-text)]">{item}</p>
                  </article>
                ))}
              </div>

              <div className="mt-auto rounded-2xl border border-[rgba(216,178,123,0.3)] bg-[linear-gradient(135deg,rgba(120,84,162,0.09),rgba(216,178,123,0.18))] px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Posicionamento institucional</p>
                <p className="mt-2 text-[15px] font-semibold text-[color:var(--bc-text)]">
                  Plataforma para organizar divulgacao, acompanhamento e rotina comercial em uma experiencia unica.
                </p>
              </div>
            </div>
          ) : null}

          {slide.id === 'fluxo' ? (
            <div className="mt-7 flex h-full flex-col">
              <h2 className="text-[33px] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
                {slide.title}
              </h2>
              <p className="mt-4 max-w-[700px] text-[17px] leading-[1.7] text-[color:var(--bc-muted)]">
                {slide.body}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {(slide.steps ?? []).map((step, stepIndex) => (
                  <article
                    key={step}
                    className="rounded-2xl border border-[rgba(120,84,162,0.12)] bg-white px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(120,84,162,0.12)] text-[12px] font-black text-[color:var(--bc-purple-strong)]">
                        {stepIndex + 1}
                      </span>
                      <p className="text-[14px] font-semibold text-[color:var(--bc-text)]">{step}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-auto rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-5 py-4">
                <p className="text-[14px] font-semibold text-[color:var(--bc-text)]">
                  Fluxo pensado para facilitar a execucao e manter previsibilidade comercial.
                </p>
              </div>
            </div>
          ) : null}

          {slide.id === 'entregas' ? (
            <div className="mt-7 flex h-full flex-col">
              <h2 className="max-w-[760px] text-[31px] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
                {slide.title}
              </h2>
              <p className="mt-3 max-w-[720px] text-[17px] leading-[1.7] text-[color:var(--bc-muted)]">
                {slide.body}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {(slide.bullets ?? []).map((item, bulletIndex) => {
                  const Icon = deliveryIcons[bulletIndex % deliveryIcons.length];
                  return (
                    <article
                      key={item}
                      className="rounded-2xl border border-[rgba(120,84,162,0.13)] bg-white px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
                          <Icon size={16} />
                        </span>
                        <p className="text-[14px] font-semibold text-[color:var(--bc-text)]">{item}</p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-auto rounded-2xl border border-[rgba(216,178,123,0.3)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-5 py-4">
                <p className="text-[14px] font-semibold text-[color:var(--bc-text)]">
                  Kit comercial completo para divulgar com padrao visual e consistencia.
                </p>
              </div>
            </div>
          ) : null}

          {slide.id === 'ganhos' ? (
            <div className="mt-7 flex h-full flex-col">
              <h2 className="text-[33px] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
                {slide.title}
              </h2>
              {slide.subtitle ? (
                <p className="mt-3 text-[21px] font-semibold text-[color:var(--bc-purple-strong)]">{slide.subtitle}</p>
              ) : null}
              <p className="mt-3 max-w-[760px] text-[17px] leading-[1.7] text-[color:var(--bc-muted)]">
                {slide.body}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {(slide.highlights ?? []).map((highlight) => (
                  <article
                    key={highlight.label}
                    className="rounded-2xl border border-[rgba(120,84,162,0.12)] bg-white px-4 py-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[color:var(--bc-muted)]">
                      {highlight.label}
                    </p>
                    <p className="mt-1 text-[14px] font-semibold text-[color:var(--bc-text)]">{highlight.value}</p>
                  </article>
                ))}
              </div>

              <div className="mt-auto grid grid-cols-[0.7fr_1.3fr] gap-3">
                <article className="rounded-2xl border border-[rgba(120,84,162,0.13)] bg-white px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Painel ativo</p>
                  <div className="mt-2 space-y-1.5 text-[12px] font-semibold text-[color:var(--bc-text)]">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={13} className="text-[color:var(--bc-purple-strong)]" />
                      Oportunidades
                    </div>
                    <div className="flex items-center gap-2">
                      <WalletCards size={13} className="text-[color:var(--bc-purple-strong)]" />
                      Comissoes
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={13} className="text-[color:var(--bc-purple-strong)]" />
                      Pagamentos
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-[rgba(120,84,162,0.13)] bg-white px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Indicadores</p>
                  <div className="mt-3 flex items-end gap-2">
                    {[34, 52, 48, 64, 70, 68].map((height, chartIndex) => (
                      <div key={`${height}-${chartIndex}`} className="flex-1">
                        <div
                          className="rounded-t-md bg-[linear-gradient(180deg,#9a7bc3,#6a4a96)]"
                          style={{ height: `${height}px` }}
                        />
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          ) : null}

          {slide.id === 'cta' ? (
            <div className="mt-7 flex h-full flex-col">
              <h2 className="max-w-[760px] text-[34px] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
                {slide.title}
              </h2>
              <p className="mt-4 max-w-[760px] text-[17px] leading-[1.7] text-[color:var(--bc-muted)]">
                {slide.body}
              </p>

              <div className="my-auto rounded-3xl border border-[rgba(216,178,123,0.34)] bg-[linear-gradient(135deg,rgba(120,84,162,0.12),rgba(216,178,123,0.2))] px-6 py-6">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Chamada final</p>
                <p className="mt-2 text-[24px] font-black tracking-[-0.02em] text-[color:var(--bc-text)]">
                  {slide.cta}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    title: 'Acesse sua area',
                    icon: LayoutDashboard,
                  },
                  {
                    title: 'Use os materiais',
                    icon: BookOpenCheck,
                  },
                  {
                    title: 'Acompanhe resultados',
                    icon: Target,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-[rgba(120,84,162,0.13)] bg-white px-4 py-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
                          <Icon size={14} />
                        </span>
                        <p className="text-[13px] font-semibold text-[color:var(--bc-text)]">{item.title}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
});
