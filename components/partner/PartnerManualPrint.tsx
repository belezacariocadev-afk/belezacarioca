import { forwardRef } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  LayoutDashboard,
  Link2,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { PartnerManualPage } from '@/lib/partner/partnerManual';

type PartnerManualPrintProps = {
  pages: PartnerManualPage[];
};

const pointIcons: LucideIcon[] = [Link2, Megaphone, LayoutDashboard, BookOpenCheck];

function getPointIcon(index: number) {
  return pointIcons[index % pointIcons.length];
}

function renderGenericPage(page: PartnerManualPage) {
  return (
    <div className="mt-7 flex h-full flex-col">
      <h2 className="max-w-[760px] text-[31px] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
        {page.title}
      </h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-[1.7] text-[color:var(--bc-muted)]">
        {page.body}
      </p>

      {page.points?.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {page.points.map((point, index) => {
            const Icon = getPointIcon(index);
            return (
              <article
                key={point}
                className="rounded-2xl border border-[rgba(120,84,162,0.13)] bg-white px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
                    <Icon size={16} />
                  </span>
                  <p className="text-[14px] font-semibold text-[color:var(--bc-text)]">{point}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {page.highlight ? (
        <div className="mt-auto rounded-2xl border border-[rgba(216,178,123,0.32)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Orientacao</p>
          <p className="mt-2 text-[15px] font-semibold text-[color:var(--bc-text)]">{page.highlight}</p>
        </div>
      ) : null}
    </div>
  );
}

function renderCoverPage(page: PartnerManualPage) {
  return (
    <div className="mt-8 flex h-full flex-col">
      <span className="inline-flex w-fit rounded-full border border-[rgba(120,84,162,0.2)] bg-[rgba(120,84,162,0.08)] px-4 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--bc-purple-strong)]">
        Manual institucional
      </span>
      <h1 className="mt-5 max-w-[560px] text-[38px] font-black leading-[1.02] tracking-[-0.05em] text-[color:var(--bc-text)]">
        {page.title}
      </h1>
      {page.subtitle ? (
        <p className="mt-4 max-w-[620px] text-[20px] font-semibold text-[color:var(--bc-purple-strong)]">
          {page.subtitle}
        </p>
      ) : null}
      <p className="mt-4 max-w-[680px] text-[17px] leading-[1.7] text-[color:var(--bc-muted)]">
        {page.body}
      </p>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Objetivo</p>
          <p className="mt-1 text-[14px] font-semibold text-[color:var(--bc-text)]">
            Direcionar sua rotina de parceria com clareza.
          </p>
        </div>
        <div className="rounded-2xl border border-[rgba(216,178,123,0.24)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Aplicacao</p>
          <p className="mt-1 text-[14px] font-semibold text-[color:var(--bc-text)]">
            Utilize este guia para manter consistencia em todas as indicacoes.
          </p>
        </div>
      </div>

      {page.highlight ? (
        <div className="mt-3 rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 py-3">
          <p className="text-[13px] font-semibold text-[color:var(--bc-text)]">{page.highlight}</p>
        </div>
      ) : null}
    </div>
  );
}

function renderClosingPage(page: PartnerManualPage) {
  return (
    <div className="mt-7 flex h-full flex-col">
      <h2 className="max-w-[760px] text-[33px] font-black leading-[1.08] tracking-[-0.04em] text-[color:var(--bc-text)]">
        {page.title}
      </h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-[1.7] text-[color:var(--bc-muted)]">
        {page.body}
      </p>

      <div className="my-auto rounded-3xl border border-[rgba(216,178,123,0.34)] bg-[linear-gradient(135deg,rgba(120,84,162,0.12),rgba(216,178,123,0.2))] px-6 py-6">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8d6a39]">Boas praticas</p>
        <div className="mt-3 space-y-2">
          {(page.points ?? []).map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-xl border border-[rgba(120,84,162,0.14)] bg-white px-3 py-2 text-[13px] font-semibold text-[color:var(--bc-text)]"
            >
              <CheckCircle2 size={14} className="text-[color:var(--bc-purple-strong)]" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {page.highlight ? (
        <div className="rounded-2xl border border-[rgba(120,84,162,0.13)] bg-white px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
              <Sparkles size={16} />
            </span>
            <p className="text-[14px] font-semibold text-[color:var(--bc-text)]">{page.highlight}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const PartnerManualPrint = forwardRef<HTMLDivElement, PartnerManualPrintProps>(
  function PartnerManualPrint({ pages }, ref) {
    return (
      <div ref={ref} className="bc-commercial-print-root">
        {pages.map((page, index) => (
          <section key={page.id} className="bc-commercial-print-page">
            <div className="bc-commercial-print-accent" />

            <header className="flex items-center justify-between gap-4">
              <img
                src="/assets/partner/presentation/logo-horizontal.png"
                alt="Logo Beleza Carioca"
                className="h-auto w-[210px]"
              />
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--bc-purple-strong)]">
                  Manual do parceiro
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--bc-muted)]">
                  Pagina {index + 1} de {pages.length}
                </p>
              </div>
            </header>

            {page.id === 'capa'
              ? renderCoverPage(page)
              : page.id === 'boas-praticas'
                ? renderClosingPage(page)
                : renderGenericPage(page)}
          </section>
        ))}
      </div>
    );
  },
);

