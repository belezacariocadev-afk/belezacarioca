'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CircleAlert,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  RefreshCw,
  ShieldBan,
  Slash,
  Trash2,
  X,
} from 'lucide-react';

import type { PartnerAdminRequestRecord, PartnerApprovalStatus } from '@/lib/partner/approval';

type PartnerRequestsAdminPanelProps = {
  initialFilter: PartnerApprovalStatus | 'all';
  initialRequests: PartnerAdminRequestRecord[];
};

const filterOptions: Array<{ label: string; value: PartnerApprovalStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Aprovados', value: 'approved' },
  { label: 'Rejeitados', value: 'rejected' },
  { label: 'Bloqueados', value: 'blocked' },
];

const summaryCards: Array<{ label: string; value: PartnerApprovalStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Aprovados', value: 'approved' },
  { label: 'Rejeitados', value: 'rejected' },
  { label: 'Bloqueados', value: 'blocked' },
];

function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function statusLabel(status: PartnerApprovalStatus) {
  if (status === 'approved') return 'Aprovado';
  if (status === 'rejected') return 'Rejeitado';
  if (status === 'blocked') return 'Bloqueado';
  return 'Em analise';
}

function statusClasses(status: PartnerApprovalStatus) {
  if (status === 'approved') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'rejected') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (status === 'blocked') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-sky-200 bg-sky-50 text-sky-700';
}

function getCount(requests: PartnerAdminRequestRecord[], status: PartnerApprovalStatus | 'all') {
  if (status === 'all') {
    return requests.length;
  }

  return requests.filter((request) => request.status === status).length;
}

function truncate(value: string | null | undefined, fallback = '-') {
  return value?.trim() ? value : fallback;
}

export function PartnerRequestsAdminPanel({
  initialFilter,
  initialRequests,
}: PartnerRequestsAdminPanelProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [activeFilter, setActiveFilter] = useState<PartnerApprovalStatus | 'all'>(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [openMenuRequestId, setOpenMenuRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PartnerAdminRequestRecord | null>(null);

  const visibleRequests = useMemo(() => {
    if (activeFilter === 'all') {
      return requests;
    }

    return requests.filter((request) => request.status === activeFilter);
  }, [activeFilter, requests]);

  const emptyMessage = useMemo(() => {
    if (activeFilter === 'all') {
      return 'Nenhuma solicitacao encontrada';
    }

    return `Nenhuma solicitacao ${statusLabel(activeFilter).toLowerCase()} encontrada`;
  }, [activeFilter]);

  async function reloadList() {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setOpenMenuRequestId(null);

    try {
      const response = await fetch('/api/parceiros/admin?status=all', {
        method: 'GET',
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; requests?: PartnerAdminRequestRecord[] }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel carregar a lista de parceiros.');
      }

      setRequests(payload?.requests ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Falha ao carregar solicitacoes.');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(requestId: string, status: PartnerApprovalStatus) {
    const reviewNotes = window.prompt('Deseja adicionar uma observacao para esta decisao? (opcional)') ?? '';

    setBusyRequestId(requestId);
    setOpenMenuRequestId(null);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/parceiros/admin', {
        body: JSON.stringify({
          requestId,
          reviewNotes,
          status,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; request?: PartnerAdminRequestRecord }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel atualizar o status do parceiro.');
      }

      if (payload?.request) {
        const updatedRequest = payload.request;
        setRequests((current) => current.map((item) => (item.id === requestId ? updatedRequest : item)));
        setSelectedRequest((current) => (current?.id === requestId ? updatedRequest : current));
      }

      setMessage(`Status atualizado para ${statusLabel(status).toLowerCase()}.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Falha ao atualizar solicitacao.');
    } finally {
      setBusyRequestId(null);
    }
  }

  async function deleteRequest(request: PartnerAdminRequestRecord) {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este parceiro/solicitacao? Essa acao removera os dados dele do sistema e permitira novo cadastro com o mesmo e-mail.',
    );

    if (!confirmed) {
      return;
    }

    setBusyRequestId(request.id);
    setOpenMenuRequestId(null);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/parceiros/admin', {
        body: JSON.stringify({
          requestId: request.id,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel excluir este parceiro/solicitacao.');
      }

      setRequests((current) => current.filter((item) => item.id !== request.id));
      setSelectedRequest((current) => (current?.id === request.id ? null : current));
      setMessage(payload?.message ?? 'Parceiro/solicitacao excluido com sucesso.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Falha ao excluir parceiro/solicitacao.');
    } finally {
      setBusyRequestId(null);
    }
  }

  function handleSelectFilter(filter: PartnerApprovalStatus | 'all') {
    setActiveFilter(filter);
    setOpenMenuRequestId(null);
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <button
            key={card.value}
            type="button"
            onClick={() => handleSelectFilter(card.value)}
            className={[
              'rounded-[1.1rem] border bg-white p-4 text-left shadow-[0_12px_28px_rgba(110,84,144,0.07)] transition',
              activeFilter === card.value
                ? 'border-[rgba(120,84,162,0.32)] ring-4 ring-[rgba(120,84,162,0.08)]'
                : 'border-[rgba(120,84,162,0.1)] hover:border-[rgba(120,84,162,0.24)]',
            ].join(' ')}
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--bc-muted)]">{card.label}</p>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-[color:var(--bc-text)]">
              {getCount(requests, card.value)}
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white p-4 shadow-[0_16px_36px_rgba(110,84,144,0.08)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectFilter(option.value)}
                className={[
                  'inline-flex h-9 items-center rounded-full border px-3 text-xs font-black uppercase tracking-[0.1em] transition',
                  activeFilter === option.value
                    ? 'border-[rgba(120,84,162,0.32)] bg-[rgba(120,84,162,0.1)] text-[color:var(--bc-purple-strong)]'
                    : 'border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-muted)] hover:border-[rgba(216,178,123,0.34)]',
                ].join(' ')}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              void reloadList();
            }}
            disabled={isLoading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-bold text-[color:var(--bc-muted)] transition hover:border-[rgba(216,178,123,0.34)] hover:text-[color:var(--bc-text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Atualizar lista
          </button>
        </div>

        {message ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <CircleAlert size={16} />
            {error}
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-visible rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white shadow-[0_18px_40px_rgba(110,84,144,0.08)] lg:block">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-[rgba(120,84,162,0.06)] text-left text-[11px] uppercase tracking-[0.1em] text-[color:var(--bc-muted)]">
            <tr>
              <th className="w-[22%] px-4 py-3">Parceiro</th>
              <th className="w-[24%] px-4 py-3">Contato</th>
              <th className="w-[16%] px-4 py-3">Atuacao</th>
              <th className="w-[12%] px-4 py-3">Status</th>
              <th className="w-[12%] px-4 py-3">Cadastro</th>
              <th className="w-[9%] px-4 py-3">Codigo</th>
              <th className="w-[5%] px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[color:var(--bc-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle size={16} className="animate-spin" />
                    Carregando solicitacoes...
                  </span>
                </td>
              </tr>
            ) : visibleRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState message={emptyMessage} onReload={reloadList} />
                </td>
              </tr>
            ) : (
              visibleRequests.map((request) => (
                <PartnerRequestRow
                  key={request.id}
                  isBusy={busyRequestId === request.id}
                  isMenuOpen={openMenuRequestId === request.id}
                  onDelete={deleteRequest}
                  onOpenDetails={setSelectedRequest}
                  onToggleMenu={(requestId) => setOpenMenuRequestId((current) => (current === requestId ? null : requestId))}
                  onUpdateStatus={updateStatus}
                  request={request}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {isLoading ? (
          <div className="rounded-[1.25rem] border border-[rgba(120,84,162,0.12)] bg-white p-5 text-center text-sm text-[color:var(--bc-muted)]">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={16} className="animate-spin" />
              Carregando solicitacoes...
            </span>
          </div>
        ) : visibleRequests.length === 0 ? (
          <EmptyState message={emptyMessage} onReload={reloadList} />
        ) : (
          visibleRequests.map((request) => (
            <PartnerRequestCard
              key={request.id}
              isBusy={busyRequestId === request.id}
              isMenuOpen={openMenuRequestId === request.id}
              onDelete={deleteRequest}
              onOpenDetails={setSelectedRequest}
              onToggleMenu={(requestId) => setOpenMenuRequestId((current) => (current === requestId ? null : requestId))}
              onUpdateStatus={updateStatus}
              request={request}
            />
          ))
        )}
      </div>

      {selectedRequest ? (
        <PartnerDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      ) : null}
    </section>
  );
}

function PartnerRequestRow({
  isBusy,
  isMenuOpen,
  onDelete,
  onOpenDetails,
  onToggleMenu,
  onUpdateStatus,
  request,
}: {
  isBusy: boolean;
  isMenuOpen: boolean;
  onDelete: (request: PartnerAdminRequestRecord) => Promise<void>;
  onOpenDetails: (request: PartnerAdminRequestRecord) => void;
  onToggleMenu: (requestId: string) => void;
  onUpdateStatus: (requestId: string, status: PartnerApprovalStatus) => Promise<void>;
  request: PartnerAdminRequestRecord;
}) {
  return (
    <tr className="border-t border-[rgba(120,84,162,0.08)] align-middle">
      <td className="px-4 py-3">
        <p className="truncate font-bold text-[color:var(--bc-text)]" title={request.fullName}>{request.fullName}</p>
        <p className="mt-1 truncate text-xs text-[color:var(--bc-muted)]" title={truncate(request.company)}>
          {truncate(request.company)}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="truncate text-xs font-semibold text-[color:var(--bc-text)]" title={request.email}>{request.email}</p>
        <p className="mt-1 truncate text-xs text-[color:var(--bc-muted)]">{request.whatsapp}</p>
      </td>
      <td className="px-4 py-3">
        <p className="truncate text-xs font-semibold text-[color:var(--bc-text)]" title={request.areaOfWork}>
          {truncate(request.areaOfWork)}
        </p>
        <p className="mt-1 truncate text-xs text-[color:var(--bc-muted)]">
          {[request.city, request.state].filter(Boolean).join(' / ') || '-'}
        </p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-4 py-3 text-xs text-[color:var(--bc-muted)]">{formatDateTime(request.createdAt)}</td>
      <td className="px-4 py-3">
        <span className="block truncate font-mono text-xs text-[color:var(--bc-muted)]" title={truncate(request.partnerCode)}>
          {truncate(request.partnerCode)}
        </span>
      </td>
      <td className="relative px-4 py-3 text-right">
        <ActionsMenu
          isBusy={isBusy}
          isOpen={isMenuOpen}
          onDelete={() => void onDelete(request)}
          onOpenDetails={() => onOpenDetails(request)}
          onToggle={() => onToggleMenu(request.id)}
          onUpdateStatus={(status) => void onUpdateStatus(request.id, status)}
          request={request}
        />
      </td>
    </tr>
  );
}

function PartnerRequestCard({
  isBusy,
  isMenuOpen,
  onDelete,
  onOpenDetails,
  onToggleMenu,
  onUpdateStatus,
  request,
}: {
  isBusy: boolean;
  isMenuOpen: boolean;
  onDelete: (request: PartnerAdminRequestRecord) => Promise<void>;
  onOpenDetails: (request: PartnerAdminRequestRecord) => void;
  onToggleMenu: (requestId: string) => void;
  onUpdateStatus: (requestId: string, status: PartnerApprovalStatus) => Promise<void>;
  request: PartnerAdminRequestRecord;
}) {
  return (
    <article className="rounded-[1.25rem] border border-[rgba(120,84,162,0.12)] bg-white p-4 shadow-[0_12px_28px_rgba(110,84,144,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-black text-[color:var(--bc-text)]">{request.fullName}</p>
          <p className="mt-1 break-all text-xs font-semibold text-[color:var(--bc-muted)]">{request.email}</p>
        </div>
        <div className="relative shrink-0">
          <ActionsMenu
            isBusy={isBusy}
            isOpen={isMenuOpen}
            onDelete={() => void onDelete(request)}
            onOpenDetails={() => onOpenDetails(request)}
            onToggle={() => onToggleMenu(request.id)}
            onUpdateStatus={(status) => void onUpdateStatus(request.id, status)}
            request={request}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={request.status} />
        <span className="rounded-full bg-[rgba(120,84,162,0.06)] px-3 py-1 text-xs font-semibold text-[color:var(--bc-muted)]">
          {formatDateTime(request.createdAt)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-[color:var(--bc-muted)]">
        <p><strong className="text-[color:var(--bc-text)]">Telefone:</strong> {request.whatsapp}</p>
        <p><strong className="text-[color:var(--bc-text)]">Empresa:</strong> {truncate(request.company)}</p>
        <p><strong className="text-[color:var(--bc-text)]">Atuacao:</strong> {truncate(request.areaOfWork)}</p>
      </div>
    </article>
  );
}

function ActionsMenu({
  isBusy,
  isOpen,
  onDelete,
  onOpenDetails,
  onToggle,
  onUpdateStatus,
  request,
}: {
  isBusy: boolean;
  isOpen: boolean;
  onDelete: () => void;
  onOpenDetails: () => void;
  onToggle: () => void;
  onUpdateStatus: (status: PartnerApprovalStatus) => void;
  request: PartnerAdminRequestRecord;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        disabled={isBusy}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-3 text-xs font-bold text-[color:var(--bc-text)] transition hover:border-[rgba(120,84,162,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? <LoaderCircle size={15} className="animate-spin" /> : <MoreHorizontal size={16} />}
        <span className="hidden xl:inline">Acoes</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-[rgba(120,84,162,0.14)] bg-white py-1 text-left shadow-[0_18px_44px_rgba(31,35,43,0.16)]">
          <ActionMenuButton icon={Eye} label="Ver detalhes" onClick={onOpenDetails} />
          {request.status !== 'approved' ? (
            <ActionMenuButton icon={CheckCircle2} label="Aprovar" onClick={() => onUpdateStatus('approved')} />
          ) : null}
          {request.status !== 'rejected' ? (
            <ActionMenuButton icon={Slash} label="Rejeitar" onClick={() => onUpdateStatus('rejected')} />
          ) : null}
          {request.status !== 'blocked' ? (
            <ActionMenuButton icon={ShieldBan} label="Bloquear" onClick={() => onUpdateStatus('blocked')} />
          ) : null}
          <div className="my-1 h-px bg-[rgba(120,84,162,0.1)]" />
          <ActionMenuButton danger icon={Trash2} label="Excluir" onClick={onDelete} />
        </div>
      ) : null}
    </>
  );
}

function ActionMenuButton({
  danger = false,
  icon: Icon,
  label,
  onClick,
}: {
  danger?: boolean;
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2 px-3 py-2 text-xs font-bold transition',
        danger ? 'text-red-700 hover:bg-red-50' : 'text-[color:var(--bc-text)] hover:bg-[rgba(120,84,162,0.06)]',
      ].join(' ')}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: PartnerApprovalStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${statusClasses(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

function EmptyState({ message, onReload }: { message: string; onReload: () => Promise<void> }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-[rgba(120,84,162,0.2)] bg-[rgba(120,84,162,0.04)] p-8 text-center">
      <p className="text-lg font-black tracking-[-0.03em] text-[color:var(--bc-text)]">{message}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--bc-muted)]">
        Quando novos cadastros chegarem pelo formulario de parceiros, eles aparecem aqui para analise.
      </p>
      <button
        type="button"
        onClick={() => {
          void onReload();
        }}
        className="bc-button-secondary mt-5 h-10 gap-2 px-5 text-xs"
      >
        <RefreshCw size={14} />
        Atualizar lista
      </button>
    </div>
  );
}

function PartnerDetailsModal({
  onClose,
  request,
}: {
  onClose: () => void;
  request: PartnerAdminRequestRecord;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm md:items-center">
      <article className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.4rem] border border-[rgba(120,84,162,0.14)] bg-white p-5 shadow-[0_24px_80px_rgba(31,35,43,0.22)] md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="bc-kicker">Detalhes da solicitacao</p>
            <h3 className="mt-1 truncate text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
              {request.fullName}
            </h3>
            <div className="mt-3">
              <StatusBadge status={request.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(120,84,162,0.14)] text-[color:var(--bc-muted)] transition hover:border-[rgba(120,84,162,0.3)] hover:text-[color:var(--bc-text)]"
            aria-label="Fechar detalhes"
          >
            <X size={16} />
          </button>
        </div>

        <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          <DetailItem label="Nome" value={request.fullName} />
          <DetailItem label="E-mail" value={request.email} />
          <DetailItem label="Telefone" value={request.whatsapp} />
          <DetailItem label="Cidade/estado" value={[request.city, request.state].filter(Boolean).join(' / ') || '-'} />
          <DetailItem label="Empresa" value={truncate(request.company)} />
          <DetailItem label="Area de atuacao" value={truncate(request.areaOfWork)} />
          <DetailItem label="Ja atua com beleza" value={request.alreadyWorksWithBeauty ? 'Sim' : 'Nao'} />
          <DetailItem label="Codigo parceiro" value={truncate(request.partnerCode)} />
          <DetailItem className="md:col-span-2" label="Plano de indicacao" value={truncate(request.referralPlan)} />
          <DetailItem className="md:col-span-2" label="Mensagem adicional" value={truncate(request.additionalMessage)} />
          <DetailItem label="Data do cadastro" value={formatDateTime(request.createdAt)} />
          <DetailItem label="Ultima revisao" value={formatDateTime(request.reviewedAt)} />
          <DetailItem className="md:col-span-2" label="Observacao interna" value={truncate(request.reviewNotes)} />
        </dl>
      </article>
    </div>
  );
}

function DetailItem({
  className = '',
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={`rounded-xl border border-[rgba(120,84,162,0.1)] bg-[rgba(120,84,162,0.04)] p-3 ${className}`}>
      <dt className="text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-6 text-[color:var(--bc-text)]">{value}</dd>
    </div>
  );
}
