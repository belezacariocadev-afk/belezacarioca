import { NextResponse } from 'next/server';

import { createPartnerCommissionEvent } from '@/lib/partner/commissionEvents';
import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type PartnerCommissionRow = {
  id: string;
  paid_at: string | null;
  salon_id: string;
  status: 'approved' | 'canceled' | 'paid' | 'pending';
};

type RequestBody = {
  notes?: string;
};

function normalizeNotes(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, 1200);
}

function canManagePartnerCommissions(profileId: string) {
  return profileId === 'platformAdmin' || profileId === 'salonAdmin';
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commissionId: string }> },
) {
  try {
    const session = readPlatformSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
    }

    if (!canManagePartnerCommissions(session.profileId)) {
      return NextResponse.json({ message: 'Sem permissao para operar comissoes.' }, { status: 403 });
    }

    const { commissionId } = await params;

    if (!commissionId?.trim()) {
      return NextResponse.json({ message: 'Comissao invalida.' }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as RequestBody;
    const notes = normalizeNotes(body.notes);
    const encodedCommissionId = encodeURIComponent(commissionId.trim());
    const rows = await supabaseRestRequest<PartnerCommissionRow[]>('partner_commissions', {
      query: `id=eq.${encodedCommissionId}&select=id,status,salon_id,paid_at&limit=1`,
      useServiceRole: true,
    });
    const commission = rows[0];

    if (!commission) {
      return NextResponse.json({ message: 'Comissao nao encontrada.' }, { status: 404 });
    }

    if (session.profileId === 'salonAdmin' && commission.salon_id !== session.salonId) {
      return NextResponse.json({ message: 'Sem permissao para operar esta comissao.' }, { status: 403 });
    }

    if (commission.status === 'canceled') {
      return NextResponse.json(
        { message: 'Comissao cancelada nao pode ser marcada como paga.' },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();

    if (commission.status !== 'paid') {
      const commissionPatch: Record<string, string> = {
        paid_at: now,
        status: 'paid',
      };

      if (!commission.paid_at) {
        commissionPatch.generated_at = now;
      }

      await supabaseRestRequest('partner_commissions', {
        body: commissionPatch,
        method: 'PATCH',
        query: `id=eq.${encodedCommissionId}`,
        prefer: 'return=minimal',
        useServiceRole: true,
      });
    }

    await createPartnerCommissionEvent({
      actorUserId: session.supabaseUserId ?? null,
      commissionId: commission.id,
      eventType: 'manual_paid',
      metadata: {
        actor_email: session.email,
        actor_profile: session.profileId,
        source: 'partner_manual_payment_api',
      },
      nextStatus: 'paid',
      notes: notes ?? 'Comissao marcada como paga manualmente pela operacao.',
      previousStatus: commission.status,
      sourceEventId: `manual-paid-${now}`,
    });

    return NextResponse.json({
      message: 'Comissao marcada como paga com sucesso.',
      result: {
        commissionId: commission.id,
        paidAt: now,
        status: 'paid',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao marcar comissao como paga.',
      },
      { status: 500 },
    );
  }
}
