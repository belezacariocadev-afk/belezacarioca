import { publicManualTokens } from './publicManualTokens';

export const DEFAULT_PUBLIC_MANUAL_TOKEN =
  publicManualTokens.find((item) => item.active)?.token ?? 'demo-manual-beleza-carioca';

export const MANUAL_WHATSAPP_MESSAGE_TEMPLATE =
  'Ola! Segue o Manual do Parceiro da Beleza Carioca para voce consultar os passos, materiais e orientacoes de uso:\n[LINK_DO_MANUAL]\n\nSe precisar, posso te ajudar com os proximos passos.';

type BuildManualLinkOptions = {
  origin?: string;
  token?: string;
};

function normalizeOrigin(origin?: string) {
  if (!origin) {
    return '';
  }

  return origin.endsWith('/') ? origin.slice(0, -1) : origin;
}

export function buildPublicManualPath(token = DEFAULT_PUBLIC_MANUAL_TOKEN) {
  return `/manual/${encodeURIComponent(token)}`;
}

export function buildPublicManualUrl({
  origin,
  token = DEFAULT_PUBLIC_MANUAL_TOKEN,
}: BuildManualLinkOptions = {}) {
  const path = buildPublicManualPath(token);
  const base = normalizeOrigin(origin);
  return base ? `${base}${path}` : path;
}

export function buildManualWhatsappUrl({
  origin,
  token = DEFAULT_PUBLIC_MANUAL_TOKEN,
}: BuildManualLinkOptions = {}) {
  const manualUrl = buildPublicManualUrl({ origin, token });
  const message = MANUAL_WHATSAPP_MESSAGE_TEMPLATE.replace('[LINK_DO_MANUAL]', manualUrl);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

