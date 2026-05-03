'use client';

import {
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Presentation,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { partnerHelpCenterFaq } from '@/lib/partner/helpCenter';
import { buildPublicManualUrl } from '@/lib/partner/manualShare';
import { buildPublicPresentationUrl } from '@/lib/partner/presentationShare';

type PartnerHelpCenterModalProps = {
  open: boolean;
  onClose: () => void;
  support: {
    email: string;
    whatsapp: string;
    responseTime: string;
  };
};

function buildWhatsAppSupportUrl(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, '');
  const message = encodeURIComponent(
    'Ola! Preciso de ajuda com minha rotina na area do parceiro da Beleza Carioca.',
  );
  return `https://wa.me/${digits}?text=${message}`;
}

export function PartnerHelpCenterModal({ open, onClose, support }: PartnerHelpCenterModalProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(partnerHelpCenterFaq[0]?.id ?? null);

  const [publicManualUrl, setPublicManualUrl] = useState(() => buildPublicManualUrl());
  const [publicPresentationUrl, setPublicPresentationUrl] = useState(() =>
    buildPublicPresentationUrl(),
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const origin = window.location.origin;
    setPublicManualUrl(buildPublicManualUrl({ origin }));
    setPublicPresentationUrl(buildPublicPresentationUrl({ origin }));
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const whatsappSupportUrl = useMemo(
    () => buildWhatsAppSupportUrl(support.whatsapp),
    [support.whatsapp],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(26,16,38,0.56)] backdrop-blur-[1.4px]"
        aria-label="Fechar central de ajuda"
      />

      <div className="absolute inset-0 p-3 sm:p-5 lg:p-8">
        <section className="relative mx-auto flex h-full w-full max-w-[1120px] flex-col overflow-hidden rounded-[2rem] border border-[rgba(120,84,162,0.22)] bg-[linear-gradient(180deg,#fffefc_0%,#f6efe8_100%)] shadow-[0_30px_80px_rgba(21,14,33,0.34)]">
          <header className="border-b border-[rgba(120,84,162,0.12)] px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="bc-kicker">Suporte parceiro</p>
                <h2 className="text-[clamp(1.25rem,3vw,2rem)] font-black tracking-[-0.045em] text-[color:var(--bc-text)]">
                  Central de ajuda
                </h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Encontre respostas rapidas e canais de suporte para sua rotina como parceiro.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.34)]"
              >
                <X size={14} />
                Fechar
              </button>
            </div>
          </header>

          <div className="grid flex-1 gap-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white/90 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]">
                  <HelpCircle size={16} />
                </span>
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[color:var(--bc-text)]">
                  Ajuda rapida
                </h3>
              </div>

              <div className="space-y-2">
                {partnerHelpCenterFaq.map((item) => {
                  const isOpen = openFaqId === item.id;

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-[1rem] border border-[rgba(120,84,162,0.12)] bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId((current) => (current === item.id ? null : item.id))}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="text-sm font-semibold leading-6 text-[color:var(--bc-text)]">
                          {item.question}
                        </span>
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(120,84,162,0.14)] bg-[rgba(120,84,162,0.06)] text-[color:var(--bc-purple-strong)]">
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="border-t border-[rgba(120,84,162,0.08)] px-4 py-3">
                          <p className="text-sm leading-7 text-[color:var(--bc-muted)]">{item.answer}</p>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="space-y-4">
              <section className="rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white/92 p-4">
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[color:var(--bc-text)]">
                  Acoes rapidas
                </h3>
                <div className="mt-3 grid gap-2">
                  <a
                    href={whatsappSupportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                  >
                    <MessageCircle size={13} />
                    Falar no WhatsApp
                  </a>

                  <a
                    href={`mailto:${support.email}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                  >
                    <Mail size={13} />
                    Enviar e-mail
                  </a>

                  <a
                    href={publicManualUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                  >
                    <FileText size={13} />
                    Ver manual do parceiro
                  </a>

                  <a
                    href={publicPresentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]"
                  >
                    <Presentation size={13} />
                    Ver apresentacao comercial
                  </a>
                </div>
              </section>

              <section className="rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white/92 p-4">
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[color:var(--bc-text)]">
                  Contato de suporte
                </h3>

                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-[rgba(120,84,162,0.12)] bg-white px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">
                      E-mail
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">{support.email}</p>
                  </div>

                  <div className="rounded-xl border border-[rgba(120,84,162,0.12)] bg-white px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">
                      WhatsApp
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">{support.whatsapp}</p>
                  </div>

                  <div className="rounded-xl border border-[rgba(120,84,162,0.12)] bg-white px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">
                      Tempo medio de resposta
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">{support.responseTime}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

