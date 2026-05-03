export type PublicPresentationTokenRecord = {
  token: string;
  active: boolean;
  partnerName: string;
  whatsappNumber: string;
  whatsappMessage: string;
};

const rawPublicPresentationTokens: PublicPresentationTokenRecord[] = [
  {
    token: 'demo-beleza-carioca',
    active: true,
    partnerName: 'Parceiro Beleza Carioca',
    whatsappNumber: '5521999990042',
    whatsappMessage:
      'Oi! Acabei de ver a apresentacao comercial da Beleza Carioca e quero saber mais sobre a parceria.',
  },
  {
    token: 'parceiro-alpha',
    active: true,
    partnerName: 'Parceiro Alpha',
    whatsappNumber: '5521999990042',
    whatsappMessage:
      'Oi! Vi a apresentacao comercial da Beleza Carioca enviada pelo parceiro e quero conversar.',
  },
];

export const publicPresentationTokens = rawPublicPresentationTokens.map((item) => ({
  ...item,
  token: normalizeToken(item.token),
}));

function normalizeToken(token: string) {
  return token.trim().toLowerCase();
}

export function getPublicPresentationByToken(token: string) {
  const normalized = normalizeToken(token);
  return publicPresentationTokens.find((item) => item.token === normalized && item.active);
}
