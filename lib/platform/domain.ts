export type AccessProfileId = 'client' | 'partner' | 'salonAdmin' | 'reception' | 'professional' | 'platformAdmin';

export type OperationalModuleId = 'agenda' | 'clientes' | 'profissionais' | 'servicos' | 'financeiro' | 'aparencia';

export type AppointmentStatus =
  | 'requested'
  | 'scheduled'
  | 'confirmed'
  | 'rejected'
  | 'checkedIn'
  | 'inService'
  | 'completed'
  | 'cancelled'
  | 'noShow';

export type AttendanceStatus = 'notStarted' | 'inProgress' | 'finished' | 'reopened';

export type ChargeStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'refunded' | 'cancelled';

export type AccountClosureStatus = 'open' | 'review' | 'closed' | 'paid' | 'cancelled';

export type PaymentMethod = 'cash' | 'pix' | 'card' | 'manualPending';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export type SubscriptionStatus = 'trialing' | 'active' | 'pastDue' | 'cancelled';

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ProfessionalSchedule = {
  active: boolean;
  weekdays: Weekday[];
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
};

export type ProfessionalScheduleExceptionType = 'dayOff' | 'manualBlock' | 'specialHours';

export type ProfessionalScheduleExceptionRecord = {
  id: string;
  salonId: string;
  professionalId: string;
  date: string;
  type: ProfessionalScheduleExceptionType;
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
};

export type SalonSettings = {
  clientCancellationLeadHours: number;
};

export type SalonRecord = {
  id: string;
  name: string;
  slug: string;
  ownerProfileId: string;
  subscriptionId?: string;
  settings: SalonSettings;
  status: 'draft' | 'active' | 'paused';
  isPublic: boolean;
  logoUrl?: string;
  coverUrl?: string;
  themeMode: 'light' | 'dark';
  primaryColor: string;
};

export type SubscriptionRecord = {
  id: string;
  salonId: string;
  plan: 'starter' | 'growth' | 'premium';
  status: SubscriptionStatus;
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  asaasCustomerId?: string;
  asaasSubscriptionId?: string;
};

export type ClientRecord = {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  archivedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalRecord = {
  id: string;
  salonId: string;
  profileId: string;
  accessProfileId: AccessProfileId;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions: string[];
  schedule: ProfessionalSchedule;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type ServiceRecord = {
  id: string;
  salonId: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
  professionalIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentRecord = {
  id: string;
  salonId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes?: string;
  salonResponseMessage?: string;
  rejectedReason?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  noShowAt?: string;
  startedAt?: string;
  finishedAt?: string;
  internalNotes?: string;
  clientVisibleMessage?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceRecord = {
  id: string;
  appointmentId: string;
  salonId: string;
  professionalId: string;
  status: AttendanceStatus;
  startedAt?: string;
  finishedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AccountClosureRecord = {
  id: string;
  salonId: string;
  appointmentId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  baseAmountCents: number;
  discountCents: number;
  additionCents: number;
  finalAmountCents: number;
  status: AccountClosureStatus;
  notes?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  salonId: string;
  appointmentId: string;
  accountClosureId: string;
  chargeId?: string;
  clientId: string;
  amountCents: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ChargeRecord = {
  id: string;
  salonId: string;
  appointmentId?: string;
  accountClosureId?: string;
  clientId?: string;
  subscriptionId?: string;
  clientName?: string;
  serviceName?: string;
  amountCents: number;
  status: ChargeStatus;
  origin: 'appointment' | 'subscription' | 'manual';
  provider: 'asaas' | 'manual';
  paymentMethod?: PaymentMethod;
  providerChargeId?: string;
  paidAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlatformFlowStep = {
  id: string;
  title: string;
  description: string;
  owner: AccessProfileId;
};

export const appointmentToChargeFlow: PlatformFlowStep[] = [
  {
    id: 'discover',
    title: 'Cliente descobre e escolhe',
    description: 'O cliente escolhe estabelecimento, servico, profissional e horario.',
    owner: 'client',
  },
  {
    id: 'book',
    title: 'Agendamento e confirmacao',
    description: 'O salao recebe a solicitacao e confirma ou recusa o horario.',
    owner: 'salonAdmin',
  },
  {
    id: 'attend',
    title: 'Atendimento profissional',
    description: 'A equipe acompanha o atendimento do inicio ao fim.',
    owner: 'professional',
  },
  {
    id: 'charge',
    title: 'Fechamento financeiro',
    description: 'O financeiro acompanha valores, pagamentos e pendencias.',
    owner: 'salonAdmin',
  },
];
