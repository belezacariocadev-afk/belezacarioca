import { normalizeSubscriptionCommercialState } from '@/lib/platform/billing/commercial-access-policy';
import type { SubscriptionPlanChoice } from '@/lib/platform/billing/subscription-intent';
import type { SubscriptionRecord } from '@/lib/platform/domain';

export const localSubscriptionCookieName = 'bc_local_subscription';
export const localSubscriptionCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

function encodeBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeBase64Url(input: string) {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function createLocalSubscriptionRecord(
  plan: SubscriptionPlanChoice,
  salonId: string,
  now = new Date(),
): SubscriptionRecord {
  const planId = plan === 'annual' ? 'premium' : 'growth';
  const periodLengthMs =
    plan === 'annual'
      ? 365 * 24 * 60 * 60 * 1000
      : plan === 'quarterly'
      ? 90 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;
  const currentPeriodEnd = new Date(now.getTime() + periodLengthMs).toISOString();

  return normalizeSubscriptionCommercialState({
    id: `subscription-${plan}-${now.getTime()}`,
    salonId,
    plan: planId,
    status: 'active',
    billingCycle: plan,
    currentPeriodEnd,
  });
}

export function serializeLocalSubscriptionCookie(subscription: SubscriptionRecord): string {
  return encodeBase64Url(JSON.stringify(subscription));
}

export function parseLocalSubscriptionCookie(cookieValue: string | null): SubscriptionRecord | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(cookieValue);
    const parsed = JSON.parse(decoded) as SubscriptionRecord;

    if (!parsed || typeof parsed !== 'object' || !parsed.id || !parsed.salonId || !parsed.plan) {
      return null;
    }

    return normalizeSubscriptionCommercialState(parsed);
  } catch {
    return null;
  }
}

export function readLocalSubscriptionFromRequest(request: Request): SubscriptionRecord | null {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookieValue = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${localSubscriptionCookieName}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  return parseLocalSubscriptionCookie(cookieValue ?? null);
}
