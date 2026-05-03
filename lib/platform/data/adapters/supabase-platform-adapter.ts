import type { PlatformSession } from '@/lib/platform/auth/session';
import { normalizeSubscriptionCommercialState } from '@/lib/platform/billing/commercial-access-policy';
import { normalizeSalonSettings } from '@/lib/platform/data/client-cancellation-policy';
import { normalizeProfessionalSchedule } from '@/lib/platform/data/professional-schedule';
import type { DeleteAppointmentResult, PlatformDataSnapshot, ProfessionalInput, PublicBookingDiagnostics } from '@/lib/platform/data/schema';
import type {
  AccountClosureRecord,
  AppointmentRecord,
  AttendanceRecord,
  ChargeRecord,
  ClientRecord,
  PaymentRecord,
  ProfessionalScheduleExceptionRecord,
  ProfessionalRecord,
  SalonRecord,
  ServiceRecord,
  SubscriptionRecord,
  Weekday,
} from '@/lib/platform/domain';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type SalonRow = {
  cover_url?: string | null;
  current_period_end?: string | null;
  id: string;
  is_public?: boolean | null;
  logo_url?: string | null;
  name: string;
  owner_profile_id: string;
  primary_color?: string | null;
  settings: Partial<SalonRecord['settings']> | null;
  slug: string;
  status: SalonRecord['status'];
  theme_mode?: string | null;
  subscription_id: string | null;
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  trial_started_at?: string | null;
};

type SubscriptionRow = {
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
  billing_cycle: SubscriptionRecord['billingCycle'] | null;
  current_period_end: string | null;
  id: string;
  plan: SubscriptionRecord['plan'];
  salon_id: string;
  status: SubscriptionRecord['status'];
  trial_ends_at: string | null;
  trial_started_at: string | null;
};

type CustomerRow = {
  archived_at?: string | null;
  created_at: string;
  deleted_at?: string | null;
  email: string | null;
  full_name?: string | null;
  id: string;
  name?: string | null;
  notes: string | null;
  phone: string;
  salon_id: string;
  updated_at?: string | null;
};

type ProfessionalRow = {
  access_profile_id?: ProfessionalRecord['accessProfileId'] | null;
  active: boolean | null;
  avatar_url?: string | null;
  commission_rate?: number | null;
  created_at: string;
  email?: string | null;
  full_name?: string | null;
  id: string;
  name?: string | null;
  permissions?: string[] | null;
  profile_id?: string | null;
  role?: string | null;
  salon_id: string;
  schedule?: Partial<ProfessionalRecord['schedule']> | null;
  specialty?: string | null;
  status?: string | null;
  updated_at?: string | null;
};

type ProfessionalScheduleExceptionRow = {
  created_at: string;
  date: string;
  end_time: string | null;
  id: string;
  professional_id: string;
  reason: string | null;
  salon_id: string;
  start_time: string | null;
  type: ProfessionalScheduleExceptionRecord['type'];
  updated_at: string;
};

type WorkingHourRow = {
  active: boolean;
  employee_id: string;
  end_time: string;
  salon_id: string;
  start_time: string;
  weekday: number;
};

type PublicEmployeeRow = ProfessionalRow & {
  avatar_url?: string | null;
  status?: string | null;
};

type ServiceRow = {
  active: boolean | null;
  category?: string | null;
  created_at: string;
  description?: string | null;
  duration_minutes: number;
  id: string;
  name: string;
  notes: string | null;
  price?: number | null;
  price_cents?: number | null;
  professional_ids?: string[] | null;
  salon_id: string;
  updated_at?: string | null;
};

type AppointmentRow = {
  appointment_date?: string | null;
  appointment_time?: string | null;
  client_id?: string | null;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  client_visible_message?: string | null;
  completed_at?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  customer_id?: string | null;
  employee_id?: string | null;
  ends_at?: string | null;
  id: string;
  notes: string | null;
  finished_at?: string | null;
  internal_notes?: string | null;
  no_show_at?: string | null;
  professional_id?: string | null;
  rejected_at?: string | null;
  rejected_reason?: string | null;
  reminder_offsets_minutes?: number[] | null;
  salon_response_message?: string | null;
  salon_id: string;
  service_id: string;
  started_at?: string | null;
  starts_at?: string | null;
  status: AppointmentRecord['status'] | 'pending' | 'no_show';
  updated_at?: string | null;
};

type AttendanceRow = {
  appointment_id: string;
  created_at: string;
  finished_at: string | null;
  id: string;
  notes: string | null;
  professional_id: string;
  salon_id: string;
  started_at: string | null;
  status: AttendanceRecord['status'];
  updated_at: string;
};

type AccountClosureRow = {
  addition_cents: number;
  appointment_id: string;
  base_amount_cents: number;
  client_id: string;
  closed_at: string | null;
  created_at: string;
  discount_cents: number;
  final_amount_cents: number;
  id: string;
  notes: string | null;
  professional_id: string;
  salon_id: string;
  service_id: string;
  status: AccountClosureRecord['status'];
  updated_at: string;
};

type PaymentRow = {
  account_closure_id: string;
  amount_cents: number;
  appointment_id: string;
  charge_id: string | null;
  client_id: string;
  created_at: string;
  id: string;
  method: 'cash' | 'pix' | 'card' | 'manualPending';
  paid_at: string | null;
  salon_id: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  updated_at: string;
};

type ChargeRow = {
  account_closure_id: string | null;
  amount?: number | null;
  amount_cents?: number | null;
  appointment_id: string | null;
  client_id: string | null;
  client_name?: string | null;
  created_at: string;
  due_date?: string | null;
  id: string;
  origin: ChargeRecord['origin'];
  paid_at: string | null;
  payment_method: ChargeRecord['paymentMethod'] | null;
  provider: ChargeRecord['provider'];
  provider_charge_id: string | null;
  salon_id: string;
  service_name?: string | null;
  status: ChargeRecord['status'];
  subscription_id: string | null;
  updated_at: string;
  valor?: number | null;
};

export async function loadSupabasePlatformSnapshot(session: PlatformSession): Promise<PlatformDataSnapshot> {
  const resolvedSalonId = await resolveSupabaseSalonIdByIdOrSlug(session.salonId, session);
  const salonId = encodeURIComponent(resolvedSalonId);
  const salons = await supabaseRestRequest<SalonRow[]>('salons', { query: `id=eq.${salonId}&select=*` }, session);
  const [
    subscriptions,
    customers,
    realProfessionals,
    employees,
    workingHours,
    professionalScheduleExceptions,
    services,
    appointments,
    attendanceRecords,
    accountClosures,
    payments,
    charges,
  ] = await Promise.all([
    fetchOptionalRows<SubscriptionRow[]>('subscriptions', `salon_id=eq.${salonId}&select=*`, session),
    fetchOptionalRows<CustomerRow[]>('customers', `salon_id=eq.${salonId}&select=*&order=full_name.asc`, session),
    fetchAdminProfessionalRows(resolvedSalonId, session),
    fetchAdminEmployeeRows(resolvedSalonId, session),
    fetchOptionalRows<WorkingHourRow[]>('working_hours', `salon_id=eq.${salonId}&select=*`, session),
    fetchOptionalRows<ProfessionalScheduleExceptionRow[]>(
      'professional_schedule_exceptions',
      `salon_id=eq.${salonId}&select=*&order=date.asc,start_time.asc`,
      session,
    ),
    fetchOptionalRows<ServiceRow[]>('services', `salon_id=eq.${salonId}&select=*&order=name.asc`, session),
    fetchOptionalRows<AppointmentRow[]>('appointments', `salon_id=eq.${salonId}&select=*&order=appointment_date.asc,appointment_time.asc`, session),
    fetchOptionalRows<AttendanceRow[]>('attendance_records', `salon_id=eq.${salonId}&select=*`, session),
    fetchOptionalRows<AccountClosureRow[]>('account_closures', `salon_id=eq.${salonId}&select=*`, session),
    fetchOptionalRows<PaymentRow[]>('payments', `salon_id=eq.${salonId}&select=*&order=created_at.asc`, session),
    fetchOptionalRows<ChargeRow[]>('charges', `salon_id=eq.${salonId}&select=*&order=created_at.asc`, session),
  ]);
  const salon = salons[0];
  const professionals = mergeProfessionalRows(realProfessionals, employees).filter(isVisibleProfessionalRow);
  const publicBookingDiagnostics = createPublicBookingDiagnostics(resolvedSalonId, {
    employees,
    professionals: realProfessionals,
    services,
    workingHours,
  });

  if (!salon) {
    throw new Error(`Salao ${resolvedSalonId} nao encontrado no Supabase.`);
  }

  logPublicBookingDiagnostics('loadSupabasePlatformSnapshot', publicBookingDiagnostics);
  console.info('[platform-snapshot] profissionais carregados', {
    employees: employees.length,
    merged: professionals.length,
    professionals: realProfessionals.length,
    salon_id: resolvedSalonId,
  });

  return {
    version: 1,
    salon: fromSalonRow(salon),
    subscription: subscriptions[0] ? fromSubscriptionRow(subscriptions[0]) : createFallbackSubscriptionFromSalon(resolvedSalonId, salon),
    publicBookingDiagnostics,
    clients: customers.map(fromCustomerRow),
    professionals: professionals.map((professional) => fromProfessionalRow(professional, workingHours)),
    professionalScheduleExceptions: professionalScheduleExceptions.map(fromProfessionalScheduleExceptionRow),
    services: services.map(fromServiceRow),
    appointments: appointments.map(fromAppointmentRow),
    attendanceRecords: attendanceRecords.map(fromAttendanceRow),
    accountClosures: accountClosures.map(fromAccountClosureRow),
    payments: payments.map(fromPaymentRow),
    charges: charges.map(fromChargeRow),
    updatedAt: new Date().toISOString(),
  };
}

async function fetchAdminProfessionalRows(salonId: string, session: PlatformSession) {
  const salonIdQuery = encodeURIComponent(salonId);

  return fetchRowsWithFallbacks<ProfessionalRow[]>(
    'professionals',
    [
      `salon_id=eq.${salonIdQuery}&select=*&order=name.asc`,
      `salon_id=eq.${salonIdQuery}&select=*&order=full_name.asc`,
      `salon_id=eq.${salonIdQuery}&select=*`,
      `salon_id=eq.${salonIdQuery}&select=id,salon_id,profile_id,access_profile_id,name,email,role,active,permissions,schedule,avatar_url,status,created_at,updated_at`,
    ],
    session,
  );
}

async function fetchAdminEmployeeRows(salonId: string, session: PlatformSession) {
  const salonIdQuery = encodeURIComponent(salonId);

  return fetchRowsWithFallbacks<ProfessionalRow[]>(
    'employees',
    [
      `salon_id=eq.${salonIdQuery}&select=*&order=full_name.asc`,
      `salon_id=eq.${salonIdQuery}&select=*&order=name.asc`,
      `salon_id=eq.${salonIdQuery}&select=*`,
      `salon_id=eq.${salonIdQuery}&select=id,salon_id,full_name,role,specialty,active,status,avatar_url,created_at,updated_at`,
    ],
    session,
  );
}

async function fetchRowsWithFallbacks<T extends unknown[]>(table: string, queries: string[], session: PlatformSession): Promise<T> {
  let lastError: unknown = null;

  for (const query of queries) {
    try {
      return await supabaseRestRequest<T>(table, { query }, session);
    } catch (error) {
      lastError = error;

      if (!isMissingTableOrColumnError(error)) {
        throw error;
      }
    }
  }

  if (lastError) {
    console.error(`[platform-snapshot] Falha ao carregar ${table}:`, lastError);
  }

  return [] as unknown as T;
}

function mergeProfessionalRows(professionals: ProfessionalRow[], employees: ProfessionalRow[]) {
  const merged = new Map<string, ProfessionalRow>();

  for (const employee of employees) {
    merged.set(employee.id, employee);
  }

  for (const professional of professionals) {
    const employee = merged.get(professional.id);

    merged.set(professional.id, {
      ...employee,
      ...professional,
      avatar_url: professional.avatar_url ?? employee?.avatar_url ?? null,
      full_name: employee?.full_name ?? professional.full_name ?? professional.name ?? null,
      role: professional.role ?? employee?.role ?? null,
      specialty: employee?.specialty ?? professional.specialty ?? professional.role ?? null,
    });
  }

  return Array.from(merged.values()).sort((left, right) => {
    const leftName = left.name ?? left.full_name ?? '';
    const rightName = right.name ?? right.full_name ?? '';

    return leftName.localeCompare(rightName);
  });
}

export async function upsertSupabasePlatformSnapshot(snapshot: PlatformDataSnapshot, session: PlatformSession) {
  await upsertRows('customers', snapshot.clients.map(toCustomerRow), session);
  await upsertRows('professionals', snapshot.professionals.map(toProfessionalRow), session);
  const mirroredCount = await syncProfessionalsToPublicBooking(
    snapshot.professionals.filter((professional) => professional.salonId === snapshot.salon.id),
    snapshot.salon.id,
    session,
  );
  await upsertRows('services', snapshot.services.map(toServiceRow), session);
  await upsertRows('appointments', snapshot.appointments.map(toAppointmentRow), session);
  await upsertRowsIfAvailable('professional_schedule_exceptions', snapshot.professionalScheduleExceptions.map(toProfessionalScheduleExceptionRow), session);
  await upsertRowsIfAvailable('attendance_records', snapshot.attendanceRecords.map(toAttendanceRow), session);
  await upsertRowsIfAvailable('account_closures', snapshot.accountClosures.map(toAccountClosureRow), session);
  await upsertRowsIfAvailable('charges', snapshot.charges.map(toChargeRow), session);
  await upsertRowsIfAvailable('payments', snapshot.payments.map(toPaymentRow), session);
  await updateSupabaseSalonState(snapshot, session, {
    canUsePublicMirror: mirroredCount > 0,
  });
}

export async function resolveSupabaseSalonIdByIdOrSlug(idOrSlug: string, session: PlatformSession) {
  const salonIdentifier = idOrSlug.trim();
  const encoded = encodeURIComponent(salonIdentifier);
  const queries = isUuid(salonIdentifier)
    ? [`id=eq.${encoded}&select=id&limit=1`]
    : [
        `slug=eq.${encoded}&select=id&limit=1`,
        `id=eq.${encoded}&select=id&limit=1`,
      ];
  let rows: Array<Pick<SalonRow, 'id'>> = [];

  for (const query of queries) {
    try {
      rows = await supabaseRestRequest<Array<Pick<SalonRow, 'id'>>>(
        'salons',
        {
          query,
          useServiceRole: true,
        },
        session,
      );

      if (rows[0]?.id) {
        break;
      }
    } catch (error) {
      if (query.startsWith('id=') && isInvalidUuidError(error)) {
        continue;
      }

      throw error;
    }
  }

  if (!rows[0]?.id) {
    throw new Error('Salao nao encontrado para atualizar a aparencia.');
  }

  return rows[0].id;
}

export async function updateSupabaseSalonAppearance(
  snapshot: PlatformDataSnapshot,
  session: PlatformSession,
  salonIdOrSlug = session.salonId,
) {
  const salonId = isUuid(salonIdOrSlug) ? salonIdOrSlug : await resolveSupabaseSalonIdByIdOrSlug(salonIdOrSlug, session);
  const rows = await supabaseRestRequest<SalonRow[]>(
    'salons',
    {
      method: 'PATCH',
      query: `id=eq.${encodeURIComponent(salonId)}&select=id,primary_color,theme_mode,logo_url,cover_url`,
      body: {
        cover_url: snapshot.salon.coverUrl ?? null,
        logo_url: snapshot.salon.logoUrl ?? null,
        primary_color: normalizeHexColor(snapshot.salon.primaryColor),
        theme_mode: snapshot.salon.themeMode === 'dark' ? 'dark' : 'light',
      },
      prefer: 'return=representation',
      useServiceRole: true,
    },
    session,
  );

  if (!rows[0]) {
    throw new Error('Nao foi possivel atualizar a aparencia deste salao.');
  }

  return rows[0];
}

export async function updateSupabaseProfessionalAvatar(professionalId: string, avatarUrl: string | undefined, session: PlatformSession) {
  if (!isUuid(professionalId)) {
    return null;
  }

  const body = { avatar_url: avatarUrl?.trim() || null };
  const rows = await supabaseRestRequest<ProfessionalRow[]>(
    'professionals',
    {
      method: 'PATCH',
      query: `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(professionalId)}&select=id,avatar_url`,
      body,
      prefer: 'return=representation',
      useServiceRole: true,
    },
    session,
  );

  if (!rows[0]) {
    throw new Error('Nao foi possivel atualizar a foto do profissional.');
  }

  await supabaseRestRequest<null>(
    'employees',
    {
      method: 'PATCH',
      query: `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(professionalId)}`,
      body,
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  ).catch((error) => {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }
  });

  return rows[0];
}

export async function addSupabaseEmployee(input: ProfessionalInput, session: PlatformSession): Promise<ProfessionalRecord> {
  const now = new Date().toISOString();
  const salonId = await resolveSupabaseSalonIdByIdOrSlug(session.salonId, session);
  const professionalId = globalThis.crypto.randomUUID();
  const schedule = normalizeProfessionalSchedule(input.schedule);
  const professionalRow: ProfessionalRow = {
    access_profile_id: 'professional',
    active: input.active,
    avatar_url: input.avatarUrl?.trim() || null,
    created_at: now,
    email: input.email.trim().toLowerCase(),
    id: professionalId,
    name: input.name.trim(),
    permissions: input.permissions,
    profile_id: `profile-${professionalId}`,
    role: input.role.trim(),
    salon_id: salonId,
    schedule,
    status: input.active ? 'active' : 'inactive',
    updated_at: now,
  };

  const rows = await supabaseRestRequest<ProfessionalRow[]>(
    'professionals',
    {
      method: 'POST',
      body: professionalRow,
      prefer: 'return=representation',
      query: 'select=*',
      useServiceRole: true,
    },
    session,
  );

  const createdProfessional = rows[0];

  if (!createdProfessional) {
    throw new Error('Nao foi possivel criar o profissional.');
  }

  await supabaseRestRequest<null>(
    'employees',
    {
      method: 'POST',
      body: {
        active: input.active,
        avatar_url: input.avatarUrl?.trim() || null,
        commission_rate: 0,
        full_name: input.name.trim(),
        id: professionalId,
        role: 'professional',
        salon_id: salonId,
        specialty: input.role.trim() || null,
        status: input.active ? 'active' : 'inactive',
      },
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  ).catch((error) => {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }
  });

  return fromProfessionalRow(createdProfessional);
}

export async function syncActiveProfessionalsToPublicBooking(snapshot: PlatformDataSnapshot, session: PlatformSession) {
  const activeProfessionals = snapshot.professionals.filter((professional) => professional.salonId === snapshot.salon.id && professional.active);

  const syncedCount = await syncProfessionalsToPublicBooking(activeProfessionals, snapshot.salon.id, session);
  const diagnostics = await fetchPublicBookingDiagnostics(session);

  logPublicBookingDiagnostics('syncActiveProfessionalsToPublicBooking', diagnostics);

  return {
    syncedCount,
    diagnostics,
  };
}

export async function syncProfessionalToPublicBooking(
  professional: ProfessionalRecord,
  salonId: string,
  session: PlatformSession,
) {
  const schedule = normalizeProfessionalSchedule(professional.schedule);
  const employee = await upsertEmployeeForProfessional(professional, salonId, session);

  await replaceWorkingHoursForEmployee(employee.id, salonId, schedule, professional.active, session);

  console.info('[public-booking-sync] professional synced', {
    salon_id: salonId,
    professional_id: professional.id,
    employee_id: employee.id,
    schedule,
  });

  return professional.active && schedule.active && schedule.weekdays.length > 0 && schedule.startTime < schedule.endTime;
}

async function updateSupabaseSalonState(
  snapshot: PlatformDataSnapshot,
  session: PlatformSession,
  options: { canUsePublicMirror: boolean },
) {
  const isReadyForPublicBooking = isSnapshotReadyForPublicBooking(snapshot, options);

  const bodyWithSettings = {
    cover_url: snapshot.salon.coverUrl ?? null,
    is_public: isReadyForPublicBooking,
    logo_url: snapshot.salon.logoUrl ?? null,
    primary_color: normalizeHexColor(snapshot.salon.primaryColor),
    settings: normalizeSalonSettings(snapshot.salon.settings),
    theme_mode: snapshot.salon.themeMode === 'dark' ? 'dark' : 'light',
  };
  const bodyWithoutSettings = {
    cover_url: snapshot.salon.coverUrl ?? null,
    is_public: isReadyForPublicBooking,
    logo_url: snapshot.salon.logoUrl ?? null,
    primary_color: normalizeHexColor(snapshot.salon.primaryColor),
    theme_mode: snapshot.salon.themeMode === 'dark' ? 'dark' : 'light',
  };

  await supabaseRestRequest<null>(
    'salons',
    {
      method: 'PATCH',
      query: `id=eq.${encodeURIComponent(snapshot.salon.id)}`,
      body: bodyWithSettings,
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  ).catch((error) => {
    if (!isMissingColumnError(error, 'settings')) {
      throw error;
    }

    return supabaseRestRequest<null>(
      'salons',
      {
        method: 'PATCH',
        query: `id=eq.${encodeURIComponent(snapshot.salon.id)}`,
        body: bodyWithoutSettings,
        prefer: 'return=minimal',
        useServiceRole: true,
      },
      session,
    );
  });
}

async function syncProfessionalsToPublicBooking(professionals: ProfessionalRecord[], salonId: string, session: PlatformSession) {
  let readyCount = 0;

  for (const professional of professionals) {
    const isReady = await syncProfessionalToPublicBooking(professional, salonId, session);

    if (isReady) {
      readyCount += 1;
    }
  }

  return readyCount;
}

async function upsertEmployeeForProfessional(professional: ProfessionalRecord, salonId: string, session: PlatformSession) {
  const fullName = professional.name.trim() || 'Profissional';
  const baseEmployeeRow = {
    active: professional.active,
    avatar_url: professional.avatarUrl ?? null,
    commission_rate: 0,
    full_name: fullName,
    role: 'professional',
    salon_id: salonId,
    specialty: professional.role.trim() || null,
    status: professional.active ? 'active' : 'inactive',
  };

  console.info('[public-booking-sync] employee payload', baseEmployeeRow);

  if (isUuid(professional.id)) {
    const rows = await supabaseRestRequest<PublicEmployeeRow[]>(
      'employees',
      {
        method: 'POST',
        query: 'on_conflict=id',
        body: [
          {
            ...baseEmployeeRow,
            id: professional.id,
          },
        ],
        prefer: 'resolution=merge-duplicates,return=representation',
        useServiceRole: true,
      },
      session,
    );

    if (!rows[0]) {
      throw new Error('Supabase nao retornou o employee atualizado para o fluxo publico.');
    }

    return rows[0];
  }

  const existingRows = await supabaseRestRequest<PublicEmployeeRow[]>(
    'employees',
    {
      query:
        `salon_id=eq.${encodeURIComponent(salonId)}` +
        `&full_name=eq.${encodeURIComponent(fullName)}` +
        '&select=id,salon_id,full_name,active,status,role,specialty,commission_rate,avatar_url&limit=1',
      useServiceRole: true,
    },
    session,
  );
  const existing = existingRows[0];

  if (existing) {
    const rows = await supabaseRestRequest<PublicEmployeeRow[]>(
      'employees',
      {
        method: 'PATCH',
        query: `salon_id=eq.${encodeURIComponent(salonId)}&id=eq.${encodeURIComponent(existing.id)}`,
        body: baseEmployeeRow,
        prefer: 'return=representation',
        useServiceRole: true,
      },
      session,
    );

    return rows[0] ?? existing;
  }

  const rows = await supabaseRestRequest<PublicEmployeeRow[]>(
    'employees',
    {
      method: 'POST',
      body: [baseEmployeeRow],
      prefer: 'return=representation',
      useServiceRole: true,
    },
    session,
  );

  if (!rows[0]) {
    throw new Error('Supabase nao retornou o employee criado para o fluxo publico.');
  }

  return rows[0];
}

export async function deleteSupabaseProfessionalScheduleException(exceptionId: string, session: PlatformSession) {
  await supabaseRestRequest<null>(
    'professional_schedule_exceptions',
    {
      method: 'DELETE',
      query: `id=eq.${encodeURIComponent(exceptionId)}`,
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  );
}

export async function deleteSupabaseProfessional(
  professionalId: string,
  session: PlatformSession,
  options: { hasAppointments: boolean },
) {
  const salonIdQuery = encodeURIComponent(session.salonId);
  const professionalIdQuery = encodeURIComponent(professionalId);

  if (options.hasAppointments) {
    await patchProfessionalAsDeleted(professionalId, session);
    await patchEmployeeAsDeleted(professionalId, session);
    await patchWorkingHoursAsInactive(professionalId, session);
    return;
  }

  if (isUuid(professionalId)) {
    await supabaseRestRequest<null>(
      'working_hours',
      {
        method: 'DELETE',
        query: `salon_id=eq.${salonIdQuery}&employee_id=eq.${professionalIdQuery}`,
        prefer: 'return=minimal',
        useServiceRole: true,
      },
      session,
    ).catch((error) => {
      if (!isMissingTableOrColumnError(error)) {
        throw error;
      }
    });

    await supabaseRestRequest<null>(
      'employees',
      {
        method: 'DELETE',
        query: `salon_id=eq.${salonIdQuery}&id=eq.${professionalIdQuery}`,
        prefer: 'return=minimal',
        useServiceRole: true,
      },
      session,
    ).catch((error) => {
      if (!isMissingTableOrColumnError(error)) {
        throw error;
      }
    });
  }

  await supabaseRestRequest<null>(
    'professional_schedule_exceptions',
    {
      method: 'DELETE',
      query: `salon_id=eq.${salonIdQuery}&professional_id=eq.${professionalIdQuery}`,
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  ).catch((error) => {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }
  });

  await supabaseRestRequest<null>(
    'professionals',
    {
      method: 'DELETE',
      query: `salon_id=eq.${salonIdQuery}&id=eq.${professionalIdQuery}`,
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  );
}

export async function deleteSupabaseAppointment(
  appointmentId: string,
  session: PlatformSession,
  mode: 'cancelled' | 'deleted' = 'deleted',
): Promise<DeleteAppointmentResult> {
  const salonIdQuery = encodeURIComponent(session.salonId);
  const appointmentIdQuery = encodeURIComponent(appointmentId);

  if (mode === 'cancelled') {
    const now = new Date().toISOString();
    const rows = await supabaseRestRequest<AppointmentRow[]>(
      'appointments',
      {
        method: 'PATCH',
        query: `salon_id=eq.${salonIdQuery}&id=eq.${appointmentIdQuery}&select=id`,
        body: {
          cancelled_at: now,
          cancellation_reason: 'Cancelado pelo estabelecimento.',
          client_visible_message: 'Agendamento cancelado pelo estabelecimento.',
          status: 'cancelled',
          updated_at: now,
        },
        prefer: 'return=representation',
        useServiceRole: true,
      },
      session,
    );

    if (!rows[0]) {
      throw new Error('Agendamento nao encontrado para exclusao.');
    }

    return {
      ok: true,
      mode: 'cancelled',
      message: 'Agendamento removido com sucesso.',
    };
  }

  const rows = await supabaseRestRequest<AppointmentRow[]>(
    'appointments',
    {
      method: 'DELETE',
      query: `salon_id=eq.${salonIdQuery}&id=eq.${appointmentIdQuery}&select=id`,
      prefer: 'return=representation',
      useServiceRole: true,
    },
    session,
  );

  if (!rows[0]) {
    throw new Error('Agendamento nao encontrado para exclusao.');
  }

  return {
    ok: true,
    mode: 'deleted',
    message: 'Agendamento removido com sucesso.',
  };
}

export async function deleteSupabaseClient(clientId: string, session: PlatformSession) {
  await supabaseRestRequest<null>(
    'customers',
    {
      method: 'DELETE',
      query: `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(clientId)}`,
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  );
}

export async function deleteSupabaseService(serviceId: string, session: PlatformSession) {
  const salonId = await resolveSupabaseSalonIdByIdOrSlug(session.salonId, session);
  const rows = await supabaseRestRequest<Array<{ id: string }>>(
    'services',
    {
      method: 'DELETE',
      query: `salon_id=eq.${encodeURIComponent(salonId)}&id=eq.${encodeURIComponent(serviceId)}&select=id`,
      prefer: 'return=representation',
      useServiceRole: true,
    },
    session,
  );

  if (!rows[0]) {
    throw new Error('Service delete returned no rows.');
  }

  return serviceId;
}

export async function archiveSupabaseClient(clientId: string, session: PlatformSession) {
  const now = new Date().toISOString();

  await supabaseRestRequest<null>(
    'customers',
    {
      method: 'PATCH',
      query: `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(clientId)}`,
      body: {
        archived_at: now,
        updated_at: now,
      },
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  );
}

async function upsertRows(table: string, rows: unknown[], session: PlatformSession) {
  if (rows.length === 0) {
    return;
  }

  await supabaseRestRequest<null>(
    table,
    {
      method: 'POST',
      query: 'on_conflict=id',
      body: rows,
      prefer: 'resolution=merge-duplicates,return=minimal',
      useServiceRole: true,
    },
    session,
  );
}

async function upsertRowsIfAvailable(table: string, rows: unknown[], session: PlatformSession) {
  try {
    await upsertRows(table, rows, session);
    return true;
  } catch (error) {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }

    return false;
  }
}

async function replaceWorkingHours(snapshot: PlatformDataSnapshot, session: PlatformSession) {
  let wroteRows = false;

  try {
    for (const professional of snapshot.professionals.filter(isProfessionalReadyForPublicMirror)) {
      await supabaseRestRequest<null>(
        'working_hours',
        {
          method: 'DELETE',
          query: `salon_id=eq.${encodeURIComponent(snapshot.salon.id)}&employee_id=eq.${encodeURIComponent(professional.id)}`,
          prefer: 'return=minimal',
          useServiceRole: true,
        },
        session,
      );

      const schedule = normalizeProfessionalSchedule(professional.schedule);
      const rows = schedule.weekdays.map((weekday) => ({
        active: schedule.active,
        employee_id: professional.id,
        end_time: schedule.endTime,
        salon_id: snapshot.salon.id,
        start_time: schedule.startTime,
        weekday,
      }));

      if (rows.length > 0) {
        await supabaseRestRequest<null>(
          'working_hours',
          {
            method: 'POST',
            body: rows,
            prefer: 'return=minimal',
            useServiceRole: true,
          },
          session,
        );
        wroteRows = true;
      }
    }

    return wroteRows;
  } catch (error) {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }

    return false;
  }
}

async function replaceWorkingHoursForEmployee(
  employeeId: string,
  salonId: string,
  schedule: ProfessionalRecord['schedule'],
  professionalActive: boolean,
  session: PlatformSession,
) {
  await supabaseRestRequest<null>(
    'working_hours',
    {
      method: 'DELETE',
      query: `salon_id=eq.${encodeURIComponent(salonId)}&employee_id=eq.${encodeURIComponent(employeeId)}`,
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  );

  const normalizedSchedule = normalizeProfessionalSchedule(schedule);

  if (!professionalActive || !normalizedSchedule.active || normalizedSchedule.startTime >= normalizedSchedule.endTime) {
    return;
  }

  const rows = normalizedSchedule.weekdays.map((weekday) => ({
    active: true,
    employee_id: employeeId,
    end_time: normalizedSchedule.endTime,
    salon_id: salonId,
    start_time: normalizedSchedule.startTime,
    weekday,
  }));

  console.info('[public-booking-sync] working_hours payload', rows);

  if (rows.length === 0) {
    return;
  }

  await supabaseRestRequest<null>(
    'working_hours',
    {
      method: 'POST',
      body: rows,
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  );
}

async function fetchPublicBookingDiagnostics(session: PlatformSession): Promise<PublicBookingDiagnostics> {
  const salonId = encodeURIComponent(session.salonId);
  const [professionals, employees, workingHours, services] = await Promise.all([
    fetchOptionalRows<ProfessionalRow[]>('professionals', `salon_id=eq.${salonId}&active=eq.true&select=id,salon_id,active,status`, session),
    fetchOptionalRows<PublicEmployeeRow[]>('employees', `salon_id=eq.${salonId}&active=eq.true&select=id,salon_id,active,status,full_name`, session),
    fetchOptionalRows<WorkingHourRow[]>('working_hours', `salon_id=eq.${salonId}&active=eq.true&select=*`, session),
    fetchOptionalRows<ServiceRow[]>('services', `salon_id=eq.${salonId}&active=eq.true&select=id,salon_id,active`, session),
  ]);

  return createPublicBookingDiagnostics(session.salonId, {
    employees,
    professionals,
    services,
    workingHours,
  });
}

async function fetchOptionalRows<T>(table: string, query: string, session: PlatformSession): Promise<T> {
  try {
    return await supabaseRestRequest<T>(table, { query }, session);
  } catch (error) {
    if (isMissingTableOrColumnError(error)) {
      return [] as T;
    }

    throw error;
  }
}

function isMissingTableOrColumnError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message;

  return (
    message.includes('Could not find the table') ||
    message.includes('Could not find') ||
    message.includes('schema cache') ||
    message.includes('column')
  );
}

function isMissingColumnError(error: unknown, columnName: string) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes(columnName) && isMissingTableOrColumnError(error);
}

function isInvalidUuidError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('invalid input syntax for type uuid') || error.message.includes('22P02');
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isProfessionalReadyForPublicMirror(professional: ProfessionalRecord) {
  const schedule = normalizeProfessionalSchedule(professional.schedule);

  return (
    professional.active &&
    schedule.active &&
    schedule.weekdays.length > 0 &&
    schedule.startTime < schedule.endTime
  );
}

function createPublicBookingDiagnostics(
  salonId: string,
  rows: {
    employees: PublicEmployeeRow[];
    professionals: ProfessionalRow[];
    services: ServiceRow[];
    workingHours: WorkingHourRow[];
  },
): PublicBookingDiagnostics {
  return {
    salonId,
    activeEmployeesCount: rows.employees.filter((employee) => employee.salon_id === salonId && isActiveCatalogRow(employee)).length,
    activeProfessionalsCount: rows.professionals.filter((professional) => professional.salon_id === salonId && isActiveCatalogRow(professional)).length,
    activeServicesCount: rows.services.filter((service) => service.salon_id === salonId && isActiveCatalogRow(service)).length,
    activeWorkingHoursCount: rows.workingHours.filter((workingHour) => workingHour.salon_id === salonId && workingHour.active !== false).length,
  };
}

function isActiveCatalogRow(row: { active: boolean | null; status?: string | null }) {
  const status = row.status?.trim().toLowerCase();

  return row.active !== false && status !== 'inactive' && status !== 'deleted' && status !== 'blocked';
}

function logPublicBookingDiagnostics(source: string, diagnostics: PublicBookingDiagnostics) {
  console.info(`[public-booking-sync] ${source}`, {
    salon_id: diagnostics.salonId,
    active_professionals: diagnostics.activeProfessionalsCount,
    active_employees: diagnostics.activeEmployeesCount,
    active_working_hours: diagnostics.activeWorkingHoursCount,
    active_services: diagnostics.activeServicesCount,
  });
}

function isVisibleProfessionalRow(row: ProfessionalRow) {
  return row.status?.trim().toLowerCase() !== 'deleted';
}

function isSnapshotReadyForPublicBooking(snapshot: PlatformDataSnapshot, options: { canUsePublicMirror: boolean }) {
  const hasActiveProfessionalWithSchedule = snapshot.professionals.some((professional) => {
    return isProfessionalReadyForPublicMirror(professional);
  });
  const hasActiveService = snapshot.services.some((service) => service.active);

  return options.canUsePublicMirror && hasActiveProfessionalWithSchedule && hasActiveService;
}

async function patchProfessionalAsDeleted(professionalId: string, session: PlatformSession) {
  const query = `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(professionalId)}`;

  try {
    await supabaseRestRequest<null>(
      'professionals',
      {
        method: 'PATCH',
        query,
        body: {
          active: false,
          status: 'deleted',
        },
        prefer: 'return=minimal',
        useServiceRole: true,
      },
      session,
    );
  } catch (error) {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }

    await supabaseRestRequest<null>(
      'professionals',
      {
        method: 'PATCH',
        query,
        body: {
          active: false,
        },
        prefer: 'return=minimal',
        useServiceRole: true,
      },
      session,
    );
  }
}

async function patchEmployeeAsDeleted(professionalId: string, session: PlatformSession) {
  if (!isUuid(professionalId)) {
    return;
  }

  const query = `salon_id=eq.${encodeURIComponent(session.salonId)}&id=eq.${encodeURIComponent(professionalId)}`;

  await supabaseRestRequest<null>(
    'employees',
    {
      method: 'PATCH',
      query,
      body: {
        active: false,
        status: 'deleted',
      },
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  ).catch((error) => {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }
  });
}

async function patchWorkingHoursAsInactive(professionalId: string, session: PlatformSession) {
  if (!isUuid(professionalId)) {
    return;
  }

  await supabaseRestRequest<null>(
    'working_hours',
    {
      method: 'PATCH',
      query: `salon_id=eq.${encodeURIComponent(session.salonId)}&employee_id=eq.${encodeURIComponent(professionalId)}`,
      body: {
        active: false,
      },
      prefer: 'return=minimal',
      useServiceRole: true,
    },
    session,
  ).catch((error) => {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }
  });
}

function createFallbackSubscription(salonId: string): SubscriptionRecord {
  const trialStartedAt = new Date();
  const trialEndsAt = new Date(trialStartedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    id: `subscription-${salonId}`,
    salonId,
    plan: 'starter',
    status: 'trialing',
    billingCycle: 'monthly',
    trialStartedAt: trialStartedAt.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    currentPeriodEnd: trialEndsAt.toISOString(),
  };
}

function createFallbackSubscriptionFromSalon(salonId: string, salon?: Partial<SalonRow> | null): SubscriptionRecord {
  const status = normalizeSubscriptionStatus((salon as { subscription_status?: string | null } | null)?.subscription_status);
  const trialStartedAt = (salon as { trial_started_at?: string | null } | null)?.trial_started_at ?? new Date().toISOString();
  const trialEndsAt =
    (salon as { trial_ends_at?: string | null } | null)?.trial_ends_at ??
    (salon as { current_period_end?: string | null } | null)?.current_period_end ??
    new Date(new Date(trialStartedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return normalizeSubscriptionCommercialState({
    id: `subscription-${salonId}`,
    salonId,
    plan: 'growth',
    status,
    billingCycle: 'monthly',
    trialStartedAt,
    trialEndsAt,
    currentPeriodEnd: (salon as { current_period_end?: string | null } | null)?.current_period_end ?? trialEndsAt,
  });
}

function normalizeSubscriptionStatus(value?: string | null): SubscriptionRecord['status'] {
  const status = value?.trim().toLowerCase();

  if (status === 'active') {
    return 'active';
  }

  if (status === 'pastdue' || status === 'past_due' || status === 'overdue' || status === 'blocked' || status === 'expired') {
    return 'pastDue';
  }

  if (status === 'cancelled' || status === 'canceled') {
    return 'cancelled';
  }

  return 'trialing';
}

function normalizeHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toUpperCase() : '#7C3AED';
}

function fromSalonRow(row: SalonRow): SalonRecord {
  return {
    id: row.id,
    name: row.name,
    ownerProfileId: row.owner_profile_id ?? 'profile-admin-bc',
    slug: row.slug ?? row.id,
    status: row.status ?? 'active',
    subscriptionId: row.subscription_id ?? undefined,
    isPublic: row.is_public === true,
    logoUrl: row.logo_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    themeMode: row.theme_mode === 'dark' ? 'dark' : 'light',
    primaryColor: normalizeHexColor(row.primary_color ?? '#7C3AED'),
    settings: normalizeSalonSettings(row.settings),
  };
}

function toSalonRow(record: SalonRecord): SalonRow {
  return {
    id: record.id,
    name: record.name,
    owner_profile_id: record.ownerProfileId,
    slug: record.slug,
    status: record.status,
    subscription_id: record.subscriptionId ?? null,
    is_public: record.isPublic,
    logo_url: record.logoUrl ?? null,
    cover_url: record.coverUrl ?? null,
    theme_mode: record.themeMode,
    primary_color: normalizeHexColor(record.primaryColor),
    settings: normalizeSalonSettings(record.settings),
  };
}

function fromSubscriptionRow(row: SubscriptionRow): SubscriptionRecord {
  return normalizeSubscriptionCommercialState({
    id: row.id,
    salonId: row.salon_id,
    plan: row.plan,
    status: row.status,
    billingCycle: row.billing_cycle ?? undefined,
    trialStartedAt: row.trial_started_at ?? undefined,
    trialEndsAt: row.trial_ends_at ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
    asaasCustomerId: row.asaas_customer_id ?? undefined,
    asaasSubscriptionId: row.asaas_subscription_id ?? undefined,
  });
}

function toSubscriptionRow(record: SubscriptionRecord): SubscriptionRow {
  const normalizedRecord = normalizeSubscriptionCommercialState(record);

  return {
    id: normalizedRecord.id,
    salon_id: normalizedRecord.salonId,
    plan: normalizedRecord.plan,
    status: normalizedRecord.status,
    billing_cycle: normalizedRecord.billingCycle ?? null,
    trial_started_at: normalizedRecord.trialStartedAt ?? null,
    trial_ends_at: normalizedRecord.trialEndsAt ?? null,
    current_period_end: normalizedRecord.currentPeriodEnd ?? null,
    asaas_customer_id: normalizedRecord.asaasCustomerId ?? null,
    asaas_subscription_id: normalizedRecord.asaasSubscriptionId ?? null,
  };
}

function fromCustomerRow(row: CustomerRow): ClientRecord {
  const createdAt = row.created_at ?? new Date().toISOString();

  return {
    id: row.id,
    salonId: row.salon_id,
    name: row.name ?? row.full_name ?? 'Cliente',
    phone: row.phone,
    email: row.email ?? undefined,
    notes: row.notes ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    deletedAt: row.deleted_at ?? undefined,
    createdAt,
    updatedAt: row.updated_at ?? createdAt,
  };
}

function toCustomerRow(record: ClientRecord): CustomerRow {
  return {
    id: record.id,
    salon_id: record.salonId,
    full_name: record.name,
    phone: record.phone,
    email: record.email ?? null,
    notes: record.notes ?? null,
    archived_at: record.archivedAt ?? null,
    deleted_at: record.deletedAt ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromProfessionalRow(row: ProfessionalRow, workingHours: WorkingHourRow[] = []): ProfessionalRecord {
  const createdAt = row.created_at ?? new Date().toISOString();
  const scheduleRows = workingHours.filter((hour) => hour.employee_id === row.id && hour.active !== false);
  const firstSchedule = scheduleRows[0];

  return {
    id: row.id,
    salonId: row.salon_id,
    profileId: row.profile_id ?? `profile-${row.id}`,
    accessProfileId: row.access_profile_id ?? 'professional',
    name: row.name ?? row.full_name ?? 'Profissional',
    email: row.email ?? `${row.id}@belezacarioca.local`,
    role: row.role ?? row.specialty ?? 'Profissional',
    active: row.active !== false,
    permissions: row.permissions ?? [],
    avatarUrl: row.avatar_url ?? undefined,
    schedule: normalizeProfessionalSchedule(
      row.schedule ??
        (firstSchedule
          ? {
              active: true,
              weekdays: scheduleRows.map((hour) => hour.weekday).filter((weekday): weekday is Weekday => weekday >= 0 && weekday <= 6),
              startTime: firstSchedule.start_time.slice(0, 5),
              endTime: firstSchedule.end_time.slice(0, 5),
            }
          : undefined),
    ),
    createdAt,
    updatedAt: row.updated_at ?? createdAt,
  };
}

function toProfessionalRow(record: ProfessionalRecord): ProfessionalRow {
  return {
    id: record.id,
    salon_id: record.salonId,
    profile_id: record.profileId,
    access_profile_id: record.accessProfileId,
    name: record.name,
    email: record.email,
    role: record.role,
    active: record.active,
    status: record.active ? 'active' : 'inactive',
    permissions: record.permissions,
    schedule: normalizeProfessionalSchedule(record.schedule),
    avatar_url: record.avatarUrl ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function toEmployeeRow(record: ProfessionalRecord): ProfessionalRow {
  return {
    id: record.id,
    salon_id: record.salonId,
    full_name: record.name,
    role: record.role,
    active: record.active,
    status: record.active ? 'active' : 'inactive',
    commission_rate: 0,
    specialty: record.role,
    avatar_url: record.avatarUrl ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromProfessionalScheduleExceptionRow(row: ProfessionalScheduleExceptionRow): ProfessionalScheduleExceptionRecord {
  return {
    id: row.id,
    salonId: row.salon_id,
    professionalId: row.professional_id,
    date: row.date,
    type: row.type,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    reason: row.reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProfessionalScheduleExceptionRow(record: ProfessionalScheduleExceptionRecord): ProfessionalScheduleExceptionRow {
  return {
    id: record.id,
    salon_id: record.salonId,
    professional_id: record.professionalId,
    date: record.date,
    type: record.type,
    start_time: record.startTime ?? null,
    end_time: record.endTime ?? null,
    reason: record.reason ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromServiceRow(row: ServiceRow): ServiceRecord {
  const createdAt = row.created_at ?? new Date().toISOString();

  return {
    id: row.id,
    salonId: row.salon_id,
    name: row.name,
    category: row.category ?? 'Geral',
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents ?? Math.round((row.price ?? 0) * 100),
    active: row.active !== false,
    professionalIds: row.professional_ids ?? [],
    notes: row.notes ?? row.description ?? undefined,
    createdAt,
    updatedAt: row.updated_at ?? createdAt,
  };
}

function toServiceRow(record: ServiceRecord): ServiceRow {
  return {
    id: record.id,
    salon_id: record.salonId,
    name: record.name,
    category: record.category,
    duration_minutes: record.durationMinutes,
    price_cents: record.priceCents,
    active: record.active,
    professional_ids: record.professionalIds,
    notes: record.notes ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromAppointmentRow(row: AppointmentRow): AppointmentRecord {
  const startsAt = row.starts_at ?? toIsoFromDateTime(row.appointment_date, row.appointment_time);
  const createdAt = row.created_at ?? new Date().toISOString();

  return {
    id: row.id,
    salonId: row.salon_id,
    clientId: row.client_id ?? row.customer_id ?? '',
    professionalId: row.professional_id ?? row.employee_id ?? '',
    serviceId: row.service_id,
    startsAt,
    endsAt: row.ends_at ?? calculateAppointmentEndsAt(startsAt),
    status: fromSupabaseAppointmentStatus(row.status),
    notes: row.notes ?? undefined,
    salonResponseMessage: row.salon_response_message ?? undefined,
    rejectedReason: row.rejected_reason ?? undefined,
    confirmedAt: row.confirmed_at ?? undefined,
    rejectedAt: row.rejected_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    noShowAt: row.no_show_at ?? undefined,
    startedAt: row.started_at ?? undefined,
    finishedAt: row.finished_at ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    clientVisibleMessage: row.client_visible_message ?? undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    createdAt,
    updatedAt: row.updated_at ?? createdAt,
  };
}

function toAppointmentRow(record: AppointmentRecord): AppointmentRow {
  const date = new Date(record.startsAt);
  const appointmentDate = Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : record.startsAt.slice(0, 10);
  const appointmentTime = Number.isFinite(date.getTime())
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : record.startsAt.slice(11, 16);

  return {
    id: record.id,
    salon_id: record.salonId,
    customer_id: record.clientId,
    employee_id: record.professionalId,
    service_id: record.serviceId,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    status: toSupabaseAppointmentStatus(record.status),
    reminder_offsets_minutes: [1440, 120],
    notes: record.notes ?? null,
    salon_response_message: record.salonResponseMessage ?? null,
    rejected_reason: record.rejectedReason ?? null,
    confirmed_at: record.confirmedAt ?? null,
    rejected_at: record.rejectedAt ?? null,
    completed_at: record.completedAt ?? null,
    cancelled_at: record.cancelledAt ?? null,
    no_show_at: record.noShowAt ?? null,
    started_at: record.startedAt ?? null,
    finished_at: record.finishedAt ?? null,
    internal_notes: record.internalNotes ?? null,
    client_visible_message: record.clientVisibleMessage ?? record.salonResponseMessage ?? null,
    cancellation_reason: record.cancellationReason ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function toIsoFromDateTime(date?: string | null, time?: string | null) {
  if (!date || !time) {
    return new Date().toISOString();
  }

  return new Date(`${date}T${time.slice(0, 5)}:00`).toISOString();
}

function calculateAppointmentEndsAt(startsAt: string) {
  return new Date(new Date(startsAt).getTime() + 45 * 60 * 1000).toISOString();
}

function fromSupabaseAppointmentStatus(status: AppointmentRow['status']): AppointmentRecord['status'] {
  if (status === 'pending') {
    return 'requested';
  }

  if (status === 'confirmed') {
    return 'confirmed';
  }

  if (status === 'rejected') {
    return 'rejected';
  }

  if (status === 'completed') {
    return 'completed';
  }

  if (status === 'cancelled') {
    return 'cancelled';
  }

  if (status === 'no_show') {
    return 'noShow';
  }

  return status;
}

function toSupabaseAppointmentStatus(status: AppointmentRecord['status']): AppointmentRow['status'] {
  if (status === 'requested' || status === 'scheduled') {
    return 'pending';
  }

  if (status === 'noShow') {
    return 'no_show';
  }

  if (status === 'rejected') {
    return 'rejected';
  }

  if (status === 'checkedIn' || status === 'inService') {
    return 'confirmed';
  }

  return status;
}

function fromAttendanceRow(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    salonId: row.salon_id,
    professionalId: row.professional_id,
    status: row.status,
    startedAt: row.started_at ?? undefined,
    finishedAt: row.finished_at ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAttendanceRow(record: AttendanceRecord): AttendanceRow {
  return {
    id: record.id,
    appointment_id: record.appointmentId,
    salon_id: record.salonId,
    professional_id: record.professionalId,
    status: record.status,
    started_at: record.startedAt ?? null,
    finished_at: record.finishedAt ?? null,
    notes: record.notes ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromAccountClosureRow(row: AccountClosureRow): AccountClosureRecord {
  return {
    id: row.id,
    salonId: row.salon_id,
    appointmentId: row.appointment_id,
    clientId: row.client_id,
    professionalId: row.professional_id,
    serviceId: row.service_id,
    baseAmountCents: row.base_amount_cents,
    discountCents: row.discount_cents,
    additionCents: row.addition_cents,
    finalAmountCents: row.final_amount_cents,
    status: row.status,
    notes: row.notes ?? undefined,
    closedAt: row.closed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAccountClosureRow(record: AccountClosureRecord): AccountClosureRow {
  return {
    id: record.id,
    salon_id: record.salonId,
    appointment_id: record.appointmentId,
    client_id: record.clientId,
    professional_id: record.professionalId,
    service_id: record.serviceId,
    base_amount_cents: record.baseAmountCents,
    discount_cents: record.discountCents,
    addition_cents: record.additionCents,
    final_amount_cents: record.finalAmountCents,
    status: record.status,
    notes: record.notes ?? null,
    closed_at: record.closedAt ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromPaymentRow(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    salonId: row.salon_id,
    appointmentId: row.appointment_id,
    accountClosureId: row.account_closure_id,
    chargeId: row.charge_id ?? undefined,
    clientId: row.client_id,
    amountCents: row.amount_cents,
    method: row.method,
    status: row.status,
    paidAt: row.paid_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPaymentRow(record: PaymentRecord): PaymentRow {
  return {
    id: record.id,
    salon_id: record.salonId,
    appointment_id: record.appointmentId,
    account_closure_id: record.accountClosureId,
    charge_id: record.chargeId ?? null,
    client_id: record.clientId,
    amount_cents: record.amountCents,
    method: record.method,
    status: record.status,
    paid_at: record.paidAt ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromChargeRow(row: ChargeRow): ChargeRecord {
  return {
    id: row.id,
    salonId: row.salon_id,
    appointmentId: row.appointment_id ?? undefined,
    accountClosureId: row.account_closure_id ?? undefined,
    clientId: row.client_id ?? undefined,
    subscriptionId: row.subscription_id ?? undefined,
    clientName: row.client_name ?? undefined,
    serviceName: row.service_name ?? undefined,
    amountCents: row.amount_cents ?? Math.round((row.valor ?? row.amount ?? 0) * 100),
    status: row.status,
    origin: row.origin,
    provider: row.provider,
    paymentMethod: row.payment_method ?? undefined,
    providerChargeId: row.provider_charge_id ?? undefined,
    paidAt: row.paid_at ?? undefined,
    dueDate: row.due_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toChargeRow(record: ChargeRecord): ChargeRow {
  return {
    id: record.id,
    salon_id: record.salonId,
    appointment_id: record.appointmentId ?? null,
    account_closure_id: record.accountClosureId ?? null,
    client_id: record.clientId ?? null,
    client_name: record.clientName ?? null,
    subscription_id: record.subscriptionId ?? null,
    amount_cents: record.amountCents,
    status: record.status,
    origin: record.origin,
    provider: record.provider,
    payment_method: record.paymentMethod ?? null,
    provider_charge_id: record.providerChargeId ?? null,
    paid_at: record.paidAt ?? null,
    due_date: record.dueDate ?? null,
    service_name: record.serviceName ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}
