'use client';

import { CheckCircle2, CircleAlert, Eye, EyeOff, LoaderCircle, ShieldAlert, UserPlus, UserX } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

import type { PlatformAdministratorRecord } from '@/lib/admin/administrators';

type AdministratorsAdminPanelProps = {
  currentSessionEmail: string;
  currentSessionUserId?: string;
  initialAdministrators: PlatformAdministratorRecord[];
};

type CreateFormState = {
  email: string;
  temporaryPassword: string;
};

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

function statusClasses(label: string, isActive: boolean | null) {
  if (isActive === false) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  const normalized = label.trim().toLowerCase();

  if (normalized === 'inativo' || normalized === 'inactive' || normalized === 'blocked') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function sortAdministrators(rows: PlatformAdministratorRecord[]) {
  return [...rows].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bDate - aDate;
  });
}

export function AdministratorsAdminPanel({
  currentSessionEmail,
  currentSessionUserId,
  initialAdministrators,
}: AdministratorsAdminPanelProps) {
  const [administrators, setAdministrators] = useState(() => sortAdministrators(initialAdministrators));
  const [form, setForm] = useState<CreateFormState>({
    email: '',
    temporaryPassword: '',
  });
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatePasswordVisible, setIsCreatePasswordVisible] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const normalizedSessionEmail = useMemo(() => currentSessionEmail.trim().toLowerCase(), [currentSessionEmail]);

  async function reloadList() {
    setIsLoadingList(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/administradores', {
        method: 'GET',
      });
      const payload = (await response.json().catch(() => null)) as
        | { administrators?: PlatformAdministratorRecord[]; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel carregar a lista de administradores.');
      }

      setAdministrators(sortAdministrators(payload?.administrators ?? []));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Falha ao carregar administradores.',
      );
    } finally {
      setIsLoadingList(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    const temporaryPassword = form.temporaryPassword.trim();

    if (!email || !temporaryPassword) {
      setError('Preencha e-mail e senha temporaria para criar o administrador.');
      setMessage(null);
      return;
    }

    setIsCreating(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/administradores', {
        body: JSON.stringify({
          email,
          temporaryPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            administrator?: PlatformAdministratorRecord;
            message?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel criar administrador.');
      }

      const createdAdministrator = payload?.administrator;

      if (createdAdministrator) {
        setAdministrators((current) => {
          const deduped = current.filter(
            (row) =>
              row.userId !== createdAdministrator.userId &&
              row.email !== createdAdministrator.email,
          );
          deduped.unshift(createdAdministrator);
          return sortAdministrators(deduped);
        });
      } else {
        await reloadList();
      }

      setForm({
        email: '',
        temporaryPassword: '',
      });
      setIsCreatePasswordVisible(false);
      setMessage(payload?.message ?? 'Administrador criado com sucesso.');
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : 'Falha ao criar administrador.',
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleResetPassword(administrator: PlatformAdministratorRecord) {
    const temporaryPassword =
      window.prompt(`Nova senha temporaria para ${administrator.email}:`)?.trim() ?? '';

    if (!temporaryPassword) {
      return;
    }

    setBusyUserId(administrator.userId);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/administradores', {
        body: JSON.stringify({
          administratorEmail: administrator.email,
          administratorId: administrator.userId,
          temporaryPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel resetar a senha do administrador.');
      }

      setMessage(payload?.message ?? 'Senha temporaria redefinida com sucesso.');
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : 'Falha ao resetar senha do administrador.',
      );
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleRemoveAccess(administrator: PlatformAdministratorRecord) {
    if (
      !window.confirm(
        'Tem certeza que deseja remover este administrador? Essa ação pode excluir o acesso dele ao sistema.',
      )
    ) {
      return;
    }

    setBusyUserId(administrator.userId);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/administradores', {
        body: JSON.stringify({
          administratorEmail: administrator.email,
          administratorId: administrator.userId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; updated?: { preservedLinks?: string[] } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel remover o acesso admin.');
      }

      await reloadList();
      const links = payload?.updated?.preservedLinks ?? [];
      const suffix = links.length > 0 ? ` Vinculos preservados: ${links.join(', ')}.` : '';
      setMessage(`${payload?.message ?? 'Acesso admin removido com sucesso.'}${suffix}`);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Falha ao remover acesso administrativo.',
      );
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_16px_36px_rgba(110,84,144,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="bc-kicker">Novo administrador</p>
            <h2 className="text-xl font-black tracking-[-0.03em] text-[color:var(--bc-text)]">
              Criar acesso administrativo
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              void reloadList();
            }}
            disabled={isLoadingList}
            className="inline-flex h-10 items-center rounded-full border border-[rgba(120,84,162,0.14)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--bc-muted)] transition hover:border-[rgba(216,178,123,0.34)] hover:text-[color:var(--bc-text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingList ? 'Atualizando...' : 'Atualizar lista'}
          </button>
        </div>

        <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
          <label className="grid gap-1 text-sm font-semibold text-[color:var(--bc-text)]">
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="novo.admin@belezacarioca.com"
              className="h-11 rounded-xl border border-[rgba(120,84,162,0.16)] px-3 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.3)] focus:ring-2 focus:ring-[rgba(120,84,162,0.12)]"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-[color:var(--bc-text)]">
            Senha temporaria
            <div className="relative">
              <input
                type={isCreatePasswordVisible ? 'text' : 'password'}
                value={form.temporaryPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    temporaryPassword: event.target.value,
                  }))
                }
                placeholder="Minimo 8 caracteres"
                className="h-11 w-full rounded-xl border border-[rgba(120,84,162,0.16)] px-3 pr-11 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.3)] focus:ring-2 focus:ring-[rgba(120,84,162,0.12)]"
              />
              <button
                type="button"
                onClick={() => setIsCreatePasswordVisible((current) => !current)}
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--bc-muted)] transition hover:bg-[rgba(120,84,162,0.08)] hover:text-[color:var(--bc-text)]"
                aria-label={isCreatePasswordVisible ? 'Ocultar senha temporaria' : 'Mostrar senha temporaria'}
                aria-pressed={isCreatePasswordVisible}
              >
                {isCreatePasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>
          <div className="md:pt-6">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[rgba(120,84,162,0.22)] bg-[rgba(120,84,162,0.1)] px-4 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-purple-strong)] transition hover:border-[rgba(120,84,162,0.34)] hover:bg-[rgba(120,84,162,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle size={14} className="animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <UserPlus size={14} />
                  Criar administrador
                </span>
              )}
            </button>
          </div>
        </form>

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

      <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white shadow-[0_18px_40px_rgba(110,84,144,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-sm">
            <thead className="bg-[rgba(120,84,162,0.06)] text-left text-xs uppercase tracking-[0.1em] text-[color:var(--bc-muted)]">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {administrators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[color:var(--bc-muted)]">
                    Nenhum administrador encontrado.
                  </td>
                </tr>
              ) : (
                administrators.map((administrator) => {
                  const isBusy = busyUserId === administrator.userId;
                  const isSelf =
                    administrator.email.trim().toLowerCase() === normalizedSessionEmail ||
                    (currentSessionUserId ? administrator.userId === currentSessionUserId : false);

                  return (
                    <tr key={`${administrator.userId}-${administrator.email}`} className="border-t border-[rgba(120,84,162,0.08)]">
                      <td className="px-4 py-3 font-semibold text-[color:var(--bc-text)]">
                        {administrator.fullName ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-[color:var(--bc-muted)]">{administrator.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border border-[rgba(120,84,162,0.2)] bg-[rgba(120,84,162,0.08)] px-3 py-1 text-xs font-bold text-[color:var(--bc-purple-strong)]">
                          {administrator.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClasses(administrator.statusLabel, administrator.isActive)}`}>
                          {administrator.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[color:var(--bc-muted)]">
                        {formatDateTime(administrator.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              void handleResetPassword(administrator);
                            }}
                            className="inline-flex h-9 items-center rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-3 text-xs font-bold text-[color:var(--bc-text)] transition hover:border-[rgba(120,84,162,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy ? (
                              <span className="inline-flex items-center gap-1">
                                <LoaderCircle size={12} className="animate-spin" />
                                Processando
                              </span>
                            ) : (
                              'Resetar senha'
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || isSelf}
                            onClick={() => {
                              void handleRemoveAccess(administrator);
                            }}
                            className="inline-flex h-9 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                            title={isSelf ? 'Nao e permitido remover seu proprio acesso admin.' : undefined}
                          >
                            <UserX size={12} className="mr-1" />
                            Remover acesso
                          </button>
                          {isSelf ? (
                            <span className="inline-flex h-9 items-center rounded-full border border-[rgba(120,84,162,0.14)] bg-[rgba(120,84,162,0.06)] px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--bc-muted)]">
                              <ShieldAlert size={12} className="mr-1" />
                              Usuario atual
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
