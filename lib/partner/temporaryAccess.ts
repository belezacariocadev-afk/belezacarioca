import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const markerPrefix = '[partner_temporary_access:';
const markerPattern = /\n*\[partner_temporary_access:([A-Za-z0-9_-]+)\]\s*$/;

type EncryptedValue = {
  ciphertext: string;
  iv: string;
  tag: string;
};

export type PartnerTemporaryAccessPayload = {
  authUserId?: string;
  encryptedPassword?: EncryptedValue;
  generatedAt: string;
  viewedAt?: string | null;
  v: 1;
};

function encodeBase64Url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getEncryptionKey() {
  const secret = process.env.PARTNER_TEMP_PASSWORD_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error('Defina PARTNER_TEMP_PASSWORD_SECRET ou SUPABASE_SERVICE_ROLE_KEY para proteger senhas temporarias.');
  }

  return createHash('sha256').update(secret).digest();
}

function encryptPassword(password: string): EncryptedValue {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);

  return {
    ciphertext: encodeBase64Url(ciphertext),
    iv: encodeBase64Url(iv),
    tag: encodeBase64Url(cipher.getAuthTag()),
  };
}

function decryptPassword(value: EncryptedValue) {
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(value.iv, 'base64url'));

  decipher.setAuthTag(Buffer.from(value.tag, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(value.ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function encodePayload(payload: PartnerTemporaryAccessPayload) {
  return encodeBase64Url(JSON.stringify(payload));
}

function decodePayload(value: string): PartnerTemporaryAccessPayload | null {
  try {
    const payload = JSON.parse(decodeBase64Url(value)) as PartnerTemporaryAccessPayload;

    return payload.v === 1 ? payload : null;
  } catch {
    return null;
  }
}

export function generateTemporaryPartnerPassword() {
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%*-_+';
  const all = `${lower}${upper}${digits}${symbols}`;
  const required = [lower, upper, digits, symbols].map((alphabet) => alphabet[randomBytes(1)[0] % alphabet.length]);
  const remaining = Array.from({ length: 8 }, () => all[randomBytes(1)[0] % all.length]);

  return [...required, ...remaining]
    .sort(() => randomBytes(1)[0] - 128)
    .join('');
}

export function stripPartnerTemporaryAccessMarker(reviewNotes: string | null | undefined) {
  const cleanNotes = (reviewNotes ?? '').replace(markerPattern, '').trim();

  return cleanNotes || null;
}

export function readPartnerTemporaryAccess(reviewNotes: string | null | undefined) {
  const match = (reviewNotes ?? '').match(markerPattern);

  if (!match?.[1]) {
    return {
      cleanNotes: stripPartnerTemporaryAccessMarker(reviewNotes),
      payload: null,
    };
  }

  return {
    cleanNotes: stripPartnerTemporaryAccessMarker(reviewNotes),
    payload: decodePayload(match[1]),
  };
}

export function appendPartnerTemporaryAccessMarker(input: {
  authUserId?: string;
  password: string;
  reviewNotes?: string | null;
}) {
  const cleanNotes = stripPartnerTemporaryAccessMarker(input.reviewNotes);
  const payload: PartnerTemporaryAccessPayload = {
    authUserId: input.authUserId,
    encryptedPassword: encryptPassword(input.password),
    generatedAt: new Date().toISOString(),
    viewedAt: null,
    v: 1,
  };
  const marker = `${markerPrefix}${encodePayload(payload)}]`;

  return cleanNotes ? `${cleanNotes}\n\n${marker}` : marker;
}

export function consumePartnerTemporaryPassword(reviewNotes: string | null | undefined) {
  const { cleanNotes, payload } = readPartnerTemporaryAccess(reviewNotes);

  if (!payload?.encryptedPassword || payload.viewedAt) {
    return {
      nextReviewNotes: reviewNotes ?? null,
      password: null,
      viewedAt: payload?.viewedAt ?? null,
    };
  }

  const password = decryptPassword(payload.encryptedPassword);
  const nextPayload: PartnerTemporaryAccessPayload = {
    authUserId: payload.authUserId,
    generatedAt: payload.generatedAt,
    viewedAt: new Date().toISOString(),
    v: 1,
  };
  const nextMarker = `${markerPrefix}${encodePayload(nextPayload)}]`;

  return {
    nextReviewNotes: cleanNotes ? `${cleanNotes}\n\n${nextMarker}` : nextMarker,
    password,
    viewedAt: nextPayload.viewedAt,
  };
}
