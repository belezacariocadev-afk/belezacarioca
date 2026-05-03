import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

export type PartnerCommissionEventType =
  | 'generated'
  | 'manual_review_required'
  | 'approved'
  | 'paid'
  | 'canceled'
  | 'financial_alert'
  | 'manual_paid';

type PartnerCommissionEventInsertInput = {
  actorUserId?: string | null;
  commissionId: string;
  eventType: PartnerCommissionEventType;
  metadata?: Record<string, unknown> | null;
  nextStatus?: 'approved' | 'canceled' | 'paid' | 'pending' | null;
  notes?: string | null;
  previousStatus?: 'approved' | 'canceled' | 'paid' | 'pending' | null;
  sourceEventId?: string | null;
};

function normalizeSourceEventId(sourceEventId?: string | null) {
  if (!sourceEventId) {
    return null;
  }

  const normalized = sourceEventId.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, 255);
}

export async function createPartnerCommissionEvent(input: PartnerCommissionEventInsertInput) {
  const sourceEventId = normalizeSourceEventId(input.sourceEventId);
  const payload = [
    {
      actor_user_id: input.actorUserId ?? null,
      commission_id: input.commissionId,
      event_type: input.eventType,
      metadata: input.metadata ?? null,
      next_status: input.nextStatus ?? null,
      notes: input.notes ?? null,
      previous_status: input.previousStatus ?? null,
      source_event_id: sourceEventId,
    },
  ];

  await supabaseRestRequest('partner_commission_events', {
    body: payload,
    method: 'POST',
    prefer: sourceEventId ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal',
    query: sourceEventId ? 'on_conflict=commission_id,event_type,source_event_id' : undefined,
    useServiceRole: true,
  });
}

