import { supabaseRestRequest, SupabaseConfigurationError } from '@/lib/platform/supabase/rest-client';

export type PublicSalonShowcase = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  category: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  primaryColor: string;
  themeMode: 'light' | 'dark';
  featured: boolean;
};

export type PublicSalonProfessional = {
  avatarUrl: string | null;
  id: string;
  name: string;
  role: string | null;
  scheduleLabel: string;
};

export type PublicSalonService = {
  durationMinutes: number;
  id: string;
  name: string;
  priceCents: number;
};

export type PublicSalonProfile = PublicSalonShowcase & {
  description: string | null;
  professionals: PublicSalonProfessional[];
  services: PublicSalonService[];
};

type PublicSalonRow = {
  id: string;
  name: string | null;
  slug?: string | null;
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  category?: string | null;
  cover_url?: string | null;
  description?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  theme_mode?: string | null;
  featured?: boolean | null;
  is_public?: boolean | null;
  current_period_end?: string | null;
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  trial_started_at?: string | null;
};

type PublicEmployeeRow = {
  active?: boolean | null;
  avatar_url?: string | null;
  full_name?: string | null;
  id: string;
  role?: string | null;
  salon_id: string;
  schedule?: PublicProfessionalSchedule | null;
  specialty?: string | null;
  status?: string | null;
};

type PublicProfessionalSchedule = {
  active?: boolean;
  endTime?: string;
  startTime?: string;
  weekdays?: number[];
};

type PublicProfessionalRow = {
  active?: boolean | null;
  avatar_url?: string | null;
  id: string;
  name?: string | null;
  role?: string | null;
  salon_id: string;
  schedule?: PublicProfessionalSchedule | null;
  status?: string | null;
};

type PublicServiceRow = {
  active?: boolean | null;
  duration_minutes?: number | null;
  id: string;
  name?: string | null;
  price?: number | null;
  price_cents?: number | null;
  salon_id: string;
  status?: string | null;
};

type PublicWorkingHourRow = {
  active?: boolean | null;
  employee_id: string;
  end_time?: string | null;
  start_time?: string | null;
  weekday?: number | null;
};

const SHOWCASE_SELECT =
  'id,name,slug,city,state,neighborhood,category,description,logo_url,cover_url,primary_color,theme_mode,featured,is_public,subscription_status,trial_started_at,trial_ends_at,current_period_end';
const SHOWCASE_SELECT_WITH_STATUS =
  'id,name,slug,city,state,neighborhood,category,description,logo_url,cover_url,primary_color,theme_mode,featured,is_public,subscription_status';
const SHOWCASE_SELECT_WITHOUT_SUBSCRIPTION =
  'id,name,slug,city,state,neighborhood,category,description,logo_url,cover_url,primary_color,theme_mode,featured,is_public';
const SHOWCASE_SELECT_WITHOUT_DESCRIPTION =
  'id,name,slug,city,state,neighborhood,category,logo_url,cover_url,primary_color,theme_mode,featured,is_public,subscription_status,trial_started_at,trial_ends_at,current_period_end';

function isMissingShowcaseColumn(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('Could not find') ||
    message.includes('schema cache') ||
    message.includes('column') ||
    message.includes('is_public') ||
    message.includes('featured') ||
    message.includes('slug')
  );
}

function isMissingColumn(error: unknown, column: string) {
  const message = error instanceof Error ? error.message : String(error);

  return message.includes(column) && (message.includes('Could not find') || message.includes('schema cache') || message.includes('column'));
}

function isActiveSalon(row: PublicSalonRow) {
  const trialEndsAt = row.trial_ends_at ?? row.current_period_end;

  if (!row.subscription_status) {
    if (!trialEndsAt) {
      return true;
    }

    const trialEndTime = new Date(trialEndsAt).getTime();

    return Number.isFinite(trialEndTime) && trialEndTime >= Date.now();
  }

  const normalizedStatus = row.subscription_status.trim().toLowerCase();

  if (normalizedStatus === 'active') {
    return true;
  }

  if (normalizedStatus !== 'trial_active' && normalizedStatus !== 'trialing' && normalizedStatus !== 'trial' && normalizedStatus !== 'none') {
    return false;
  }

  if (!trialEndsAt) {
    return false;
  }

  const trialEndTime = new Date(trialEndsAt).getTime();

  return Number.isFinite(trialEndTime) && trialEndTime >= Date.now();
}

function toPublicSalon(row: PublicSalonRow): PublicSalonShowcase | null {
  if (!row.id || !row.name || row.is_public !== true || !isActiveSalon(row)) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug ?? null,
    city: row.city ?? null,
    state: row.state ?? null,
    neighborhood: row.neighborhood ?? null,
    category: row.category ?? null,
    logoUrl: row.logo_url ?? null,
    coverUrl: row.cover_url ?? null,
    primaryColor: normalizeHexColor(row.primary_color ?? '#7C3AED'),
    themeMode: row.theme_mode === 'dark' ? 'dark' : 'light',
    featured: row.featured === true,
  };
}

function normalizeHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toUpperCase() : '#7C3AED';
}

export async function listFeaturedPublicSalons(limit = 8): Promise<PublicSalonShowcase[]> {
  try {
    const params = {
      is_public: 'eq.true',
      order: 'featured.desc,name.asc',
      limit: String(limit),
    };
    const rows = await requestPublicSalonRows(params);

    return rows.map(toPublicSalon).filter((salon): salon is PublicSalonShowcase => Boolean(salon));
  } catch (error) {
    if (error instanceof SupabaseConfigurationError || isMissingShowcaseColumn(error)) {
      return [];
    }

    throw error;
  }
}

export async function getPublicSalonBySlug(slug: string): Promise<PublicSalonShowcase | null> {
  try {
    const rows = await requestPublicSalonRows({
      slug: `eq.${slug}`,
      is_public: 'eq.true',
      limit: '1',
    });

    return toPublicSalon(rows[0] ?? ({} as PublicSalonRow));
  } catch (error) {
    if (error instanceof SupabaseConfigurationError || isMissingShowcaseColumn(error)) {
      return null;
    }

    throw error;
  }
}

export async function getPublicSalonProfileByIdOrSlug(idOrSlug: string): Promise<PublicSalonProfile | null> {
  try {
    const salonIdentifier = idOrSlug.trim();
    const rows = await requestPublicSalonRows({
      [isUuid(salonIdentifier) ? 'id' : 'slug']: `eq.${salonIdentifier}`,
      is_public: 'eq.true',
      limit: '1',
    });
    const salon = toPublicSalon(rows[0] ?? ({} as PublicSalonRow));

    if (!salon) {
      return null;
    }

    const [employees, professionals, services, workingHours] = await Promise.all([
      fetchPublicEmployees(salon.id),
      fetchPublicProfessionals(salon.id),
      fetchPublicServices(salon.id),
      fetchPublicWorkingHours(salon.id),
    ]);
    const publicProfessionals = mergePublicProfessionals(employees, professionals);

    return {
      ...salon,
      description: rows[0]?.description ?? null,
      professionals: publicProfessionals.map((professional) => toPublicProfessional(professional, workingHours)),
      services: services.filter(isActiveCatalogRow).map(toPublicService),
    };
  } catch (error) {
    if (error instanceof SupabaseConfigurationError || isMissingShowcaseColumn(error)) {
      return null;
    }

    throw error;
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function requestPublicSalonRows(params: Record<string, string>) {
  try {
    return await supabaseRestRequest<PublicSalonRow[]>('salons', {
      query: new URLSearchParams({
        select: SHOWCASE_SELECT,
        ...params,
      }).toString(),
    });
  } catch (error) {
    if (isMissingColumn(error, 'description')) {
      return supabaseRestRequest<PublicSalonRow[]>('salons', {
        query: new URLSearchParams({
          select: SHOWCASE_SELECT_WITHOUT_DESCRIPTION,
          ...params,
        }).toString(),
      });
    }

    if (
      !isMissingColumn(error, 'subscription_status') &&
      !isMissingColumn(error, 'trial_started_at') &&
      !isMissingColumn(error, 'trial_ends_at') &&
      !isMissingColumn(error, 'current_period_end')
    ) {
      throw error;
    }

    if (!isMissingColumn(error, 'subscription_status')) {
      return supabaseRestRequest<PublicSalonRow[]>('salons', {
        query: new URLSearchParams({
          select: SHOWCASE_SELECT_WITH_STATUS,
          ...params,
        }).toString(),
      });
    }

    return supabaseRestRequest<PublicSalonRow[]>('salons', {
      query: new URLSearchParams({
        select: SHOWCASE_SELECT_WITHOUT_SUBSCRIPTION,
        ...params,
      }).toString(),
    });
  }
}

async function fetchPublicEmployees(salonId: string) {
  return supabaseRestRequest<PublicEmployeeRow[]>('employees', {
    query: `salon_id=eq.${encodeURIComponent(salonId)}&active=eq.true&select=id,salon_id,full_name,role,specialty,active,status,avatar_url&order=full_name.asc`,
    useServiceRole: true,
  }).catch((error) => {
    if (isMissingShowcaseColumn(error)) {
      return [];
    }

    throw error;
  });
}

async function fetchPublicProfessionals(salonId: string) {
  return supabaseRestRequest<PublicProfessionalRow[]>('professionals', {
    query: `salon_id=eq.${encodeURIComponent(salonId)}&active=eq.true&select=id,salon_id,name,role,active,status,avatar_url,schedule&order=name.asc`,
    useServiceRole: true,
  }).catch((error) => {
    if (isMissingShowcaseColumn(error)) {
      return [];
    }

    throw error;
  });
}

async function fetchPublicServices(salonId: string) {
  return supabaseRestRequest<PublicServiceRow[]>('services', {
    query: `salon_id=eq.${encodeURIComponent(salonId)}&active=eq.true&select=id,salon_id,name,duration_minutes,price,price_cents,active,status&order=name.asc`,
    useServiceRole: true,
  }).catch((error) => {
    if (isMissingShowcaseColumn(error)) {
      return [];
    }

    throw error;
  });
}

async function fetchPublicWorkingHours(salonId: string) {
  return supabaseRestRequest<PublicWorkingHourRow[]>('working_hours', {
    query: `salon_id=eq.${encodeURIComponent(salonId)}&active=eq.true&select=employee_id,weekday,start_time,end_time`,
    useServiceRole: true,
  }).catch((error) => {
    if (isMissingShowcaseColumn(error)) {
      return [];
    }

    throw error;
  });
}

function toPublicProfessional(row: PublicEmployeeRow, workingHours: PublicWorkingHourRow[]): PublicSalonProfessional {
  const professionalHours = workingHours.filter((hour) => hour.employee_id === row.id);

  return {
    avatarUrl: row.avatar_url ?? null,
    id: row.id,
    name: row.full_name ?? 'Profissional',
    role: row.specialty ?? row.role ?? 'Profissional',
    scheduleLabel: professionalHours.length > 0 ? formatScheduleLabel(professionalHours) : formatProfessionalScheduleLabel(row.schedule),
  };
}

function mergePublicProfessionals(employees: PublicEmployeeRow[], professionals: PublicProfessionalRow[]): PublicEmployeeRow[] {
  const activeEmployees = employees.filter(isActiveCatalogRow);
  const merged = new Map<string, PublicEmployeeRow>();

  for (const employee of activeEmployees) {
    merged.set(employee.id, employee);
  }

  for (const professional of professionals.filter(isActiveCatalogRow)) {
    const existing = merged.get(professional.id);

    merged.set(professional.id, {
      active: professional.active,
      avatar_url: existing?.avatar_url ?? professional.avatar_url ?? null,
      full_name: existing?.full_name ?? professional.name ?? 'Profissional',
      id: professional.id,
      role: existing?.role ?? professional.role ?? 'professional',
      salon_id: professional.salon_id,
      schedule: existing?.schedule ?? professional.schedule ?? null,
      specialty: existing?.specialty ?? professional.role ?? 'Profissional',
      status: professional.status,
    });
  }

  return Array.from(merged.values()).sort((left, right) => (left.full_name ?? '').localeCompare(right.full_name ?? ''));
}

function formatProfessionalScheduleLabel(schedule?: PublicProfessionalSchedule | null) {
  if (!schedule?.active || !schedule.startTime || !schedule.endTime) {
    return 'Horario sob consulta';
  }

  return `${formatWeekdayRange(schedule.weekdays ?? [])} | ${schedule.startTime.slice(0, 5)} as ${schedule.endTime.slice(0, 5)}`;
}

function toPublicService(row: PublicServiceRow): PublicSalonService {
  return {
    durationMinutes: row.duration_minutes ?? 45,
    id: row.id,
    name: row.name ?? 'Servico',
    priceCents: row.price_cents ?? Math.round((row.price ?? 0) * 100),
  };
}

function isActiveCatalogRow(row: { active?: boolean | null; status?: string | null }) {
  const status = row.status?.trim().toLowerCase();

  return row.active !== false && status !== 'inactive' && status !== 'deleted' && status !== 'blocked';
}

function formatScheduleLabel(hours: PublicWorkingHourRow[]) {
  const activeHours = hours.filter((hour) => hour.start_time && hour.end_time);

  if (activeHours.length === 0) {
    return 'Horario sob consulta';
  }

  const first = activeHours[0];
  const weekdays = activeHours
    .map((hour) => hour.weekday)
    .filter((weekday): weekday is number => typeof weekday === 'number')
    .sort((left, right) => left - right);

  return `${formatWeekdayRange(weekdays)} | ${first.start_time?.slice(0, 5)} as ${first.end_time?.slice(0, 5)}`;
}

function formatWeekdayRange(weekdays: number[]) {
  if (weekdays.length === 0) {
    return 'Agenda flexivel';
  }

  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  if (weekdays.length >= 5 && weekdays[0] === 1 && weekdays[weekdays.length - 1] === 5) {
    return 'Seg a Sex';
  }

  return weekdays.map((weekday) => labels[weekday] ?? '').filter(Boolean).join(', ');
}
