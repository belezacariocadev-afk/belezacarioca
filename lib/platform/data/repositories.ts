import type {
  AccountClosureInput,
  AppointmentInput,
  ClientInput,
  CreateAppointmentResult,
  DeleteAppointmentResult,
  DeleteClientResult,
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
import { getClientCancellationEligibility, normalizeSalonSettings } from '@/lib/platform/data/client-cancellation-policy';
import { normalizeProfessionalSchedule } from '@/lib/platform/data/professional-schedule';
import type {
  AccountClosureRecord,
  AccessProfileId,
  AppointmentRecord,
  AppointmentStatus,
  AttendanceRecord,
  AttendanceStatus,
  ChargeRecord,
  PaymentRecord,
} from '@/lib/platform/domain';

type UpdateAppointmentStatusRecordOptions = {
  actorId?: string;
  profileId?: AccessProfileId;
  now?: Date;
};

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function touch(snapshot: PlatformDataSnapshot): PlatformDataSnapshot {
  return {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeText(value: string) {
  return value.trim();
}

function calculateEndsAt(startsAt: string, durationMinutes: number) {
  return new Date(new Date(startsAt).getTime() + durationMinutes * 60 * 1000).toISOString();
}

export function getAppointmentConflict(
  snapshot: PlatformDataSnapshot,
  input: AppointmentInput,
  ignoredAppointmentId?: string,
): string | null {
  const service = snapshot.services.find((item) => item.id === input.serviceId);
  const professional = snapshot.professionals.find((item) => item.id === input.professionalId);

  if (!service) {
    return 'Selecione um servico valido.';
  }

  if (!service.active) {
    return 'O servico selecionado esta inativo.';
  }

  if (!professional?.active) {
    return 'O profissional selecionado esta inativo.';
  }

  if (service.professionalIds.length > 0 && !service.professionalIds.includes(input.professionalId)) {
    return 'Este profissional nao esta habilitado para o servico selecionado.';
  }

  const startsAt = new Date(input.startsAt).getTime();
  const endsAt = new Date(calculateEndsAt(input.startsAt, service.durationMinutes)).getTime();

  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || endsAt <= startsAt) {
    return 'Informe data e horario validos.';
  }

  const conflict = snapshot.appointments.find((appointment) => {
    if (appointment.id === ignoredAppointmentId || appointment.professionalId !== input.professionalId) {
      return false;
    }

    if (appointment.status === 'cancelled' || appointment.status === 'noShow' || appointment.status === 'rejected') {
      return false;
    }

    const appointmentStartsAt = new Date(appointment.startsAt).getTime();
    const appointmentEndsAt = new Date(appointment.endsAt).getTime();

    return startsAt < appointmentEndsAt && endsAt > appointmentStartsAt;
  });

  if (conflict) {
    return `Conflito de horario com outro agendamento do profissional entre ${formatTime(conflict.startsAt)} e ${formatTime(conflict.endsAt)}.`;
  }

  return null;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function createClientRecord(snapshot: PlatformDataSnapshot, input: ClientInput): PlatformDataSnapshot {
  const now = new Date().toISOString();

  return touch({
    ...snapshot,
    clients: [
      ...snapshot.clients,
      {
        id: makeId('client'),
        salonId: snapshot.salon.id,
        name: normalizeText(input.name),
        phone: normalizeText(input.phone),
        email: input.email?.trim().toLowerCase() || undefined,
        notes: input.notes?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
}

export function updateClientRecord(snapshot: PlatformDataSnapshot, clientId: string, input: ClientInput): PlatformDataSnapshot {
  const now = new Date().toISOString();

  return touch({
    ...snapshot,
    clients: snapshot.clients.map((client) =>
      client.id === clientId
        ? {
            ...client,
            name: normalizeText(input.name),
            phone: normalizeText(input.phone),
            email: input.email?.trim().toLowerCase() || undefined,
            notes: input.notes?.trim() || undefined,
            updatedAt: now,
          }
        : client,
    ),
  });
}

export function deleteOrArchiveClientRecordResult(
  snapshot: PlatformDataSnapshot,
  clientId: string,
): { result: DeleteClientResult; snapshot: PlatformDataSnapshot } {
  const client = snapshot.clients.find((item) => item.id === clientId);

  if (!client || client.salonId !== snapshot.salon.id) {
    return {
      result: {
        ok: false,
        message: 'Cliente nao encontrado ou sem permissao para esta acao.',
      },
      snapshot,
    };
  }

  const hasHistory = snapshot.appointments.some((appointment) => appointment.clientId === clientId);
  const now = new Date().toISOString();

  if (!hasHistory) {
    return {
      result: {
        ok: true,
        mode: 'deleted',
        message: 'Cliente removido com sucesso.',
      },
      snapshot: touch({
        ...snapshot,
        clients: snapshot.clients.filter((item) => item.id !== clientId),
      }),
    };
  }

  return {
    result: {
      ok: true,
      mode: 'archived',
      message: 'Cliente arquivado com sucesso.',
    },
    snapshot: touch({
      ...snapshot,
      clients: snapshot.clients.map((item) =>
        item.id === clientId
          ? {
              ...item,
              archivedAt: item.archivedAt ?? now,
              updatedAt: now,
            }
          : item,
      ),
    }),
  };
}

export function createProfessionalRecord(snapshot: PlatformDataSnapshot, input: ProfessionalInput): PlatformDataSnapshot {
  assertUniqueProfessional(snapshot, input);

  const now = new Date().toISOString();
  const professionalId = makeId('pro');

  return touch({
    ...snapshot,
    professionals: [
      ...snapshot.professionals,
      {
        id: professionalId,
        salonId: snapshot.salon.id,
        profileId: `profile-${professionalId}`,
        accessProfileId: 'professional',
        name: normalizeText(input.name),
        email: input.email.trim().toLowerCase(),
        role: normalizeText(input.role),
        active: input.active,
        permissions: input.permissions,
        schedule: normalizeProfessionalSchedule(input.schedule),
        avatarUrl: input.avatarUrl?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
}

export function updateProfessionalRecord(
  snapshot: PlatformDataSnapshot,
  professionalId: string,
  input: ProfessionalInput,
): PlatformDataSnapshot {
  assertUniqueProfessional(snapshot, input, professionalId);

  const now = new Date().toISOString();

  return touch({
    ...snapshot,
    professionals: snapshot.professionals.map((professional) =>
      professional.id === professionalId
        ? {
            ...professional,
            name: normalizeText(input.name),
            email: input.email.trim().toLowerCase(),
            role: normalizeText(input.role),
            active: input.active,
            permissions: input.permissions,
            schedule: normalizeProfessionalSchedule(input.schedule),
            avatarUrl: input.avatarUrl?.trim() || undefined,
            updatedAt: now,
          }
        : professional,
    ),
  });
}

export function updateProfessionalAvatarRecord(
  snapshot: PlatformDataSnapshot,
  professionalId: string,
  avatarUrl?: string,
): PlatformDataSnapshot {
  const now = new Date().toISOString();

  return touch({
    ...snapshot,
    professionals: snapshot.professionals.map((professional) =>
      professional.id === professionalId
        ? {
            ...professional,
            avatarUrl: avatarUrl?.trim() || undefined,
            updatedAt: now,
          }
        : professional,
    ),
  });
}

export function deleteProfessionalRecord(snapshot: PlatformDataSnapshot, professionalId: string): PlatformDataSnapshot {
  const hasAppointments = snapshot.appointments.some((appointment) => appointment.professionalId === professionalId);

  return touch({
    ...snapshot,
    professionals: hasAppointments
      ? snapshot.professionals.filter((professional) => professional.id !== professionalId)
      : snapshot.professionals.filter((professional) => professional.id !== professionalId),
    professionalScheduleExceptions: (snapshot.professionalScheduleExceptions ?? []).filter(
      (exception) => exception.professionalId !== professionalId,
    ),
    services: snapshot.services.map((service) => ({
      ...service,
      professionalIds: service.professionalIds.filter((item) => item !== professionalId),
    })),
  });
}

function assertUniqueProfessional(snapshot: PlatformDataSnapshot, input: ProfessionalInput, currentProfessionalId?: string) {
  const email = input.email.trim().toLowerCase();
  const name = normalizeText(input.name).toLowerCase();
  const role = normalizeText(input.role).toLowerCase();
  const duplicate = snapshot.professionals.find((professional) => {
    if (professional.id === currentProfessionalId) {
      return false;
    }

    if (professional.salonId !== snapshot.salon.id) {
      return false;
    }

    if (email && professional.email.trim().toLowerCase() === email) {
      return true;
    }

    if (!email && !professional.email.trim() && professional.name.toLowerCase() === name && professional.role.toLowerCase() === role) {
      return true;
    }

    return false;
  });

  if (duplicate) {
    throw new Error('Este profissional já está cadastrado.');
  }
}

export function createProfessionalScheduleExceptionRecord(
  snapshot: PlatformDataSnapshot,
  input: ProfessionalScheduleExceptionInput,
): PlatformDataSnapshot {
  const professional = snapshot.professionals.find((item) => item.id === input.professionalId);

  if (!professional || !input.date) {
    return snapshot;
  }

  const now = new Date().toISOString();
  const startTime = input.startTime?.trim() || undefined;
  const endTime = input.endTime?.trim() || undefined;

  if ((input.type === 'manualBlock' || input.type === 'specialHours') && (!startTime || !endTime)) {
    return snapshot;
  }

  return touch({
    ...snapshot,
    professionalScheduleExceptions: [
      ...(snapshot.professionalScheduleExceptions ?? []),
      {
        id: makeId('schedule-exception'),
        salonId: snapshot.salon.id,
        professionalId: professional.id,
        date: input.date,
        type: input.type,
        startTime: input.type === 'dayOff' ? undefined : startTime,
        endTime: input.type === 'dayOff' ? undefined : endTime,
        reason: input.reason?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
}

export function deleteProfessionalScheduleExceptionRecord(
  snapshot: PlatformDataSnapshot,
  exceptionId: string,
): PlatformDataSnapshot {
  return touch({
    ...snapshot,
    professionalScheduleExceptions: (snapshot.professionalScheduleExceptions ?? []).filter((item) => item.id !== exceptionId),
  });
}

export function createServiceRecord(snapshot: PlatformDataSnapshot, input: ServiceInput): PlatformDataSnapshot {
  const now = new Date().toISOString();

  return touch({
    ...snapshot,
    services: [
      ...snapshot.services,
      {
        id: makeId('service'),
        salonId: snapshot.salon.id,
        name: normalizeText(input.name),
        category: normalizeText(input.category) || 'Geral',
        durationMinutes: Math.max(5, input.durationMinutes),
        priceCents: Math.max(0, input.priceCents),
        active: input.active,
        professionalIds: input.professionalIds,
        notes: input.notes?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
}

export function updateServiceRecord(snapshot: PlatformDataSnapshot, serviceId: string, input: ServiceInput): PlatformDataSnapshot {
  const now = new Date().toISOString();

  return touch({
    ...snapshot,
    services: snapshot.services.map((service) =>
      service.id === serviceId
        ? {
            ...service,
            name: normalizeText(input.name),
            category: normalizeText(input.category) || 'Geral',
            durationMinutes: Math.max(5, input.durationMinutes),
            priceCents: Math.max(0, input.priceCents),
            active: input.active,
            professionalIds: input.professionalIds,
            notes: input.notes?.trim() || undefined,
            updatedAt: now,
          }
        : service,
    ),
  });
}

export function deleteServiceRecord(snapshot: PlatformDataSnapshot, serviceId: string): PlatformDataSnapshot {
  return touch({
    ...snapshot,
    services: snapshot.services.filter((service) => service.id !== serviceId),
  });
}

export function updateSalonSettingsRecord(snapshot: PlatformDataSnapshot, input: SalonSettingsInput): PlatformDataSnapshot {
  return touch({
    ...snapshot,
    salon: {
      ...snapshot.salon,
      settings: normalizeSalonSettings(input),
    },
  });
}

export function updateSalonAppearanceRecord(snapshot: PlatformDataSnapshot, input: SalonAppearanceInput): PlatformDataSnapshot {
  return touch({
    ...snapshot,
    salon: {
      ...snapshot.salon,
      coverUrl: input.coverUrl?.trim() || undefined,
      logoUrl: input.logoUrl?.trim() || undefined,
      primaryColor: normalizeHexColor(input.primaryColor),
      themeMode: input.themeMode === 'dark' ? 'dark' : 'light',
    },
  });
}

function normalizeHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toUpperCase() : '#7C3AED';
}

export function createAppointmentRecord(snapshot: PlatformDataSnapshot, input: AppointmentInput): PlatformDataSnapshot {
  return createAppointmentRecordResult(snapshot, input).snapshot;
}

export function createAppointmentRecordResult(
  snapshot: PlatformDataSnapshot,
  input: AppointmentInput,
): { result: CreateAppointmentResult; snapshot: PlatformDataSnapshot } {
  const service = snapshot.services.find((item) => item.id === input.serviceId);

  if (!service) {
    return {
      result: {
        ok: false,
        message: 'Selecione um servico valido.',
      },
      snapshot,
    };
  }

  const conflict = getAppointmentConflict(snapshot, input);

  if (conflict) {
    return {
      result: {
        ok: false,
        message: conflict,
      },
      snapshot,
    };
  }

  const now = new Date().toISOString();
  const appointmentId = makeId('appointment');
  const appointment: AppointmentRecord = {
    id: appointmentId,
    salonId: snapshot.salon.id,
    clientId: input.clientId,
    professionalId: input.professionalId,
    serviceId: input.serviceId,
    startsAt: input.startsAt,
    endsAt: calculateEndsAt(input.startsAt, service.durationMinutes),
    status: input.status,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const next = touch({
    ...snapshot,
    appointments: [
      ...snapshot.appointments,
      appointment,
    ],
    charges: [
      ...snapshot.charges,
      {
        id: makeId('charge'),
        salonId: snapshot.salon.id,
        appointmentId,
        clientId: input.clientId,
        amountCents: service.priceCents,
        status: 'draft',
        origin: 'appointment',
        provider: 'manual',
        createdAt: now,
        updatedAt: now,
      },
    ],
  });

  return {
    result: {
      ok: true,
      appointment,
    },
    snapshot: next,
  };
}

export function updateAppointmentRecord(
  snapshot: PlatformDataSnapshot,
  appointmentId: string,
  input: AppointmentInput,
): PlatformDataSnapshot {
  const service = snapshot.services.find((item) => item.id === input.serviceId);

  if (!service || getAppointmentConflict(snapshot, input, appointmentId)) {
    return snapshot;
  }

  const now = new Date().toISOString();

  return touch({
    ...snapshot,
    appointments: snapshot.appointments.map((appointment) =>
      appointment.id === appointmentId
        ? {
            ...appointment,
            clientId: input.clientId,
            professionalId: input.professionalId,
            serviceId: input.serviceId,
            startsAt: input.startsAt,
            endsAt: calculateEndsAt(input.startsAt, service.durationMinutes),
            status: input.status,
            notes: input.notes?.trim() || undefined,
            salonResponseMessage: undefined,
            rejectedReason: undefined,
            confirmedAt: undefined,
            rejectedAt: undefined,
            updatedAt: now,
          }
        : appointment,
    ),
    charges: snapshot.charges.map((charge) =>
      charge.appointmentId === appointmentId
        ? {
            ...charge,
            clientId: input.clientId,
            amountCents: service.priceCents,
            updatedAt: now,
          }
        : charge,
    ),
    accountClosures: snapshot.accountClosures.map((closure) =>
      closure.appointmentId === appointmentId && closure.status !== 'paid'
        ? {
            ...closure,
            clientId: input.clientId,
            professionalId: input.professionalId,
            serviceId: input.serviceId,
            baseAmountCents: service.priceCents,
            finalAmountCents: calculateFinalAmount(service.priceCents, closure.discountCents, closure.additionCents),
            updatedAt: now,
          }
        : closure,
    ),
  });
}

export function deleteOrCancelAppointmentRecordResult(
  snapshot: PlatformDataSnapshot,
  appointmentId: string,
): { result: DeleteAppointmentResult; snapshot: PlatformDataSnapshot } {
  const appointment = snapshot.appointments.find((item) => item.id === appointmentId);

  if (!appointment || appointment.salonId !== snapshot.salon.id) {
    return {
      result: {
        ok: false,
        message: 'Agendamento nao encontrado ou sem permissao para esta acao.',
      },
      snapshot,
    };
  }

  return {
    result: {
      ok: true,
      mode: 'deleted',
      message: 'Agendamento removido com sucesso.',
    },
    snapshot: touch({
      ...snapshot,
      appointments: snapshot.appointments.filter((item) => item.id !== appointmentId),
      accountClosures: snapshot.accountClosures.filter((closure) => closure.appointmentId !== appointmentId),
      attendanceRecords: snapshot.attendanceRecords.filter((attendance) => attendance.appointmentId !== appointmentId),
      charges: snapshot.charges.filter((charge) => charge.appointmentId !== appointmentId),
      payments: snapshot.payments.filter((payment) => payment.appointmentId !== appointmentId),
    }),
  };
}

export function rescheduleAppointmentRecordResult(
  snapshot: PlatformDataSnapshot,
  appointmentId: string,
  input: AppointmentInput,
): { result: UpdateAppointmentResult; snapshot: PlatformDataSnapshot } {
  const appointment = snapshot.appointments.find((item) => item.id === appointmentId);

  if (!appointment) {
    return {
      result: {
        ok: false,
        message: 'Agendamento nao encontrado para reagendar.',
      },
      snapshot,
    };
  }

  if (appointment.clientId !== input.clientId) {
    return {
      result: {
        ok: false,
        message: 'Nao eh possivel reagendar um agendamento de outro cliente.',
      },
      snapshot,
    };
  }

  if (['cancelled', 'completed', 'noShow', 'inService', 'checkedIn'].includes(appointment.status)) {
    return {
      result: {
        ok: false,
        message: 'Este agendamento nao pode ser reagendado.',
      },
      snapshot,
    };
  }

  const cancellation = getClientCancellationEligibility(appointment, snapshot.salon);

  if (!cancellation.allowed) {
    return {
      result: {
        ok: false,
        message: cancellation.message,
      },
      snapshot,
    };
  }

  const service = snapshot.services.find((item) => item.id === input.serviceId);

  if (!service) {
    return {
      result: {
        ok: false,
        message: 'Selecione um servico valido para reagendar.',
      },
      snapshot,
    };
  }

  const conflict = getAppointmentConflict(snapshot, input, appointmentId);

  if (conflict) {
    return {
      result: {
        ok: false,
        message: conflict,
      },
      snapshot,
    };
  }

  const now = new Date().toISOString();
  const updatedAppointment: AppointmentRecord = {
    ...appointment,
    clientId: input.clientId,
    professionalId: input.professionalId,
    serviceId: input.serviceId,
    startsAt: input.startsAt,
    endsAt: calculateEndsAt(input.startsAt, service.durationMinutes),
    status: input.status,
    notes: input.notes?.trim() || undefined,
    updatedAt: now,
  };

  const next = touch({
    ...snapshot,
    appointments: snapshot.appointments.map((item) => (item.id === appointmentId ? updatedAppointment : item)),
    charges: snapshot.charges.map((charge) =>
      charge.appointmentId === appointmentId
        ? {
            ...charge,
            clientId: input.clientId,
            amountCents: service.priceCents,
            updatedAt: now,
          }
        : charge,
    ),
    accountClosures: snapshot.accountClosures.map((closure) =>
      closure.appointmentId === appointmentId && closure.status !== 'paid'
        ? {
            ...closure,
            clientId: input.clientId,
            professionalId: input.professionalId,
            serviceId: input.serviceId,
            baseAmountCents: service.priceCents,
            finalAmountCents: calculateFinalAmount(service.priceCents, closure.discountCents, closure.additionCents),
            updatedAt: now,
          }
        : closure,
    ),
  });

  return {
    result: {
      ok: true,
      appointment: updatedAppointment,
    },
    snapshot: next,
  };
}

export function updateAppointmentStatusRecord(
  snapshot: PlatformDataSnapshot,
  appointmentId: string,
  status: AppointmentStatus,
): PlatformDataSnapshot {
  return updateAppointmentStatusRecordResult(snapshot, appointmentId, status).snapshot;
}

export function updateAppointmentStatusRecordResult(
  snapshot: PlatformDataSnapshot,
  appointmentId: string,
  status: AppointmentStatus,
  options: UpdateAppointmentStatusRecordOptions = {},
): { result: UpdateAppointmentStatusResult; snapshot: PlatformDataSnapshot } {
  const appointment = snapshot.appointments.find((item) => item.id === appointmentId);

  if (!appointment) {
    return {
      result: {
        ok: false,
        message: 'Nao encontramos o agendamento para atualizar o status.',
      },
      snapshot,
    };
  }

  if (options.profileId === 'client') {
    if (appointment.clientId !== options.actorId || status !== 'cancelled') {
      return {
        result: {
          ok: false,
          message: 'Esta acao nao esta disponivel para este acesso.',
        },
        snapshot,
      };
    }

    const cancellation = getClientCancellationEligibility(appointment, snapshot.salon, options.now);

    if (!cancellation.allowed) {
      return {
        result: {
          ok: false,
          message: cancellation.message,
        },
        snapshot,
      };
    }
  }

  const now = new Date().toISOString();
  const updatedAppointment: AppointmentRecord = {
    ...appointment,
    status,
    startedAt: status === 'inService' ? appointment.startedAt ?? now : appointment.startedAt,
    completedAt: status === 'completed' ? now : appointment.completedAt,
    finishedAt: status === 'completed' ? now : appointment.finishedAt,
    cancelledAt: status === 'cancelled' ? now : appointment.cancelledAt,
    noShowAt: status === 'noShow' ? now : appointment.noShowAt,
    updatedAt: now,
  };
  let next = touch({
    ...snapshot,
    appointments: snapshot.appointments.map((item) =>
      item.id === appointmentId ? updatedAppointment : item,
    ),
  });

  if (status === 'inService') {
    next = upsertAttendance(next, updatedAppointment, 'inProgress', now);
  }

  if (status === 'completed') {
    next = upsertAttendance(next, updatedAppointment, 'finished', now);
    next = ensureAccountClosure(next, appointmentId, now);
  }

  if (status === 'cancelled' || status === 'noShow') {
    next = touch({
      ...next,
      accountClosures: next.accountClosures.map((closure) =>
        closure.appointmentId === appointmentId
          ? {
              ...closure,
              status: 'cancelled',
              updatedAt: now,
            }
          : closure,
      ),
      charges: next.charges.map((charge) =>
        charge.appointmentId === appointmentId
          ? {
              ...charge,
              status: 'cancelled',
              updatedAt: now,
            }
          : charge,
      ),
    });
  }

  return {
    result: {
      ok: true,
      appointment: updatedAppointment,
    },
    snapshot: next,
  };
}

export function respondAppointmentRequestRecordResult(
  snapshot: PlatformDataSnapshot,
  appointmentId: string,
  input: RespondAppointmentRequestInput,
): { result: RespondAppointmentRequestResult; snapshot: PlatformDataSnapshot } {
  const appointment = snapshot.appointments.find((item) => item.id === appointmentId);

  if (!appointment) {
    return {
      result: {
        ok: false,
        message: 'Agendamento nao encontrado.',
      },
      snapshot,
    };
  }

  if (appointment.status !== 'requested') {
    return {
      result: {
        ok: false,
        message: 'Apenas solicitacoes pendentes podem ser respondidas.',
      },
      snapshot,
    };
  }

  const message = input.message?.trim() || undefined;

  if (input.status === 'rejected' && !message) {
    return {
      result: {
        ok: false,
        message: 'Informe o motivo da recusa.',
      },
      snapshot,
    };
  }

  const now = new Date().toISOString();
  const updatedAppointment: AppointmentRecord = {
    ...appointment,
    status: input.status,
    salonResponseMessage: message,
    rejectedReason: input.status === 'rejected' ? message : undefined,
    confirmedAt: input.status === 'confirmed' ? now : appointment.confirmedAt,
    rejectedAt: input.status === 'rejected' ? now : undefined,
    updatedAt: now,
  };
  const next = touch({
    ...snapshot,
    appointments: snapshot.appointments.map((item) => (item.id === appointmentId ? updatedAppointment : item)),
  });

  return {
    result: {
      ok: true,
      appointment: updatedAppointment,
    },
    snapshot: next,
  };
}

export function upsertAccountClosureRecord(
  snapshot: PlatformDataSnapshot,
  appointmentId: string,
  input: AccountClosureInput,
): PlatformDataSnapshot {
  return upsertAccountClosureRecordResult(snapshot, appointmentId, input).snapshot;
}

export function updateAttendanceStatusRecord(
  snapshot: PlatformDataSnapshot,
  attendanceId: string,
  status: AttendanceStatus,
): PlatformDataSnapshot {
  return updateAttendanceStatusRecordResult(snapshot, attendanceId, status).snapshot;
}

export function updateAttendanceStatusRecordResult(
  snapshot: PlatformDataSnapshot,
  attendanceId: string,
  status: AttendanceStatus,
): { result: UpdateAttendanceStatusResult; snapshot: PlatformDataSnapshot } {
  const attendance = snapshot.attendanceRecords.find((item) => item.id === attendanceId);

  if (!attendance) {
    return {
      result: {
        ok: false,
        message: 'Nao encontramos o atendimento para atualizar o status.',
      },
      snapshot,
    };
  }

  const now = new Date().toISOString();
  const updatedAttendance: AttendanceRecord = {
    ...attendance,
    status,
    startedAt: status === 'inProgress' || status === 'finished' ? attendance.startedAt ?? now : attendance.startedAt,
    finishedAt: status === 'finished' ? attendance.finishedAt ?? now : attendance.finishedAt,
    updatedAt: now,
  };
  const next = touch({
    ...snapshot,
    attendanceRecords: snapshot.attendanceRecords.map((item) =>
      item.id === attendanceId ? updatedAttendance : item,
    ),
  });

  return {
    result: {
      ok: true,
      attendance: updatedAttendance,
    },
    snapshot: next,
  };
}

export function upsertAccountClosureRecordResult(
  snapshot: PlatformDataSnapshot,
  appointmentId: string,
  input: AccountClosureInput,
): { result: UpsertAccountClosureResult; snapshot: PlatformDataSnapshot } {
  const appointment = snapshot.appointments.find((item) => item.id === appointmentId);
  const service = appointment ? snapshot.services.find((item) => item.id === appointment.serviceId) : undefined;

  if (!appointment) {
    return {
      result: {
        ok: false,
        message: 'Nao encontramos o agendamento para gerar o fechamento.',
      },
      snapshot,
    };
  }

  if (!service) {
    return {
      result: {
        ok: false,
        message: 'Nao encontramos o servico vinculado ao fechamento.',
      },
      snapshot,
    };
  }

  const now = new Date().toISOString();
  const existingClosure = snapshot.accountClosures.find((closure) => closure.appointmentId === appointmentId);
  const baseAmountCents = service.priceCents;
  const finalAmountCents = calculateFinalAmount(baseAmountCents, input.discountCents, input.additionCents);
  const closure: AccountClosureRecord = {
    id: existingClosure?.id ?? makeId('closure'),
    salonId: snapshot.salon.id,
    appointmentId,
    clientId: appointment.clientId,
    professionalId: appointment.professionalId,
    serviceId: appointment.serviceId,
    baseAmountCents,
    discountCents: Math.max(0, input.discountCents),
    additionCents: Math.max(0, input.additionCents),
    finalAmountCents,
    status: input.status,
    notes: input.notes?.trim() || undefined,
    closedAt: input.status === 'closed' || input.status === 'paid' ? existingClosure?.closedAt ?? now : existingClosure?.closedAt,
    createdAt: existingClosure?.createdAt ?? now,
    updatedAt: now,
  };
  const next = touch({
    ...snapshot,
    accountClosures: existingClosure
      ? snapshot.accountClosures.map((item) => (item.id === existingClosure.id ? closure : item))
      : [...snapshot.accountClosures, closure],
  });
  const snapshotWithCharge = upsertChargeForClosure(
    next,
    closure,
    input.status === 'paid' ? 'paid' : input.status === 'cancelled' ? 'cancelled' : 'pending',
    now,
  );

  return {
    result: {
      ok: true,
      accountClosure: closure,
    },
    snapshot: snapshotWithCharge,
  };
}

export function registerPaymentRecord(
  snapshot: PlatformDataSnapshot,
  accountClosureId: string,
  input: PaymentInput,
): PlatformDataSnapshot {
  return registerPaymentRecordResult(snapshot, accountClosureId, input).snapshot;
}

export function registerPaymentRecordResult(
  snapshot: PlatformDataSnapshot,
  accountClosureId: string,
  input: PaymentInput,
): { result: RegisterPaymentResult; snapshot: PlatformDataSnapshot } {
  const closure = snapshot.accountClosures.find((item) => item.id === accountClosureId);

  if (!closure) {
    return {
      result: {
        ok: false,
        message: 'Nao encontramos o fechamento para registrar o pagamento.',
      },
      snapshot,
    };
  }

  const now = new Date().toISOString();
  const methodStatus = input.method === 'manualPending' ? 'pending' : input.status;
  const paidAt = methodStatus === 'paid' ? now : undefined;
  const charge = snapshot.charges.find((item) => item.accountClosureId === accountClosureId || item.appointmentId === closure.appointmentId);
  const payment: PaymentRecord = {
    id: makeId('payment'),
    salonId: snapshot.salon.id,
    appointmentId: closure.appointmentId,
    accountClosureId,
    chargeId: charge?.id,
    clientId: closure.clientId,
    amountCents: Math.max(0, input.amountCents),
    method: input.method,
    status: methodStatus,
    paidAt,
    createdAt: now,
    updatedAt: now,
  };

  const next = touch({
    ...snapshot,
    accountClosures: snapshot.accountClosures.map((item) =>
      item.id === accountClosureId
        ? {
            ...item,
            status: methodStatus === 'paid' ? 'paid' : 'closed',
            closedAt: item.closedAt ?? now,
            updatedAt: now,
          }
        : item,
    ),
    payments: [...snapshot.payments, payment],
    charges: snapshot.charges.map((item) =>
      item.id === charge?.id
        ? {
            ...item,
            accountClosureId,
            clientId: closure.clientId,
            amountCents: payment.amountCents,
            status: methodStatus === 'paid' ? 'paid' : 'pending',
            paymentMethod: input.method,
            paidAt,
            updatedAt: now,
          }
        : item,
    ),
  });

  return {
    result: {
      ok: true,
      payment,
    },
    snapshot: next,
  };
}

function calculateFinalAmount(baseAmountCents: number, discountCents: number, additionCents: number) {
  return Math.max(0, baseAmountCents - Math.max(0, discountCents) + Math.max(0, additionCents));
}

function upsertAttendance(
  snapshot: PlatformDataSnapshot,
  appointment: AppointmentRecord,
  status: 'inProgress' | 'finished',
  now: string,
): PlatformDataSnapshot {
  const existingAttendance = snapshot.attendanceRecords.find((item) => item.appointmentId === appointment.id);

  if (existingAttendance) {
    return touch({
      ...snapshot,
      attendanceRecords: snapshot.attendanceRecords.map((attendance) =>
        attendance.id === existingAttendance.id
          ? {
              ...attendance,
              status,
              startedAt: attendance.startedAt ?? now,
              finishedAt: status === 'finished' ? attendance.finishedAt ?? now : attendance.finishedAt,
              updatedAt: now,
            }
          : attendance,
      ),
    });
  }

  return touch({
    ...snapshot,
    attendanceRecords: [
      ...snapshot.attendanceRecords,
      {
        id: makeId('attendance'),
        appointmentId: appointment.id,
        salonId: appointment.salonId,
        professionalId: appointment.professionalId,
        status,
        startedAt: now,
        finishedAt: status === 'finished' ? now : undefined,
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
}

function ensureAccountClosure(snapshot: PlatformDataSnapshot, appointmentId: string, now: string): PlatformDataSnapshot {
  const appointment = snapshot.appointments.find((item) => item.id === appointmentId);
  const service = appointment ? snapshot.services.find((item) => item.id === appointment.serviceId) : undefined;

  if (!appointment || !service) {
    return snapshot;
  }

  const existingClosure = snapshot.accountClosures.find((closure) => closure.appointmentId === appointmentId);

  if (existingClosure) {
    return snapshot;
  }

  const closure: AccountClosureRecord = {
    id: makeId('closure'),
    salonId: snapshot.salon.id,
    appointmentId,
    clientId: appointment.clientId,
    professionalId: appointment.professionalId,
    serviceId: appointment.serviceId,
    baseAmountCents: service.priceCents,
    discountCents: 0,
    additionCents: 0,
    finalAmountCents: service.priceCents,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };
  const next = touch({
    ...snapshot,
    accountClosures: [...snapshot.accountClosures, closure],
  });

  return upsertChargeForClosure(next, closure, 'pending', now);
}

function upsertChargeForClosure(
  snapshot: PlatformDataSnapshot,
  closure: AccountClosureRecord,
  status: ChargeRecord['status'],
  now: string,
): PlatformDataSnapshot {
  const existingCharge = snapshot.charges.find(
    (charge) => charge.accountClosureId === closure.id || charge.appointmentId === closure.appointmentId,
  );
  const nextCharge: ChargeRecord = {
    id: existingCharge?.id ?? makeId('charge'),
    salonId: snapshot.salon.id,
    appointmentId: closure.appointmentId,
    accountClosureId: closure.id,
    clientId: closure.clientId,
    amountCents: closure.finalAmountCents,
    status,
    origin: 'appointment',
    provider: existingCharge?.provider ?? 'manual',
    paymentMethod: existingCharge?.paymentMethod,
    providerChargeId: existingCharge?.providerChargeId,
    paidAt: status === 'paid' ? existingCharge?.paidAt ?? now : existingCharge?.paidAt,
    createdAt: existingCharge?.createdAt ?? now,
    updatedAt: now,
  };

  return touch({
    ...snapshot,
    charges: existingCharge
      ? snapshot.charges.map((charge) => (charge.id === existingCharge.id ? nextCharge : charge))
      : [...snapshot.charges, nextCharge],
  });
}
