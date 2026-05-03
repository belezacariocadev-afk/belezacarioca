import { NextResponse } from 'next/server';

import { canAccessModule } from '@/lib/platform/access';
import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import { establishmentProfileIds, type PlatformSession } from '@/lib/platform/auth/session';
import {
  evaluateSalonCommercialAccess,
  isCommercialActionBlocked,
  type SalonCommercialAccessInput,
} from '@/lib/platform/billing/commercial-access';
import {
  addSupabaseEmployee,
  archiveSupabaseClient,
  deleteSupabaseAppointment,
  deleteSupabaseClient,
  deleteSupabaseProfessionalScheduleException,
  deleteSupabaseProfessional,
  deleteSupabaseService,
  loadSupabasePlatformSnapshot,
  resolveSupabaseSalonIdByIdOrSlug,
  syncActiveProfessionalsToPublicBooking,
  updateSupabaseProfessionalAvatar,
  updateSupabaseSalonAppearance,
  upsertSupabasePlatformSnapshot,
} from '@/lib/platform/data/adapters/supabase-platform-adapter';
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
  updateAppointmentRecord,
  updateAppointmentStatusRecordResult,
  updateClientRecord,
  updateProfessionalRecord,
  updateProfessionalAvatarRecord,
  updateSalonAppearanceRecord,
  updateSalonSettingsRecord,
  updateServiceRecord,
  upsertAccountClosureRecordResult,
} from '@/lib/platform/data/repositories';
import { createInitialPlatformData } from '@/lib/platform/data/seed';
import type {
  AccountClosureInput,
  AppointmentInput,
  ClientInput,
  CreateAppointmentResult,
  DeleteAppointmentResult,
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
import { isSupabaseDataSourceRequested } from '@/lib/platform/supabase/config';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type PlatformActionRequest =
  | { action: 'createClient'; payload: ClientInput }
  | { action: 'updateClient'; payload: { clientId: string; input: ClientInput } }
  | { action: 'deleteClient'; payload: { clientId: string } }
  | { action: 'createProfessional'; payload: ProfessionalInput }
  | { action: 'addEmployee'; payload: ProfessionalInput }
  | { action: 'updateProfessional'; payload: { professionalId: string; input: ProfessionalInput } }
  | { action: 'updateProfessionalAvatar'; payload: { professionalId: string; avatarUrl?: string } }
  | { action: 'deleteProfessional'; payload: { professionalId: string } }
  | { action: 'createProfessionalScheduleException'; payload: ProfessionalScheduleExceptionInput }
  | { action: 'deleteProfessionalScheduleException'; payload: { exceptionId: string } }
  | { action: 'createService'; payload: ServiceInput }
  | { action: 'updateService'; payload: { serviceId: string; input: ServiceInput } }
  | { action: 'deleteService'; payload: { serviceId: string } }
  | { action: 'updateSalonAppearance'; payload: SalonAppearanceInput }
  | { action: 'updateSalonSettings'; payload: SalonSettingsInput }
  | { action: 'syncPublicBooking'; payload?: never }
  | { action: 'createAppointment'; payload: AppointmentInput }
  | { action: 'updateAppointment'; payload: { appointmentId: string; input: AppointmentInput } }
  | { action: 'deleteAppointment'; payload: { appointmentId: string; mode?: 'cancelled' | 'deleted' } }
  | { action: 'rescheduleAppointment'; payload: { appointmentId: string; input: AppointmentInput } }
  | { action: 'updateAppointmentStatus'; payload: { appointmentId: string; status: AppointmentStatus } }
  | { action: 'respondAppointmentRequest'; payload: { appointmentId: string; input: RespondAppointmentRequestInput } }
  | { action: 'updateAttendanceStatus'; payload: { attendanceId: string; status: AttendanceStatus } }
  | { action: 'upsertAccountClosure'; payload: { appointmentId: string; input: AccountClosureInput } }
  | { action: 'registerPayment'; payload: { accountClosureId: string; input: PaymentInput } }
  | { action: 'reset'; payload?: never };

type PlatformActionResult = {
  result?:
    | CreateAppointmentResult
    | DeleteAppointmentResult
    | DeleteClientResult
    | UpdateAppointmentResult
    | UpdateAppointmentStatusResult
    | RespondAppointmentRequestResult
    | UpdateAttendanceStatusResult
    | UpsertAccountClosureResult
    | RegisterPaymentResult
    | DeleteServiceResult
    | { ok: true; message: string; professional: PlatformDataSnapshot['professionals'][number] }
    | { ok: true; message: string; avatarUrl?: string }
    | { ok: true; message: string; syncedCount: number };
  snapshot: PlatformDataSnapshot;
};

export async function POST(request: Request) {
  const session = readPlatformSessionFromRequest(request);
  let requestedAction: PlatformActionRequest['action'] | undefined;

  if (!session) {
    return NextResponse.json({ message: 'Sessao obrigatoria.' }, { status: 401 });
  }

  if (!isSupabaseDataSourceRequested()) {
    return NextResponse.json({ message: 'Fonte Supabase nao esta ativa.' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as PlatformActionRequest;
    requestedAction = body.action;
    console.info('[platform-actions] received action', {
      action: body.action,
      salon_id: session.salonId,
    });

    if (body.action === 'reset' && process.env.NEXT_PUBLIC_ENABLE_DEMO_SEED !== 'true') {
      return NextResponse.json({ message: 'Seed demo desativado com Supabase ativo.' }, { status: 400 });
    }

    const commercialBlock = await resolveCommercialActionBlock(session, body.action);

    if (commercialBlock) {
      return commercialBlock;
    }

    if (body.action === 'deleteAppointment') {
      if (!canAccessModule(session.profileId, 'agenda')) {
        return NextResponse.json({ message: 'Perfil sem permissao para esta acao.' }, { status: 403 });
      }

      const result = await deleteSupabaseAppointment(body.payload.appointmentId, session, body.payload.mode ?? 'deleted');

      return NextResponse.json({
        result,
      });
    }

    if (body.action === 'addEmployee') {
      if (!canAccessModule(session.profileId, 'profissionais')) {
        return NextResponse.json({ message: 'Perfil sem permissao para esta acao.' }, { status: 403 });
      }

      const professional = await addSupabaseEmployee(body.payload, session);

      return NextResponse.json({
        result: {
          ok: true,
          message: 'Profissional criado com sucesso.',
          professional,
        },
      });
    }

    const current = body.action === 'reset' ? createInitialPlatformData() : await loadSupabasePlatformSnapshot(session);

    if (!canRunAction(session, body, current)) {
      return NextResponse.json({ message: 'Perfil sem permissao para esta acao.' }, { status: 403 });
    }

    const applied = applyAction(current, body, session);

    if (body.action === 'deleteProfessionalScheduleException') {
      await deleteSupabaseProfessionalScheduleException(body.payload.exceptionId, session);
    }

    if (body.action === 'deleteProfessional') {
      const hasAppointments = current.appointments.some((appointment) => appointment.professionalId === body.payload.professionalId);

      await deleteSupabaseProfessional(body.payload.professionalId, session, { hasAppointments });
    }

    if (body.action === 'deleteClient') {
      const result = applied.result as DeleteClientResult | undefined;

      if (result?.ok && result.mode === 'deleted') {
        await deleteSupabaseClient(body.payload.clientId, session);
      } else if (result?.ok) {
        await archiveSupabaseClient(body.payload.clientId, session);
      }
    }

    if (body.action === 'deleteService') {
      await deleteSupabaseService(body.payload.serviceId, session);
    }

    let actionResult = applied.result;

    if (body.action === 'updateSalonAppearance') {
      const salonId = await resolveSupabaseSalonIdByIdOrSlug(body.payload.salonIdOrSlug ?? session.salonId, session);

      if (salonId !== current.salon.id) {
        return NextResponse.json({ message: 'Perfil sem permissao para atualizar este salao.' }, { status: 403 });
      }

      await updateSupabaseSalonAppearance(applied.snapshot, session, salonId);
    } else if (body.action === 'updateProfessionalAvatar') {
      const professional = await updateSupabaseProfessionalAvatar(body.payload.professionalId, body.payload.avatarUrl, session);

      actionResult = {
        ok: true,
        message: 'Foto do profissional atualizada com sucesso.',
        avatarUrl: professional?.avatar_url ?? body.payload.avatarUrl,
      };
    } else {
      await upsertSupabasePlatformSnapshot(applied.snapshot, session);
    }

    const syncResult = body.action === 'syncPublicBooking'
      ? await syncActiveProfessionalsToPublicBooking(applied.snapshot, session)
      : null;

    const responseSnapshot = body.action === 'updateProfessionalAvatar'
      ? applied.snapshot
      : await loadSupabasePlatformSnapshot(session);

    return NextResponse.json({
      ...applied,
      result: syncResult
        ? {
            ok: true,
            message: 'Fluxo publico sincronizado com sucesso.',
            syncedCount: syncResult.syncedCount,
          }
        : actionResult,
      snapshot: responseSnapshot,
    });
  } catch (error) {
    console.error('[platform-actions] Falha ao executar action', {
      action: requestedAction,
      error,
    });
    const rawMessage = error instanceof Error ? error.message : 'Falha ao gravar dados no Supabase.';

    if (requestedAction === 'updateProfessionalAvatar') {
      return NextResponse.json(
        {
          message: 'N\u00e3o foi poss\u00edvel atualizar a foto. Tente novamente.',
        },
        { status: 503 },
      );
    }

    if (requestedAction === 'deleteAppointment') {
      return NextResponse.json(
        {
          message: 'N\u00e3o foi poss\u00edvel excluir este agendamento. Tente novamente.',
        },
        { status: 503 },
      );
    }

    if (requestedAction === 'addEmployee') {
      return NextResponse.json(
        {
          message: 'N\u00e3o foi poss\u00edvel criar o profissional. Tente novamente.',
        },
        { status: 503 },
      );
    }

    const message = isProfessionalDuplicateError(rawMessage)
      ? 'Este profissional já está cadastrado.'
      : requestedAction === 'deleteProfessional'
        ? 'Não foi possível excluir este profissional. Verifique sua permissão e tente novamente.'
        : rawMessage;
    const status = message === 'Este profissional já está cadastrado.' ? 409 : 503;

    return NextResponse.json(
      {
        message,
      },
      { status },
    );
  }
}

function isProfessionalDuplicateError(message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes('este profissional já está cadastrado') ||
    normalizedMessage.includes('23505') ||
    normalizedMessage.includes('professionals_unique_salon_email') ||
    normalizedMessage.includes('professionals_unique_salon_name_role')
  );
}

async function resolveCommercialActionBlock(session: PlatformSession, action: PlatformActionRequest['action']) {
  if (!establishmentProfileIds.includes(session.profileId) || action === 'reset') {
    return null;
  }

  const rows = await supabaseRestRequest<SalonCommercialAccessInput[]>('salons', {
    query:
      `id=eq.${encodeURIComponent(session.salonId)}` +
      '&select=subscription_status,current_period_end,trial_ends_at,selected_plan,professional_range,plan_label&limit=1',
    useServiceRole: true,
  });
  const access = evaluateSalonCommercialAccess(rows[0] ?? null);

  if (!isCommercialActionBlocked(action, access)) {
    return null;
  }

  return NextResponse.json(
    {
      commercialAccess: access,
      message: 'Seu acesso esta congelado. Regularize sua assinatura para continuar.',
    },
    { status: 403 },
  );
}

function canRunAction(session: PlatformSession, body: PlatformActionRequest, snapshot: PlatformDataSnapshot) {
  const isAdmin = session.profileId === 'salonAdmin' || session.profileId === 'platformAdmin';
  const isReception = session.profileId === 'reception';
  const canOperateAgenda = isAdmin || isReception || canAccessModule(session.profileId, 'agenda');
  const canOperateClients = isAdmin || isReception;
  const canOperateServices = isAdmin || isReception;

  switch (body.action) {
    case 'createClient':
    case 'updateClient':
    case 'deleteClient':
      return canOperateClients;
    case 'createProfessional':
    case 'addEmployee':
    case 'updateProfessional':
    case 'updateProfessionalAvatar':
    case 'deleteProfessional':
    case 'createProfessionalScheduleException':
    case 'deleteProfessionalScheduleException':
    case 'reset':
      return isAdmin;
    case 'createService':
    case 'updateService':
    case 'deleteService':
      return canOperateServices;
    case 'updateSalonSettings':
    case 'updateSalonAppearance':
    case 'syncPublicBooking':
      return isAdmin;
    case 'createAppointment':
      return (isAdmin || isReception) || (
        session.profileId === 'client' &&
        body.payload.clientId === session.actorId &&
        body.payload.status === 'requested'
      );
    case 'updateAppointment': {
      const appointment = snapshot.appointments.find((item) => item.id === body.payload.appointmentId);

      return (isAdmin || isReception) || (
        session.profileId === 'client' &&
        appointment?.clientId === session.actorId &&
        body.payload.input.clientId === session.actorId
      );
    }
    case 'deleteAppointment': {
      const appointment = snapshot.appointments.find((item) => item.id === body.payload.appointmentId);

      return Boolean(appointment && appointment.salonId === session.salonId && (isAdmin || isReception || canOperateAgenda));
    }
    case 'rescheduleAppointment': {
      const appointment = snapshot.appointments.find((item) => item.id === body.payload.appointmentId);

      return (
        session.profileId === 'client' &&
        appointment?.clientId === session.actorId &&
        body.payload.input.clientId === session.actorId
      );
    }
    case 'updateAppointmentStatus': {
      const appointment = snapshot.appointments.find((item) => item.id === body.payload.appointmentId);

      if (isAdmin || isReception) {
        return true;
      }

      if (!appointment) {
        return false;
      }

      if (session.profileId === 'professional') {
        return appointment.professionalId === session.actorId && ['inService', 'completed'].includes(body.payload.status);
      }

      if (session.profileId === 'client') {
        return appointment.clientId === session.actorId && body.payload.status === 'cancelled';
      }

      return canOperateAgenda;
    }
    case 'respondAppointmentRequest': {
      const appointment = snapshot.appointments.find((item) => item.id === body.payload.appointmentId);

      return Boolean(appointment && (isAdmin || isReception || canOperateAgenda) && appointment.salonId === session.salonId);
    }
    case 'updateAttendanceStatus': {
      const attendance = snapshot.attendanceRecords.find((item) => item.id === body.payload.attendanceId);

      if (isAdmin || isReception) {
        return true;
      }

      if (!attendance) {
        return false;
      }

      return (
        session.profileId === 'professional' &&
        attendance.professionalId === session.actorId &&
        ['inProgress', 'finished', 'reopened'].includes(body.payload.status)
      );
    }
    case 'upsertAccountClosure':
    case 'registerPayment':
      return isAdmin;
  }
}

function applyAction(snapshot: PlatformDataSnapshot, body: PlatformActionRequest, session: PlatformSession): PlatformActionResult {
  switch (body.action) {
    case 'createClient':
      return { snapshot: createClientRecord(snapshot, body.payload) };
    case 'updateClient':
      return { snapshot: updateClientRecord(snapshot, body.payload.clientId, body.payload.input) };
    case 'deleteClient':
      return deleteOrArchiveClientRecordResult(snapshot, body.payload.clientId);
    case 'createProfessional':
    case 'addEmployee':
      return { snapshot: createProfessionalRecord(snapshot, body.payload) };
    case 'updateProfessional':
      return { snapshot: updateProfessionalRecord(snapshot, body.payload.professionalId, body.payload.input) };
    case 'updateProfessionalAvatar':
      return { snapshot: updateProfessionalAvatarRecord(snapshot, body.payload.professionalId, body.payload.avatarUrl) };
    case 'deleteProfessional':
      return { snapshot: deleteProfessionalRecord(snapshot, body.payload.professionalId) };
    case 'createProfessionalScheduleException':
      return { snapshot: createProfessionalScheduleExceptionRecord(snapshot, body.payload) };
    case 'deleteProfessionalScheduleException':
      return { snapshot: deleteProfessionalScheduleExceptionRecord(snapshot, body.payload.exceptionId) };
    case 'createService':
      return { snapshot: createServiceRecord(snapshot, body.payload) };
    case 'updateService':
      return { snapshot: updateServiceRecord(snapshot, body.payload.serviceId, body.payload.input) };
    case 'deleteService':
      return {
        result: {
          ok: true,
          message: 'Serviço excluído com sucesso.',
          serviceId: body.payload.serviceId,
        },
        snapshot: deleteServiceRecord(snapshot, body.payload.serviceId),
      };
    case 'updateSalonSettings':
      return { snapshot: updateSalonSettingsRecord(snapshot, body.payload) };
    case 'updateSalonAppearance':
      return { snapshot: updateSalonAppearanceRecord(snapshot, body.payload) };
    case 'syncPublicBooking':
      return { snapshot };
    case 'createAppointment':
      return createAppointmentRecordResult(snapshot, body.payload);
    case 'updateAppointment':
      return { snapshot: updateAppointmentRecord(snapshot, body.payload.appointmentId, body.payload.input) };
    case 'deleteAppointment':
      return deleteOrCancelAppointmentRecordResult(snapshot, body.payload.appointmentId);
    case 'rescheduleAppointment':
      return rescheduleAppointmentRecordResult(snapshot, body.payload.appointmentId, body.payload.input);
    case 'updateAppointmentStatus':
      return updateAppointmentStatusRecordResult(snapshot, body.payload.appointmentId, body.payload.status, {
        actorId: session.actorId,
        profileId: session.profileId,
      });
    case 'respondAppointmentRequest':
      return respondAppointmentRequestRecordResult(snapshot, body.payload.appointmentId, body.payload.input);
    case 'updateAttendanceStatus':
      return updateAttendanceStatusRecordResult(snapshot, body.payload.attendanceId, body.payload.status);
    case 'upsertAccountClosure':
      return upsertAccountClosureRecordResult(snapshot, body.payload.appointmentId, body.payload.input);
    case 'registerPayment':
      return registerPaymentRecordResult(snapshot, body.payload.accountClosureId, body.payload.input);
    case 'reset':
      return { snapshot };
  }
}
