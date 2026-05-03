import type { PlatformSession } from '@/lib/platform/auth/session';
import type { ChargeRecord, ChargeStatus } from '@/lib/platform/domain';
import type { ChargeInput, ChargeUpdateInput, FinanceSummary } from '@/lib/platform/data/schema';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type FinanceChargeRow = {
  amount_cents?: number | null;
  amount?: number | null;
  valor?: number | null;
  client_name?: string | null;
  created_at?: string | null;
  due_date?: string | null;
  id: string;
  origin?: ChargeRecord['origin'] | null;
  paid_at?: string | null;
  provider?: ChargeRecord['provider'] | null;
  salon_id: string;
  service_name?: string | null;
  status?: ChargeStatus | FinanceStatusPt | null;
  updated_at?: string | null;
};

type FinanceStatus = Extract<ChargeStatus, 'draft' | 'pending' | 'paid' | 'cancelled'>;
type FinanceStatusPt = 'rascunho' | 'pendente' | 'pago' | 'cancelado';
type FinanceWriteRow = Partial<FinanceChargeRow> & {
  amount_cents: number;
  client_name: string | null;
  id: string;
  salon_id: string;
  service_name: string | null;
  status: FinanceStatus | FinanceStatusPt;
  updated_at: string;
};

const statusFromPt: Record<FinanceStatusPt, FinanceStatus> = {
  cancelado: 'cancelled',
  pago: 'paid',
  pendente: 'pending',
  rascunho: 'draft',
};

const statusToPt: Record<FinanceStatus, FinanceStatusPt> = {
  cancelled: 'cancelado',
  draft: 'rascunho',
  paid: 'pago',
  pending: 'pendente',
};

export async function listFinanceCharges(session: PlatformSession) {
  const rows = await supabaseRestRequest<FinanceChargeRow[]>('charges', {
    query: `salon_id=eq.${encodeURIComponent(session.salonId)}&select=*&order=created_at.desc`,
    useServiceRole: true,
  });

  return rows.map(fromFinanceChargeRow);
}

export async function getFinanceSummary(session: PlatformSession): Promise<FinanceSummary> {
  return buildFinanceSummary(await listFinanceCharges(session));
}

export async function createFinanceCharge(input: ChargeInput, session: PlatformSession) {
  const now = new Date().toISOString();
  const charge: ChargeRecord = {
    id: globalThis.crypto.randomUUID(),
    salonId: session.salonId,
    amountCents: normalizeAmountCents(input.amountCents),
    clientName: normalizeRequiredText(input.clientName),
    serviceName: normalizeRequiredText(input.serviceName),
    status: normalizeFinanceStatus(input.status),
    origin: 'manual',
    provider: 'manual',
    dueDate: normalizeOptionalDate(input.dueDate),
    createdAt: now,
    updatedAt: now,
  };
  const rows = await writeFinanceChargeRows({
    method: 'POST',
    query: 'select=*',
    body: toFinanceChargeRow(charge),
    session,
  });

  if (!rows[0]) {
    throw new Error('Charge insert returned no rows.');
  }

  return fromFinanceChargeRow(rows[0]);
}

export async function updateFinanceCharge(chargeId: string, input: ChargeUpdateInput, session: PlatformSession) {
  const existingRow = await getFinanceChargeRowById(chargeId, session);
  const existing = fromFinanceChargeRow(existingRow);
  const next: ChargeRecord = {
    ...existing,
    amountCents: input.amountCents === undefined ? existing.amountCents : normalizeAmountCents(input.amountCents),
    clientName: input.clientName === undefined ? existing.clientName : normalizeRequiredText(input.clientName),
    dueDate: input.dueDate === undefined ? existing.dueDate : normalizeOptionalDate(input.dueDate),
    serviceName: input.serviceName === undefined ? existing.serviceName : normalizeRequiredText(input.serviceName),
    status: input.status === undefined ? existing.status : normalizeFinanceStatus(input.status),
    updatedAt: new Date().toISOString(),
  };
  const rows = await writeFinanceChargeRows({
    method: 'PATCH',
    query: `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(chargeId)}&select=*`,
    body: toFinanceChargeRow(next, getDatabaseStatusMode(existingRow.status)),
    session,
  });

  if (!rows[0]) {
    throw new Error('Charge update returned no rows.');
  }

  return fromFinanceChargeRow(rows[0]);
}

async function writeFinanceChargeRows(input: {
  body: FinanceWriteRow;
  method: 'PATCH' | 'POST';
  query: string;
  session: PlatformSession;
}) {
  try {
    return await supabaseRestRequest<FinanceChargeRow[]>('charges', {
      method: input.method,
      body: input.body,
      prefer: 'return=representation',
      query: input.query,
      useServiceRole: true,
    });
  } catch (error) {
    if (!isMissingFinanceColumnError(error)) {
      throw error;
    }

    console.error('[financeiro] Schema de charges sem colunas opcionais, tentando payload compativel:', error);

    return supabaseRestRequest<FinanceChargeRow[]>('charges', {
      method: input.method,
      body: toCompatibleFinanceChargeRow(input.body),
      prefer: 'return=representation',
      query: input.query,
      useServiceRole: true,
    });
  }
}

/*
 * Compatibilidade com bancos que ainda nao receberam todas as migrations antigas
 * de charges. O financeiro manual precisa funcionar com as colunas essenciais.
 */
function toCompatibleFinanceChargeRow(row: FinanceWriteRow): FinanceWriteRow {
  return {
    amount_cents: row.amount_cents,
    client_name: row.client_name,
    id: row.id,
    salon_id: row.salon_id,
    service_name: row.service_name,
    status: row.status,
    updated_at: row.updated_at,
    ...(row.created_at ? { created_at: row.created_at } : {}),
  };
}

function isMissingFinanceColumnError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('pgrst204') &&
    (message.includes("'origin' column") ||
      message.includes("'provider' column") ||
      message.includes("'paid_at' column") ||
      message.includes("'due_date' column") ||
      message.includes("'payment_method' column") ||
      message.includes("'provider_charge_id' column"))
  );
}

export async function deleteFinanceCharge(chargeId: string, session: PlatformSession) {
  await getFinanceChargeById(chargeId, session);

  const rows = await supabaseRestRequest<FinanceChargeRow[]>('charges', {
    method: 'DELETE',
    query: `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(chargeId)}&select=id`,
    prefer: 'return=representation',
    useServiceRole: true,
  });

  if (!rows[0]) {
    throw new Error('Charge delete returned no rows.');
  }

  return chargeId;
}

export function buildFinanceSummary(charges: ChargeRecord[]): FinanceSummary {
  return {
    cancelled: charges.filter((charge) => charge.status === 'cancelled').length,
    draft: charges.filter((charge) => charge.status === 'draft').length,
    paid: charges.filter((charge) => charge.status === 'paid').length,
    pending: charges.filter((charge) => charge.status === 'pending').length,
  };
}

async function getFinanceChargeById(chargeId: string, session: PlatformSession) {
  return fromFinanceChargeRow(await getFinanceChargeRowById(chargeId, session));
}

async function getFinanceChargeRowById(chargeId: string, session: PlatformSession) {
  const rows = await supabaseRestRequest<FinanceChargeRow[]>('charges', {
    query: `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(chargeId)}&select=*&limit=1`,
    useServiceRole: true,
  });

  if (!rows[0]) {
    throw new Error('Charge not found.');
  }

  return rows[0];
}

function fromFinanceChargeRow(row: FinanceChargeRow): ChargeRecord {
  const createdAt = row.created_at ?? new Date().toISOString();

  return {
    id: row.id,
    salonId: row.salon_id,
    amountCents: row.amount_cents ?? Math.round((row.valor ?? row.amount ?? 0) * 100),
    clientName: row.client_name ?? undefined,
    serviceName: row.service_name ?? undefined,
    status: normalizeFinanceStatus(row.status ?? 'draft'),
    origin: row.origin ?? 'manual',
    provider: row.provider ?? 'manual',
    paidAt: row.paid_at ?? undefined,
    dueDate: row.due_date ?? undefined,
    createdAt,
    updatedAt: row.updated_at ?? createdAt,
  };
}

function toFinanceChargeRow(charge: ChargeRecord, statusMode: 'en' | 'pt' = 'en'): FinanceWriteRow {
  const status = normalizeFinanceStatus(charge.status);

  return {
    id: charge.id,
    salon_id: charge.salonId,
    client_name: charge.clientName ?? null,
    service_name: charge.serviceName ?? null,
    amount_cents: charge.amountCents,
    status: statusMode === 'pt' ? statusToPt[status] : status,
    origin: charge.origin,
    provider: charge.provider,
    paid_at: charge.paidAt ?? null,
    due_date: charge.dueDate ?? null,
    created_at: charge.createdAt,
    updated_at: charge.updatedAt,
  };
}

function getDatabaseStatusMode(status: FinanceChargeRow['status']): 'en' | 'pt' {
  return status === 'rascunho' || status === 'pendente' || status === 'pago' || status === 'cancelado' ? 'pt' : 'en';
}

function normalizeFinanceStatus(status: ChargeStatus | FinanceStatusPt): FinanceStatus {
  if (status === 'rascunho' || status === 'pendente' || status === 'pago' || status === 'cancelado') {
    return statusFromPt[status];
  }

  return status === 'paid' || status === 'cancelled' || status === 'pending' ? status : 'draft';
}

function normalizeAmountCents(value: number) {
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

function normalizeOptionalDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

function normalizeRequiredText(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error('Required finance field is empty.');
  }

  return normalized;
}
