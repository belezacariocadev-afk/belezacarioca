import { publicPresentationTokens } from './publicPresentationTokens';

export const DEFAULT_PUBLIC_PRESENTATION_TOKEN =
  publicPresentationTokens.find((item) => item.active)?.token ?? 'demo-beleza-carioca';

export const PRESENTATION_WHATSAPP_MESSAGE_TEMPLATE =
  'Ola! Separei uma apresentacao rapida para voce conhecer melhor a Beleza Carioca:\n[LINK_DA_APRESENTACAO]\n\nSe quiser, posso te explicar como funciona.';

type BuildPresentationLinkOptions = {
  origin?: string;
  token?: string;
};

function normalizeOrigin(origin?: string) {
  if (!origin) {
    return '';
  }

  return origin.endsWith('/') ? origin.slice(0, -1) : origin;
}

export function buildPublicPresentationPath(token = DEFAULT_PUBLIC_PRESENTATION_TOKEN) {
  return `/apresentacao/${encodeURIComponent(token)}`;
}

export function buildPublicPresentationUrl({
  origin,
  token = DEFAULT_PUBLIC_PRESENTATION_TOKEN,
}: BuildPresentationLinkOptions = {}) {
  const path = buildPublicPresentationPath(token);
  const base = normalizeOrigin(origin);
  return base ? `${base}${path}` : path;
}

export function buildPresentationWhatsappUrl({
  origin,
  token = DEFAULT_PUBLIC_PRESENTATION_TOKEN,
}: BuildPresentationLinkOptions = {}) {
  const presentationUrl = buildPublicPresentationUrl({ origin, token });
  const message = PRESENTATION_WHATSAPP_MESSAGE_TEMPLATE.replace(
    '[LINK_DA_APRESENTACAO]',
    presentationUrl,
  );

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
