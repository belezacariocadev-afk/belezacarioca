import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

export type ClientBookingSalon = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  category: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  themeMode: 'light' | 'dark';
  primaryColor: string;
  services: ClientBookingService[];
  employees: ClientBookingEmployee[];
};

export type ClientBookingSalonDiagnostic = {
  id: string;
  name: string;
  issues: string[];
};

export type ClientBookingService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
};

export type ClientBookingEmployee = {
  id: string;
  fullName: string;
  specialty: string | null;
  avatarUrl: string | null;
};

export type ClientBookingSlot = {
  time: string;
  label: string;
};

export type ClientBookingAppointment = {
  id: string;
  date: string;
  time: string;
  salonId: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  priceCents: number;
  employeeId: string;
  employeeName: string;
  status: 'pending' | 'scheduled' | 'confirmed' | 'inService' | 'completed' | 'rejected' | 'cancelled' | 'noShow';
  salonResponseMessage: string | null;
  rejectedReason: string | null;
};

type SalonRow = {
  id: string;
  name: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  category: string | null;
  cover_url?: string | null;
  is_public: boolean | null;
  logo_url?: string | null;
  subscription_status: string | null;
  theme_mode?: string | null;
  primary_color?: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
};

type ServiceRow = {
  active: boolean | null;
  category?: string | null;
  description: string | null;
  duration_minutes: number | null;
  id: string;
  name: string | null;
  notes?: string | null;
  price: number | null;
  price_cents?: number | null;
  salon_id: string;
  status?: string | null;
};

type EmployeeRow = {
  active: boolean | null;
  full_name: string | null;
  id: string;
  avatar_url?: string | null;
  salon_id: string;
  status?: string | null;
  specialty: string | null;
};

type ProfessionalRow = {
  active: boolean | null;
  avatar_url?: string | null;
  id: string;
  name?: string | null;
  salon_id: string;
  status?: string | null;
};

type WorkingHourRow = {
  active: boolean | null;
  employee_id: string;
  end_time: string | null;
  salon_id: string;
  start_time: string | null;
  weekday: number | null;
};

type AppointmentRow = {
  appointment_date: string;
  appointment_time: string;
  customer_id: string;
  employee_id: string;
  id: string;
  rejected_reason?: string | null;
  salon_response_message?: string | null;
  salon_id: string;
  service_id: string;
  status: string;
};

type CustomerRow = {
  email: string | null;
  full_name: string | null;
  id: string;
  phone: string | null;
  salon_id: string;
};

export type CreateClientBookingInput = {
  salonId: string;
  serviceId: string;
  employeeId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
};

const salonSelect =
  'id,name,city,state,neighborhood,category,logo_url,cover_url,theme_mode,primary_color,is_public,subscription_status,trial_ends_at,current_period_end';

export async function listAvailableClientBookingSalons(): Promise<ClientBookingSalon[]> {
  const result = await listClientBookingSalonAvailability();

  return result.salons;
}

export async function listClientBookingSalonAvailability(): Promise<{
  diagnostics: ClientBookingSalonDiagnostic[];
  salons: ClientBookingSalon[];
}> {
  const salons = await supabaseRestRequest<SalonRow[]>('salons', {
    query: new URLSearchParams({
      select: salonSelect,
      order: 'featured.desc,name.asc',
    }).toString(),
    useServiceRole: true,
  });
  const commerciallyAvailableSalons = salons.filter(isSalonCommerciallyAvailable);

  if (commerciallyAvailableSalons.length === 0) {
    return {
      diagnostics: salons.map((salon) => ({
        id: salon.id,
        name: salon.name ?? 'Estabelecimento',
        issues: getSalonBaseIssues(salon),
      })),
      salons: [],
    };
  }

  const salonIds = commerciallyAvailableSalons.map((salon) => salon.id);
  const [services, professionals, employees, workingHours] = await Promise.all([
    fetchServices(salonIds),
    fetchProfessionals(salonIds),
    fetchEmployees(salonIds),
    fetchWorkingHours(salonIds),
  ]);

  const mappedSalons = await Promise.all(commerciallyAvailableSalons.map(async (salon) => {
      const salonServices = services
        .filter((service) => service.salon_id === salon.id && isActiveCatalogRow(service) && service.name)
        .map(toClientService);
      const salonProfessionals = professionals.filter(
        (professional) => professional.salon_id === salon.id && isActiveCatalogRow(professional),
      );
      const salonEmployees = employees
        .filter((employee) => employee.salon_id === salon.id && isActiveCatalogRow(employee) && employee.full_name)
        .map((employee) => toClientEmployee(employee, salonProfessionals.find((professional) => professional.id === employee.id)));
      const hasHours = workingHours.some((row) => row.salon_id === salon.id && row.active !== false);

      console.info('[client-booking] public readiness', {
        salon_id: salon.id,
        active_professionals: salonProfessionals.length,
        active_employees: salonEmployees.length,
        active_working_hours: workingHours.filter((row) => row.salon_id === salon.id && row.active !== false).length,
        active_services: salonServices.length,
      });

      return {
        diagnostics: getSalonSetupIssues(salon, {
          hasEmployees: salonEmployees.length > 0,
          hasHours,
          hasProfessionals: salonProfessionals.length > 0,
          hasServices: salonServices.length > 0,
        }),
        salon: {
          id: salon.id,
          name: salon.name ?? 'Estabelecimento',
          city: salon.city,
          state: salon.state,
          neighborhood: salon.neighborhood,
          category: salon.category,
          logoUrl: salon.logo_url ?? null,
          coverUrl: salon.cover_url ?? null,
          themeMode: normalizeThemeMode(salon.theme_mode),
          primaryColor: normalizeHexColor(salon.primary_color ?? '#7C3AED'),
          services: salonServices,
          employees: salonEmployees,
        },
      };
    }));

  return {
    diagnostics: mappedSalons
      .filter((item) => item.diagnostics.length > 0)
      .map((item) => ({
        id: item.salon.id,
        name: item.salon.name,
        issues: item.diagnostics,
      })),
    salons: mappedSalons.filter((item) => item.diagnostics.length === 0).map((item) => item.salon),
  };
}

export async function listClientBookingSlots(input: {
  date: string;
  employeeId: string;
  salonId: string;
  serviceId: string;
}): Promise<ClientBookingSlot[]> {
  const [salons, services, employees, workingHours, appointments] = await Promise.all([
    supabaseRestRequest<SalonRow[]>('salons', {
      query: `id=eq.${encodeURIComponent(input.salonId)}&select=${salonSelect}&limit=1`,
      useServiceRole: true,
    }),
    supabaseRestRequest<ServiceRow[]>('services', {
      query: `id=eq.${encodeURIComponent(input.serviceId)}&salon_id=eq.${encodeURIComponent(input.salonId)}&select=*&limit=1`,
      useServiceRole: true,
    }),
    supabaseRestRequest<EmployeeRow[]>('employees', {
      query: `id=eq.${encodeURIComponent(input.employeeId)}&salon_id=eq.${encodeURIComponent(input.salonId)}&select=*&limit=1`,
      useServiceRole: true,
    }),
    supabaseRestRequest<WorkingHourRow[]>('working_hours', {
      query:
        `salon_id=eq.${encodeURIComponent(input.salonId)}` +
        `&employee_id=eq.${encodeURIComponent(input.employeeId)}` +
        `&weekday=eq.${getWeekday(input.date)}` +
        '&active=eq.true&select=*',
      useServiceRole: true,
    }),
    fetchAppointments(input.salonId, input.employeeId, input.date),
  ]);
  const salon = salons[0];
  const service = services[0];
  const employee = employees[0];

  if (!salon || !isSalonBookable(salon) || !service || !isActiveCatalogRow(service) || !employee || !isActiveCatalogRow(employee)) {
    return [];
  }

  return buildSlotsForDay(input.date, workingHours, appointments, service.duration_minutes ?? 45);
}

export async function createClientBooking(input: CreateClientBookingInput) {
  const slots = await listClientBookingSlots(input);

  if (!slots.some((slot) => slot.time === input.time)) {
    throw new Error('Horario indisponivel. Escolha outro horario e tente novamente.');
  }

  const customer = await findOrCreateCustomer(input);
  const duplicate = await supabaseRestRequest<AppointmentRow[]>('appointments', {
    query:
      `salon_id=eq.${encodeURIComponent(input.salonId)}` +
      `&customer_id=eq.${encodeURIComponent(customer.id)}` +
      `&employee_id=eq.${encodeURIComponent(input.employeeId)}` +
      `&appointment_date=eq.${encodeURIComponent(input.date)}` +
      `&appointment_time=eq.${encodeURIComponent(input.time)}` +
      '&status=in.(pending,confirmed)&select=id&limit=1',
    useServiceRole: true,
  });

  if (duplicate[0]) {
    throw new Error('Voce ja tem uma solicitacao pendente ou confirmada neste horario.');
  }

  const rows = await supabaseRestRequest<AppointmentRow[]>('appointments', {
    method: 'POST',
    body: [
      {
        salon_id: input.salonId,
        customer_id: customer.id,
        employee_id: input.employeeId,
        service_id: input.serviceId,
        appointment_date: input.date,
        appointment_time: input.time,
        status: 'pending',
        notes: input.notes?.trim() || null,
        salon_response_message: null,
        rejected_reason: null,
      },
    ],
    prefer: 'return=representation',
    useServiceRole: true,
  });

  return rows[0];
}

export async function listClientBookingAppointments(input: { email?: string; phone?: string }): Promise<ClientBookingAppointment[]> {
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();

  if (!email && !phone) {
    return [];
  }

  const customerFilter = email && phone
    ? `or=(email.eq.${encodeURIComponent(email)},phone.eq.${encodeURIComponent(phone)})`
    : email
      ? `email=eq.${encodeURIComponent(email)}`
      : `phone=eq.${encodeURIComponent(phone ?? '')}`;
  const customers = await supabaseRestRequest<CustomerRow[]>('customers', {
    query: `${customerFilter}&select=id,salon_id,full_name,email,phone`,
    useServiceRole: true,
  });
  const customerIds = customers.map((customer) => customer.id);

  if (customerIds.length === 0) {
    return [];
  }

  const appointments = await supabaseRestRequest<AppointmentRow[]>('appointments', {
    query:
      `customer_id=in.(${customerIds.map(encodeURIComponent).join(',')})` +
      '&select=id,salon_id,customer_id,employee_id,service_id,appointment_date,appointment_time,status,salon_response_message,rejected_reason' +
      '&order=appointment_date.desc,appointment_time.desc',
    useServiceRole: true,
  });
  const salonIds = unique(appointments.map((appointment) => appointment.salon_id));
  const serviceIds = unique(appointments.map((appointment) => appointment.service_id));
  const employeeIds = unique(appointments.map((appointment) => appointment.employee_id));
  const [salons, services, employees] = await Promise.all([
    salonIds.length > 0
      ? supabaseRestRequest<SalonRow[]>('salons', {
          query: `id=in.(${salonIds.map(encodeURIComponent).join(',')})&select=id,name`,
          useServiceRole: true,
        })
      : [],
    serviceIds.length > 0
      ? supabaseRestRequest<ServiceRow[]>('services', {
          query: `id=in.(${serviceIds.map(encodeURIComponent).join(',')})&select=id,name`,
          useServiceRole: true,
        })
      : [],
    employeeIds.length > 0
      ? supabaseRestRequest<EmployeeRow[]>('employees', {
          query: `id=in.(${employeeIds.map(encodeURIComponent).join(',')})&select=id,full_name`,
          useServiceRole: true,
        })
      : [],
  ]);

  return appointments.map((appointment) => ({
    id: appointment.id,
    date: appointment.appointment_date,
    time: appointment.appointment_time.slice(0, 5),
    salonId: appointment.salon_id,
    salonName: salons.find((salon) => salon.id === appointment.salon_id)?.name ?? 'Estabelecimento',
    serviceId: appointment.service_id,
    serviceName: services.find((service) => service.id === appointment.service_id)?.name ?? 'Servico',
    priceCents: toClientServicePriceCents(services.find((service) => service.id === appointment.service_id)),
    employeeId: appointment.employee_id,
    employeeName: employees.find((employee) => employee.id === appointment.employee_id)?.full_name ?? 'Profissional',
    status: toPublicAppointmentStatus(appointment.status),
    salonResponseMessage: appointment.salon_response_message ?? null,
    rejectedReason: appointment.rejected_reason ?? null,
  }));
}

function isSalonBookable(salon: SalonRow) {
  if (salon.is_public !== true) {
    return false;
  }

  return isSalonCommerciallyAvailable(salon);
}

function isSalonCommerciallyAvailable(salon: SalonRow) {

  const status = salon.subscription_status?.trim().toLowerCase();

  if (status === 'active') {
    return true;
  }

  if (status && status !== 'trial_active' && status !== 'trialing' && status !== 'trial' && status !== 'none') {
    return false;
  }

  const trialEndsAt = salon.trial_ends_at ?? salon.current_period_end;

  if (!trialEndsAt) {
    return false;
  }

  const trialEndTime = new Date(trialEndsAt).getTime();

  return Number.isFinite(trialEndTime) && trialEndTime >= Date.now();
}

function getSalonBaseIssues(salon: SalonRow) {
  if (!isSalonCommerciallyAvailable(salon)) {
    return ['O salão não está com trial ou assinatura ativa.'];
  }

  return [];
}

function getSalonSetupIssues(
  salon: SalonRow,
  readiness: { hasEmployees: boolean; hasHours: boolean; hasProfessionals: boolean; hasServices: boolean },
) {
  const issues = getSalonBaseIssues(salon);

  if (salon.is_public !== true) {
    issues.push('O salão ainda não foi publicado para agendamento.');
  }

  if (!readiness.hasProfessionals) {
    issues.push('Cadastre pelo menos um profissional ativo.');
  }

  if (!readiness.hasEmployees) {
    issues.push('Sincronize o profissional com o fluxo público de agendamento.');
  }

  if (!readiness.hasServices) {
    issues.push('Cadastre pelo menos um serviço ativo.');
  }

  if (!readiness.hasHours) {
    issues.push('Configure horários ativos para atendimento.');
  }

  return issues;
}

function isActiveCatalogRow(row: { active: boolean | null; status?: string | null }) {
  const status = row.status?.trim().toLowerCase();

  return row.active !== false && status !== 'inactive' && status !== 'deleted' && status !== 'blocked';
}

async function fetchServices(salonIds: string[]) {
  return supabaseRestRequest<ServiceRow[]>('services', {
    query: `salon_id=in.(${salonIds.map(encodeURIComponent).join(',')})&active=eq.true&select=*`,
    useServiceRole: true,
  });
}

async function fetchProfessionals(salonIds: string[]) {
  return supabaseRestRequest<ProfessionalRow[]>('professionals', {
    query: `salon_id=in.(${salonIds.map(encodeURIComponent).join(',')})&active=eq.true&select=*`,
    useServiceRole: true,
  }).catch((error) => {
    if (isMissingTableOrColumnError(error)) {
      return [];
    }

    throw error;
  });
}

async function fetchEmployees(salonIds: string[]) {
  return supabaseRestRequest<EmployeeRow[]>('employees', {
    query: `salon_id=in.(${salonIds.map(encodeURIComponent).join(',')})&active=eq.true&select=*`,
    useServiceRole: true,
  });
}

async function fetchWorkingHours(salonIds: string[]) {
  return supabaseRestRequest<WorkingHourRow[]>('working_hours', {
    query: `salon_id=in.(${salonIds.map(encodeURIComponent).join(',')})&active=eq.true&select=*`,
    useServiceRole: true,
  });
}

async function fetchAppointments(salonId: string, employeeId: string, date: string) {
  return supabaseRestRequest<AppointmentRow[]>('appointments', {
    query:
      `salon_id=eq.${encodeURIComponent(salonId)}` +
      `&employee_id=eq.${encodeURIComponent(employeeId)}` +
      `&appointment_date=eq.${encodeURIComponent(date)}` +
      '&status=in.(pending,confirmed)&select=*',
    useServiceRole: true,
  });
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function toPublicAppointmentStatus(status: string): ClientBookingAppointment['status'] {
  if (status === 'scheduled') {
    return 'scheduled';
  }

  if (status === 'confirmed') {
    return 'confirmed';
  }

  if (status === 'inService') {
    return 'inService';
  }

  if (status === 'completed') {
    return 'completed';
  }

  if (status === 'rejected') {
    return 'rejected';
  }

  if (status === 'cancelled' || status === 'canceled') {
    return 'cancelled';
  }

  if (status === 'no_show' || status === 'noShow') {
    return 'noShow';
  }

  return 'pending';
}

function toClientServicePriceCents(service?: ServiceRow) {
  return service ? service.price_cents ?? Math.round((service.price ?? 0) * 100) : 0;
}

async function findOrCreateCustomer(input: CreateClientBookingInput) {
  const email = input.customerEmail?.trim().toLowerCase() || '';
  const phone = input.customerPhone?.trim() || '';
  const customerFilter = email && phone
    ? `or=(email.eq.${encodeURIComponent(email)},phone.eq.${encodeURIComponent(phone)})`
    : email
      ? `email=eq.${encodeURIComponent(email)}`
      : `phone=eq.${encodeURIComponent(phone)}`;
  const existing = await supabaseRestRequest<CustomerRow[]>('customers', {
    query:
      `salon_id=eq.${encodeURIComponent(input.salonId)}` +
      `&${customerFilter}` +
      '&select=id,salon_id,full_name,email,phone&limit=1',
    useServiceRole: true,
  });

  if (existing[0]) {
    await supabaseRestRequest<CustomerRow[]>('customers', {
      method: 'PATCH',
      query: `id=eq.${encodeURIComponent(existing[0].id)}`,
      body: {
        full_name: input.customerName.trim(),
        phone,
        email: email || null,
      },
      prefer: 'return=representation',
      useServiceRole: true,
    });

    return existing[0];
  }

  const rows = await supabaseRestRequest<CustomerRow[]>('customers', {
    method: 'POST',
    body: {
      salon_id: input.salonId,
      full_name: input.customerName.trim(),
      phone,
      email: email || null,
    },
    prefer: 'return=representation',
    useServiceRole: true,
  });

  return rows[0];
}

function toClientService(row: ServiceRow): ClientBookingService {
  return {
    id: row.id,
    name: row.name ?? 'Servico',
    description: row.description ?? row.notes ?? row.category ?? null,
    durationMinutes: row.duration_minutes ?? 45,
    priceCents: row.price_cents ?? Math.round((row.price ?? 0) * 100),
  };
}

function toClientEmployee(row: EmployeeRow, professional?: ProfessionalRow): ClientBookingEmployee {
  return {
    id: row.id,
    fullName: row.full_name ?? 'Profissional',
    specialty: row.specialty,
    avatarUrl: row.avatar_url ?? professional?.avatar_url ?? null,
  };
}

function normalizeHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toUpperCase() : '#7C3AED';
}

function normalizeThemeMode(value?: string | null): ClientBookingSalon['themeMode'] {
  return value === 'dark' ? 'dark' : 'light';
}

function buildSlotsForDay(date: string, workingHours: WorkingHourRow[], appointments: AppointmentRow[], durationMinutes: number) {
  const now = Date.now();
  const taken = new Set(appointments.map((appointment) => appointment.appointment_time.slice(0, 5)));
  const slots: ClientBookingSlot[] = [];

  for (const period of workingHours) {
    const start = parseTime(period.start_time);
    const end = parseTime(period.end_time);

    if (start === null || end === null || end <= start) {
      continue;
    }

    for (let minute = start; minute + durationMinutes <= end; minute += 30) {
      const time = formatMinutes(minute);

      if (taken.has(time)) {
        continue;
      }

      const slotTime = new Date(`${date}T${time}:00`);

      if (slotTime.getTime() > now) {
        slots.push({ time, label: time });
      }
    }
  }

  return slots;
}

function getWeekday(date: string) {
  return new Date(`${date}T00:00:00`).getDay();
}

function parseTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const [hour, minute] = value.slice(0, 5).split(':').map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function formatMinutes(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function isMissingTableOrColumnError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message;

  return message.includes('Could not find') || message.includes('schema cache') || message.includes('column');
}
