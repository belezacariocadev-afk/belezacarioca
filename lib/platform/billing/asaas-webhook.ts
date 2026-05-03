import { createHash, randomUUID } from 'crypto';

import { createPartnerCommissionEvent } from '@/lib/partner/commissionEvents';
import { calculatePartnerCommission } from '@/lib/partner/commissionRules';
import { canUsePartnerPersistence } from '@/lib/partner/persistence';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type AsaasWebhookPayload = Record<string, unknown> & {
  data?: Record<string, unknown>;
  event?: string;
  id?: number | string;
  payment?: Record<string, unknown>;
  subscription?: Record<string, unknown>;
};

type AsaasPayment = {
  billingType?: string;
  clientPaymentDate?: string;
  confirmedDate?: string;
  customer?: string;
  id: string;
  paymentDate?: string;
  status?: string;
  subscription?: string;
  value?: number | string;
};

type AsaasSubscription = {
  customer?: string;
  id: string;
  nextDueDate?: string;
  status?: string;
};

type AsaasWebhookEventRow = {
  created_at: string;
  error_message: string | null;
  event_name: string;
  id: string;
  payment_id: string | null;
  payload: Record<string, unknown>;
  processed_at: string | null;
  processing_status: 'error' | 'ignored' | 'processed' | 'processing';
  provider_event_id: string;
  received_at: string;
  subscription_external_id: string | null;
  updated_at: string;
};

type ChargeRow = {
  amount_cents: number;
  asaas_payment_id?: string | null;
  checkout_url?: string | null;
  id: string;
  paid_at: string | null;
  payment_method: 'card' | 'cash' | 'manualPending' | 'pix' | null;
  provider_charge_id: string | null;
  salon_id: string;
  status: 'cancelled' | 'draft' | 'overdue' | 'paid' | 'pending' | 'refunded';
  subscription_intent_id?: string | null;
  subscription_id: string | null;
};

type SubscriptionRow = {
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
  billing_cycle: 'annual' | 'monthly' | 'quarterly' | null;
  id: string;
  plan: 'growth' | 'premium' | 'starter';
  salon_id: string;
  status: 'active' | 'cancelled' | 'pastDue' | 'trialing';
};

type PartnerConversionRow = {
  conversion_status: 'canceled' | 'clicked' | 'paid' | 'qualified' | 'registered' | 'subscribed';
  first_paid_at: string | null;
  id: string;
  partner_id: string;
  payment_status: 'canceled' | 'confirmed' | 'failed' | 'pending' | 'refunded' | null;
  referral_id: string | null;
  salon_id: string;
  subscription_status: 'active' | 'cancelled' | 'none' | 'pastDue' | 'trialing' | null;
};

type PartnerReferralRow = {
  id: string;
  referral_code: string;
};

type PartnerCommissionRow = {
  amount: string | null;
  canceled_at: string | null;
  conversion_id: string | null;
  currency: string;
  generated_at: string | null;
  id: string;
  paid_at: string | null;
  rule_snapshot: Record<string, unknown> | null;
  status: 'approved' | 'canceled' | 'paid' | 'pending';
};

type SubscriptionIntentRow = {
  amount_cents?: number | null;
  id: string;
  plan_label?: string | null;
  professional_range?: string | null;
  salon_id: string;
  selected_plan: 'annual' | 'monthly' | 'quarterly';
  status?: 'cancelled' | 'confirmed' | 'converted' | 'paid' | 'pendingContact' | 'sentToCheckout';
};

type BillingContext = {
  asaasPaymentId?: string;
  asaasSubscriptionId?: string;
  charge: ChargeRow | null;
  payment: AsaasPayment | null;
  salonId: string;
  subscription: SubscriptionRow | null;
};

export type AsaasWebhookProcessResult = {
  classification:
    | 'payment_confirmed'
    | 'payment_failed'
    | 'payment_refunded'
    | 'subscription_canceled'
    | 'subscription_updated'
    | 'unsupported';
  conversionUpdated: boolean;
  eventName: string;
  providerEventId: string;
  status: 'duplicate' | 'ignored' | 'processed';
};

const confirmedPaymentEvents = new Set(['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']);
const failedPaymentEvents = new Set(['PAYMENT_DELETED', 'PAYMENT_OVERDUE', 'PAYMENT_REPROVED']);
const refundedPaymentEvents = new Set([
  'PAYMENT_CHARGEBACK_DISPUTE',
  'PAYMENT_CHARGEBACK_REQUESTED',
  'PAYMENT_PARTIALLY_REFUNDED',
  'PAYMENT_REFUNDED',
]);
const subscriptionUpdatedEvents = new Set(['SUBSCRIPTION_CREATED', 'SUBSCRIPTION_REACTIVATED', 'SUBSCRIPTION_UPDATED']);
const subscriptionCanceledEvents = new Set(['SUBSCRIPTION_DELETED', 'SUBSCRIPTION_INACTIVATED']);

const webhookSelect =
  'id,provider_event_id,event_name,payment_id,subscription_external_id,processing_status,payload,received_at,processed_at,error_message,created_at,updated_at';
const chargeSelect =
  'id,salon_id,subscription_id,subscription_intent_id,status,provider_charge_id,asaas_payment_id,checkout_url,amount_cents,paid_at,payment_method';
const subscriptionSelect =
  'id,salon_id,status,plan,billing_cycle,asaas_subscription_id,asaas_customer_id';
const conversionSelect =
  'id,partner_id,salon_id,referral_id,conversion_status,subscription_status,payment_status,first_paid_at';
const commissionSelect = 'id,conversion_id,status,amount,currency,generated_at,paid_at,canceled_at,rule_snapshot';

function normalizeEventName(value: unknown) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function parseAsaasPayment(payload: AsaasWebhookPayload): AsaasPayment | null {
  const candidate = payload.payment ?? payload.data;

  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const id = typeof candidate.id === 'string' ? candidate.id : null;

  if (!id) {
    return null;
  }

  return {
    billingType: typeof candidate.billingType === 'string' ? candidate.billingType : undefined,
    clientPaymentDate: typeof candidate.clientPaymentDate === 'string' ? candidate.clientPaymentDate : undefined,
    confirmedDate: typeof candidate.confirmedDate === 'string' ? candidate.confirmedDate : undefined,
    customer: typeof candidate.customer === 'string' ? candidate.customer : undefined,
    id,
    paymentDate: typeof candidate.paymentDate === 'string' ? candidate.paymentDate : undefined,
    status: typeof candidate.status === 'string' ? candidate.status : undefined,
    subscription: typeof candidate.subscription === 'string' ? candidate.subscription : undefined,
    value: typeof candidate.value === 'number' || typeof candidate.value === 'string' ? candidate.value : undefined,
  };
}

function parseAsaasSubscription(payload: AsaasWebhookPayload): AsaasSubscription | null {
  const candidate = payload.subscription ?? payload.data;

  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const id = typeof candidate.id === 'string' ? candidate.id : null;

  if (!id) {
    return null;
  }

  return {
    customer: typeof candidate.customer === 'string' ? candidate.customer : undefined,
    id,
    nextDueDate: typeof candidate.nextDueDate === 'string' ? candidate.nextDueDate : undefined,
    status: typeof candidate.status === 'string' ? candidate.status : undefined,
  };
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function toCents(value: unknown) {
  if (typeof value === 'number') {
    return Math.max(0, Math.round(value * 100));
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);

    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.round(parsed * 100));
    }
  }

  return 0;
}

function deriveProviderEventId(payload: AsaasWebhookPayload, eventName: string, payment: AsaasPayment | null, subscription: AsaasSubscription | null) {
  if (typeof payload.id === 'string' || typeof payload.id === 'number') {
    return `asaas-event-${String(payload.id)}`;
  }

  const fingerprintSource = JSON.stringify({
    eventName,
    paymentId: payment?.id ?? null,
    paymentStatus: payment?.status ?? null,
    paymentSubscription: payment?.subscription ?? null,
    paymentValue: payment?.value ?? null,
    subscriptionId: subscription?.id ?? null,
    subscriptionStatus: subscription?.status ?? null,
  });

  return `asaas-fp-${createHash('sha256').update(fingerprintSource).digest('hex')}`;
}

function classifyEvent(eventName: string): AsaasWebhookProcessResult['classification'] {
  if (confirmedPaymentEvents.has(eventName)) {
    return 'payment_confirmed';
  }

  if (failedPaymentEvents.has(eventName)) {
    return 'payment_failed';
  }

  if (refundedPaymentEvents.has(eventName)) {
    return 'payment_refunded';
  }

  if (subscriptionCanceledEvents.has(eventName)) {
    return 'subscription_canceled';
  }

  if (subscriptionUpdatedEvents.has(eventName)) {
    return 'subscription_updated';
  }

  return 'unsupported';
}

function mapSubscriptionStatusFromAsaas(value?: string | null): SubscriptionRow['status'] | null {
  const normalized = value?.trim().toUpperCase();

  if (!normalized) {
    return null;
  }

  if (['ACTIVE', 'RECEIVED'].includes(normalized)) {
    return 'active';
  }

  if (['OVERDUE', 'PENDING', 'SUSPENDED'].includes(normalized)) {
    return 'pastDue';
  }

  if (['TRIALING', 'TRIAL'].includes(normalized)) {
    return 'trialing';
  }

  if (['INACTIVE', 'CANCELLED', 'CANCELED', 'DELETED', 'EXPIRED'].includes(normalized)) {
    return 'cancelled';
  }

  return null;
}

function mapSubscriptionStatusByEvent(input: {
  classification: AsaasWebhookProcessResult['classification'];
  eventName: string;
  paymentStatus?: string;
  subscriptionStatus?: string;
}): SubscriptionRow['status'] | null {
  if (input.classification === 'payment_confirmed') {
    return 'active';
  }

  if (input.classification === 'payment_failed' || input.classification === 'payment_refunded') {
    return 'pastDue';
  }

  if (input.classification === 'subscription_canceled') {
    return 'cancelled';
  }

  if (input.classification === 'subscription_updated') {
    return mapSubscriptionStatusFromAsaas(input.subscriptionStatus) ?? mapSubscriptionStatusFromAsaas(input.paymentStatus);
  }

  return null;
}

function mapChargeStatus(input: {
  classification: AsaasWebhookProcessResult['classification'];
  paymentStatus?: string;
}): ChargeRow['status'] {
  if (input.classification === 'payment_confirmed') {
    return 'paid';
  }

  if (input.classification === 'payment_failed') {
    return 'overdue';
  }

  if (input.classification === 'payment_refunded') {
    return 'refunded';
  }

  const normalized = input.paymentStatus?.trim().toUpperCase();

  if (['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'].includes(normalized ?? '')) {
    return 'paid';
  }

  if (['OVERDUE'].includes(normalized ?? '')) {
    return 'overdue';
  }

  if (['REFUNDED', 'CHARGEBACK_REQUESTED'].includes(normalized ?? '')) {
    return 'refunded';
  }

  if (['DELETED', 'CANCELED', 'CANCELLED'].includes(normalized ?? '')) {
    return 'cancelled';
  }

  return 'pending';
}

function mapPaymentMethod(billingType?: string): ChargeRow['payment_method'] {
  const normalized = billingType?.trim().toUpperCase();

  if (normalized === 'PIX') {
    return 'pix';
  }

  if (normalized === 'CREDIT_CARD' || normalized === 'DEBIT_CARD') {
    return 'card';
  }

  if (normalized === 'CASH') {
    return 'cash';
  }

  return 'manualPending';
}

function resolvePaymentConfirmedAt(payment: AsaasPayment | null) {
  return (
    parseDate(payment?.confirmedDate) ??
    parseDate(payment?.paymentDate) ??
    parseDate(payment?.clientPaymentDate) ??
    null
  );
}

function amountToDecimal(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

async function findWebhookEventByProviderEventId(providerEventId: string) {
  const rows = await supabaseRestRequest<AsaasWebhookEventRow[]>('asaas_webhook_events', {
    query: `provider_event_id=eq.${encodeURIComponent(providerEventId)}&select=${webhookSelect}&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function upsertWebhookEvent(input: {
  eventName: string;
  paymentId?: string;
  payload: AsaasWebhookPayload;
  processingStatus: AsaasWebhookEventRow['processing_status'];
  providerEventId: string;
  receivedAt: string;
  subscriptionExternalId?: string;
}) {
  const rows = await supabaseRestRequest<AsaasWebhookEventRow[]>('asaas_webhook_events', {
    body: [
      {
        error_message: null,
        event_name: input.eventName,
        payment_id: input.paymentId ?? null,
        payload: input.payload,
        processed_at: null,
        processing_status: input.processingStatus,
        provider_event_id: input.providerEventId,
        received_at: input.receivedAt,
        subscription_external_id: input.subscriptionExternalId ?? null,
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    query: 'on_conflict=provider_event_id',
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function updateWebhookEventStatus(input: {
  errorMessage?: string | null;
  eventRowId: string;
  processedAt?: string | null;
  processingStatus: AsaasWebhookEventRow['processing_status'];
}) {
  await supabaseRestRequest<AsaasWebhookEventRow[]>('asaas_webhook_events', {
    body: {
      error_message: input.errorMessage ?? null,
      processed_at: input.processedAt ?? null,
      processing_status: input.processingStatus,
    },
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(input.eventRowId)}`,
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

async function findChargeByProviderPaymentId(paymentId: string) {
  const rows = await supabaseRestRequest<ChargeRow[]>('charges', {
    query: `provider=eq.asaas&provider_charge_id=eq.${encodeURIComponent(paymentId)}&select=${chargeSelect}&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function findSubscriptionByAsaasExternalId(asaasSubscriptionId: string) {
  const rows = await supabaseRestRequest<SubscriptionRow[]>('subscriptions', {
    query: `asaas_subscription_id=eq.${encodeURIComponent(asaasSubscriptionId)}&select=${subscriptionSelect}&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function findSubscriptionById(subscriptionId: string) {
  const rows = await supabaseRestRequest<SubscriptionRow[]>('subscriptions', {
    query: `id=eq.${encodeURIComponent(subscriptionId)}&select=${subscriptionSelect}&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function findLatestSubscriptionBySalonId(salonId: string) {
  const rows = await supabaseRestRequest<SubscriptionRow[]>('subscriptions', {
    query: `salon_id=eq.${encodeURIComponent(salonId)}&select=${subscriptionSelect}&order=updated_at.desc&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function updateSubscription(input: {
  asaasCustomerId?: string | null;
  asaasSubscriptionId?: string | null;
  status?: SubscriptionRow['status'] | null;
  subscriptionId: string;
}) {
  const patch: Record<string, unknown> = {};

  if (input.status) {
    patch.status = input.status;
  }

  if (input.asaasCustomerId) {
    patch.asaas_customer_id = input.asaasCustomerId;
  }

  if (input.asaasSubscriptionId) {
    patch.asaas_subscription_id = input.asaasSubscriptionId;
  }

  if (Object.keys(patch).length === 0) {
    return;
  }

  await supabaseRestRequest<SubscriptionRow[]>('subscriptions', {
    body: patch,
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(input.subscriptionId)}`,
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

async function upsertCharge(input: {
  amountCents: number;
  chargeId: string;
  paidAt: string | null;
  paymentMethod: ChargeRow['payment_method'];
  providerChargeId: string;
  salonId: string;
  status: ChargeRow['status'];
  subscriptionId: string | null;
}) {
  await supabaseRestRequest<ChargeRow[]>('charges', {
    body: [
      {
        amount_cents: input.amountCents,
        id: input.chargeId,
        origin: 'subscription',
        paid_at: input.paidAt,
        payment_method: input.paymentMethod,
        provider: 'asaas',
        asaas_payment_id: input.providerChargeId,
        provider_charge_id: input.providerChargeId,
        salon_id: input.salonId,
        status: input.status,
        subscription_id: input.subscriptionId,
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    query: 'on_conflict=id',
    useServiceRole: true,
  });
}

async function patchCharge(input: {
  amountCents: number;
  chargeId: string;
  paidAt: string | null;
  paymentMethod: ChargeRow['payment_method'];
  providerChargeId: string;
  status: ChargeRow['status'];
  subscriptionId: string | null;
}) {
  await supabaseRestRequest<ChargeRow[]>('charges', {
    body: {
      amount_cents: input.amountCents,
      asaas_payment_id: input.providerChargeId,
      paid_at: input.paidAt,
      payment_method: input.paymentMethod,
      provider_charge_id: input.providerChargeId,
      status: input.status,
      subscription_id: input.subscriptionId,
    },
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(input.chargeId)}`,
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

async function resolveBillingContext(payload: AsaasWebhookPayload): Promise<BillingContext | null> {
  const payment = parseAsaasPayment(payload);
  const subscriptionFromPayload = parseAsaasSubscription(payload);
  const asaasPaymentId = payment?.id;
  const asaasSubscriptionId = payment?.subscription ?? subscriptionFromPayload?.id;
  const charge = asaasPaymentId ? await findChargeByProviderPaymentId(asaasPaymentId) : null;

  let subscription =
    (asaasSubscriptionId ? await findSubscriptionByAsaasExternalId(asaasSubscriptionId) : null) ??
    (charge?.subscription_id ? await findSubscriptionById(charge.subscription_id) : null) ??
    (charge?.salon_id ? await findLatestSubscriptionBySalonId(charge.salon_id) : null);

  if (!subscription && subscriptionFromPayload?.id) {
    subscription = await findSubscriptionByAsaasExternalId(subscriptionFromPayload.id);
  }

  const salonId = subscription?.salon_id ?? charge?.salon_id;

  if (!salonId) {
    return null;
  }

  return {
    asaasPaymentId,
    asaasSubscriptionId: asaasSubscriptionId ?? undefined,
    charge,
    payment,
    salonId,
    subscription,
  };
}

async function findPrimaryPartnerConversionBySalonId(salonId: string) {
  const rows = await supabaseRestRequest<PartnerConversionRow[]>('partner_conversions', {
    query: `salon_id=eq.${encodeURIComponent(salonId)}&select=${conversionSelect}&order=created_at.asc&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function patchPartnerConversion(
  conversionId: string,
  patch: Partial<Pick<PartnerConversionRow, 'conversion_status' | 'first_paid_at' | 'payment_status' | 'subscription_status'>>,
) {
  await supabaseRestRequest<PartnerConversionRow[]>('partner_conversions', {
    body: patch,
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(conversionId)}`,
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

async function findPartnerReferralById(referralId: string) {
  const rows = await supabaseRestRequest<PartnerReferralRow[]>('partner_referrals', {
    query: `id=eq.${encodeURIComponent(referralId)}&select=id,referral_code&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function findLatestSubscriptionIntentPlan(salonId: string, partnerCode?: string | null) {
  const intent = await findLatestSubscriptionIntent(salonId, partnerCode);

  return intent?.selected_plan;
}

async function findLatestSubscriptionIntent(salonId: string, partnerCode?: string | null) {
  const base = [
    `salon_id=eq.${encodeURIComponent(salonId)}`,
    'select=id,salon_id,selected_plan,status,amount_cents,professional_range,plan_label',
    'order=created_at.desc',
    'limit=1',
  ];

  if (partnerCode) {
    base.unshift(`partner_referral_code=eq.${encodeURIComponent(partnerCode)}`);
  }

  const rows = await supabaseRestRequest<SubscriptionIntentRow[]>('subscription_intents', {
    query: base.join('&'),
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function findSubscriptionIntentById(intentId: string) {
  const rows = await supabaseRestRequest<SubscriptionIntentRow[]>('subscription_intents', {
    query: `id=eq.${encodeURIComponent(intentId)}&select=id,salon_id,selected_plan,status,amount_cents,professional_range,plan_label&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function findCommissionByConversionId(conversionId: string) {
  const rows = await supabaseRestRequest<PartnerCommissionRow[]>('partner_commissions', {
    query: `conversion_id=eq.${encodeURIComponent(conversionId)}&select=${commissionSelect}&limit=1`,
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function upsertCommission(input: {
  amountCents: number;
  conversion: PartnerConversionRow;
  eventName: string;
  generatedAt: string;
  paymentId?: string;
  providerEventId: string;
  selectedPlan?: 'annual' | 'monthly' | 'quarterly';
  status: 'approved' | 'paid';
  subscriptionExternalId?: string;
}) {
  const calculation = calculatePartnerCommission({
    paymentAmountCents: input.amountCents,
    selectedPlan: input.selectedPlan,
  });

  if (!calculation.isEligible) {
    return null;
  }

  const rows = await supabaseRestRequest<PartnerCommissionRow[]>('partner_commissions', {
    body: [
      {
        amount: amountToDecimal(calculation.amountCents),
        canceled_at: null,
        conversion_id: input.conversion.id,
        currency: calculation.currency,
        generated_at: input.generatedAt,
        paid_at: input.status === 'paid' ? input.generatedAt : null,
        partner_id: input.conversion.partner_id,
        rule_snapshot: {
          ...calculation.ruleSnapshot,
          asaas_event_name: input.eventName,
          asaas_payment_id: input.paymentId ?? null,
          asaas_subscription_id: input.subscriptionExternalId ?? null,
          provider_event_id: input.providerEventId,
          trigger: 'financial_confirmation_webhook',
        },
        salon_id: input.conversion.salon_id,
        status: input.status,
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    query: 'on_conflict=conversion_id',
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function upsertCommissionForManualReview(input: {
  conversion: PartnerConversionRow;
  eventName: string;
  notes: string;
  paymentId?: string;
  providerEventId: string;
  selectedPlan?: 'annual' | 'monthly' | 'quarterly';
  subscriptionExternalId?: string;
}) {
  const rows = await supabaseRestRequest<PartnerCommissionRow[]>('partner_commissions', {
    body: [
      {
        amount: null,
        canceled_at: null,
        conversion_id: input.conversion.id,
        currency: 'BRL',
        generated_at: null,
        paid_at: null,
        partner_id: input.conversion.partner_id,
        rule_snapshot: {
          asaas_event_name: input.eventName,
          asaas_payment_id: input.paymentId ?? null,
          asaas_subscription_id: input.subscriptionExternalId ?? null,
          manual_review_required: true,
          notes: input.notes,
          provider_event_id: input.providerEventId,
          selected_plan: input.selectedPlan ?? null,
          trigger: 'financial_confirmation_webhook',
        },
        salon_id: input.conversion.salon_id,
        status: 'pending',
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    query: 'on_conflict=conversion_id',
    useServiceRole: true,
  });

  return rows[0] ?? null;
}

async function patchCommission(input: {
  commissionId: string;
  patch: Partial<Pick<PartnerCommissionRow, 'amount' | 'canceled_at' | 'paid_at' | 'rule_snapshot' | 'status'>>;
}) {
  await supabaseRestRequest<PartnerCommissionRow[]>('partner_commissions', {
    body: input.patch,
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(input.commissionId)}`,
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

function buildConversionPatch(input: {
  classification: AsaasWebhookProcessResult['classification'];
  conversion: PartnerConversionRow;
  subscriptionStatus: SubscriptionRow['status'] | null;
  confirmedAt: string | null;
}) {
  if (input.classification === 'payment_confirmed') {
    return {
      conversion_status: 'paid' as const,
      first_paid_at: input.conversion.first_paid_at ?? input.confirmedAt,
      payment_status: 'confirmed' as const,
      subscription_status: (input.subscriptionStatus ?? 'active') as PartnerConversionRow['subscription_status'],
    };
  }

  if (input.classification === 'payment_failed') {
    return {
      conversion_status: 'subscribed' as const,
      payment_status: 'failed' as const,
      subscription_status: (input.subscriptionStatus ?? 'pastDue') as PartnerConversionRow['subscription_status'],
    };
  }

  if (input.classification === 'payment_refunded') {
    return {
      conversion_status: 'canceled' as const,
      payment_status: 'refunded' as const,
      subscription_status: (input.subscriptionStatus ?? 'pastDue') as PartnerConversionRow['subscription_status'],
    };
  }

  if (input.classification === 'subscription_canceled') {
    return {
      conversion_status: 'canceled' as const,
      payment_status: (input.conversion.payment_status ?? 'canceled') as PartnerConversionRow['payment_status'],
      subscription_status: (input.subscriptionStatus ?? 'cancelled') as PartnerConversionRow['subscription_status'],
    };
  }

  if (input.classification === 'subscription_updated' && input.subscriptionStatus) {
    return {
      subscription_status: input.subscriptionStatus as PartnerConversionRow['subscription_status'],
    };
  }

  return null;
}

async function syncPartnerByFinancialEvent(input: {
  classification: AsaasWebhookProcessResult['classification'];
  context: BillingContext;
  eventName: string;
  providerEventId: string;
}) {
  if (!canUsePartnerPersistence()) {
    return false;
  }

  const conversion = await findPrimaryPartnerConversionBySalonId(input.context.salonId);

  if (!conversion) {
    return false;
  }

  const confirmedAt = resolvePaymentConfirmedAt(input.context.payment);
  const subscriptionStatus = mapSubscriptionStatusByEvent({
    classification: input.classification,
    eventName: input.eventName,
    paymentStatus: input.context.payment?.status,
    subscriptionStatus: input.context.subscription?.status,
  });
  const conversionPatch = buildConversionPatch({
    classification: input.classification,
    confirmedAt,
    conversion,
    subscriptionStatus,
  });

  if (conversionPatch) {
    await patchPartnerConversion(conversion.id, conversionPatch);
  }

  const existingCommission = await findCommissionByConversionId(conversion.id);

  if (input.classification === 'payment_confirmed') {
    const referral = conversion.referral_id ? await findPartnerReferralById(conversion.referral_id) : null;
    const selectedPlan = await findLatestSubscriptionIntentPlan(input.context.salonId, referral?.referral_code);
    const amountCents = Math.max(
      toCents(input.context.payment?.value),
      input.context.charge?.amount_cents ?? 0,
    );
    const targetStatus: 'approved' | 'paid' = existingCommission?.status === 'paid' ? 'paid' : 'approved';
    const generatedAt = confirmedAt ?? new Date().toISOString();
    if (amountCents <= 0) {
      const manualReviewNotes =
        'Pagamento confirmado sem valor financeiro confiavel para calcular a comissao automaticamente.';
      const reviewCommission =
        existingCommission?.status === 'paid'
          ? existingCommission
          : await upsertCommissionForManualReview({
              conversion,
              eventName: input.eventName,
              notes: manualReviewNotes,
              paymentId: input.context.asaasPaymentId,
              providerEventId: input.providerEventId,
              selectedPlan,
              subscriptionExternalId: input.context.asaasSubscriptionId,
            });

      if (reviewCommission) {
        const isAlreadyPaid = reviewCommission.status === 'paid';
        await createPartnerCommissionEvent({
          commissionId: reviewCommission.id,
          eventType: isAlreadyPaid ? 'financial_alert' : 'manual_review_required',
          metadata: {
            asaas_event_name: input.eventName,
            asaas_payment_id: input.context.asaasPaymentId ?? null,
            provider_event_id: input.providerEventId,
            selected_plan: selectedPlan ?? null,
          },
          nextStatus: reviewCommission.status,
          notes: isAlreadyPaid
            ? 'Pagamento confirmado sem valor confiavel recebido apos comissao paga.'
            : manualReviewNotes,
          previousStatus: existingCommission?.status ?? null,
          sourceEventId: input.providerEventId,
        });
      }

      return true;
    }

    const nextCommission = await upsertCommission({
      amountCents,
      conversion,
      eventName: input.eventName,
      generatedAt,
      paymentId: input.context.asaasPaymentId,
      providerEventId: input.providerEventId,
      selectedPlan,
      status: targetStatus,
      subscriptionExternalId: input.context.asaasSubscriptionId,
    });

    if (nextCommission) {
      const eventType =
        existingCommission == null
          ? 'generated'
          : nextCommission.status === 'paid'
            ? 'paid'
            : 'approved';

      await createPartnerCommissionEvent({
        commissionId: nextCommission.id,
        eventType,
        metadata: {
          asaas_event_name: input.eventName,
          asaas_payment_id: input.context.asaasPaymentId ?? null,
          provider_event_id: input.providerEventId,
          selected_plan: selectedPlan ?? null,
        },
        nextStatus: nextCommission.status,
        previousStatus: existingCommission?.status ?? null,
        sourceEventId: input.providerEventId,
      });
    }

    return true;
  }

  if (input.classification === 'payment_failed' || input.classification === 'payment_refunded' || input.classification === 'subscription_canceled') {
    if (!existingCommission) {
      return true;
    }

    const now = new Date().toISOString();
    const previousSnapshot = existingCommission.rule_snapshot ?? {};
    const enrichedSnapshot = {
      ...previousSnapshot,
      financial_alert: {
        asaas_event_name: input.eventName,
        payment_id: input.context.asaasPaymentId ?? null,
        provider_event_id: input.providerEventId,
        received_at: now,
      },
    };

    if (existingCommission.status === 'paid') {
      await patchCommission({
        commissionId: existingCommission.id,
        patch: {
          rule_snapshot: enrichedSnapshot,
        },
      });
      await createPartnerCommissionEvent({
        commissionId: existingCommission.id,
        eventType: 'financial_alert',
        metadata: {
          asaas_event_name: input.eventName,
          asaas_payment_id: input.context.asaasPaymentId ?? null,
          provider_event_id: input.providerEventId,
        },
        nextStatus: existingCommission.status,
        notes: 'Evento financeiro negativo recebido para comissao que ja estava paga.',
        previousStatus: existingCommission.status,
        sourceEventId: input.providerEventId,
      });
      return true;
    }

    await patchCommission({
      commissionId: existingCommission.id,
      patch: {
        canceled_at: now,
        rule_snapshot: enrichedSnapshot,
        status: 'canceled',
      },
    });
    await createPartnerCommissionEvent({
      commissionId: existingCommission.id,
      eventType: 'canceled',
      metadata: {
        asaas_event_name: input.eventName,
        asaas_payment_id: input.context.asaasPaymentId ?? null,
        provider_event_id: input.providerEventId,
      },
      nextStatus: 'canceled',
      notes: 'Comissao cancelada apos evento financeiro negativo.',
      previousStatus: existingCommission.status,
      sourceEventId: input.providerEventId,
    });
  }

  return true;
}

async function resolveCommercialIntent(context: BillingContext) {
  if (context.charge?.subscription_intent_id) {
    const intent = await findSubscriptionIntentById(context.charge.subscription_intent_id);

    if (intent) {
      return intent;
    }
  }

  return findLatestSubscriptionIntent(context.salonId);
}

async function patchSubscriptionIntentStatus(intentId: string, status: 'cancelled' | 'paid' | 'confirmed') {
  await supabaseRestRequest<SubscriptionIntentRow[]>('subscription_intents', {
    body: { status },
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(intentId)}`,
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

async function updateSalonCommercialStatus(input: {
  classification: AsaasWebhookProcessResult['classification'];
  context: BillingContext;
}) {
  const now = new Date();
  const intent = await resolveCommercialIntent(input.context);
  const selectedPlan =
    intent?.selected_plan ??
    input.context.subscription?.billing_cycle ??
    'monthly';
  const planLabel = intent?.plan_label ?? resolvePlanLabel(selectedPlan);
  const professionalRange = intent?.professional_range ?? null;
  const patch: Record<string, unknown> = {
    commercial_access: {
      asaas_payment_id: input.context.asaasPaymentId ?? null,
      asaas_subscription_id: input.context.asaasSubscriptionId ?? null,
      last_webhook_classification: input.classification,
      updated_at: now.toISOString(),
    },
  };

  if (input.classification === 'payment_confirmed') {
    const confirmedAt = resolvePaymentConfirmedAt(input.context.payment) ?? now.toISOString();

    patch.subscription_status = 'active';
    patch.current_period_end = addBillingPeriod(confirmedAt, selectedPlan).toISOString();
    patch.selected_plan = selectedPlan;
    patch.professional_range = professionalRange;
    patch.plan_label = planLabel;
    patch.subscription_started_at = confirmedAt;
    patch.subscription_canceled_at = null;

    if (intent?.id) {
      await patchSubscriptionIntentStatus(intent.id, 'paid');
    }
  } else if (input.classification === 'payment_failed') {
    patch.subscription_status = 'past_due';
  } else if (input.classification === 'payment_refunded') {
    patch.subscription_status = 'blocked';
  } else if (input.classification === 'subscription_canceled') {
    patch.subscription_status = 'canceled';
    patch.subscription_canceled_at = now.toISOString();

    if (intent?.id) {
      await patchSubscriptionIntentStatus(intent.id, 'cancelled');
    }
  } else if (input.classification === 'subscription_updated') {
    const subscriptionStatus = mapSubscriptionStatusByEvent({
      classification: input.classification,
      eventName: '',
      paymentStatus: input.context.payment?.status,
      subscriptionStatus: input.context.subscription?.status,
    });

    if (subscriptionStatus === 'active') {
      patch.subscription_status = 'active';
    } else if (subscriptionStatus === 'pastDue') {
      patch.subscription_status = 'past_due';
    } else if (subscriptionStatus === 'cancelled') {
      patch.subscription_status = 'canceled';
      patch.subscription_canceled_at = now.toISOString();
    }
  }

  await supabaseRestRequest('salons', {
    body: patch,
    method: 'PATCH',
    query: `id=eq.${encodeURIComponent(input.context.salonId)}`,
    prefer: 'return=minimal',
    useServiceRole: true,
  });
}

function addBillingPeriod(baseDate: string, selectedPlan: string) {
  const date = new Date(baseDate);

  if (Number.isNaN(date.getTime())) {
    return addBillingPeriod(new Date().toISOString(), selectedPlan);
  }

  const months = selectedPlan === 'annual' ? 12 : selectedPlan === 'quarterly' ? 3 : 1;
  date.setMonth(date.getMonth() + months);

  return date;
}

function resolvePlanLabel(selectedPlan: string) {
  if (selectedPlan === 'annual') {
    return 'Plano anual';
  }

  if (selectedPlan === 'quarterly') {
    return 'Plano trimestral';
  }

  return 'Plano mensal';
}

async function applyBillingUpdates(input: {
  classification: AsaasWebhookProcessResult['classification'];
  context: BillingContext;
  eventName: string;
}) {
  const subscriptionStatus = mapSubscriptionStatusByEvent({
    classification: input.classification,
    eventName: input.eventName,
    paymentStatus: input.context.payment?.status,
    subscriptionStatus: input.context.subscription?.status,
  });

  if (input.context.subscription) {
    await updateSubscription({
      asaasCustomerId: input.context.payment?.customer ?? undefined,
      asaasSubscriptionId: input.context.asaasSubscriptionId ?? undefined,
      status: subscriptionStatus,
      subscriptionId: input.context.subscription.id,
    });
  }

  if (!input.context.payment || !input.context.asaasPaymentId) {
    return;
  }

  const paymentStatus = mapChargeStatus({
    classification: input.classification,
    paymentStatus: input.context.payment.status,
  });
  const confirmedAt = resolvePaymentConfirmedAt(input.context.payment);
  const paymentMethod = mapPaymentMethod(input.context.payment.billingType);
  const amountCents = Math.max(
    toCents(input.context.payment.value),
    input.context.charge?.amount_cents ?? 0,
  );

  if (input.context.charge) {
    await patchCharge({
      amountCents,
      chargeId: input.context.charge.id,
      paidAt: paymentStatus === 'paid' ? confirmedAt : input.context.charge.paid_at,
      paymentMethod,
      providerChargeId: input.context.asaasPaymentId,
      status: paymentStatus,
      subscriptionId: input.context.subscription?.id ?? input.context.charge.subscription_id,
    });
    return;
  }

  await upsertCharge({
    amountCents,
    chargeId: randomUUID(),
    paidAt: paymentStatus === 'paid' ? confirmedAt : null,
    paymentMethod,
    providerChargeId: input.context.asaasPaymentId,
    salonId: input.context.salonId,
    status: paymentStatus,
    subscriptionId: input.context.subscription?.id ?? null,
  });
}

export async function processAsaasWebhook(input: {
  payload: AsaasWebhookPayload;
  receivedAt: string;
}): Promise<AsaasWebhookProcessResult> {
  if (!canUsePartnerPersistence()) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY e obrigatoria para processar webhook financeiro do Asaas.');
  }

  const eventName = normalizeEventName(input.payload.event);

  if (!eventName) {
    return {
      classification: 'unsupported',
      conversionUpdated: false,
      eventName: 'UNKNOWN',
      providerEventId: 'unknown',
      status: 'ignored',
    };
  }

  const payment = parseAsaasPayment(input.payload);
  const subscription = parseAsaasSubscription(input.payload);
  const providerEventId = deriveProviderEventId(input.payload, eventName, payment, subscription);
  const classification = classifyEvent(eventName);

  const existingEvent = await findWebhookEventByProviderEventId(providerEventId);

  if (existingEvent && ['processed', 'ignored'].includes(existingEvent.processing_status)) {
    return {
      classification,
      conversionUpdated: false,
      eventName,
      providerEventId,
      status: 'duplicate',
    };
  }

  if (existingEvent?.processing_status === 'processing') {
    const processingAgeMs = Date.now() - new Date(existingEvent.updated_at).getTime();

    if (processingAgeMs < 90_000) {
      return {
        classification,
        conversionUpdated: false,
        eventName,
        providerEventId,
        status: 'duplicate',
      };
    }
  }

  const processingRow =
    existingEvent ??
    (await upsertWebhookEvent({
      eventName,
      paymentId: payment?.id,
      payload: input.payload,
      processingStatus: 'processing',
      providerEventId,
      receivedAt: input.receivedAt,
      subscriptionExternalId: payment?.subscription ?? subscription?.id,
    }));

  if (!processingRow) {
    throw new Error('Nao foi possivel registrar o evento do webhook para idempotencia.');
  }

  if (classification === 'unsupported') {
    await updateWebhookEventStatus({
      eventRowId: processingRow.id,
      processedAt: new Date().toISOString(),
      processingStatus: 'ignored',
    });

    return {
      classification,
      conversionUpdated: false,
      eventName,
      providerEventId,
      status: 'ignored',
    };
  }

  try {
    const context = await resolveBillingContext(input.payload);

    if (!context) {
      await updateWebhookEventStatus({
        eventRowId: processingRow.id,
        processedAt: new Date().toISOString(),
        processingStatus: 'ignored',
      });

      return {
        classification,
        conversionUpdated: false,
        eventName,
        providerEventId,
        status: 'ignored',
      };
    }

    await applyBillingUpdates({
      classification,
      context,
      eventName,
    });

    await updateSalonCommercialStatus({
      classification,
      context,
    });

    const conversionUpdated = await syncPartnerByFinancialEvent({
      classification,
      context,
      eventName,
      providerEventId,
    });

    await updateWebhookEventStatus({
      eventRowId: processingRow.id,
      processedAt: new Date().toISOString(),
      processingStatus: 'processed',
    });

    return {
      classification,
      conversionUpdated,
      eventName,
      providerEventId,
      status: 'processed',
    };
  } catch (error) {
    await updateWebhookEventStatus({
      errorMessage: error instanceof Error ? error.message : 'Erro desconhecido no processamento do webhook',
      eventRowId: processingRow.id,
      processedAt: new Date().toISOString(),
      processingStatus: 'error',
    });

    throw error;
  }
}
