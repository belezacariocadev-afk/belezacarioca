export type PublicManualTokenRecord = {
  token: string;
  active: boolean;
  partnerName: string;
};

const rawPublicManualTokens: PublicManualTokenRecord[] = [
  {
    token: 'demo-manual-beleza-carioca',
    active: true,
    partnerName: 'Parceiro Beleza Carioca',
  },
  {
    token: 'onboarding-parceiros',
    active: true,
    partnerName: 'Time de Parcerias',
  },
];

export const publicManualTokens = rawPublicManualTokens.map((item) => ({
  ...item,
  token: normalizeToken(item.token),
}));

function normalizeToken(token: string) {
  return token.trim().toLowerCase();
}

export function getPublicManualByToken(token: string) {
  const normalized = normalizeToken(token);
  return publicManualTokens.find((item) => item.token === normalized && item.active);
}

