'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { usePlatformSession } from '@/components/platform/PlatformAuthProvider';
import { loadPlatformData, resetPlatformData, savePlatformData } from '@/lib/platform/data/browser-store';
import {
  createAppointmentRecordResult,
  createClientRecord,
  createProfessionalRecord,
  createProfessionalScheduleExceptionRecord,
  deleteOrArchiveClientRecordResult,
  deleteOrCancelAppointmentRecordResult,
  deleteProfessionalRecord,
  createServiceRecord,
  deleteServiceRecord,
  deleteProfessionalScheduleExceptionRecord,
  registerPaymentRecordResult,
  respondAppointmentRequestRecordResult,
  rescheduleAppointmentRecordResult,
  updateAttendanceStatusRecordResult,
  updateAppointmentStatusRecordResult,
  updateAppointmentRecord,
  updateSalonSettingsRecord,
  upsertAccountClosureRecordResult,
  updateClientRecord,
  updateProfessionalRecord,
  updateProfessionalAvatarRecord,
  updateSalonAppearanceRecord,
  updateServiceRecord,
} from '@/lib/platform/data/repositories';
import { createEmptyPlatformData, createInitialPlatformData } from '@/lib/platform/data/seed';
import { getBrowserPlatformDataSource, type PlatformDataSource } from '@/lib/platform/data/source';
import type {
  AccountClosureInput,
  AppointmentInput,
  ChargeActionResult,
  ChargeInput,
  ChargeUpdateInput,
  ClientInput,
  CreateAppointmentResult,
  DeleteAppointmentResult,
  DeleteChargeResult,
  DeleteClientResult,
  DeleteServiceResult,
  PaymentInput,
  PlatformDataSnapshot,
  ProfessionalScheduleExceptionInput,
  ProfessionalInput,
  SalonAppearanceInput,
  RegisterPaymentResult,
  RespondAppointmentRequestInput,
  RespondAppointmentRequestResult,
  SalonSettingsInput,
  ServiceInput,
  UpsertAccountClosureResult,
  UpdateAppointmentResult,
  UpdateAttendanceStatusResult,
  UpdateAppointmentStatusResult,
} from '@/lib/platform/data/schema';
import type { AppointmentStatus, AttendanceStatus } from '@/lib/platform/domain';
import type { ChargeRecord } from '@/lib/platform/domain';

type PlatformDataActions = {
  addEmployee: (input: ProfessionalInput) => Promise<{ ok: boolean; message: string; professional?: PlatformDataSnapshot['professionals'][number] }>;
  createClient: (input: ClientInput) => void;
  updateClient: (clientId: string, input: ClientInput) => void;
  deleteClient: (clientId: string) => Promise<DeleteClientResult>;
  createCharge: (input: ChargeInput) => Promise<ChargeActionResult>;
  updateCharge: (chargeId: string, input: ChargeUpdateInput) => Promise<ChargeActionResult>;
  deleteCharge: (chargeId: string) => Promise<DeleteChargeResult>;
  createProfessional: (input: ProfessionalInput) => void;
  updateProfessional: (professionalId: string, input: ProfessionalInput) => void;
  updateProfessionalAvatar: (professionalId: string, avatarUrl?: string) => Promise<{ ok: boolean; message: string; avatarUrl?: string }>;
  deleteProfessional: (professionalId: string) => void;
  createProfessionalScheduleException: (input: ProfessionalScheduleExceptionInput) => void;
  deleteProfessionalScheduleException: (exceptionId: string) => void;
  createService: (input: ServiceInput) => void;
  updateService: (serviceId: string, input: ServiceInput) => void;
  deleteService: (serviceId: string) => Promise<DeleteServiceResult>;
  updateSalonAppearance: (input: SalonAppearanceInput) => Promise<{ ok: boolean; message: string }>;
  updateSalonSettings: (input: SalonSettingsInput) => void;
  syncPublicBooking: () => Promise<{ ok: boolean; message: string }>;
  createAppointment: (input: AppointmentInput) => Promise<CreateAppointmentResult>;
  updateAppointment: (appointmentId: string, input: AppointmentInput) => void;
  deleteAppointment: (appointmentId: string) => Promise<DeleteAppointmentResult>;
  rescheduleAppointment: (appointmentId: string, input: AppointmentInput) => Promise<UpdateAppointmentResult>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<UpdateAppointmentStatusResult>;
  respondAppointmentRequest: (appointmentId: string, input: RespondAppointmentRequestInput) => Promise<RespondAppointmentRequestResult>;
  updateAttendanceStatus: (attendanceId: string, status: AttendanceStatus) => Promise<UpdateAttendanceStatusResult>;
  upsertAccountClosure: (appointmentId: string, input: AccountClosureInput) => Promise<UpsertAccountClosureResult>;
  registerPayment: (accountClosureId: string, input: PaymentInput) => Promise<RegisterPaymentResult>;
  reset: () => void;
};

type PlatformDataContextValue = {
  data: PlatformDataSnapshot;
  dataSource: PlatformDataSource;
  isHydrated: boolean;
  lastSyncError: string | null;
  actions: PlatformDataActions;
};

type PlatformActionResponse<TActionResult = undefined> = {
  result?: TActionResult;
  snapshot?: PlatformDataSnapshot;
};

type UpdateProfessionalAvatarResult = {
  ok: true;
  message: string;
  avatarUrl?: string;
};

type AddEmployeeResult = {
  ok: true;
  message: string;
  professional: PlatformDataSnapshot['professionals'][number];
};

const publicSalonRefreshEvent = 'beleza-carioca:public-salon-refresh';
const financeiroRefreshEvent = 'beleza-carioca:financeiro-refresh';

const PlatformDataContext = createContext<PlatformDataContextValue | null>(null);

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const { session } = usePlatformSession();
  const [dataSource, setDataSource] = useState<PlatformDataSource>(() => getBrowserPlatformDataSource());
  const [data, setData] = useState<PlatformDataSnapshot>(() =>
    getBrowserPlatformDataSource() === 'supabase' ? createEmptyPlatformData() : createInitialPlatformData(),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const requestedSource = getBrowserPlatformDataSource();

    async function loadData() {
      if (requestedSource === 'supabase') {
        const response = await fetch('/api/platform/snapshot', {
          cache: 'no-store',
        }).catch(() => null);

        if (isMounted && response?.ok) {
          const payload = (await response.json()) as { snapshot: PlatformDataSnapshot };
          console.info('[platform-data] Snapshot carregado', {
            professionals: payload.snapshot.professionals.length,
            salonId: payload.snapshot.salon.id,
          });
          setData(payload.snapshot);
          setDataSource('supabase');
          setLastSyncError(null);
          setIsHydrated(true);
          return;
        }

        if (isMounted) {
          const payload = (await response?.json().catch(() => null)) as { message?: string } | null;

          console.error('[platform-data] Falha ao carregar snapshot inicial:', payload);
          setDataSource('supabase');
          setLastSyncError(payload?.message ?? 'Nao foi possivel carregar os dados do painel agora. Tente novamente em instantes.');
          setIsHydrated(true);
        }

        return;
      }

      if (isMounted) {
        setData(loadPlatformData());
        setDataSource('local');
        setIsHydrated(true);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const syncSupabaseAction = useCallback(async <TActionResult = undefined,>(action: string, payload?: unknown) => {
    const response = await fetch('/api/platform/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(error?.message ?? 'Nao foi possivel atualizar os dados agora.');
    }

    const result = (await response.json()) as PlatformActionResponse<TActionResult>;
    if (result.snapshot) {
      setData(result.snapshot);
    }
    setLastSyncError(null);

    return result;
  }, []);

  const commit = useCallback((action: string, payload: unknown, producer: (current: PlatformDataSnapshot) => PlatformDataSnapshot) => {
    if (dataSource === 'supabase') {
      void syncSupabaseAction(action, payload).catch((error: unknown) => {
        setLastSyncError(error instanceof Error ? error.message : 'Nao foi possivel atualizar os dados agora.');
      });

      return;
    }

    try {
      const next = producer(data);

      savePlatformData(next);
      setData(next);
      setLastSyncError(null);
    } catch (error) {
      setLastSyncError(error instanceof Error ? error.message : 'Falha ao atualizar dados locais.');
    }
  }, [data, dataSource, syncSupabaseAction]);

  const actions = useMemo<PlatformDataActions>(
    () => ({
      addEmployee: async (input) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<AddEmployeeResult>('addEmployee', input);
            const professional = response.result?.professional;

            if (!professional) {
              return { ok: false, message: 'N\u00e3o foi poss\u00edvel criar o profissional. Tente novamente.' };
            }

            setData((current) => ({
              ...current,
              professionals: [...current.professionals.filter((item) => item.id !== professional.id), professional],
              updatedAt: new Date().toISOString(),
            }));
            setLastSyncError(null);
            notifyPublicSalonRefresh(data.salon.id, data.salon.slug);

            return {
              ok: true,
              message: 'Profissional criado com sucesso.',
              professional,
            };
          } catch (error) {
            console.error('[platform-data] Falha ao criar profissional:', error);
            const message = 'N\u00e3o foi poss\u00edvel criar o profissional. Tente novamente.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        try {
          const next = createProfessionalRecord(data, input);
          const professional = next.professionals[next.professionals.length - 1];

          savePlatformData(next);
          setData(next);
          setLastSyncError(null);
          notifyPublicSalonRefresh(next.salon.id, next.salon.slug);

          return {
            ok: true,
            message: 'Profissional criado com sucesso.',
            professional,
          };
        } catch (error) {
          console.error('[platform-data] Falha ao criar profissional:', error);
          const message = 'N\u00e3o foi poss\u00edvel criar o profissional. Tente novamente.';
          setLastSyncError(message);

          return { ok: false, message };
        }
      },
      createClient: (input) => commit('createClient', input, (current) => createClientRecord(current, input)),
      updateClient: (clientId, input) =>
        commit('updateClient', { clientId, input }, (current) => updateClientRecord(current, clientId, input)),
      deleteClient: async (clientId) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<DeleteClientResult>('deleteClient', { clientId });

            return response.result ?? { ok: false, message: 'Nao foi possivel confirmar a exclusao do cliente.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel excluir este cliente.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        const response = deleteOrArchiveClientRecordResult(data, clientId);

        if (response.result.ok) {
          savePlatformData(response.snapshot);
          setData(response.snapshot);
        }

        return response.result;
      },
      createCharge: async (input) => {
        if (dataSource === 'supabase') {
          try {
            const response = await fetch('/api/financeiro/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            });

            if (!response.ok) {
              throw new Error((await response.json().catch(() => null))?.message ?? 'Finance create failed');
            }

            const payload = (await response.json()) as { charge: ChargeRecord; message?: string };
            setData((current) => ({
              ...current,
              charges: [payload.charge, ...current.charges.filter((charge) => charge.id !== payload.charge.id)],
              updatedAt: new Date().toISOString(),
            }));
            setLastSyncError(null);
            notifyFinanceiroRefresh(payload.charge.salonId);

            return { ok: true, charge: payload.charge, message: 'Cobrança criada com sucesso.' };
          } catch (error) {
            console.error('[platform-data] Falha ao criar cobranca:', error);
            const message = 'Não foi possível criar cobrança. Tente novamente.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        try {
          const charge = createLocalCharge(data.salon.id, input);

          setData((current) => ({
            ...current,
            charges: [charge, ...current.charges],
            updatedAt: new Date().toISOString(),
          }));
          setLastSyncError(null);
          notifyFinanceiroRefresh(charge.salonId);

          return { ok: true, charge, message: 'Cobrança criada com sucesso.' };
        } catch (error) {
          console.error('[platform-data] Falha ao criar cobranca local:', error);
          const message = 'Não foi possível criar cobrança. Tente novamente.';
          setLastSyncError(message);

          return { ok: false, message };
        }
      },
      updateCharge: async (chargeId, input) => {
        if (dataSource === 'supabase') {
          try {
            const response = await fetch(`/api/financeiro/${encodeURIComponent(chargeId)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            });

            if (!response.ok) {
              throw new Error((await response.json().catch(() => null))?.message ?? 'Finance update failed');
            }

            const payload = (await response.json()) as { charge: ChargeRecord; message?: string };
            setData((current) => ({
              ...current,
              charges: current.charges.map((charge) => (charge.id === payload.charge.id ? payload.charge : charge)),
              updatedAt: new Date().toISOString(),
            }));
            setLastSyncError(null);
            notifyFinanceiroRefresh(payload.charge.salonId);

            return { ok: true, charge: payload.charge, message: 'Cobrança atualizada com sucesso.' };
          } catch (error) {
            console.error('[platform-data] Falha ao atualizar cobranca:', error);
            const message = 'Não foi possível atualizar a cobrança. Tente novamente.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        const existing = data.charges.find((charge) => charge.id === chargeId);

        if (!existing) {
          return { ok: false, message: 'Não foi possível atualizar a cobrança. Tente novamente.' };
        }

        const charge = updateLocalCharge(existing, input);
        setData((current) => ({
          ...current,
          charges: current.charges.map((item) => (item.id === charge.id ? charge : item)),
          updatedAt: new Date().toISOString(),
        }));
        setLastSyncError(null);
        notifyFinanceiroRefresh(charge.salonId);

        return { ok: true, charge, message: 'Cobrança atualizada com sucesso.' };
      },
      deleteCharge: async (chargeId) => {
        const existing = data.charges.find((charge) => charge.id === chargeId);

        if (!existing) {
          return { ok: false, message: 'Não foi possível remover cobrança. Tente novamente.' };
        }

        if (dataSource === 'supabase') {
          try {
            const response = await fetch(`/api/financeiro/${encodeURIComponent(chargeId)}`, { method: 'DELETE' });

            if (!response.ok) {
              throw new Error((await response.json().catch(() => null))?.message ?? 'Finance delete failed');
            }

            setData((current) => ({
              ...current,
              charges: current.charges.filter((charge) => charge.id !== chargeId),
              updatedAt: new Date().toISOString(),
            }));
            setLastSyncError(null);
            notifyFinanceiroRefresh(existing.salonId);

            return { ok: true, chargeId, message: 'Cobrança removida com sucesso.' };
          } catch (error) {
            console.error('[platform-data] Falha ao remover cobranca:', error);
            const message = 'Não foi possível remover cobrança. Tente novamente.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        setData((current) => ({
          ...current,
          charges: current.charges.filter((charge) => charge.id !== chargeId),
          updatedAt: new Date().toISOString(),
        }));
        setLastSyncError(null);
        notifyFinanceiroRefresh(existing.salonId);

        return { ok: true, chargeId, message: 'Cobrança removida com sucesso.' };
      },
      createProfessional: (input) => commit('createProfessional', input, (current) => createProfessionalRecord(current, input)),
      updateProfessional: (professionalId, input) =>
        commit('updateProfessional', { professionalId, input }, (current) => updateProfessionalRecord(current, professionalId, input)),
      updateProfessionalAvatar: async (professionalId, avatarUrl) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<UpdateProfessionalAvatarResult>('updateProfessionalAvatar', { professionalId, avatarUrl });
            const savedAvatarUrl = response.result?.avatarUrl ?? avatarUrl;

            setData((current) => updateProfessionalAvatarRecord(current, professionalId, savedAvatarUrl));
            setLastSyncError(null);
            notifyPublicSalonRefresh(data.salon.id, data.salon.slug);
            return {
              ok: true,
              message: 'Foto do profissional atualizada com sucesso.',
              avatarUrl: savedAvatarUrl,
            };
          } catch (error) {
            console.error('[platform-data] Falha ao atualizar foto do profissional:', error);
            const message = 'N\u00e3o foi poss\u00edvel atualizar a foto. Tente novamente.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        try {
          const next = updateProfessionalAvatarRecord(data, professionalId, avatarUrl);

          savePlatformData(next);
          setData(next);
          setLastSyncError(null);
          notifyPublicSalonRefresh(next.salon.id, next.salon.slug);

          return { ok: true, message: 'Foto do profissional atualizada com sucesso.', avatarUrl };
        } catch (error) {
          console.error('[platform-data] Falha ao atualizar foto do profissional:', error);
          const message = 'N\u00e3o foi poss\u00edvel atualizar a foto. Tente novamente.';

          setLastSyncError(message);
          return { ok: false, message };
        }
      },
      deleteProfessional: (professionalId) =>
        commit('deleteProfessional', { professionalId }, (current) => deleteProfessionalRecord(current, professionalId)),
      createProfessionalScheduleException: (input) =>
        commit('createProfessionalScheduleException', input, (current) => createProfessionalScheduleExceptionRecord(current, input)),
      deleteProfessionalScheduleException: (exceptionId) =>
        commit('deleteProfessionalScheduleException', { exceptionId }, (current) =>
          deleteProfessionalScheduleExceptionRecord(current, exceptionId),
        ),
      createService: (input) => {
        commit('createService', input, (current) => createServiceRecord(current, input));
        notifyPublicSalonRefresh(data.salon.id, data.salon.slug);
      },
      updateService: (serviceId, input) => {
        commit('updateService', { serviceId, input }, (current) => updateServiceRecord(current, serviceId, input));
        notifyPublicSalonRefresh(data.salon.id, data.salon.slug);
      },
      deleteService: async (serviceId) => {
        const existing = data.services.find((service) => service.id === serviceId);

        if (!existing) {
          return { ok: false, message: 'Não foi possível excluir o serviço. Tente novamente.' };
        }

        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<DeleteServiceResult>('deleteService', { serviceId });
            const result = response.result;

            if (!result?.ok) {
              return { ok: false, message: result?.message ?? 'Não foi possível excluir o serviço. Tente novamente.' };
            }

            setData((current) => ({
              ...current,
              services: current.services.filter((service) => service.id !== serviceId),
              updatedAt: new Date().toISOString(),
            }));
            setLastSyncError(null);
            notifyPublicSalonRefresh(data.salon.id, data.salon.slug);

            return result;
          } catch (error) {
            console.error('[platform-data] Falha ao excluir servico:', error);
            const message = 'Não foi possível excluir o serviço. Tente novamente.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        const next = deleteServiceRecord(data, serviceId);
        savePlatformData(next);
        setData(next);
        setLastSyncError(null);
        notifyPublicSalonRefresh(data.salon.id, data.salon.slug);

        return { ok: true, message: 'Serviço excluído com sucesso.', serviceId };
      },
      updateSalonAppearance: async (input) => {
        if (dataSource === 'supabase') {
          try {
            await syncSupabaseAction('updateSalonAppearance', input);
            return { ok: true, message: 'Aparencia salva com sucesso.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel salvar a aparencia agora.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        try {
          const next = updateSalonAppearanceRecord(data, input);

          savePlatformData(next);
          setData(next);
          setLastSyncError(null);

          return { ok: true, message: 'Aparencia salva com sucesso.' };
        } catch {
          const message = 'Nao foi possivel salvar a aparencia agora.';

          setLastSyncError(message);
          return { ok: false, message };
        }
      },
      updateSalonSettings: (input) => commit('updateSalonSettings', input, (current) => updateSalonSettingsRecord(current, input)),
      syncPublicBooking: async () => {
        if (dataSource !== 'supabase') {
          const message = 'A sincronizacao do fluxo publico esta disponivel apenas no modo online.';

          setLastSyncError(message);
          return { ok: false, message };
        }

        try {
          await syncSupabaseAction('syncPublicBooking');
          setLastSyncError(null);
          return { ok: true, message: 'Fluxo publico sincronizado com sucesso.' };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Falha ao sincronizar fluxo publico.';

          setLastSyncError(message);
          return { ok: false, message };
        }
      },
      createAppointment: async (input) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<CreateAppointmentResult>('createAppointment', input);

            return response.result ?? { ok: false, message: 'Nao foi possivel confirmar a criacao do agendamento.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel atualizar os dados agora.';
            setLastSyncError(message);

            return {
              ok: false,
              message,
            };
          }
        }

        const response = createAppointmentRecordResult(data, input);

        if (response.result.ok) {
          savePlatformData(response.snapshot);
          setData(response.snapshot);
        }

        return response.result;
      },
      updateAppointment: (appointmentId, input) =>
        commit('updateAppointment', { appointmentId, input }, (current) => updateAppointmentRecord(current, appointmentId, input)),
      deleteAppointment: async (appointmentId) => {
        const localResponse = deleteOrCancelAppointmentRecordResult(data, appointmentId);

        if (!localResponse.result.ok) {
          return localResponse.result;
        }

        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<DeleteAppointmentResult>('deleteAppointment', {
              appointmentId,
              mode: localResponse.result.mode,
            });
            const result = response.result ?? localResponse.result;

            if (result.ok) {
              setData(localResponse.snapshot);
              setLastSyncError(null);
            }

            return result;
          } catch (error) {
            console.error('[platform-data] Falha ao excluir agendamento:', error);
            const message = 'N\u00e3o foi poss\u00edvel excluir este agendamento. Tente novamente.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        if (localResponse.result.ok) {
          savePlatformData(localResponse.snapshot);
          setData(localResponse.snapshot);
        }

        return localResponse.result;
      },
      rescheduleAppointment: async (appointmentId, input) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<UpdateAppointmentResult>('rescheduleAppointment', {
              appointmentId,
              input,
            });

            return response.result ?? { ok: false, message: 'Nao foi possivel confirmar o reagendamento.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel confirmar o reagendamento.';
            setLastSyncError(message);

            return {
              ok: false,
              message,
            };
          }
        }

        const response = rescheduleAppointmentRecordResult(data, appointmentId, input);

        if (response.result.ok) {
          savePlatformData(response.snapshot);
          setData(response.snapshot);
        }

        return response.result;
      },
      updateAppointmentStatus: async (appointmentId, status) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<UpdateAppointmentStatusResult>('updateAppointmentStatus', { appointmentId, status });

            return response.result ?? { ok: false, message: 'Nao foi possivel confirmar a atualizacao do agendamento.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel atualizar o status do agendamento.';
            setLastSyncError(message);

            return {
              ok: false,
              message,
            };
          }
        }

        const response = updateAppointmentStatusRecordResult(
          data,
          appointmentId,
          status,
          session
            ? {
                actorId: session.actorId,
                profileId: session.profileId,
              }
            : undefined,
        );

        if (response.result.ok) {
          savePlatformData(response.snapshot);
          setData(response.snapshot);
        }

        return response.result;
      },
      respondAppointmentRequest: async (appointmentId, input) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<RespondAppointmentRequestResult>('respondAppointmentRequest', { appointmentId, input });

            return response.result ?? { ok: false, message: 'Nao foi possivel confirmar a resposta do agendamento.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao responder agendamento.';
            setLastSyncError(message);

            return { ok: false, message };
          }
        }

        const response = respondAppointmentRequestRecordResult(data, appointmentId, input);

        if (response.result.ok) {
          savePlatformData(response.snapshot);
          setData(response.snapshot);
        }

        return response.result;
      },
      updateAttendanceStatus: async (attendanceId, status) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<UpdateAttendanceStatusResult>('updateAttendanceStatus', { attendanceId, status });

            return response.result ?? { ok: false, message: 'Nao foi possivel confirmar a atualizacao do atendimento.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel atualizar o atendimento.';
            setLastSyncError(message);

            return {
              ok: false,
              message,
            };
          }
        }

        const response = updateAttendanceStatusRecordResult(data, attendanceId, status);

        if (response.result.ok) {
          savePlatformData(response.snapshot);
          setData(response.snapshot);
        }

        return response.result;
      },
      upsertAccountClosure: async (appointmentId, input) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<UpsertAccountClosureResult>('upsertAccountClosure', { appointmentId, input });

            return response.result ?? { ok: false, message: 'Nao foi possivel confirmar o fechamento.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel atualizar o fechamento.';
            setLastSyncError(message);

            return {
              ok: false,
              message,
            };
          }
        }

        const response = upsertAccountClosureRecordResult(data, appointmentId, input);

        if (response.result.ok) {
          savePlatformData(response.snapshot);
          setData(response.snapshot);
        }

        return response.result;
      },
      registerPayment: async (accountClosureId, input) => {
        if (dataSource === 'supabase') {
          try {
            const response = await syncSupabaseAction<RegisterPaymentResult>('registerPayment', { accountClosureId, input });

            return response.result ?? { ok: false, message: 'Nao foi possivel confirmar o pagamento registrado.' };
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel registrar o pagamento.';
            setLastSyncError(message);

            return {
              ok: false,
              message,
            };
          }
        }

        const response = registerPaymentRecordResult(data, accountClosureId, input);

        if (response.result.ok) {
          savePlatformData(response.snapshot);
          setData(response.snapshot);
        }

        return response.result;
      },
      reset: () => {
        if (dataSource === 'supabase') {
          setLastSyncError('Os dados de exemplo estao desativados no modo online.');
          return;
        }

        const seed = resetPlatformData();
        setData(seed);
      },
    }),
    [commit, data, dataSource, session, syncSupabaseAction],
  );

  const value = useMemo(
    () => ({
      data,
      dataSource,
      isHydrated,
      lastSyncError,
      actions,
    }),
    [actions, data, dataSource, isHydrated, lastSyncError],
  );

  return <PlatformDataContext.Provider value={value}>{children}</PlatformDataContext.Provider>;
}

function notifyPublicSalonRefresh(salonId: string, salonSlug?: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  const detail = {
    salonId,
    salonSlug: salonSlug ?? null,
    timestamp: Date.now(),
  };

  window.dispatchEvent(new CustomEvent(publicSalonRefreshEvent, { detail }));

  try {
    window.localStorage.setItem(publicSalonRefreshEvent, JSON.stringify(detail));
  } catch {
    // Ignore browser storage restrictions; BroadcastChannel/custom event still cover active tabs.
  }

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(publicSalonRefreshEvent);
    channel.postMessage(detail);
    channel.close();
  }
}

function notifyFinanceiroRefresh(salonId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const detail = {
    salonId,
    timestamp: Date.now(),
  };

  window.dispatchEvent(new CustomEvent(financeiroRefreshEvent, { detail }));

  try {
    window.localStorage.setItem(financeiroRefreshEvent, JSON.stringify(detail));
  } catch {
    // Ignore browser storage restrictions; active views already receive the in-page event.
  }

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(financeiroRefreshEvent);
    channel.postMessage(detail);
    channel.close();
  }
}

function createLocalCharge(salonId: string, input: ChargeInput): ChargeRecord {
  const now = new Date().toISOString();

  return {
    id: globalThis.crypto.randomUUID(),
    salonId,
    amountCents: Math.max(0, Math.round(input.amountCents)),
    clientName: input.clientName.trim(),
    serviceName: input.serviceName.trim(),
    status: input.status,
    origin: 'manual',
    provider: 'manual',
    dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

function updateLocalCharge(charge: ChargeRecord, input: ChargeUpdateInput): ChargeRecord {
  return {
    ...charge,
    amountCents: input.amountCents === undefined ? charge.amountCents : Math.max(0, Math.round(input.amountCents)),
    clientName: input.clientName === undefined ? charge.clientName : input.clientName.trim(),
    dueDate: input.dueDate === undefined ? charge.dueDate : input.dueDate ? new Date(input.dueDate).toISOString() : undefined,
    serviceName: input.serviceName === undefined ? charge.serviceName : input.serviceName.trim(),
    status: input.status ?? charge.status,
    updatedAt: new Date().toISOString(),
  };
}

export function usePlatformData() {
  const context = useContext(PlatformDataContext);

  if (!context) {
    throw new Error('usePlatformData must be used inside PlatformDataProvider');
  }

  return context;
}
