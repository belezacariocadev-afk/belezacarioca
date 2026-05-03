'use client';

import { Check, Copy, ExternalLink, Link2, Send } from 'lucide-react';
import { useState } from 'react';

type PartnerReferralLinkCardProps = {
  partnerCode: string;
  referralLink: string;
  disclosureText: string;
};

export function PartnerReferralLinkCard({
  partnerCode,
  referralLink,
  disclosureText,
}: PartnerReferralLinkCardProps) {
  const [copyState, setCopyState] = useState<'idle' | 'link' | 'text' | 'shared'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCopy(text: string, type: 'link' | 'text') {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(type);
      setErrorMessage(null);
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setErrorMessage('Nao foi possivel copiar agora. Tente novamente.');
      window.setTimeout(() => setErrorMessage(null), 2200);
    }
  }

  async function handleShare() {
    const sharePayload = {
      title: 'Programa de parceiros Beleza Carioca',
      text: disclosureText,
      url: referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        setCopyState('shared');
        setErrorMessage(null);
        window.setTimeout(() => setCopyState('idle'), 1800);
      } catch {
        // noop: cancelamento do share nativo
      }
      return;
    }

    await handleCopy(`${disclosureText}\n\n${referralLink}`, 'text');
  }

  return (
    <section id="meu-link" className="scroll-mt-24">
      <div className="rounded-[1.95rem] border border-[rgba(120,84,162,0.12)] bg-[linear-gradient(150deg,rgba(255,255,255,0.98),rgba(247,240,233,0.95))] p-6 shadow-[0_18px_42px_rgba(110,84,144,0.1)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="bc-kicker">Meu link exclusivo</p>
            <h2 className="text-[clamp(1.35rem,3vw,1.95rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
              Indique estabelecimentos com um link unico
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.2)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#6e4c98]">
            <Link2 size={14} />
            Codigo: {partnerCode}
          </span>
        </div>

        <div className="mt-5 rounded-[1.4rem] border border-[rgba(120,84,162,0.14)] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8d6a39]">Link de indicacao</p>
          <p className="mt-2 break-all text-sm font-semibold leading-7 text-[color:var(--bc-text)]">{referralLink}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleCopy(referralLink, 'link')}
            className="bc-button-primary h-12 gap-2 px-6 text-sm"
          >
            {copyState === 'link' ? <Check size={16} /> : <Copy size={16} />}
            {copyState === 'link' ? 'Link copiado' : 'Copiar link'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="bc-button-secondary h-12 gap-2 px-6 text-sm"
          >
            <Send size={15} />
            {copyState === 'shared' ? 'Compartilhado' : 'Compartilhar'}
          </button>
          <a
            href={referralLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-6 text-sm font-black text-[color:var(--bc-text)] transition hover:-translate-y-0.5"
          >
            <ExternalLink size={15} />
            Abrir link
          </a>
        </div>

        <div className="mt-6 rounded-[1.35rem] border border-[rgba(120,84,162,0.12)] bg-white/92 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-black text-[color:var(--bc-text)]">Texto pronto para divulgacao</h3>
            <button
              type="button"
              onClick={() => handleCopy(disclosureText, 'text')}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.18)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#6e4c98] transition hover:border-[rgba(216,178,123,0.38)]"
            >
              {copyState === 'text' ? <Check size={14} /> : <Copy size={14} />}
              {copyState === 'text' ? 'Texto copiado' : 'Copiar texto'}
            </button>
          </div>
          <p className="mt-3 rounded-xl bg-[rgba(120,84,162,0.06)] px-4 py-3 text-sm leading-7 text-[color:var(--bc-muted)]">
            {disclosureText}
          </p>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-sm font-semibold text-red-600">{errorMessage}</p>
        ) : (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.13em] text-[color:var(--bc-muted)]">
            Dica: foque em estabelecimentos que estao prontos para ativar um plano pago.
          </p>
        )}
      </div>
    </section>
  );
}
