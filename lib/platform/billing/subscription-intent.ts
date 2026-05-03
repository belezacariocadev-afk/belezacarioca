import type { CommercialAccessReason, CommercialAccessResult } from '@/lib/platform/billing/commercial-access-policy';
import type { PartnerReferralSource } from '@/lib/partner/program';
import type { PersistPartnerAttributionResult } from '@/lib/partner/persistence';

export const subscriptionIntentStorageKey = 'bc_subscription_intents_v1';

export type SubscriptionPlanChoice = 'monthly' | 'quarterly' | 'annual';

export type SubscriptionIntentStatus = 'pendingContact' | 'sentToCheckout' | 'converted' | 'paid' | 'confirmed' | 'cancelled';

export type SubscriptionIntentRecord = {
  id: string;
  actorId: string;
  commercialAccess?: CommercialAccessResult;
  createdAt: string;
  email: string;
  profileId: string;
  reason?: CommercialAccessReason | string;
  salonId: string;
  selectedPlan: SubscriptionPlanChoice;
  partnerReferralSource?: PartnerReferralSource;
  source: 'subscriptionPage';
  status: SubscriptionIntentStatus;
  updatedAt: string;
};

type CreateSubscriptionIntentInput = {
  actorId: string;
  commercialAccess?: CommercialAccessResult;
  email: string;
  profileId: string;
  reason?: CommercialAccessReason | string | null;
  salonId: string;
  selectedPlan: SubscriptionPlanChoice;
  partnerReferralSource?: PartnerReferralSource;
};

export type SubscriptionIntentPayload = {
  intent: SubscriptionIntentRecord;
  partnerAttribution?: PersistPartnerAttributionResult;
  persistedTo: 'local' | 'supabase';
};

export function isSubscriptionPlanChoice(value: unknown): value is SubscriptionPlanChoice {
  return value === 'monthly' || value === 'quarterly' || value === 'annual';
}

export function createSubscriptionIntentRecord(input: CreateSubscriptionIntentInput, now: Date = new Date()): SubscriptionIntentRecord {
  const timestamp = now.toISOString();

  return {
    id: crypto.randomUUID(),
    actorId: input.actorId,
    commercialAccess: input.commercialAccess,
    createdAt: timestamp,
    email: input.email,
    profileId: input.profileId,
    reason: input.reason ?? input.commercialAccess?.reason,
    salonId: input.salonId,
    selectedPlan: input.selectedPlan,
    partnerReferralSource: input.partnerReferralSource,
    source: 'subscriptionPage',
    status: 'pendingContact',
    updatedAt: timestamp,
  };
}
