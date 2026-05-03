import type { PartnerReferralSource } from '@/lib/partner/program';

export const partnerReferralStorageKey = 'bc_partner_referral_source_v1';
export const partnerReferralCookieName = 'bc_partner_ref';
export const partnerReferralVisitorStorageKey = 'bc_partner_referral_visitor_v1';

const partnerReferralCookieMaxAgeSeconds = 60 * 60 * 24 * 30;
const referralParamCandidates = ['ref', 'partner', 'parceiro'] as const;

function isBrowser() {
  return typeof window !== 'undefined';
}

function sanitizePartnerCode(rawValue: string) {
  const normalized = rawValue.trim().toUpperCase();

  if (!normalized) {
    return null;
  }

  const cleaned = normalized.replace(/[^A-Z0-9_-]/g, '');

  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, 64);
}

function parseStoredReferralSource(value: string | null): PartnerReferralSource | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as PartnerReferralSource;

    if (!parsed.partnerCode || typeof parsed.partnerCode !== 'string') {
      return null;
    }

    return {
      ...parsed,
      partnerCode: sanitizePartnerCode(parsed.partnerCode) ?? parsed.partnerCode,
      visitorKey: typeof parsed.visitorKey === 'string' ? parsed.visitorKey.slice(0, 120) : undefined,
    };
  } catch {
    return null;
  }
}

function writeReferralCookie(partnerCode: string) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = [
    `${partnerReferralCookieName}=${encodeURIComponent(partnerCode)}`,
    'path=/',
    `max-age=${partnerReferralCookieMaxAgeSeconds}`,
    'samesite=lax',
  ].join('; ');
}

function readReferralCodeFromCookie() {
  if (!isBrowser()) {
    return null;
  }

  const encodedName = `${partnerReferralCookieName}=`;
  const targetCookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(encodedName));

  if (!targetCookie) {
    return null;
  }

  const value = decodeURIComponent(targetCookie.slice(encodedName.length));
  return sanitizePartnerCode(value);
}

function readReferralSourceFromStorage() {
  if (!isBrowser()) {
    return null;
  }

  return parseStoredReferralSource(window.localStorage.getItem(partnerReferralStorageKey));
}

function generateVisitorKey() {
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return `visitor-${seed}`;
}

export function getOrCreatePartnerReferralVisitorKey() {
  if (!isBrowser()) {
    return undefined;
  }

  const current = window.localStorage.getItem(partnerReferralVisitorStorageKey);

  if (current) {
    return current;
  }

  const generated = generateVisitorKey();
  window.localStorage.setItem(partnerReferralVisitorStorageKey, generated);

  return generated;
}

export function extractPartnerCodeFromSearchParams(searchParams: URLSearchParams) {
  for (const paramName of referralParamCandidates) {
    const value = searchParams.get(paramName);
    const code = value ? sanitizePartnerCode(value) : null;

    if (code) {
      return { code, paramName };
    }
  }

  return null;
}

export function persistPartnerReferralSource(source: PartnerReferralSource) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(partnerReferralStorageKey, JSON.stringify(source));
  writeReferralCookie(source.partnerCode);
}

export function capturePartnerReferralFromSearchParams(searchParams: URLSearchParams, pathname: string) {
  const detected = extractPartnerCodeFromSearchParams(searchParams);

  if (!detected) {
    return null;
  }

  const source: PartnerReferralSource = {
    capturedAt: new Date().toISOString(),
    channel: 'queryParam',
    landingPath: pathname,
    partnerCode: detected.code,
    queryParam: detected.paramName,
    visitorKey: getOrCreatePartnerReferralVisitorKey(),
  };

  persistPartnerReferralSource(source);
  return source;
}

export function readPartnerReferralSource() {
  const fromStorage = readReferralSourceFromStorage();

  if (fromStorage?.partnerCode) {
    return fromStorage;
  }

  const codeFromCookie = readReferralCodeFromCookie();

  if (!codeFromCookie) {
    return null;
  }

  return {
    capturedAt: new Date().toISOString(),
    channel: 'unknown',
    partnerCode: codeFromCookie,
    visitorKey: getOrCreatePartnerReferralVisitorKey(),
  } satisfies PartnerReferralSource;
}

export function clearPartnerReferralSource() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(partnerReferralStorageKey);
  document.cookie = `${partnerReferralCookieName}=; path=/; max-age=0; samesite=lax`;
}
