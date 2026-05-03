import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';
import type { SubscriptionPlanChoice } from '@/lib/platform/billing/subscription-intent';

type SalonBillingRow = {
  city?: string | null;
  cpf_cnpj?: string | null;
  email?: string | null;
  id: string;
  name: string;
  phone?: string | null;
  state?: string | null;
};

type ProfileBillingRow = {
  email: string | null;
  full_name: string | null;
  id: string;
};

type SubscriptionRow = {
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
  billing_cycle: SubscriptionPlanChoice | null;
  current_period_end: string | null;
  id: string;
  plan: 'growth' | 'premium' | 'starter';
  salon_id: string;
  status: 'active' | 'cancelled' | 'pastDue' | 'trialing';
};

type ChargeWriteRow = {
  amount_cents: number;
  asaas_payment_id?: string | null;
  client_name?: string | null;
  checkout_url?: string | null;
  due_date?: string | null;
  id: string;
  origin: 'subscription';
  payment_method: 'manualPending';
  provider: 'asaas';
  provider_charge_id: string;
  salon_id: string;
  service_name?: string | null;
  status: 'pending';
  subscription_id: string | null;
  subscription_intent_id?: string | null;
};

type AsaasCustomerResponse = {
  id?: string;
};

type AsaasPaymentResponse = {
  bankSlipUrl?: string | null;
  id?: string;
  invoiceUrl?: string | null;
  invoice_url?: string | null;
  paymentLink?: string | null;
  transactionReceiptUrl?: string | null;
  url?: string | null;
};

type AsaasErrorResponse = {
  errors?: Array<{
    code?: string;
    description?: string;
  }>;
};

type CreateAsaasSubscriptionCheckoutInput = {
  actorEmail: string;
  actorName?: string | null;
  amountCents: number;
  intentId: string;
  planLabel: string;
  profileId: string;
  professionalRangeLabel: string;
  salonId: string;
  selectedPlan: SubscriptionPlanChoice;
};

export type AsaasSubscriptionCheckout = {
  asaasCustomerId: string;
  asaasPaymentId: string;
  chargeId: string;
  checkoutUrl: string;
  paymentId: string;
  subscriptionId: string | null;
};

export class AsaasCheckoutError extends Error {
  code?: string;
  status: number;

  constructor(message: string, options: { code?: string; status: number }) {
    super(message);
    this.name = 'AsaasCheckoutError';
    this.code = options.code;
    this.status = options.status;
  }
}

function getAsaasConfig() {
  const apiKey = process.env.ASAAS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('ASAAS_API_KEY nao configurada.');
  }

  const baseUrl =
    process.env.ASAAS_API_BASE_URL?.replace(/\/$/, '') ??
    (process.env.ASAAS_ENVIRONMENT === 'production' ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/v3');

  return {
    apiKey,
    baseUrl,
  };
}

async function asaasRequest<T>(path: string, body: Record<string, unknown>, method: 'POST' | 'PUT' = 'POST') {
  const config = getAsaasConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    method,
    headers: {
      access_token: config.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'BelezaCarioca/1.0',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const rawBody = await response.text();
    let asaasError: AsaasErrorResponse | null = null;

    try {
      asaasError = JSON.parse(rawBody) as AsaasErrorResponse;
    } catch {
      asaasError = null;
    }

    const firstError = asaasError?.errors?.[0];
    throw new AsaasCheckoutError(firstError?.description ?? rawBody, {
      code: firstError?.code,
      status: response.status,
    });
  }

  return (await response.json()) as T;
}

function toCurrencyValue(amountCents: number) {
  return Number((amountCents / 100).toFixed(2));
}

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizePhoneDigits(value?: string | null) {
  const digits = value?.replace(/\D/g, '') ?? '';

  return digits || null;
}

function resolveAsaasCustomerPhone(value?: string | null) {
  const digits = normalizePhoneDigits(value);

  if (!digits) {
    return {
      digitsLength: 0,
      exists: false,
      phone: undefined,
      mobilePhone: undefined,
      usedField: 'none' as const,
    };
  }

  if (digits.length === 11) {
    return {
      digitsLength: digits.length,
      exists: true,
      phone: undefined,
      mobilePhone: digits,
      usedField: 'mobilePhone' as const,
    };
  }

  if (digits.length === 10) {
    return {
      digitsLength: digits.length,
      exists: true,
      phone: digits,
      mobilePhone: undefined,
      usedField: 'phone' as const,
    };
  }

  return {
    digitsLength: digits.length,
    exists: true,
    phone: undefined,
    mobilePhone: undefined,
    usedField: 'omittedInvalid' as const,
  };
}

export function isInvalidAsaasMobilePhoneError(error: unknown) {
  return (
    error instanceof AsaasCheckoutError &&
    (error.code === 'invalid_mobilePhone' || error.message.toLowerCase().includes('celular informado'))
  );
}

function normalizeCpfCnpj(value?: string | null) {
  const digits = value?.replace(/\D/g, '') ?? '';

  return digits || null;
}

function isValidCpfCnpj(value?: string | null) {
  const digits = normalizeCpfCnpj(value);

  return digits?.length === 11 || digits?.length === 14;
}

export function isInvalidAsaasCpfCnpjError(error: unknown) {
  return (
    error instanceof AsaasCheckoutError &&
    (error.code === 'invalid_cpfCnpj' ||
      error.message.toLowerCase().includes('cpf') ||
      error.message.toLowerCase().includes('cnpj'))
  );
}

function getCheckoutUrl(payment: AsaasPaymentResponse) {
  return (
    payment.invoiceUrl ??
    payment.paymentLink ??
    payment.url ??
    payment.bankSlipUrl ??
    payment.invoice_url ??
    payment.transactionReceiptUrl ??
    null
  );
}

function isMissingTableError(error: unknown, tableName: string) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('pgrst205') &&
    message.includes(`public.${tableName}`) &&
    message.includes('schema cache')
  );
}

async function getSalon(salonId: string) {
  const rows = await supabaseRestRequest<SalonBillingRow[]>('salons', {
    query: `id=eq.${encodeURIComponent(salonId)}&select=id,name,email,phone,cpf_cnpj,city,state&limit=1`,
    useServiceRole: true,
  });

  if (!rows[0]) {
    throw new Error('Salao nao encontrado para criar checkout Asaas.');
  }

  return rows[0];
}

function assertSalonHasValidCpfCnpj(salon: SalonBillingRow) {
  const cpfCnpj = normalizeCpfCnpj(salon.cpf_cnpj);

  if (!isValidCpfCnpj(cpfCnpj)) {
    throw new AsaasCheckoutError(
      'Informe um CPF ou CNPJ válido no cadastro do estabelecimento antes de ativar o plano.',
      {
        code: 'invalid_cpf_cnpj',
        status: 400,
      },
    );
  }

  return cpfCnpj;
}

async function getProfile(profileId: string) {
  const rows = await supabaseRestRequest<ProfileBillingRow[]>('profiles', {
    query: `id=eq.${encodeURIComponent(profileId)}&select=id,email,full_name&limit=1`,
    useServiceRole: true,
  }).catch(() => []);

  return rows[0] ?? null;
}

async function getLatestSubscription(salonId: string) {
  const rows = await supabaseRestRequest<SubscriptionRow[]>('subscriptions', {
    query: `salon_id=eq.${encodeURIComponent(salonId)}&select=id,salon_id,plan,status,billing_cycle,current_period_end,asaas_customer_id,asaas_subscription_id&order=updated_at.desc&limit=1`,
    useServiceRole: true,
  }).catch((error: unknown) => {
    if (isMissingTableError(error, 'subscriptions')) {
      console.warn('[asaas-checkout] Tabela subscriptions ausente; checkout seguirá sem vínculo de assinatura.');
      return [];
    }

    throw error;
  });

  return rows[0] ?? null;
}

async function upsertSubscription(input: {
  asaasCustomerId: string;
  selectedPlan: SubscriptionPlanChoice;
  salonId: string;
  subscription: SubscriptionRow | null;
}) {
  const body = {
    asaas_customer_id: input.asaasCustomerId,
    billing_cycle: input.selectedPlan,
    plan: 'growth',
    salon_id: input.salonId,
    status: input.subscription?.status ?? 'trialing',
  };

  if (input.subscription) {
    const rows = await supabaseRestRequest<SubscriptionRow[]>('subscriptions', {
      body,
      method: 'PATCH',
      prefer: 'return=representation',
      query: `id=eq.${encodeURIComponent(input.subscription.id)}`,
      useServiceRole: true,
    }).catch((error: unknown) => {
      if (isMissingTableError(error, 'subscriptions')) {
        console.warn('[asaas-checkout] Tabela subscriptions ausente; não foi possível atualizar assinatura.');
        return [];
      }

      throw error;
    });

    return rows[0] ?? input.subscription;
  }

  const rows = await supabaseRestRequest<SubscriptionRow[]>('subscriptions', {
    body: [
      {
        ...body,
        id: crypto.randomUUID(),
      },
    ],
    method: 'POST',
    prefer: 'return=representation',
    useServiceRole: true,
  }).catch((error: unknown) => {
    if (isMissingTableError(error, 'subscriptions')) {
      console.warn('[asaas-checkout] Tabela subscriptions ausente; não foi possível criar assinatura.');
      return [];
    }

    throw error;
  });

  return rows[0] ?? null;
}

async function createAsaasCustomer(input: {
  actorEmail: string;
  actorName?: string | null;
  salon: SalonBillingRow;
}) {
  const phone = resolveAsaasCustomerPhone(input.salon.phone);
  const cpfCnpj = assertSalonHasValidCpfCnpj(input.salon);
  const customerPayload: Record<string, unknown> = {
    cpfCnpj,
    email: input.salon.email ?? input.actorEmail,
    externalReference: input.salon.id,
    name: input.salon.name || input.actorName || input.actorEmail,
    notificationDisabled: false,
  };

  if (phone.mobilePhone) {
    customerPayload.mobilePhone = phone.mobilePhone;
  }

  if (phone.phone) {
    customerPayload.phone = phone.phone;
  }

  console.info('[asaas-checkout] Telefone do customer Asaas', {
    digitsLength: phone.digitsLength,
    exists: phone.exists,
    salonId: input.salon.id,
    usedField: phone.usedField,
  });

  const customer = await asaasRequest<AsaasCustomerResponse>('/customers', customerPayload);

  if (!customer.id) {
    throw new Error('Asaas nao retornou o id do customer.');
  }

  return customer.id;
}

async function updateAsaasCustomerDocument(input: {
  asaasCustomerId: string;
  salon: SalonBillingRow;
}) {
  const cpfCnpj = assertSalonHasValidCpfCnpj(input.salon);

  await asaasRequest<AsaasCustomerResponse>(
    `/customers/${encodeURIComponent(input.asaasCustomerId)}`,
    {
      cpfCnpj,
    },
    'PUT',
  );
}

async function createAsaasPayment(input: {
  asaasCustomerId: string;
  actorEmail: string;
  amountCents: number;
  intentId: string;
  planLabel: string;
  professionalRangeLabel: string;
  salon: SalonBillingRow;
  selectedPlan: SubscriptionPlanChoice;
}) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);

  const payment = await asaasRequest<AsaasPaymentResponse>('/payments', {
    billingType: 'UNDEFINED',
    customer: input.asaasCustomerId,
    description: `${input.planLabel} Beleza Carioca - ${input.professionalRangeLabel}`,
    dueDate: formatDateOnly(dueDate),
    externalReference: input.intentId,
    value: toCurrencyValue(input.amountCents),
  });
  const checkoutUrl = getCheckoutUrl(payment);

  if (!payment.id || !checkoutUrl) {
    throw new Error('Asaas nao retornou link de pagamento para a cobranca.');
  }

  return {
    dueDate: dueDate.toISOString(),
    id: payment.id,
    checkoutUrl,
  };
}

async function insertCharge(input: {
  amountCents: number;
  asaasPaymentId: string;
  chargeId: string;
  checkoutUrl: string;
  dueDate: string;
  planLabel: string;
  salon: SalonBillingRow;
  subscriptionId: string | null;
  subscriptionIntentId: string;
}) {
  const row: ChargeWriteRow = {
    amount_cents: input.amountCents,
    asaas_payment_id: input.asaasPaymentId,
    client_name: input.salon.name,
    checkout_url: input.checkoutUrl,
    due_date: input.dueDate,
    id: input.chargeId,
    origin: 'subscription',
    payment_method: 'manualPending',
    provider: 'asaas',
    provider_charge_id: input.asaasPaymentId,
    salon_id: input.salon.id,
    service_name: input.planLabel,
    status: 'pending',
    subscription_id: input.subscriptionId,
    subscription_intent_id: input.subscriptionIntentId,
  };

  try {
    await supabaseRestRequest('charges', {
      body: [row],
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      query: 'on_conflict=id',
      useServiceRole: true,
    });
  } catch (error) {
    if (!(error instanceof Error) || !isMissingChargeColumnError(error)) {
      throw error;
    }

    await supabaseRestRequest('charges', {
      body: [
        buildMinimalChargeRow(row),
      ],
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      query: 'on_conflict=id',
      useServiceRole: true,
    });
  }
}

function isMissingChargeColumnError(error: Error) {
  const message = error.message.toLowerCase();

  return (
    message.includes('pgrst204') ||
    (message.includes('column') &&
      (message.includes('asaas_payment_id') ||
        message.includes('checkout_url') ||
        message.includes('subscription_intent_id') ||
        message.includes('client_name') ||
        message.includes('service_name') ||
        message.includes('due_date')))
  );
}

function buildMinimalChargeRow(row: ChargeWriteRow) {
  return {
    amount_cents: row.amount_cents,
    id: row.id,
    origin: row.origin,
    payment_method: row.payment_method,
    provider: row.provider,
    provider_charge_id: row.provider_charge_id,
    salon_id: row.salon_id,
    status: row.status,
    subscription_id: row.subscription_id,
  };
}

export async function createAsaasSubscriptionCheckout(input: CreateAsaasSubscriptionCheckoutInput): Promise<AsaasSubscriptionCheckout> {
  const [salon, profile, existingSubscription] = await Promise.all([
    getSalon(input.salonId),
    getProfile(input.profileId),
    getLatestSubscription(input.salonId),
  ]);
  const asaasCustomerId = existingSubscription?.asaas_customer_id;

  if (asaasCustomerId) {
    await updateAsaasCustomerDocument({
      asaasCustomerId,
      salon,
    });
  }

  const resolvedAsaasCustomerId =
    asaasCustomerId ??
    (await createAsaasCustomer({
      actorEmail: profile?.email ?? input.actorEmail,
      actorName: profile?.full_name ?? input.actorName,
      salon,
    }));
  const subscription = await upsertSubscription({
    asaasCustomerId: resolvedAsaasCustomerId,
    salonId: input.salonId,
    selectedPlan: input.selectedPlan,
    subscription: existingSubscription,
  });
  const payment = await createAsaasPayment({
    actorEmail: profile?.email ?? input.actorEmail,
    amountCents: input.amountCents,
    asaasCustomerId: resolvedAsaasCustomerId,
    intentId: input.intentId,
    planLabel: input.planLabel,
    professionalRangeLabel: input.professionalRangeLabel,
    salon,
    selectedPlan: input.selectedPlan,
  });
  const chargeId = crypto.randomUUID();

  await insertCharge({
    amountCents: input.amountCents,
    asaasPaymentId: payment.id,
    chargeId,
    checkoutUrl: payment.checkoutUrl,
    dueDate: payment.dueDate,
    planLabel: `${input.planLabel} - ${input.professionalRangeLabel}`,
    salon,
    subscriptionId: subscription?.id ?? null,
    subscriptionIntentId: input.intentId,
  }).catch((error: unknown) => {
    console.error('[asaas-checkout] Falha ao persistir cobranca Asaas; checkout sera retornado mesmo assim.', {
      asaasPaymentId: payment.id,
      chargeId,
      error,
      salonId: salon.id,
    });
  });

  return {
    asaasCustomerId: resolvedAsaasCustomerId,
    asaasPaymentId: payment.id,
    chargeId,
    checkoutUrl: payment.checkoutUrl,
    paymentId: payment.id,
    subscriptionId: subscription?.id ?? null,
  };
}
