export type SalonCommercialStatus =
  | 'trial_active'
  | 'active'
  | 'past_due'
  | 'overdue'
  | 'expired'
  | 'blocked'
  | 'canceled';

export type SalonCommercialAccessInput = {
  current_period_end?: string | null;
  plan_label?: string | null;
  professional_range?: string | null;
  selected_plan?: string | null;
  subscription_status?: string | null;
  trial_ends_at?: string | null;
};

export type SalonCommercialAccess = {
  bannerMessage: string;
  bannerTitle: string;
  canManageAppointments: boolean;
  canManageClients: boolean;
  canManageProfessionals: boolean;
  canManageServices: boolean;
  canUseFinancial: boolean;
  canUseSystem: boolean;
  currentPeriodEndLabel?: string;
  daysUntilTrialEnds: number | null;
  isBlocked: boolean;
  isPastDue: boolean;
  isSubscriptionActive: boolean;
  isTrialActive: boolean;
  planLabel?: string;
  professionalRange?: string;
  selectedPlan?: string;
  status: SalonCommercialStatus;
};

const blockedStatuses = new Set<SalonCommercialStatus>(['blocked', 'expired', 'canceled']);

export function evaluateSalonCommercialAccess(
  salon: SalonCommercialAccessInput | null | undefined,
  now: Date = new Date(),
): SalonCommercialAccess {
  const status = resolveCommercialStatus(salon, now);
  const trialEndsAt = parseDate(salon?.trial_ends_at);
  const currentPeriodEnd = parseDate(salon?.current_period_end);
  const isTrialActive = status === 'trial_active';
  const isSubscriptionActive = status === 'active';
  const isPastDue = status === 'past_due' || status === 'overdue';
  const isBlocked = blockedStatuses.has(status);
  const canUseSystem = isTrialActive || isSubscriptionActive || isPastDue;
  const canManageCriticalResources = isTrialActive || isSubscriptionActive;

  return {
    ...buildBanner({
      currentPeriodEnd,
      now,
      planLabel: salon?.plan_label ?? undefined,
      professionalRange: salon?.professional_range ?? undefined,
      status,
      trialEndsAt,
    }),
    canManageAppointments: canManageCriticalResources,
    canManageClients: canManageCriticalResources,
    canManageProfessionals: canManageCriticalResources,
    canManageServices: canManageCriticalResources,
    canUseFinancial: canManageCriticalResources,
    canUseSystem,
    currentPeriodEndLabel: currentPeriodEnd ? formatDateLabel(currentPeriodEnd) : undefined,
    daysUntilTrialEnds: trialEndsAt ? getCalendarDaysLeft(trialEndsAt, now) : null,
    isBlocked,
    isPastDue,
    isSubscriptionActive,
    isTrialActive,
    planLabel: salon?.plan_label ?? undefined,
    professionalRange: salon?.professional_range ?? undefined,
    selectedPlan: salon?.selected_plan ?? undefined,
    status,
  };
}

export function isCommercialActionBlocked(action: string, access: SalonCommercialAccess) {
  if (access.canManageAppointments && access.canManageClients && access.canManageProfessionals && access.canManageServices && access.canUseFinancial) {
    return false;
  }

  if (appointmentActions.has(action)) {
    return !access.canManageAppointments;
  }

  if (clientActions.has(action)) {
    return !access.canManageClients;
  }

  if (professionalActions.has(action)) {
    return !access.canManageProfessionals;
  }

  if (serviceActions.has(action)) {
    return !access.canManageServices;
  }

  if (financialActions.has(action)) {
    return !access.canUseFinancial;
  }

  return false;
}

function resolveCommercialStatus(
  salon: SalonCommercialAccessInput | null | undefined,
  now: Date,
): SalonCommercialStatus {
  const rawStatus = normalizeStatus(salon?.subscription_status);
  const trialEndsAt = parseDate(salon?.trial_ends_at);
  const currentPeriodEnd = parseDate(salon?.current_period_end);

  if (rawStatus === 'active') {
    return currentPeriodEnd && currentPeriodEnd.getTime() <= now.getTime() ? 'past_due' : 'active';
  }

  if (rawStatus === 'trial_active' || rawStatus === 'trialing' || rawStatus === 'trial' || rawStatus === 'none' || !rawStatus) {
    return trialEndsAt && trialEndsAt.getTime() >= now.getTime() ? 'trial_active' : 'expired';
  }

  if (rawStatus === 'past_due' || rawStatus === 'pastdue') {
    return 'past_due';
  }

  if (rawStatus === 'overdue') {
    return 'overdue';
  }

  if (rawStatus === 'cancelled' || rawStatus === 'canceled') {
    return 'canceled';
  }

  if (rawStatus === 'blocked' || rawStatus === 'expired') {
    return rawStatus;
  }

  return 'blocked';
}

function buildBanner(input: {
  currentPeriodEnd: Date | null;
  now: Date;
  planLabel?: string;
  professionalRange?: string;
  status: SalonCommercialStatus;
  trialEndsAt: Date | null;
}): Pick<SalonCommercialAccess, 'bannerMessage' | 'bannerTitle'> {
  if (input.status === 'trial_active') {
    const daysLeft = input.trialEndsAt ? getCalendarDaysLeft(input.trialEndsAt, input.now) : 0;

    return {
      bannerMessage: daysLeft <= 0 ? 'Seu teste termina hoje.' : `Faltam ${daysLeft} dias para seu teste acabar.`,
      bannerTitle: 'Teste gratis ativo',
    };
  }

  if (input.status === 'active') {
    const periodLabel = input.currentPeriodEnd ? `Seu plano vence dia ${formatDateLabel(input.currentPeriodEnd)}.` : 'Seu plano esta ativo.';
    const planDetails = input.planLabel
      ? ` Plano: ${input.planLabel}${input.professionalRange ? ` - faixa ${input.professionalRange}` : ''}.`
      : '';

    return {
      bannerMessage: `${periodLabel}${planDetails}`,
      bannerTitle: 'Plano ativo',
    };
  }

  if (input.status === 'past_due' || input.status === 'overdue') {
    return {
      bannerMessage: 'Regularize o pagamento para voltar a cadastrar agendamentos, clientes, profissionais, servicos e financeiro.',
      bannerTitle: 'Pagamento pendente',
    };
  }

  if (input.status === 'canceled') {
    return {
      bannerMessage: 'Assine novamente para liberar as funcoes do sistema.',
      bannerTitle: 'Plano cancelado',
    };
  }

  return {
    bannerMessage: 'Renove sua assinatura para voltar a cadastrar agendamentos, clientes, profissionais e servicos.',
    bannerTitle: 'Sistema congelado',
  };
}

function getCalendarDaysLeft(target: Date, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  return Math.max(0, Math.ceil((targetDay - today) / (24 * 60 * 60 * 1000)));
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function normalizeStatus(value?: string | null) {
  return value?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? null;
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const appointmentActions = new Set([
  'createAppointment',
  'updateAppointment',
  'deleteAppointment',
  'rescheduleAppointment',
  'updateAppointmentStatus',
  'respondAppointmentRequest',
  'updateAttendanceStatus',
]);

const clientActions = new Set(['createClient', 'updateClient', 'deleteClient']);
const professionalActions = new Set([
  'addEmployee',
  'createProfessional',
  'createProfessionalScheduleException',
  'deleteProfessional',
  'deleteProfessionalScheduleException',
  'updateProfessional',
  'updateProfessionalAvatar',
]);
const serviceActions = new Set(['createService', 'updateService', 'deleteService', 'syncPublicBooking']);
const financialActions = new Set(['registerPayment', 'upsertAccountClosure']);
