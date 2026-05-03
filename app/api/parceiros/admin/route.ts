import { NextResponse } from 'next/server';

import {
  deletePartnerAccessRequestForAdmin,
  listPartnerAccessRequestsForAdmin,
  type PartnerApprovalStatus,
  updatePartnerAccessRequestStatusForAdmin,
} from '@/lib/partner/approval';
import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';

type StatusUpdateBody = {
  requestId?: string;
  reviewNotes?: string;
  status?: PartnerApprovalStatus;
};

type DeleteRequestBody = {
  requestId?: string;
};

const availableStatusFilters = new Set<PartnerApprovalStatus | 'all'>([
  'all',
  'pending',
  'approved',
  'rejected',
  'blocked',
]);

const mutableStatuses = new Set<PartnerApprovalStatus>(['pending', 'approved', 'rejected', 'blocked']);

function canManagePartnerRequests(profileId: string) {
  return profileId === 'platformAdmin';
}

function resolveStatusFilter(value: string | null) {
  if (!value) {
    return 'all' as const;
  }

  const normalized = value.trim().toLowerCase() as PartnerApprovalStatus | 'all';

  if (availableStatusFilters.has(normalized)) {
    return normalized;
  }

  return null;
}

export async function GET(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!canManagePartnerRequests(session.profileId)) {
    return NextResponse.json({ message: 'Sem permissao para acessar esta area.' }, { status: 403 });
  }

  const url = new URL(request.url);
  const statusFilter = resolveStatusFilter(url.searchParams.get('status'));

  if (!statusFilter) {
    return NextResponse.json({ message: 'Filtro de status invalido.' }, { status: 400 });
  }

  try {
    const requests = await listPartnerAccessRequestsForAdmin({
      status: statusFilter,
    });

    return NextResponse.json({
      requests,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao listar solicitacoes de parceiros.',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!canManagePartnerRequests(session.profileId)) {
    return NextResponse.json({ message: 'Sem permissao para atualizar parceiros.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as StatusUpdateBody;
  const requestId = body.requestId?.trim();
  const status = body.status;

  if (!requestId) {
    return NextResponse.json({ message: 'Informe a solicitacao que sera atualizada.' }, { status: 400 });
  }

  if (!status || !mutableStatuses.has(status)) {
    return NextResponse.json({ message: 'Status invalido para atualizacao.' }, { status: 400 });
  }

  try {
    const updatedRequest = await updatePartnerAccessRequestStatusForAdmin({
      requestId,
      reviewNotes: body.reviewNotes,
      reviewedBy: session.email,
      status,
    });

    if (!updatedRequest) {
      return NextResponse.json({ message: 'Solicitacao nao encontrada.' }, { status: 404 });
    }

    return NextResponse.json({
      request: updatedRequest,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao atualizar status do parceiro.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!canManagePartnerRequests(session.profileId)) {
    return NextResponse.json({ message: 'Sem permissao para excluir parceiros.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as DeleteRequestBody;
  const requestId = body.requestId?.trim();

  if (!requestId) {
    return NextResponse.json({ message: 'Informe a solicitacao que sera excluida.' }, { status: 400 });
  }

  try {
    const result = await deletePartnerAccessRequestForAdmin({ requestId });

    if (!result) {
      return NextResponse.json({ message: 'Solicitacao nao encontrada.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Parceiro/solicitacao excluido com sucesso.',
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao excluir parceiro/solicitacao.';
    const status = message.includes('historico financeiro ou conversoes') ? 409 : 500;

    return NextResponse.json(
      {
        message,
      },
      { status },
    );
  }
}
