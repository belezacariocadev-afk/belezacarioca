'use client';

import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, CreditCard, ImagePlus, Palette, Scissors, Users2 } from 'lucide-react';

import { ClientBookingMarketplace } from '@/components/client/ClientBookingMarketplace';
import { AdminAppearancePanel } from '@/components/appearance/AppearancePanels';
import { useAppearance } from '@/components/appearance/AppearanceProvider';
import { FinanceiroPage } from '@/components/platform/financeiro/FinanceiroPage';
import { usePlatformSession } from '@/components/platform/PlatformAuthProvider';
import { usePlatformData } from '@/components/platform/PlatformDataProvider';
import {
  getAvailabilityScheduleContext,
  getAvailabilitySlots,
  getProfessionalDayExceptions,
  type AvailabilitySlot,
} from '@/lib/platform/data/availability';
import { getClientCancellationEligibility } from '@/lib/platform/data/client-cancellation-policy';
import { defaultProfessionalSchedule, normalizeProfessionalSchedule } from '@/lib/platform/data/professional-schedule';
import { getAppointmentConflict } from '@/lib/platform/data/repositories';
import type {
  AccountClosureRecord,
  AccountClosureStatus,
  AccessProfileId,
  AppointmentRecord,
  AppointmentStatus,
  AttendanceRecord,
  AttendanceStatus,
  ChargeRecord,
  ClientRecord,
  OperationalModuleId,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  ProfessionalSchedule,
  ProfessionalScheduleExceptionRecord,
  ProfessionalScheduleExceptionType,
  SalonRecord,
  Weekday,
} from '@/lib/platform/domain';
import type {
  AppointmentInput,
  ClientInput,
  PlatformDataSnapshot,
  ProfessionalInput,
  ProfessionalScheduleExceptionInput,
  ServiceInput,
} from '@/lib/platform/data/schema';

const appointmentStatuses: { id: AppointmentStatus; label: string }[] = [
  { id: 'requested', label: 'Pendente' },
  { id: 'scheduled', label: 'Agendado' },
  { id: 'confirmed', label: 'Confirmado' },
  { id: 'rejected', label: 'Recusado' },
  { id: 'checkedIn', label: 'Check-in' },
  { id: 'inService', label: 'Em atendimento' },
  { id: 'completed', label: 'Concluido' },
  { id: 'cancelled', label: 'Cancelado' },
  { id: 'noShow', label: 'Faltou' },
];

const attendanceStatuses: { id: AttendanceStatus; label: string }[] = [
  { id: 'notStarted', label: 'Nao iniciado' },
  { id: 'inProgress', label: 'Em andamento' },
  { id: 'finished', label: 'Finalizado' },
  { id: 'reopened', label: 'Reaberto' },
];

const closureStatuses: { id: AccountClosureStatus; label: string }[] = [
  { id: 'open', label: 'Aberto' },
  { id: 'review', label: 'Em revisao' },
  { id: 'closed', label: 'Fechado' },
  { id: 'paid', label: 'Pago' },
  { id: 'cancelled', label: 'Cancelado' },
];

const paymentMethods: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Dinheiro' },
  { id: 'pix', label: 'Pix' },
  { id: 'card', label: 'Cartao' },
  { id: 'manualPending', label: 'Pendente/manual' },
];

const paymentStatuses: { id: PaymentStatus; label: string }[] = [
  { id: 'pending', label: 'Pendente' },
  { id: 'paid', label: 'Pago' },
  { id: 'failed', label: 'Falhou' },
  { id: 'cancelled', label: 'Cancelado' },
];

const operationalAgendaPreferencesStorageKey = 'belezaCarioca:operationalAgendaPreferences:v1';

const professionalPermissions = [
  'ver_agenda_propria',
  'iniciar_atendimento',
  'finalizar_atendimento',
  'ver_comissoes',
];

const weekdayLabels: { id: Weekday; label: string }[] = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sab' },
];

const scheduleExceptionTypes: { id: ProfessionalScheduleExceptionType; label: string }[] = [
  { id: 'dayOff', label: 'Folga' },
  { id: 'manualBlock', label: 'Bloqueio manual' },
  { id: 'specialHours', label: 'Horario especial' },
];

const calendarLegend: { id: OperationalCalendarEntryKind | 'completed' | 'inService' | 'cancelled' | 'noShow'; label: string }[] = [
  { id: 'free', label: 'Horario livre' },
  { id: 'appointment', label: 'Agendado' },
  { id: 'inService', label: 'Em atendimento' },
  { id: 'completed', label: 'Concluido' },
  { id: 'cancelled', label: 'Cancelado' },
  { id: 'noShow', label: 'Faltou' },
  { id: 'dayOff', label: 'Folga' },
  { id: 'manualBlock', label: 'Bloqueio manual' },
  { id: 'specialHours', label: 'Horario especial' },
  { id: 'pause', label: 'Pausa' },
];

const emptyClientForm: ClientInput = {
  name: '',
  phone: '',
  email: '',
  notes: '',
};

const emptyProfessionalForm: ProfessionalInput = {
  name: '',
  email: '',
  role: '',
  active: true,
  permissions: ['ver_agenda_propria'],
  schedule: defaultProfessionalSchedule,
  avatarUrl: '',
};

const emptyServiceForm: ServiceInput = {
  name: '',
  category: 'Geral',
  durationMinutes: 45,
  priceCents: 0,
  active: true,
  professionalIds: [],
  notes: '',
};

type AppointmentFormState = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string;
};

type ClosureFormState = {
  discountAmount: string;
  additionAmount: string;
  status: AccountClosureStatus;
  notes: string;
};

type PaymentFormState = {
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
};

type SalonSettingsFormState = {
  clientCancellationLeadHours: string;
};

type SalonAppearanceFormState = {
  coverUrl: string;
  logoUrl: string;
  primaryColor: string;
  themeMode: 'light' | 'dark';
};

type AdminHistoryFilters = {
  clientQuery: string;
  period: 'today' | '7d' | '30d' | 'custom';
  professionalId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  status: AppointmentStatus | 'all';
};

type ScheduleExceptionFormState = ProfessionalScheduleExceptionInput;

type CalendarStatusFilter = AppointmentStatus | 'all';

type OperationalCalendarFilters = {
  date: string;
  professionalId: string;
  serviceId: string;
  status: CalendarStatusFilter;
};

type OperationalAgendaPreferences = {
  hideFreeSlots: boolean;
  professionalId: string;
  status: CalendarStatusFilter;
};

type OperationalSlotPrefillContext = {
  date: string;
  professionalId: string;
  serviceId: string;
  slotLabel: string;
  time: string;
};

type OperationalCalendarEntryKind = 'appointment' | 'dayOff' | 'free' | 'manualBlock' | 'pause' | 'specialHours';

type OperationalCalendarEntry = {
  appointment?: EnrichedAppointment;
  body: string;
  id: string;
  kind: OperationalCalendarEntryKind;
  label: string;
  minute: number;
  slot?: AvailabilitySlot;
  status?: AppointmentStatus;
  time: string;
  title: string;
};

type OperationalCalendarModel = {
  entries: OperationalCalendarEntry[];
  exceptions: ProfessionalScheduleExceptionRecord[];
  freeSlots: AvailabilitySlot[];
  professionalName: string;
  scheduleSummary: string;
  serviceName: string;
  stateMessage: string;
  weekRangeLabel: string;
  weekSummary: OperationalWeekSummaryDay[];
};

type OperationalWeekSummaryFilters = {
  exceptionsOnly: boolean;
  pendingOnly: boolean;
};

type OperationalWeekSummaryDay = {
  appointmentsCount: number;
  cancelledOrNoShowCount: number;
  completedCount: number;
  date: string;
  exceptionCount: number;
  hasException: boolean;
  hasDayOff: boolean;
  hasManualBlock: boolean;
  hasMovement: boolean;
  hasPending: boolean;
  hasSpecialHours: boolean;
  isSelected: boolean;
  label: string;
  pendingCount: number;
};

export function ProfileHomeWorkspace({ profileId }: { profileId: AccessProfileId }) {
  if (profileId === 'professional') {
    return <ProfessionalDashboard />;
  }

  if (profileId === 'client') {
    return <ClientDashboard />;
  }

  return <AdminOverview />;
}

export function AdminModuleWorkspace({ moduleId }: { moduleId: OperationalModuleId }) {
  if (moduleId === 'agenda') {
    return <AgendaManager />;
  }

  if (moduleId === 'clientes') {
    return <ClientsManager />;
  }

  if (moduleId === 'profissionais') {
    return <ProfessionalsManager />;
  }

  if (moduleId === 'servicos') {
    return <ServicesManager />;
  }

  if (moduleId === 'financeiro') {
    return <FinanceManager />;
  }

  return <AdminAppearancePanel />;
}

function AdminOverview() {
  const { data, dataSource, isHydrated, actions } = usePlatformData();
  const [settingsForm, setSettingsForm] = useState<SalonSettingsFormState>(() => createSalonSettingsForm(data.salon));
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsConfirmation, setSettingsConfirmation] = useState<string | null>(null);
  const [publicSyncStatus, setPublicSyncStatus] = useState<string | null>(null);
  const [appointmentResponseMessage, setAppointmentResponseMessage] = useState<string | null>(null);
  const [historyFilters, setHistoryFilters] = useState<AdminHistoryFilters>(() => createAdminHistoryFilters());
  const appointments = useMemo(() => getEnrichedAppointments(data), [data]);
  const todaysAppointments = appointments.filter((appointment) => isSameDay(appointment.startsAt, new Date()));
  const nextAppointments = getUpcomingAdminAppointments(appointments);
  const historyAppointments = getFilteredHistoryAppointments(appointments, historyFilters);
  const groupedNextAppointments = groupAppointmentsByDay(nextAppointments);
  const inProgress = appointments.filter((appointment) => appointment.status === 'inService');
  const completedToday = todaysAppointments.filter((appointment) => appointment.status === 'completed');
  const cancelledOrNoShow = todaysAppointments.filter((appointment) => appointment.status === 'cancelled' || appointment.status === 'noShow');
  const paidCharges = data.charges.filter((charge) => charge.status === 'paid');
  const pendingCharges = data.charges.filter((charge) => charge.status === 'pending' || charge.status === 'draft');
  const paidTotal = paidCharges.reduce((total, charge) => total + charge.amountCents, 0);
  const bookingPublication = getBookingPublicationStatus(data);

  useEffect(() => {
    setSettingsForm(createSalonSettingsForm(data.salon));
  }, [data.salon]);

  function handleSalonSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsError(null);
    setSettingsConfirmation(null);

    const clientCancellationLeadHours = Number(settingsForm.clientCancellationLeadHours);

    if (!Number.isFinite(clientCancellationLeadHours) || clientCancellationLeadHours < 0 || clientCancellationLeadHours > 168) {
      setSettingsError('Informe uma antecedencia entre 0 e 168 horas.');
      return;
    }

    actions.updateSalonSettings({
      clientCancellationLeadHours,
    });
    setSettingsConfirmation('Regra de cancelamento do cliente atualizada.');
  }

  async function handlePublicBookingSync() {
    setPublicSyncStatus('Sincronizando fluxo publico...');
    const result = await actions.syncPublicBooking();

    setPublicSyncStatus(result.message);
  }

  async function handleRespondAppointment(appointment: EnrichedAppointment, status: 'confirmed' | 'rejected') {
    setAppointmentResponseMessage(null);
    const defaultMessage = status === 'confirmed'
      ? 'Agendamento confirmado. Chegue com 10 minutos de antecedencia.'
      : 'Horario indisponivel. Por favor, escolha outro horario ou outro dia.';
    const message = window.prompt(
      status === 'confirmed' ? 'Observacao opcional para o cliente:' : 'Informe o motivo da recusa:',
      defaultMessage,
    );

    if (message === null) {
      return;
    }

    if (status === 'rejected' && !message.trim()) {
      setAppointmentResponseMessage('Informe o motivo da recusa.');
      return;
    }

    const result = await actions.respondAppointmentRequest(appointment.id, { message, status });

    setAppointmentResponseMessage(result.ok ? 'Resposta enviada ao cliente.' : result.message);
  }

  async function handleQuickAppointmentStatus(appointment: EnrichedAppointment, status: AppointmentStatus) {
    setAppointmentResponseMessage(null);
    const result = await actions.updateAppointmentStatus(appointment.id, status);

    setAppointmentResponseMessage(result.ok ? `Status atualizado para ${getStatusLabel(result.appointment.status)}.` : result.message);
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<CalendarDays size={18} />} label="Agendamentos do dia" value={todaysAppointments.length} />
        <MetricCard icon={<Scissors size={18} />} label="Em atendimento" value={inProgress.length} />
        <MetricCard icon={<Users2 size={18} />} label="Concluidos hoje" value={completedToday.length} />
        <MetricCard icon={<CreditCard size={18} />} label={`Recebido ${formatCurrency(paidTotal)}`} value={paidCharges.length} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard icon={<CalendarDays size={18} />} label="Cancelados/faltas hoje" value={cancelledOrNoShow.length} />
        <MetricCard icon={<CreditCard size={18} />} label="Pendentes de pagamento" value={pendingCharges.length} />
      </div>

      <Panel
        title="Proximos atendimentos"
        eyebrow={isHydrated ? 'Agenda do estabelecimento' : 'Carregando atendimentos'}
        action={dataSource === 'local' ? (
          <button type="button" onClick={actions.reset} className="bc-admin-secondary-button">
            Restaurar dados de exemplo
          </button>
        ) : undefined}
      >
        {!isHydrated ? (
          <EmptyState message="Carregando atendimentos..." />
        ) : groupedNextAppointments.length > 0 ? (
          <div className="grid gap-5">
            {groupedNextAppointments.map((group) => (
              <div key={group.date} className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[rgba(120,84,162,0.06)] px-4 py-3">
                  <strong className="text-sm text-[color:var(--bc-text)]">{formatDateOnly(group.date)}</strong>
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">{group.appointments.length} atendimento(s)</span>
                </div>
                {group.appointments.map((appointment) => (
                  <AppointmentSummaryCard
                    key={appointment.id}
                    appointment={appointment}
                    action={
                      <div className="flex max-w-full flex-wrap gap-2">
                        {appointment.status === 'requested' ? (
                          <>
                            <button type="button" onClick={() => void handleRespondAppointment(appointment, 'confirmed')} className="bc-admin-secondary-button">
                              Aceitar
                            </button>
                            <button type="button" onClick={() => void handleRespondAppointment(appointment, 'rejected')} className="bc-admin-secondary-button">
                              Rejeitar
                            </button>
                          </>
                        ) : null}
                        {appointment.status === 'confirmed' || appointment.status === 'scheduled' ? (
                          <button type="button" onClick={() => void handleQuickAppointmentStatus(appointment, 'inService')} className="bc-admin-secondary-button">
                            Iniciar atendimento
                          </button>
                        ) : null}
                        {appointment.status === 'inService' ? (
                          <button type="button" onClick={() => void handleQuickAppointmentStatus(appointment, 'completed')} className="bc-admin-secondary-button">
                            Finalizar atendimento
                          </button>
                        ) : null}
                        {appointment.status !== 'inService' ? (
                          <button type="button" onClick={() => void handleQuickAppointmentStatus(appointment, 'noShow')} className="bc-admin-secondary-button">
                            Marcar falta
                          </button>
                        ) : null}
                        <button type="button" onClick={() => void handleQuickAppointmentStatus(appointment, 'cancelled')} className="bc-admin-secondary-button">
                          Cancelar
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhum agendamento cadastrado ainda." />
        )}
        {appointmentResponseMessage ? <p className="mt-4 rounded-lg bg-[rgba(120,84,162,0.06)] px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)]">{appointmentResponseMessage}</p> : null}
      </Panel>

      <Panel title="Historico de atendimentos" eyebrow={`${historyAppointments.length} registros`}>
        <div className="grid gap-3 lg:grid-cols-6">
          <SelectField
            label="Status"
            value={historyFilters.status}
            onChange={(value) => setHistoryFilters((current) => ({ ...current, status: value as AdminHistoryFilters['status'] }))}
            options={[{ value: 'all', label: 'Todos' }, ...appointmentStatuses.map((status) => ({ value: status.id, label: status.label }))]}
          />
          <SelectField
            label="Profissional"
            value={historyFilters.professionalId}
            onChange={(value) => setHistoryFilters((current) => ({ ...current, professionalId: value }))}
            options={[{ value: 'all', label: 'Todos' }, ...data.professionals.map((professional) => ({ value: professional.id, label: professional.name }))]}
          />
          <SelectField
            label="Servico"
            value={historyFilters.serviceId}
            onChange={(value) => setHistoryFilters((current) => ({ ...current, serviceId: value }))}
            options={[{ value: 'all', label: 'Todos' }, ...data.services.map((service) => ({ value: service.id, label: service.name }))]}
          />
          <SelectField
            label="Periodo"
            value={historyFilters.period}
            onChange={(value) => setHistoryFilters((current) => ({ ...current, period: value as AdminHistoryFilters['period'] }))}
            options={[
              { value: 'today', label: 'Hoje' },
              { value: '7d', label: '7 dias' },
              { value: '30d', label: '30 dias' },
              { value: 'custom', label: 'Personalizado' },
            ]}
          />
          <Field label="Inicio" type="date" value={historyFilters.startDate} onChange={(value) => setHistoryFilters((current) => ({ ...current, startDate: value, period: 'custom' }))} />
          <Field label="Fim" type="date" value={historyFilters.endDate} onChange={(value) => setHistoryFilters((current) => ({ ...current, endDate: value, period: 'custom' }))} />
        </div>
        <div className="mt-3">
          <Field label="Busca por cliente" value={historyFilters.clientQuery} onChange={(value) => setHistoryFilters((current) => ({ ...current, clientQuery: value }))} />
        </div>
        <div className="mt-5 grid gap-3">
          {historyAppointments.length > 0 ? (
            historyAppointments.map((appointment) => <AppointmentSummaryCard key={appointment.id} appointment={appointment} />)
          ) : (
            <EmptyState message="Nenhum atendimento encontrado para os filtros." />
          )}
        </div>
      </Panel>

      <Panel title="Regras do salao" eyebrow="Configuracao simples">
        <form className="grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={handleSalonSettingsSubmit}>
          <Field
            label="Antecedencia minima para cancelamento do cliente (horas)"
            max="168"
            min="0"
            required
            type="number"
            value={settingsForm.clientCancellationLeadHours}
            onChange={(value) => {
              setSettingsError(null);
              setSettingsConfirmation(null);
              setSettingsForm({ clientCancellationLeadHours: value });
            }}
          />
          <div className="flex items-end">
            <button type="submit" className="bc-admin-primary-button">
              Salvar regra
            </button>
          </div>
        </form>
        <p className="mt-3 text-sm leading-6 text-[color:var(--bc-muted)]">
          Clientes veem esta regra na area logada antes de solicitar cancelamento.
        </p>
        {settingsError ? <EmptyState message={settingsError} /> : null}
        {settingsConfirmation ? <SuccessState message={settingsConfirmation} /> : null}
      </Panel>

      <Panel
        title="Publicacao para agendamento"
        eyebrow={bookingPublication.isPublished ? 'Salao publicado' : 'Configuracao pendente'}
        action={
          <button type="button" onClick={() => void handlePublicBookingSync()} className="bc-admin-secondary-button">
            Sincronizar fluxo publico
          </button>
        }
      >
        {bookingPublication.isPublished ? (
          <SuccessState message="Seu salao esta publicado e pronto para aparecer na area do cliente." />
        ) : (
          <EmptyState message="O salao sera publicado automaticamente quando todos os itens abaixo estiverem prontos." />
        )}
        {publicSyncStatus ? <p className="mt-3 text-sm font-semibold text-[color:var(--bc-muted)]">{publicSyncStatus}</p> : null}
        <div className="mt-4 grid gap-2 text-sm font-semibold text-[color:var(--bc-muted)]">
          {bookingPublication.items.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-[rgba(120,84,162,0.12)] px-3 py-2">
              <span>{item.label}</span>
              <span className={item.ok ? 'text-[#1f7a3d]' : 'text-[#ad352d]'}>{item.ok ? 'Pronto' : 'Pendente'}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Atalhos operacionais" eyebrow="Dashboard">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['Agenda', '/admin/agenda'],
            ['Clientes', '/admin/clientes'],
            ['Profissionais', '/admin/profissionais'],
            ['Servicos', '/admin/servicos'],
            ['Financeiro', '/admin/financeiro'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="bc-admin-secondary-button">
              {label}
            </a>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function ClientDashboard() {
  if (process.env.NEXT_PUBLIC_PLATFORM_DATA_SOURCE === 'supabase') {
    return <ClientBookingMarketplace />;
  }

  const { data, actions, lastSyncError } = usePlatformData();
  const { session } = usePlatformSession();
  const client = data.clients.find((item) => item.id === session?.actorId) ?? data.clients[0];
  const [form, setForm] = useState<AppointmentFormState>(() => createClientAppointmentForm(data, client?.id));
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [cancellationError, setCancellationError] = useState<string | null>(null);
  const [cancellationConfirmation, setCancellationConfirmation] = useState<string | null>(null);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState<AppointmentFormState>(() => createClientAppointmentForm(data, client?.id));
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleConfirmation, setRescheduleConfirmation] = useState<string | null>(null);
  const appointments = useMemo(
    () => getEnrichedAppointments(data).filter((appointment) => appointment.clientId === client?.id),
    [client?.id, data],
  );
  const upcoming = appointments.filter((appointment) => isUpcomingAppointment(appointment) && !isTerminalAppointment(appointment.status));
  const nextAppointment = upcoming[0];
  const history = appointments
    .filter((appointment) => appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'noShow')
    .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime());
  const insights = client ? getClientInsights(data, client.id) : null;
  const activeServices = useMemo(() => data.services.filter((service) => service.active), [data.services]);
  const availableProfessionals = useMemo(
    () => getProfessionalsForService(data, form.serviceId),
    [data, form.serviceId],
  );
  const availabilitySlots = useMemo(
    () =>
      getAvailabilitySlots(data, {
        date: form.date,
        professionalId: form.professionalId,
        serviceId: form.serviceId,
        status: 'requested',
      }),
    [data, form.date, form.professionalId, form.serviceId],
  );
  const selectedService = activeServices.find((service) => service.id === form.serviceId);
  const selectedSlot = availabilitySlots.find((slot) => slot.time === form.time);
  const canSubmitAppointment = Boolean(client && form.serviceId && form.professionalId && form.date && selectedSlot);

  const rescheduleAppointment = rescheduleAppointmentId
    ? upcoming.find((appointment) => appointment.id === rescheduleAppointmentId) ?? null
    : null;
  const rescheduleAvailabilitySlots = useMemo(
    () =>
      getAvailabilitySlots(data, {
        date: rescheduleForm.date,
        professionalId: rescheduleForm.professionalId,
        serviceId: rescheduleForm.serviceId,
        status: 'requested',
      }),
    [data, rescheduleForm.date, rescheduleForm.professionalId, rescheduleForm.serviceId],
  );
  const canSubmitReschedule = Boolean(
    client &&
      rescheduleAppointment &&
      rescheduleForm.serviceId &&
      rescheduleForm.professionalId &&
      rescheduleForm.date &&
      rescheduleForm.time,
  );

  useEffect(() => {
    setForm((current) => {
      const nextClientId = client?.id ?? '';
      const nextServiceId = activeServices.some((service) => service.id === current.serviceId)
        ? current.serviceId
        : activeServices[0]?.id ?? '';
      const professionals = getProfessionalsForService(data, nextServiceId);
      const nextProfessionalId = professionals.some((professional) => professional.id === current.professionalId)
        ? current.professionalId
        : professionals[0]?.id ?? '';

      return {
        ...current,
        clientId: nextClientId,
        professionalId: nextProfessionalId,
        serviceId: nextServiceId,
        status: 'requested',
      };
    });
  }, [activeServices, client?.id, data]);

  useEffect(() => {
    if (availabilitySlots.length > 0 && !availabilitySlots.some((slot) => slot.time === form.time)) {
      setForm((current) => ({
        ...current,
        time: availabilitySlots[0].time,
      }));
    }
  }, [availabilitySlots, form.time]);

  function handleServiceChange(serviceId: string) {
    const professionals = getProfessionalsForService(data, serviceId);

    setFormError(null);
    setConfirmation(null);
    setForm((current) => ({
      ...current,
      serviceId,
      professionalId: professionals.some((professional) => professional.id === current.professionalId)
        ? current.professionalId
        : professionals[0]?.id ?? '',
    }));
  }

  async function handleClientAppointmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmation(null);

    if (!client) {
      setFormError('Nao encontramos seu cadastro de cliente nesta sessao.');
      return;
    }

    if (!form.serviceId || !form.professionalId || !form.date) {
      setFormError('Escolha servico, profissional e data para continuar.');
      return;
    }

    if (!selectedSlot) {
      setFormError('Escolha um horario disponivel para confirmar o agendamento.');
      return;
    }

    const input: AppointmentInput = {
      clientId: client.id,
      professionalId: form.professionalId,
      serviceId: form.serviceId,
      startsAt: selectedSlot.startsAt,
      status: 'requested',
      notes: form.notes,
    };

    if (new Date(input.startsAt).getTime() <= Date.now()) {
      setFormError('Escolha um horario futuro para o novo agendamento.');
      return;
    }

    const conflict = getAppointmentConflict(data, input);

    if (conflict) {
      setFormError(conflict);
      return;
    }

    const result = await actions.createAppointment(input);

    if (!result.ok) {
      setFormError(result.message);
      setConfirmation(null);
      return;
    }

    setForm(createClientAppointmentForm(data, client.id));
    setFormError(null);
    setConfirmation('Agendamento solicitado. O salao vai acompanhar essa solicitacao pela agenda.');
  }

  async function handleClientCancellation(appointment: EnrichedAppointment) {
    setCancellationError(null);
    setCancellationConfirmation(null);

    const cancellation = getClientCancellationEligibility(appointment, data.salon);

    if (!cancellation.allowed) {
      setCancellationError(cancellation.message);
      return;
    }

    const result = await actions.updateAppointmentStatus(appointment.id, 'cancelled');

    if (!result.ok) {
      setCancellationError(result.message);
      return;
    }

    setCancellationConfirmation('Agendamento cancelado com sucesso. O salao ja consegue ver a atualizacao.');
  }

  function handleStartReschedule(appointment: EnrichedAppointment) {
    setRescheduleError(null);
    setRescheduleConfirmation(null);
    setRescheduleAppointmentId(appointment.id);

    const controls = toDateTimeControls(appointment.startsAt);

    setRescheduleForm({
      clientId: client?.id ?? appointment.clientId,
      professionalId: appointment.professionalId,
      serviceId: appointment.serviceId,
      date: controls.date,
      time: controls.time,
      status: appointment.status,
      notes: appointment.notes ?? '',
    });
  }

  async function handleClientRescheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRescheduleError(null);
    setRescheduleConfirmation(null);

    if (!client || !rescheduleAppointment) {
      setRescheduleError('Falha ao reagendar. Verifique seu cadastro e tente novamente.');
      return;
    }

    if (!rescheduleForm.serviceId || !rescheduleForm.professionalId || !rescheduleForm.date || !rescheduleForm.time) {
      setRescheduleError('Escolha servico, profissional, data e horario para reagendar.');
      return;
    }

    const startsAt = fromDateTimeControls(rescheduleForm.date, rescheduleForm.time);

    if (new Date(startsAt).getTime() <= Date.now()) {
      setRescheduleError('Escolha um horario futuro para o reagendamento.');
      return;
    }

    const input: AppointmentInput = {
      clientId: client.id,
      professionalId: rescheduleForm.professionalId,
      serviceId: rescheduleForm.serviceId,
      startsAt,
      status: rescheduleForm.status,
      notes: rescheduleForm.notes,
    };

    const result = await actions.rescheduleAppointment(rescheduleAppointment.id, input);

    if (!result.ok) {
      setRescheduleError(result.message);
      return;
    }

    setRescheduleConfirmation('Agendamento reagendado com sucesso. O salao ve a nova data imediatamente.');
    setRescheduleAppointmentId(null);
  }

  function handleCancelReschedule() {
    setRescheduleAppointmentId(null);
    setRescheduleError(null);
    setRescheduleConfirmation(null);
  }

  return (
    <section className="grid gap-6">
      <Panel title="Proximo atendimento" eyebrow="Area do cliente">
        {client ? (
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <ClientProfileCard client={client} lastVisit={insights?.lastVisit} totalSpentCents={insights?.totalSpentCents ?? 0} />
            {nextAppointment ? (
              <AppointmentSummaryCard
                appointment={nextAppointment}
                action={
                  <div className="flex flex-col gap-2">
                    {isClientCancellationVisible(nextAppointment) ? (
                      <ClientCancellationAction appointment={nextAppointment} salon={data.salon} onCancel={handleClientCancellation} />
                    ) : null}
                    <ClientRescheduleAction
                      appointment={nextAppointment}
                      salon={data.salon}
                      onReschedule={handleStartReschedule}
                      disabled={!canClientReschedule(nextAppointment, data.salon)}
                      reason={getClientRescheduleEligibility(nextAppointment, data.salon).message}
                    />
                  </div>
                }
              />
            ) : (
              <EmptyState message="Voce ainda nao tem um proximo atendimento marcado." />
            )}
            {cancellationError ? <EmptyState message={cancellationError} /> : null}
            {cancellationConfirmation ? <SuccessState message={cancellationConfirmation} /> : null}
          </div>
        ) : (
          <EmptyState message="Nenhum cliente disponivel na base local." />
        )}
      </Panel>

      <Panel title="Novo agendamento" eyebrow="Escolha seu horario">
        {client && activeServices.length > 0 ? (
          <form className="grid gap-4" onSubmit={handleClientAppointmentSubmit}>
            <SelectField
              label="Servico"
              value={form.serviceId}
              onChange={handleServiceChange}
              options={activeServices.map((service) => ({
                value: service.id,
                label: `${service.name} - ${service.durationMinutes} min - ${formatCurrency(service.priceCents)}`,
              }))}
            />
            {availableProfessionals.length > 0 ? (
              <SelectField
                label="Profissional"
                value={form.professionalId}
                onChange={(value) => {
                  setFormError(null);
                  setConfirmation(null);
                  setForm((current) => ({ ...current, professionalId: value }));
                }}
                options={availableProfessionals.map((professional) => ({ value: professional.id, label: professional.name }))}
              />
            ) : (
              <EmptyState message="Nao ha profissional ativo para o servico selecionado." />
            )}
            <ReadonlyValue
              label="Resumo do servico"
              value={selectedService ? `${selectedService.durationMinutes} minutos | ${formatCurrency(selectedService.priceCents)}` : 'Selecione um servico'}
            />
            <div className="grid gap-4">
              <Field
                label="Data"
                type="date"
                value={form.date}
                required
                onChange={(value) => {
                  setFormError(null);
                  setConfirmation(null);
                  setForm((current) => ({ ...current, date: value }));
                }}
              />
                <AvailabilitySlotPicker
                emptyMessage={getAvailabilityEmptyMessage(data, form)}
                onSelect={(time) => {
                  setFormError(null);
                  setConfirmation(null);
                  setForm((current) => ({ ...current, time }));
                }}
                selectedTime={form.time}
                slots={availabilitySlots}
              />
            </div>
            <TextArea
              label="Observacoes"
              value={form.notes}
              onChange={(value) => {
                setConfirmation(null);
                setForm((current) => ({ ...current, notes: value }));
              }}
            />
            {formError ? <EmptyState message={formError} /> : null}
            {confirmation ? <SuccessState message={confirmation} /> : null}
            {lastSyncError ? <EmptyState message={lastSyncError} /> : null}
            <button type="submit" disabled={!canSubmitAppointment} className="bc-admin-primary-button disabled:cursor-not-allowed disabled:opacity-60">
              Solicitar agendamento
            </button>
          </form>
        ) : (
          <EmptyState message="Nao ha servicos ativos para agendar agora." />
        )}
      </Panel>

      {rescheduleAppointment ? (
        <Panel title="Reagendar atendimento" eyebrow="Fluxo de reagendamento">
          <form className="grid gap-4" onSubmit={handleClientRescheduleSubmit}>
            <SelectField
              label="Servico"
              value={rescheduleForm.serviceId}
              onChange={(serviceId) => {
                const professionals = getProfessionalsForService(data, serviceId);

                setRescheduleError(null);
                setRescheduleConfirmation(null);
                setRescheduleForm((current) => ({
                  ...current,
                  serviceId,
                  professionalId: professionals.some((professional) => professional.id === current.professionalId)
                    ? current.professionalId
                    : professionals[0]?.id ?? '',
                }));
              }}
              options={activeServices.map((service) => ({
                value: service.id,
                label: `${service.name} - ${service.durationMinutes} min - ${formatCurrency(service.priceCents)}`,
              }))}
            />
            <SelectField
              label="Profissional"
              value={rescheduleForm.professionalId}
              onChange={(value) => {
                setRescheduleError(null);
                setRescheduleConfirmation(null);
                setRescheduleForm((current) => ({ ...current, professionalId: value }));
              }}
              options={getProfessionalsForService(data, rescheduleForm.serviceId).map((professional) => ({
                value: professional.id,
                label: professional.name,
              }))}
            />
            <div className="grid gap-4">
              <Field
                label="Data"
                type="date"
                value={rescheduleForm.date}
                required
                onChange={(value) => {
                  setRescheduleError(null);
                  setRescheduleConfirmation(null);
                  setRescheduleForm((current) => ({ ...current, date: value }));
                }}
              />
              <AvailabilitySlotPicker
                emptyMessage={getAvailabilityEmptyMessage(data, rescheduleForm)}
                onSelect={(time) => {
                  setRescheduleError(null);
                  setRescheduleConfirmation(null);
                  setRescheduleForm((current) => ({ ...current, time }));
                }}
                selectedTime={rescheduleForm.time}
                slots={rescheduleAvailabilitySlots}
              />
            </div>
            <TextArea
              label="Observacoes"
              value={rescheduleForm.notes}
              onChange={(value) => {
                setRescheduleError(null);
                setRescheduleForm((current) => ({ ...current, notes: value }));
              }}
            />
            {rescheduleError ? <EmptyState message={rescheduleError} /> : null}
            {rescheduleConfirmation ? <SuccessState message={rescheduleConfirmation} /> : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={!canSubmitReschedule} className="bc-admin-primary-button disabled:cursor-not-allowed disabled:opacity-60">
                Confirmar reagendamento
              </button>
              <button type="button" onClick={handleCancelReschedule} className="bc-admin-secondary-button">
                Cancelar
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel title="Proximos agendamentos" eyebrow={`${upcoming.length} registros`}>
        {upcoming.length > 0 ? (
          <div className="grid gap-3">
            {upcoming.map((appointment) => (
              <AppointmentSummaryCard
                key={appointment.id}
                appointment={appointment}
                action={
                  <div className="flex flex-col gap-2">
                    {isClientCancellationVisible(appointment) ? (
                      <ClientCancellationAction appointment={appointment} salon={data.salon} onCancel={handleClientCancellation} />
                    ) : null}
                    <ClientRescheduleAction
                      appointment={appointment}
                      salon={data.salon}
                      onReschedule={handleStartReschedule}
                      disabled={!canClientReschedule(appointment, data.salon)}
                      reason={getClientRescheduleEligibility(appointment, data.salon).message}
                    />
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState message="Voce nao tem proximos atendimentos." />
        )}
      </Panel>

      <Panel title="Historico simples" eyebrow={`${history.length} registros`}>
        {history.length > 0 ? (
          <div className="grid gap-3">
            {history.map((appointment) => (
              <AppointmentSummaryCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        ) : (
          <EmptyState message="Seu historico ainda esta vazio." />
        )}
      </Panel>
    </section>
  );
}

function ClientCancellationAction({
  appointment,
  onCancel,
  salon,
}: {
  appointment: EnrichedAppointment;
  onCancel: (appointment: EnrichedAppointment) => void;
  salon: SalonRecord;
}) {
  const cancellation = getClientCancellationEligibility(appointment, salon);

  return (
    <div className="grid max-w-72 gap-2 text-sm">
      <span className={`font-semibold ${cancellation.allowed ? 'text-[#326c65]' : 'text-[#8f352f]'}`}>
        {cancellation.message}
      </span>
      {cancellation.allowed ? (
        <button type="button" onClick={() => onCancel(appointment)} className="bc-admin-secondary-button">
          Cancelar
        </button>
      ) : (
        <button type="button" disabled className="bc-admin-secondary-button cursor-not-allowed opacity-60">
          Cancelamento indisponivel
        </button>
      )}
    </div>
  );
}

function ClientRescheduleAction({
  appointment,
  salon,
  onReschedule,
  disabled,
  reason,
}: {
  appointment: EnrichedAppointment;
  salon: SalonRecord;
  onReschedule: (appointment: EnrichedAppointment) => void;
  disabled: boolean;
  reason: string;
}) {
  const eligibility = getClientRescheduleEligibility(appointment, salon);

  return (
    <div className="grid max-w-72 gap-2 text-sm">
      <button
        type="button"
        onClick={() => onReschedule(appointment)}
        disabled={disabled}
        className="bc-admin-secondary-button"
        title={disabled ? reason : 'Reagendar este atendimento'}
      >
        Reagendar
      </button>
      {disabled ? <span className="text-[#8f352f]">{eligibility.message}</span> : null}
    </div>
  );
}

function ClientProfileCard({
  client,
  lastVisit,
  totalSpentCents,
}: {
  client: ClientRecord;
  lastVisit?: string;
  totalSpentCents: number;
}) {
  return (
    <div className="rounded-lg bg-[rgba(120,84,162,0.06)] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d6a39]">Cliente</p>
      <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{client.name}</h3>
      <p className="mt-2 text-sm font-semibold text-[color:var(--bc-muted)]">{client.phone}</p>
      <p className="mt-1 text-sm text-[color:var(--bc-muted)]">{client.email}</p>
      <p className="mt-4 text-sm leading-6 text-[color:var(--bc-muted)]">Total gasto: {formatCurrency(totalSpentCents)}</p>
      <p className="mt-1 text-sm leading-6 text-[color:var(--bc-muted)]">
        Ultima visita: {lastVisit ? formatDateTime(lastVisit) : 'Ainda sem historico'}
      </p>
    </div>
  );
}

function ProfessionalDashboard() {
  const { data, actions } = usePlatformData();
  const { session } = usePlatformSession();
  const professional = data.professionals.find((item) => item.id === session?.actorId) ?? data.professionals[0];
  const appointments = getEnrichedAppointments(data).filter((appointment) => appointment.professionalId === professional?.id);
  const todaysAppointments = appointments.filter((appointment) => isSameDay(appointment.startsAt, new Date()));
  const nextAppointments = appointments.filter((appointment) => !isTerminalAppointment(appointment.status));
  const services = professional
    ? data.services.filter((service) => service.active && isServiceAvailableForProfessional(service.professionalIds, professional.id))
    : [];
  const canStart = professional?.permissions.includes('iniciar_atendimento');
  const canFinish = professional?.permissions.includes('finalizar_atendimento');

  return (
    <Panel title="Minha agenda profissional" eyebrow="Acesso profissional">
      {professional ? (
        <div className="grid gap-4">
          <div className="rounded-lg bg-[rgba(120,84,162,0.06)] p-4">
            <h3 className="text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{professional.name}</h3>
            <p className="mt-2 text-sm font-semibold text-[color:var(--bc-muted)]">{professional.role}</p>
            <p className="mt-1 text-sm text-[color:var(--bc-muted)]">{professional.email}</p>
            <p className="mt-4 text-sm leading-6 text-[color:var(--bc-muted)]">
              Hoje: {todaysAppointments.length} atendimentos | Proximos: {nextAppointments.length} | Base para comissao futura
            </p>
          </div>
          {services.length > 0 ? (
            <div className="grid gap-2 rounded-lg border border-[rgba(120,84,162,0.12)] bg-white p-4">
              <h3 className="text-lg font-black text-[color:var(--bc-text)]">Servicos vinculados</h3>
              <p className="text-sm leading-6 text-[color:var(--bc-muted)]">
                {services.map((service) => `${service.name} (${service.durationMinutes} min)`).join(', ')}
              </p>
            </div>
          ) : null}
          {nextAppointments.length > 0 ? (
            <div className="grid gap-3">
              {nextAppointments.map((appointment) => (
                <AppointmentSummaryCard
                  key={appointment.id}
                  appointment={appointment}
                  action={
                    <div className="flex flex-wrap gap-2">
                      {canStart && canStartAttendance(appointment.status) ? (
                        <button
                          type="button"
                          onClick={() => void actions.updateAppointmentStatus(appointment.id, 'inService')}
                          className="bc-admin-secondary-button"
                        >
                          Iniciar
                        </button>
                      ) : null}
                      {canFinish && appointment.status === 'inService' ? (
                        <button
                          type="button"
                          onClick={() => void actions.updateAppointmentStatus(appointment.id, 'completed')}
                          className="bc-admin-secondary-button"
                        >
                          Concluir
                        </button>
                      ) : null}
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState message="Nao ha proximos agendamentos vinculados a este profissional." />
          )}
        </div>
      ) : (
        <EmptyState message="Nenhum profissional disponivel na base local." />
      )}
    </Panel>
  );
}

function AgendaManager() {
  const { data, actions, isHydrated } = usePlatformData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(() => getDefaultSelectedAppointmentId(data));
  const [form, setForm] = useState<AppointmentFormState>(() => createAppointmentForm(data));
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [calendarFilters, setCalendarFilters] = useState<OperationalCalendarFilters>(() => createOperationalCalendarFilters(data));
  const [weekSummaryFilters, setWeekSummaryFilters] = useState<OperationalWeekSummaryFilters>({
    exceptionsOnly: false,
    pendingOnly: false,
  });
  const [hideFreeCalendarSlots, setHideFreeCalendarSlots] = useState(false);
  const [agendaPreferencesReady, setAgendaPreferencesReady] = useState(false);
  const [slotPrefillContext, setSlotPrefillContext] = useState<OperationalSlotPrefillContext | null>(null);
  const appointmentFormRef = useRef<HTMLDivElement | null>(null);
  const operationsPanelRef = useRef<HTMLDivElement | null>(null);
  const hasRestoredAgendaPreferences = useRef(false);
  const appointments = useMemo(() => getEnrichedAppointments(data), [data]);
  const visibleClients = useMemo(() => data.clients.filter(isVisibleClient), [data.clients]);
  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? appointments[0];
  const availableServices = useMemo(
    () => data.services.filter((service) => service.active && isServiceAvailableForProfessional(service.professionalIds, form.professionalId)),
    [data.services, form.professionalId],
  );
  const calendarServices = useMemo(
    () =>
      data.services.filter(
        (service) => service.active && isServiceAvailableForProfessional(service.professionalIds, calendarFilters.professionalId),
      ),
    [calendarFilters.professionalId, data.services],
  );
  const operationalCalendar = useMemo(
    () => createOperationalCalendarModel(data, appointments, calendarFilters),
    [appointments, calendarFilters, data],
  );
  const selectedService = data.services.find((service) => service.id === form.serviceId);
  const availabilitySlots = useMemo(
    () =>
      getAvailabilitySlots(data, {
        date: form.date,
        ignoredAppointmentId: editingId ?? undefined,
        professionalId: form.professionalId,
        serviceId: form.serviceId,
        status: form.status,
      }),
    [data, editingId, form.date, form.professionalId, form.serviceId, form.status],
  );
  const selectedSlot = availabilitySlots.find((slot) => slot.time === form.time);
  const hasRequiredCatalog = visibleClients.length > 0 && data.professionals.length > 0 && data.services.length > 0;
  const slotPrefillHighlights = getOperationalSlotPrefillHighlights(form, slotPrefillContext);
  const slotPrefillSummary = isOperationalSlotPrefillActive(form, slotPrefillContext)
    ? createOperationalSlotPrefillSummary(data, slotPrefillContext)
    : null;

  useEffect(() => {
    setForm((current) => ({
      ...current,
      clientId: current.clientId || visibleClients[0]?.id || '',
      professionalId: current.professionalId || data.professionals[0]?.id || '',
      serviceId: current.serviceId || data.services.find((service) => service.active)?.id || '',
    }));
  }, [data.professionals, data.services, visibleClients]);

  useEffect(() => {
    if (!isHydrated || hasRestoredAgendaPreferences.current) {
      return;
    }

    const preferences = readOperationalAgendaPreferences();
    hasRestoredAgendaPreferences.current = true;

    if (preferences) {
      setHideFreeCalendarSlots(preferences.hideFreeSlots);
      setCalendarFilters((current) => applyOperationalAgendaPreferences(current, preferences, data));
    }

    setAgendaPreferencesReady(true);
  }, [data, isHydrated]);

  useEffect(() => {
    setCalendarFilters((current) => {
      const professionalId = data.professionals.some((professional) => professional.id === current.professionalId)
        ? current.professionalId
        : data.professionals[0]?.id ?? '';
      const services = data.services.filter(
        (service) => service.active && isServiceAvailableForProfessional(service.professionalIds, professionalId),
      );
      const serviceId = services.some((service) => service.id === current.serviceId) ? current.serviceId : services[0]?.id ?? '';
      const next = {
        ...current,
        professionalId,
        serviceId,
      };

      return next.professionalId === current.professionalId && next.serviceId === current.serviceId ? current : next;
    });
  }, [data.professionals, data.services]);

  useEffect(() => {
    if (!agendaPreferencesReady) {
      return;
    }

    writeOperationalAgendaPreferences({
      hideFreeSlots: hideFreeCalendarSlots,
      professionalId: calendarFilters.professionalId,
      status: calendarFilters.status,
    });
  }, [agendaPreferencesReady, calendarFilters.professionalId, calendarFilters.status, hideFreeCalendarSlots]);

  useEffect(() => {
    if (availableServices.length > 0 && !availableServices.some((service) => service.id === form.serviceId)) {
      setForm((current) => ({
        ...current,
        serviceId: availableServices[0].id,
      }));
    }
  }, [availableServices, form.serviceId]);

  useEffect(() => {
    if (availabilitySlots.length > 0 && !availabilitySlots.some((slot) => slot.time === form.time)) {
      setForm((current) => ({
        ...current,
        time: availabilitySlots[0].time,
      }));
    }
  }, [availabilitySlots, form.time]);

  useEffect(() => {
    if (!selectedAppointmentId && data.appointments[0]) {
      setSelectedAppointmentId(getDefaultSelectedAppointmentId(data));
    }
  }, [data.appointments, selectedAppointmentId]);

  function resetForm() {
    setEditingId(null);
    setFormError(null);
    setSlotPrefillContext(null);
    setForm(createAppointmentForm(data));
  }

  function handleEdit(appointment: EnrichedAppointment) {
    const controls = toDateTimeControls(appointment.startsAt);
    setEditingId(appointment.id);
    setSelectedAppointmentId(appointment.id);
    setSlotPrefillContext(null);
    setForm({
      clientId: appointment.clientId,
      professionalId: appointment.professionalId,
      serviceId: appointment.serviceId,
      date: controls.date,
      time: controls.time,
      status: appointment.status,
      notes: appointment.notes ?? '',
    });
  }

  function handleOpenAppointment(appointment: EnrichedAppointment) {
    setSelectedAppointmentId(appointment.id);
    window.requestAnimationFrame(() => operationsPanelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }

  function handleUseCalendarSlot(slot: AvailabilitySlot) {
    setEditingId(null);
    setFormError(null);
    const serviceId = calendarFilters.serviceId || form.serviceId;
    setSlotPrefillContext({
      date: calendarFilters.date,
      professionalId: calendarFilters.professionalId,
      serviceId,
      slotLabel: slot.label,
      time: slot.time,
    });
    setForm((current) => ({
      ...current,
      professionalId: calendarFilters.professionalId,
      serviceId,
      date: calendarFilters.date,
      time: slot.time,
      status: 'scheduled',
    }));
    window.requestAnimationFrame(() => appointmentFormRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasRequiredCatalog) {
      return;
    }

    const input: AppointmentInput = {
      clientId: form.clientId,
      professionalId: form.professionalId,
      serviceId: form.serviceId,
      startsAt: selectedSlot?.startsAt ?? fromDateTimeControls(form.date, form.time),
      status: form.status,
      notes: form.notes,
    };

    if (!selectedSlot) {
      setFormError('Escolha um horario disponivel para criar o agendamento.');
      return;
    }

    const conflict = getAppointmentConflict(data, input, editingId ?? undefined);

    if (conflict) {
      setFormError(conflict);
      return;
    }

    if (editingId) {
      actions.updateAppointment(editingId, input);
      setSelectedAppointmentId(editingId);
    } else {
      const result = await actions.createAppointment(input);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      const controls = toDateTimeControls(result.appointment.startsAt);
      setSelectedAppointmentId(result.appointment.id);
      setCalendarFilters((current) => ({
        ...current,
        date: controls.date,
        professionalId: result.appointment.professionalId,
        serviceId: result.appointment.serviceId,
        status: result.appointment.status,
      }));
      window.requestAnimationFrame(() => operationsPanelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }

    resetForm();
  }

  async function handleDeleteAppointment(appointment: EnrichedAppointment) {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    setDeleteMessage(null);
    const result = await actions.deleteAppointment(appointment.id);

    if (!result.ok) {
      setDeleteMessage(result.message || 'Nao foi possivel excluir este agendamento.');
      return;
    }

    setDeleteMessage('Agendamento removido com sucesso.');
    if (selectedAppointmentId === appointment.id) {
      setSelectedAppointmentId(null);
    }
    if (editingId === appointment.id) {
      resetForm();
    }
  }

  return (
    <section className="grid gap-6">
      <OperationalCalendarPanel
        filters={calendarFilters}
        hideFreeSlots={hideFreeCalendarSlots}
        model={operationalCalendar}
        onCreateFromSlot={handleUseCalendarSlot}
        onFilterChange={(input) => setCalendarFilters((current) => ({ ...current, ...input }))}
        onHideFreeSlotsChange={setHideFreeCalendarSlots}
        onOpenAppointment={handleOpenAppointment}
        selectedAppointmentId={selectedAppointmentId}
        onWeekSummaryFilterChange={(input) => setWeekSummaryFilters((current) => ({ ...current, ...input }))}
        professionals={data.professionals}
        services={calendarServices}
        weekSummaryFilters={weekSummaryFilters}
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div ref={appointmentFormRef}>
        <Panel title={editingId ? 'Editar agendamento' : 'Novo agendamento'} eyebrow="Agenda">
          {hasRequiredCatalog ? (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {slotPrefillSummary ? (
                <div className="rounded-lg border border-[#7854a2] bg-[rgba(120,84,162,0.08)] p-4">
                  <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#7854a2]">Horario livre aplicado</span>
                  <strong className="mt-1 block text-sm text-[color:var(--bc-text)]">{slotPrefillSummary}</strong>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--bc-muted)]">
                    Profissional, servico, data e horario foram preenchidos. Ajuste qualquer campo se precisar.
                  </p>
                </div>
              ) : null}
              <SelectField
                label="Cliente"
                value={form.clientId}
                onChange={(value) => setForm((current) => ({ ...current, clientId: value }))}
                options={visibleClients.map((client) => ({ value: client.id, label: client.name }))}
              />
              <div className={getOperationalPrefillFieldClass(slotPrefillHighlights.professional)}>
                <SelectField
                  label="Profissional"
                  value={form.professionalId}
                  onChange={(value) => {
                    setFormError(null);
                    setForm((current) => ({ ...current, professionalId: value }));
                  }}
                  options={data.professionals
                    .filter((professional) => professional.active)
                    .map((professional) => ({ value: professional.id, label: professional.name }))}
                />
              </div>
              <div className={getOperationalPrefillFieldClass(slotPrefillHighlights.service)}>
                <SelectField
                  label="Servico"
                  value={form.serviceId}
                  onChange={(value) => {
                    setFormError(null);
                    setForm((current) => ({ ...current, serviceId: value }));
                  }}
                  options={availableServices.map((service) => ({
                    value: service.id,
                    label: `${service.name} - ${service.durationMinutes} min - ${formatCurrency(service.priceCents)}`,
                  }))}
                />
              </div>
              <ReadonlyValue
                label="Duracao prevista"
                value={selectedService ? `${selectedService.durationMinutes} minutos` : 'Selecione um servico'}
              />
              <div className="grid gap-4">
                <div className={getOperationalPrefillFieldClass(slotPrefillHighlights.date)}>
                  <Field
                    label="Data"
                    type="date"
                    value={form.date}
                    onChange={(value) => {
                      setFormError(null);
                      setForm((current) => ({ ...current, date: value }));
                    }}
                  />
                </div>
                <div className={getOperationalPrefillFieldClass(slotPrefillHighlights.time)}>
                  <AvailabilitySlotPicker
                    emptyMessage={getAvailabilityEmptyMessage(data, form)}
                    onSelect={(time) => {
                      setFormError(null);
                      setForm((current) => ({ ...current, time }));
                    }}
                    selectedTime={form.time}
                    slots={availabilitySlots}
                  />
                </div>
              </div>
              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => setForm((current) => ({ ...current, status: value as AppointmentStatus }))}
                options={appointmentStatuses.map((status) => ({ value: status.id, label: status.label }))}
              />
              <TextArea label="Observacoes" value={form.notes} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
              {formError ? <EmptyState message={formError} /> : null}
              <FormActions isEditing={Boolean(editingId)} onCancel={resetForm} />
            </form>
          ) : (
            <EmptyState message="Cadastre ao menos um cliente, profissional e servico antes de criar agendamentos." />
          )}
        </Panel>
        </div>

        <Panel title="Agendamentos" eyebrow={`${appointments.length} registros`}>
          {deleteMessage ? <p className="mb-4 rounded-lg bg-[rgba(120,84,162,0.06)] px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)]">{deleteMessage}</p> : null}
          {appointments.length > 0 ? (
            <div className="grid gap-3">
              {appointments.map((appointment) => (
                <AppointmentSummaryCard
                  key={appointment.id}
                  appointment={appointment}
                  isSelected={selectedAppointment?.id === appointment.id}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleOpenAppointment(appointment)} className="bc-admin-secondary-button">
                        Abrir
                      </button>
                      <button type="button" onClick={() => handleEdit(appointment)} className="bc-admin-secondary-button">
                        Editar
                      </button>
                      <button type="button" onClick={() => void handleDeleteAppointment(appointment)} className="bc-admin-secondary-button">
                        Excluir
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState message="Nenhum agendamento cadastrado ainda." />
          )}
        </Panel>
      </div>

      <div ref={operationsPanelRef}>{selectedAppointment ? <AppointmentOperations appointment={selectedAppointment} /> : null}</div>
    </section>
  );
}

function OperationalCalendarPanel({
  filters,
  hideFreeSlots,
  model,
  onCreateFromSlot,
  onFilterChange,
  onHideFreeSlotsChange,
  onOpenAppointment,
  selectedAppointmentId,
  onWeekSummaryFilterChange,
  professionals,
  services,
  weekSummaryFilters,
}: {
  filters: OperationalCalendarFilters;
  hideFreeSlots: boolean;
  model: OperationalCalendarModel;
  onCreateFromSlot: (slot: AvailabilitySlot) => void;
  onFilterChange: (input: Partial<OperationalCalendarFilters>) => void;
  onHideFreeSlotsChange: (value: boolean) => void;
  onOpenAppointment: (appointment: EnrichedAppointment) => void;
  selectedAppointmentId: string | null;
  onWeekSummaryFilterChange: (input: Partial<OperationalWeekSummaryFilters>) => void;
  professionals: { active: boolean; id: string; name: string }[];
  services: { id: string; name: string }[];
  weekSummaryFilters: OperationalWeekSummaryFilters;
}) {
  const visibleWeekSummary = getVisibleWeekSummary(model.weekSummary, weekSummaryFilters);
  const visibleEntries = getVisibleOperationalEntries(model.entries, hideFreeSlots);

  return (
    <Panel title="Calendario operacional" eyebrow={`${model.professionalName} | ${model.serviceName}`}>
      <div className="grid gap-5">
        <div className="flex flex-col gap-3 rounded-lg border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.04)] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="block text-sm font-black text-[color:var(--bc-text)]">Data selecionada</span>
            <p className="mt-1 text-sm font-semibold text-[color:var(--bc-muted)]">{formatDateOnly(filters.date)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFilterChange({ date: addDaysToDateKey(filters.date, -1) })}
              className="bc-admin-secondary-button"
            >
              Dia anterior
            </button>
            <button type="button" onClick={() => onFilterChange({ date: todayDateKey() })} className="bc-admin-secondary-button">
              Hoje
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ date: addDaysToDateKey(filters.date, 1) })}
              className="bc-admin-secondary-button"
            >
              Proximo dia
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <SelectField
            label="Profissional"
            value={filters.professionalId}
            onChange={(value) => onFilterChange({ professionalId: value })}
            options={professionals
              .filter((professional) => professional.active)
              .map((professional) => ({ value: professional.id, label: professional.name }))}
          />
          <Field label="Data" type="date" value={filters.date} onChange={(value) => onFilterChange({ date: value })} />
          <SelectField
            label="Status dos agendamentos"
            value={filters.status}
            onChange={(value) => onFilterChange({ status: value as CalendarStatusFilter })}
            options={[
              { value: 'all', label: 'Todos' },
              ...appointmentStatuses.map((status) => ({ value: status.id, label: status.label })),
            ]}
          />
          <SelectField
            label="Servico para slots livres"
            value={filters.serviceId}
            onChange={(value) => onFilterChange({ serviceId: value })}
            options={services.map((service) => ({ value: service.id, label: service.name }))}
          />
        </div>

        <div className="grid gap-3 rounded-lg border border-[rgba(120,84,162,0.12)] bg-[rgba(255,253,249,0.82)] p-4 text-sm text-[color:var(--bc-muted)] md:grid-cols-3">
          <ReadonlyValue label="Jornada" value={model.scheduleSummary} />
          <ReadonlyValue label="Slots livres" value={String(model.freeSlots.length)} />
          <ReadonlyValue label="Excecoes na data" value={String(model.exceptions.length)} />
        </div>

        <div className="grid gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="block text-sm font-black text-[color:var(--bc-text)]">Resumo semanal</span>
              <p className="text-sm font-semibold text-[color:var(--bc-muted)]">{model.weekRangeLabel}</p>
            </div>
            <p className="text-xs font-semibold text-[color:var(--bc-muted)]">Agendamentos, concluidos, cancelados/faltas e excecoes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onWeekSummaryFilterChange({ exceptionsOnly: !weekSummaryFilters.exceptionsOnly })}
              className={getQuickFilterButtonClass(weekSummaryFilters.exceptionsOnly)}
            >
              Somente dias com excecao
            </button>
            <button
              type="button"
              onClick={() => onWeekSummaryFilterChange({ pendingOnly: !weekSummaryFilters.pendingOnly })}
              className={getQuickFilterButtonClass(weekSummaryFilters.pendingOnly)}
            >
              Somente dias com pendencia
            </button>
            {weekSummaryFilters.exceptionsOnly || weekSummaryFilters.pendingOnly ? (
              <button
                type="button"
                onClick={() => onWeekSummaryFilterChange({ exceptionsOnly: false, pendingOnly: false })}
                className="bc-admin-secondary-button"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
          {visibleWeekSummary.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-7">
              {visibleWeekSummary.map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => onFilterChange({ date: day.date })}
                className={getWeekSummaryCardClass(day)}
              >
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#8d6a39]">{day.label}</span>
                <strong className="mt-2 block text-2xl text-[color:var(--bc-text)]">{day.appointmentsCount}</strong>
                <span className="mt-1 block text-xs font-semibold text-[color:var(--bc-muted)]">
                  {day.completedCount} concluidos | {day.cancelledOrNoShowCount} canc./faltas | {day.pendingCount} pend.
                </span>
                <span className="mt-2 block text-xs font-black text-[#7854a2]">
                  {formatWeekSummaryExceptionLabel(day)}
                </span>
                <span className="mt-1 block text-xs font-semibold text-[color:var(--bc-muted)]">{formatWeekSummaryMovementLabel(day)}</span>
              </button>
              ))}
            </div>
          ) : (
            <EmptyState message="Nenhum dia da semana atende aos filtros rapidos." />
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {calendarLegend.map((item) => {
              const style = getCalendarEntryStyle(item.id);

              return (
                <span key={item.id} className={`rounded-lg border px-3 py-2 text-xs font-black ${style.badge}`}>
                  {item.label}
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => onHideFreeSlotsChange(!hideFreeSlots)}
            className={getQuickFilterButtonClass(hideFreeSlots)}
          >
            {hideFreeSlots ? 'Mostrar tudo' : 'Ocultar horarios livres'}
          </button>
        </div>

        {visibleEntries.length > 0 ? (
          <div className="grid gap-3">
            {visibleEntries.map((entry) => (
              <OperationalCalendarEntryCard
                key={entry.id}
                entry={entry}
                isSelected={entry.appointment?.id === selectedAppointmentId}
                onCreateFromSlot={onCreateFromSlot}
                onOpenAppointment={onOpenAppointment}
              />
            ))}
          </div>
        ) : (
          <EmptyState message={hideFreeSlots ? 'Nenhum estado operacional ocupado para estes filtros.' : model.stateMessage} />
        )}
      </div>
    </Panel>
  );
}

function OperationalCalendarEntryCard({
  entry,
  isSelected,
  onCreateFromSlot,
  onOpenAppointment,
}: {
  entry: OperationalCalendarEntry;
  isSelected: boolean;
  onCreateFromSlot: (slot: AvailabilitySlot) => void;
  onOpenAppointment: (appointment: EnrichedAppointment) => void;
}) {
  const style = getCalendarEntryStyle(entry.status ?? entry.kind);

  return (
    <article className={`rounded-lg border p-4 ${style.card} ${isSelected ? 'shadow-[0_0_0_4px_rgba(120,84,162,0.12)] ring-1 ring-[#7854a2]' : ''}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid gap-1">
          <div className="flex flex-wrap gap-2">
            <span className={`w-fit rounded-lg border px-2 py-1 text-xs font-black ${style.badge}`}>{entry.label}</span>
            {isSelected ? (
              <span className="w-fit rounded-lg border border-[#7854a2] bg-white px-2 py-1 text-xs font-black text-[#7854a2]">Selecionado</span>
            ) : null}
          </div>
          <h3 className="text-lg font-black text-[color:var(--bc-text)]">{entry.title}</h3>
          <p className="text-sm font-semibold text-[color:var(--bc-muted)]">{entry.time}</p>
          <p className="text-sm leading-6 text-[color:var(--bc-muted)]">{entry.body}</p>
        </div>
        {entry.appointment ? (
          <button type="button" onClick={() => onOpenAppointment(entry.appointment!)} className="bc-admin-secondary-button">
            Abrir
          </button>
        ) : null}
        {entry.slot ? (
          <button type="button" onClick={() => onCreateFromSlot(entry.slot!)} className="bc-admin-secondary-button">
            Criar neste horario
          </button>
        ) : null}
      </div>
    </article>
  );
}

function AppointmentOperations({ appointment }: { appointment: EnrichedAppointment }) {
  const { actions } = usePlatformData();
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusConfirmation, setStatusConfirmation] = useState<string | null>(null);

  useEffect(() => {
    setStatusError(null);
    setStatusConfirmation(null);
  }, [appointment.id]);

  async function handleStatusChange(status: AppointmentStatus) {
    setStatusError(null);
    setStatusConfirmation(null);

    const result = await actions.updateAppointmentStatus(appointment.id, status);

    if (!result.ok) {
      setStatusError(result.message);
      return;
    }

    setStatusConfirmation(`Status atualizado para ${getStatusLabel(result.appointment.status)}.`);
  }

  async function handleAttendanceStatusChange(status: AttendanceStatus) {
    setStatusError(null);
    setStatusConfirmation(null);

    if (!appointment.attendanceRecord) {
      setStatusError('Nao encontramos o atendimento para atualizar o status.');
      return;
    }

    const result = await actions.updateAttendanceStatus(appointment.attendanceRecord.id, status);

    if (!result.ok) {
      setStatusError(result.message);
      return;
    }

    setStatusConfirmation(`Status do atendimento atualizado para ${getAttendanceStatusLabel(result.attendance.status)}.`);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Atendimento" eyebrow="Abrir agendamento">
        <div className="grid gap-4">
          <RecordCard
            title={`${appointment.clientName} - ${appointment.serviceName}`}
            subtitle={`${formatDateTime(appointment.startsAt)} | ${appointment.professionalName}`}
            body={`Status atual: ${getStatusLabel(appointment.status)} | Valor base: ${formatCurrency(appointment.servicePriceCents)}`}
          />
          <div className="flex flex-wrap gap-2">
            {appointment.status === 'scheduled' || appointment.status === 'requested' ? (
              <button type="button" onClick={() => void handleStatusChange('confirmed')} className="bc-admin-secondary-button">
                Confirmar
              </button>
            ) : null}
            {canStartAttendance(appointment.status) ? (
              <button type="button" onClick={() => void handleStatusChange('inService')} className="bc-admin-primary-button">
                Iniciar atendimento
              </button>
            ) : null}
            {appointment.status === 'inService' ? (
              <button type="button" onClick={() => void handleStatusChange('completed')} className="bc-admin-primary-button">
                Concluir atendimento
              </button>
            ) : null}
            {!isTerminalAppointment(appointment.status) ? (
              <>
                <button type="button" onClick={() => void handleStatusChange('cancelled')} className="bc-admin-secondary-button">
                  Cancelar
                </button>
                <button type="button" onClick={() => void handleStatusChange('noShow')} className="bc-admin-secondary-button">
                  Marcar faltou
                </button>
              </>
            ) : null}
          </div>
          <div className="grid gap-3 rounded-lg border border-[rgba(120,84,162,0.12)] bg-[rgba(255,253,249,0.82)] p-4">
            <div>
              <span className="block text-sm font-black text-[color:var(--bc-text)]">Status do atendimento</span>
              <p className="mt-1 text-sm font-semibold text-[color:var(--bc-muted)]">
                {appointment.attendanceRecord
                  ? getAttendanceStatusLabel(appointment.attendanceRecord.status)
                  : 'Atendimento ainda nao iniciado.'}
              </p>
            </div>
            {appointment.attendanceRecord ? (
              <div className="flex flex-wrap gap-2">
                {appointment.attendanceRecord.status !== 'inProgress' ? (
                  <button type="button" onClick={() => void handleAttendanceStatusChange('inProgress')} className="bc-admin-secondary-button">
                    Marcar em andamento
                  </button>
                ) : null}
                {appointment.attendanceRecord.status !== 'finished' ? (
                  <button type="button" onClick={() => void handleAttendanceStatusChange('finished')} className="bc-admin-secondary-button">
                    Marcar finalizado
                  </button>
                ) : null}
                {appointment.attendanceRecord.status === 'finished' ? (
                  <button type="button" onClick={() => void handleAttendanceStatusChange('reopened')} className="bc-admin-secondary-button">
                    Reabrir atendimento
                  </button>
                ) : null}
              </div>
            ) : (
              <EmptyState message="Inicie o atendimento pelo status do agendamento para criar o registro operacional." />
            )}
          </div>
          {statusError ? <EmptyState message={statusError} /> : null}
          {statusConfirmation ? <SuccessState message={statusConfirmation} /> : null}
        </div>
      </Panel>

      <ClosureAndPaymentPanel appointment={appointment} />
    </section>
  );
}

function ClosureAndPaymentPanel({ appointment }: { appointment: EnrichedAppointment }) {
  const { actions } = usePlatformData();
  const closure = appointment.accountClosure;
  const [closureForm, setClosureForm] = useState<ClosureFormState>(() => createClosureForm(closure));
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(() => createPaymentForm(closure));
  const [closureError, setClosureError] = useState<string | null>(null);
  const [closureConfirmation, setClosureConfirmation] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentConfirmation, setPaymentConfirmation] = useState<string | null>(null);

  useEffect(() => {
    setClosureForm(createClosureForm(closure));
    setPaymentForm(createPaymentForm(closure));
  }, [closure]);

  useEffect(() => {
    setClosureError(null);
    setClosureConfirmation(null);
    setPaymentError(null);
    setPaymentConfirmation(null);
  }, [appointment.id]);

  async function handleGenerateClosure() {
    setClosureError(null);
    setClosureConfirmation(null);
    setPaymentError(null);
    setPaymentConfirmation(null);

    const result = await actions.upsertAccountClosure(appointment.id, {
      discountCents: 0,
      additionCents: 0,
      notes: '',
      status: 'open',
    });

    if (!result.ok) {
      setClosureError(result.message);
      return;
    }

    setClosureConfirmation('Fechamento gerado para revisao.');
  }

  async function handleClosureSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClosureError(null);
    setClosureConfirmation(null);
    setPaymentError(null);
    setPaymentConfirmation(null);

    const result = await actions.upsertAccountClosure(appointment.id, {
      discountCents: parseMoneyToCents(closureForm.discountAmount),
      additionCents: parseMoneyToCents(closureForm.additionAmount),
      notes: closureForm.notes,
      status: closureForm.status,
    });

    if (!result.ok) {
      setClosureError(result.message);
      return;
    }

    setClosureConfirmation('Fechamento salvo com sucesso.');
  }

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentError(null);
    setPaymentConfirmation(null);

    if (!closure) {
      setPaymentError('Gere um fechamento antes de registrar o pagamento.');
      return;
    }

    const result = await actions.registerPayment(closure.id, {
      amountCents: parseMoneyToCents(paymentForm.amount),
      method: paymentForm.method,
      status: paymentForm.status,
    });

    if (!result.ok) {
      setPaymentError(result.message);
      return;
    }

    setPaymentConfirmation('Pagamento registrado com sucesso.');
  }

  return (
    <Panel title="Fechamento de conta" eyebrow={closure ? getClosureStatusLabel(closure.status) : 'Aguardando atendimento'}>
      <div className="grid gap-5">
        <div className="grid gap-3 rounded-lg bg-[rgba(120,84,162,0.06)] p-4 text-sm text-[color:var(--bc-muted)]">
          <strong className="text-[color:var(--bc-text)]">{appointment.clientName}</strong>
          <span>{appointment.professionalName}</span>
          <span>{appointment.serviceName}</span>
          <span>{formatDateTime(appointment.startsAt)}</span>
          <span>Valor base: {formatCurrency(appointment.servicePriceCents)}</span>
        </div>

        {!closure && appointment.status !== 'completed' ? (
          <EmptyState message="Conclua o atendimento para preparar o fechamento de conta." />
        ) : null}

        {!closure && appointment.status === 'completed' ? (
          <button
            type="button"
            onClick={handleGenerateClosure}
            className="bc-admin-primary-button"
          >
            Gerar fechamento
          </button>
        ) : null}
        {closureError ? <EmptyState message={closureError} /> : null}
        {closureConfirmation ? <SuccessState message={closureConfirmation} /> : null}

        {closure ? (
          <>
            <form className="grid gap-4" onSubmit={handleClosureSubmit}>
              <div className="grid gap-4 sm:grid-cols-3">
                <ReadonlyValue label="Base" value={formatCurrency(closure.baseAmountCents)} />
                <Field
                  label="Desconto (R$)"
                  type="number"
                  step="0.01"
                  value={closureForm.discountAmount}
                  onChange={(value) => setClosureForm((current) => ({ ...current, discountAmount: value }))}
                />
                <Field
                  label="Acrescimos (R$)"
                  type="number"
                  step="0.01"
                  value={closureForm.additionAmount}
                  onChange={(value) => setClosureForm((current) => ({ ...current, additionAmount: value }))}
                />
              </div>
              <ReadonlyValue
                label="Valor final"
                value={formatCurrency(
                  Math.max(
                    0,
                    closure.baseAmountCents -
                      parseMoneyToCents(closureForm.discountAmount) +
                      parseMoneyToCents(closureForm.additionAmount),
                  ),
                )}
              />
              <SelectField
                label="Status do fechamento"
                value={closureForm.status}
                onChange={(value) => setClosureForm((current) => ({ ...current, status: value as AccountClosureStatus }))}
                options={closureStatuses.map((status) => ({ value: status.id, label: status.label }))}
              />
              <TextArea label="Observacoes do fechamento" value={closureForm.notes} onChange={(value) => setClosureForm((current) => ({ ...current, notes: value }))} />
              <button type="submit" className="bc-admin-primary-button">
                Salvar fechamento
              </button>
            </form>

            <form className="grid gap-4 rounded-lg border border-[rgba(120,84,162,0.12)] bg-[rgba(255,253,249,0.82)] p-4" onSubmit={handlePaymentSubmit}>
              <h3 className="text-lg font-black text-[color:var(--bc-text)]">Registrar pagamento</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Valor pago (R$)"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(value) => setPaymentForm((current) => ({ ...current, amount: value }))}
                />
                <SelectField
                  label="Forma"
                  value={paymentForm.method}
                  onChange={(value) => setPaymentForm((current) => ({ ...current, method: value as PaymentMethod }))}
                  options={paymentMethods.map((method) => ({ value: method.id, label: method.label }))}
                />
                <SelectField
                  label="Status"
                  value={paymentForm.status}
                  onChange={(value) => setPaymentForm((current) => ({ ...current, status: value as PaymentStatus }))}
                  options={paymentStatuses.map((status) => ({ value: status.id, label: status.label }))}
                />
              </div>
              <button type="submit" className="bc-admin-primary-button">
                Registrar pagamento
              </button>
              {paymentError ? <EmptyState message={paymentError} /> : null}
              {paymentConfirmation ? <SuccessState message={paymentConfirmation} /> : null}
            </form>

            {appointment.payments.length > 0 ? (
              <div className="grid gap-2">
                {appointment.payments.map((payment) => (
                  <RecordCard
                    key={payment.id}
                    title={formatCurrency(payment.amountCents)}
                    subtitle={`${getPaymentMethodLabel(payment.method)} | ${getPaymentStatusLabel(payment.status)}`}
                    body={payment.paidAt ? `Pago em ${formatDateTime(payment.paidAt)}` : `Criado em ${formatDateTime(payment.createdAt)}`}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </Panel>
  );
}

function ClientsManager() {
  const { data, actions } = usePlatformData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientInput>(emptyClientForm);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const visibleClients = useMemo(() => data.clients.filter(isVisibleClient), [data.clients]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyClientForm);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      actions.updateClient(editingId, form);
    } else {
      actions.createClient(form);
    }

    resetForm();
  }

  async function handleDeleteClient(clientId: string) {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    setDeleteMessage(null);
    const result = await actions.deleteClient(clientId);

    if (!result.ok) {
      setDeleteMessage(result.message || 'Nao foi possivel excluir este cliente.');
      return;
    }

    setDeleteMessage(result.mode === 'archived' ? 'Cliente arquivado com sucesso.' : 'Cliente removido com sucesso.');
    if (editingId === clientId) {
      resetForm();
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title={editingId ? 'Editar cliente' : 'Novo cliente'} eyebrow="Clientes">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label="Nome" value={form.name} required onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <Field label="Telefone" value={form.phone} required onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
          <Field label="E-mail" type="email" value={form.email ?? ''} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
          <TextArea label="Observacoes e preferencias" value={form.notes ?? ''} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
          <FormActions isEditing={Boolean(editingId)} onCancel={resetForm} />
        </form>
      </Panel>

      <Panel title="Clientes e historico" eyebrow={`${visibleClients.length} registros`}>
        {deleteMessage ? <p className="mb-4 rounded-lg bg-[rgba(120,84,162,0.06)] px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)]">{deleteMessage}</p> : null}
        {visibleClients.length > 0 ? (
          <div className="grid gap-3">
            {visibleClients.map((client) => {
              const insights = getClientInsights(data, client.id);

              return (
                <RecordCard
                  key={client.id}
                  title={client.name}
                  subtitle={`${client.phone}${client.email ? ` | ${client.email}` : ''}`}
                  body={[
                    `Total gasto: ${formatCurrency(insights.totalSpentCents)}`,
                    `Ultima visita: ${insights.lastVisit ? formatDateTime(insights.lastVisit) : 'sem visita'}`,
                    `Ultimos status: ${insights.lastStatuses.join(', ') || 'sem historico'}`,
                    client.notes ?? 'Sem observacoes registradas.',
                  ].join(' | ')}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(client.id);
                          setForm({
                            name: client.name,
                            phone: client.phone,
                            email: client.email ?? '',
                            notes: client.notes ?? '',
                          });
                        }}
                        className="bc-admin-secondary-button"
                      >
                        Editar
                      </button>
                      <button type="button" onClick={() => void handleDeleteClient(client.id)} className="bc-admin-secondary-button">
                        Excluir
                      </button>
                    </div>
                  }
                />
              );
            })}
          </div>
        ) : (
          <EmptyState message="Nenhum cliente cadastrado ainda." />
        )}
      </Panel>
    </section>
  );
}

function ProfessionalsManager() {
  const { data, actions, lastSyncError } = usePlatformData();
  const appearance = useAppearance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfessionalInput>(emptyProfessionalForm);
  const [professionalMessage, setProfessionalMessage] = useState<string | null>(null);
  const [exceptionForm, setExceptionForm] = useState<ScheduleExceptionFormState>(() => createScheduleExceptionForm(data));
  const selectedExceptionProfessional = data.professionals.find((professional) => professional.id === exceptionForm.professionalId);
  const selectedProfessionalExceptions = (data.professionalScheduleExceptions ?? [])
    .filter((exception) => exception.professionalId === exceptionForm.professionalId)
    .sort((left, right) => left.date.localeCompare(right.date) || (left.startTime ?? '').localeCompare(right.startTime ?? ''));

  useEffect(() => {
    if (data.professionals.length > 0 && !data.professionals.some((professional) => professional.id === exceptionForm.professionalId)) {
      setExceptionForm(createScheduleExceptionForm(data));
    }
  }, [data, exceptionForm.professionalId]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyProfessionalForm);
    setProfessionalMessage(null);
  }

  function handlePermissionChange(permission: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }

  function updateSchedule(input: Partial<ProfessionalSchedule>) {
    setForm((current) => ({
      ...current,
      schedule: normalizeProfessionalSchedule({
        ...current.schedule,
        ...input,
      }),
    }));
  }

  function handleWeekdayToggle(weekday: Weekday) {
    const schedule = normalizeProfessionalSchedule(form.schedule);
    const weekdays = schedule.weekdays.includes(weekday)
      ? schedule.weekdays.filter((item) => item !== weekday)
      : [...schedule.weekdays, weekday].sort((left, right) => left - right);

    updateSchedule({
      weekdays,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      actions.updateProfessional(editingId, form);
      resetForm();
      setProfessionalMessage('Profissional atualizado com sucesso.');
      return;
    }

    setProfessionalMessage(null);
    const result = await actions.addEmployee(form);

    if (!result.ok) {
      return;
    } else {
      resetForm();
      setProfessionalMessage('Profissional criado com sucesso.');
    }
  }

  async function handleProfessionalAvatarUploaded(url: string) {
    if (editingId) {
      setProfessionalMessage(null);

      const result = await actions.updateProfessionalAvatar(editingId, url);

      if (!result.ok) {
        return;
      }

      const nextAvatarUrl = result.avatarUrl ?? url;

      appearance.setAvatar(editingId, nextAvatarUrl);
      setForm((current) => ({ ...current, avatarUrl: nextAvatarUrl }));
    } else {
      setForm((current) => ({ ...current, avatarUrl: url }));
    }

    setProfessionalMessage('Foto do profissional atualizada com sucesso.');
  }

  function handleDeleteProfessional() {
    if (!editingId) {
      return;
    }

    const confirmed = window.confirm('Tem certeza que deseja excluir este profissional? Essa ação não poderá ser desfeita.');

    if (!confirmed) {
      return;
    }

    actions.deleteProfessional(editingId);
    resetForm();
  }

  function handleExceptionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    actions.createProfessionalScheduleException(exceptionForm);
    setExceptionForm(createScheduleExceptionForm(data, exceptionForm.professionalId));
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="grid gap-6">
        <Panel title={editingId ? 'Editar profissional' : 'Novo profissional'} eyebrow="Equipe e permissoes">
        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <Field label="Nome" value={form.name} required onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <Field label="E-mail de acesso" type="email" value={form.email} required onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
          <Field label="Funcao" value={form.role} required onChange={(value) => setForm((current) => ({ ...current, role: value }))} />
          <div className="grid gap-3 rounded-lg border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.04)] p-4 sm:grid-cols-[72px_1fr]">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-white text-sm font-black text-[#7854a2]">
              {form.avatarUrl ? <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" /> : getInitials(form.name || 'Profissional')}
            </span>
            <UploadField
              accept="image/jpeg,image/png,image/webp"
              assetType="professionalAvatar"
              disabled={!editingId}
              label="Foto do profissional"
              professionalId={editingId ?? undefined}
              onUploaded={handleProfessionalAvatarUploaded}
            />
            {!editingId ? <p className="text-sm font-semibold text-[color:var(--bc-muted)] sm:col-span-2">Salve o profissional antes de enviar a foto.</p> : null}
          </div>
          <SelectField
            label="Status"
            value={form.active ? 'active' : 'inactive'}
            onChange={(value) => setForm((current) => ({ ...current, active: value === 'active' }))}
            options={[
              { value: 'active', label: 'Ativo' },
              { value: 'inactive', label: 'Inativo' },
            ]}
          />
          <div>
            <span className="mb-2 block text-sm font-black text-[color:var(--bc-text)]">Acessos do profissional</span>
            <div className="grid gap-2">
              {professionalPermissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-3 rounded-lg border border-[rgba(120,84,162,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--bc-muted)]"
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="h-4 w-4 accent-[#7854a2]"
                  />
                  {getProfessionalPermissionLabel(permission)}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 rounded-lg border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.04)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-sm font-black text-[color:var(--bc-text)]">Jornada da agenda</span>
                <p className="mt-1 text-xs font-semibold text-[color:var(--bc-muted)]">
                  Usada para calcular os horarios disponiveis do cliente e do admin.
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[color:var(--bc-muted)]">
                <input
                  type="checkbox"
                  checked={form.schedule.active}
                  onChange={() => updateSchedule({ active: !form.schedule.active })}
                  className="h-4 w-4 accent-[#7854a2]"
                />
                Agenda ativa
              </label>
            </div>
            <div>
              <span className="mb-2 block text-sm font-black text-[color:var(--bc-text)]">Dias de atendimento</span>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {weekdayLabels.map((weekday) => (
                  <button
                    key={weekday.id}
                    type="button"
                    onClick={() => handleWeekdayToggle(weekday.id)}
                    className={[
                      'h-10 rounded-lg border px-2 text-xs font-black transition',
                      form.schedule.weekdays.includes(weekday.id)
                        ? 'border-[#7854a2] bg-[#7854a2] text-white'
                        : 'border-[rgba(120,84,162,0.16)] bg-white text-[color:var(--bc-muted)]',
                    ].join(' ')}
                  >
                    {weekday.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Inicio"
                type="time"
                value={form.schedule.startTime}
                required
                onChange={(value) => updateSchedule({ startTime: value })}
              />
              <Field
                label="Fim"
                type="time"
                value={form.schedule.endTime}
                required
                onChange={(value) => updateSchedule({ endTime: value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Inicio da pausa"
                type="time"
                value={form.schedule.breakStartTime ?? ''}
                onChange={(value) => updateSchedule({ breakStartTime: value || undefined })}
              />
              <Field
                label="Fim da pausa"
                type="time"
                value={form.schedule.breakEndTime ?? ''}
                onChange={(value) => updateSchedule({ breakEndTime: value || undefined })}
              />
            </div>
          </div>
          {professionalMessage ? <SuccessState message={professionalMessage} /> : null}
          {lastSyncError ? <EmptyState message={lastSyncError} /> : null}
          <FormActions isEditing={Boolean(editingId)} onCancel={resetForm} />
          {editingId ? (
            <button
              type="button"
              onClick={handleDeleteProfessional}
              className="rounded-lg border border-[#f0b8b8] bg-[#fff5f5] px-4 py-3 text-sm font-black text-[#a83232] transition hover:border-[#df8585] hover:bg-[#ffecec]"
            >
              Excluir profissional
            </button>
          ) : null}
        </form>
        </Panel>

        <Panel title="Excecoes de agenda" eyebrow={selectedExceptionProfessional?.name ?? 'Profissionais'}>
          {data.professionals.length > 0 ? (
            <div className="grid gap-5">
              <form className="grid gap-4" onSubmit={handleExceptionSubmit}>
                <SelectField
                  label="Profissional"
                  value={exceptionForm.professionalId}
                  onChange={(value) => setExceptionForm((current) => ({ ...current, professionalId: value }))}
                  options={data.professionals.map((professional) => ({ value: professional.id, label: professional.name }))}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Data"
                    type="date"
                    value={exceptionForm.date}
                    required
                    onChange={(value) => setExceptionForm((current) => ({ ...current, date: value }))}
                  />
                  <SelectField
                    label="Tipo"
                    value={exceptionForm.type}
                    onChange={(value) =>
                      setExceptionForm((current) => ({
                        ...current,
                        type: value as ProfessionalScheduleExceptionType,
                        startTime: value === 'dayOff' ? '' : current.startTime,
                        endTime: value === 'dayOff' ? '' : current.endTime,
                      }))
                    }
                    options={scheduleExceptionTypes.map((type) => ({ value: type.id, label: type.label }))}
                  />
                </div>
                {exceptionForm.type !== 'dayOff' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={exceptionForm.type === 'specialHours' ? 'Inicio especial' : 'Inicio do bloqueio'}
                      type="time"
                      value={exceptionForm.startTime ?? ''}
                      required
                      onChange={(value) => setExceptionForm((current) => ({ ...current, startTime: value }))}
                    />
                    <Field
                      label={exceptionForm.type === 'specialHours' ? 'Fim especial' : 'Fim do bloqueio'}
                      type="time"
                      value={exceptionForm.endTime ?? ''}
                      required
                      onChange={(value) => setExceptionForm((current) => ({ ...current, endTime: value }))}
                    />
                  </div>
                ) : null}
                <TextArea
                  label="Motivo"
                  value={exceptionForm.reason ?? ''}
                  onChange={(value) => setExceptionForm((current) => ({ ...current, reason: value }))}
                />
                <button type="submit" className="bc-admin-primary-button">
                  Salvar excecao
                </button>
              </form>

              {selectedProfessionalExceptions.length > 0 ? (
                <div className="grid gap-3">
                  {selectedProfessionalExceptions.map((exception) => (
                    <RecordCard
                      key={exception.id}
                      title={getScheduleExceptionTypeLabel(exception.type)}
                      subtitle={`${formatDateOnly(exception.date)} | ${selectedExceptionProfessional?.name ?? 'Profissional'}`}
                      body={formatScheduleException(exception)}
                      action={
                        <button
                          type="button"
                          onClick={() => actions.deleteProfessionalScheduleException(exception.id)}
                          className="bc-admin-secondary-button"
                        >
                          Remover
                        </button>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="Nenhuma excecao cadastrada para este profissional." />
              )}
            </div>
          ) : (
            <EmptyState message="Cadastre um profissional antes de configurar excecoes." />
          )}
        </Panel>
      </div>

      <Panel title="Profissionais" eyebrow={`${data.professionals.length} registros`}>
        {data.professionals.length > 0 ? (
          <div className="grid gap-3">
            {data.professionals.map((professional) => {
              const ownAppointments = data.appointments.filter((appointment) => appointment.professionalId === professional.id);
              const schedule = normalizeProfessionalSchedule(professional.schedule);

              return (
                <div key={professional.id} className="grid gap-3 rounded-lg border border-[rgba(120,84,162,0.12)] bg-[rgba(255,253,249,0.82)] p-4 sm:grid-cols-[56px_1fr]">
                  <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white text-sm font-black text-[#7854a2]">
                    {professional.avatarUrl ? <img src={professional.avatarUrl} alt="" className="h-full w-full object-cover" /> : getInitials(professional.name)}
                  </span>
                  <RecordCard
                    title={professional.name}
                    subtitle={`${professional.role} | ${professional.active ? 'ativo' : 'inativo'} | ${ownAppointments.length} agendamentos`}
                    body={`${professional.email} | perfil ${professional.accessProfileId} | ${formatProfessionalSchedule(schedule)} | ${professional.permissions.join(', ')}`}
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(professional.id);
                          setForm({
                            name: professional.name,
                            email: professional.email,
                            role: professional.role,
                            active: professional.active,
                            permissions: professional.permissions,
                            schedule: normalizeProfessionalSchedule(professional.schedule),
                            avatarUrl: professional.avatarUrl ?? '',
                          });
                        }}
                        className="bc-admin-secondary-button"
                      >
                        Editar
                      </button>
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState message="Nenhum profissional cadastrado ainda." />
        )}
      </Panel>
    </section>
  );
}

function SalonAppearanceManager() {
  const { data, actions, dataSource, lastSyncError } = usePlatformData();
  const [form, setForm] = useState<SalonAppearanceFormState>(() => createSalonAppearanceForm(data.salon));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDark = form.themeMode === 'dark';

  useEffect(() => {
    setForm(createSalonAppearanceForm(data.salon));
  }, [data.salon]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isValidHexColor(form.primaryColor)) {
      setError('Informe uma cor hexadecimal valida, como #7C3AED.');
      return;
    }

    actions.updateSalonAppearance({
      coverUrl: form.coverUrl || undefined,
      logoUrl: form.logoUrl || undefined,
      primaryColor: form.primaryColor,
      themeMode: form.themeMode,
    });
    setMessage('Aparencia salva com sucesso.');
  }

  async function handleAssetUploaded(kind: 'cover' | 'logo', url: string) {
    setForm((current) => ({ ...current, [kind === 'logo' ? 'logoUrl' : 'coverUrl']: url }));
    actions.updateSalonAppearance({
      ...form,
      [kind === 'logo' ? 'logoUrl' : 'coverUrl']: url,
    });
    setMessage(kind === 'logo' ? 'Logo atualizado com sucesso.' : 'Capa atualizada com sucesso.');
    setError(null);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title="Aparencia do salao" eyebrow="Identidade visual">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <UploadField
            accept="image/jpeg,image/png,image/webp"
            disabled={dataSource !== 'supabase'}
            label="Logo do salao"
            assetType="logo"
            onUploaded={(url) => void handleAssetUploaded('logo', url)}
          />
          <UploadField
            accept="image/jpeg,image/png,image/webp"
            disabled={dataSource !== 'supabase'}
            label="Capa do salao"
            assetType="cover"
            onUploaded={(url) => void handleAssetUploaded('cover', url)}
          />
          {dataSource !== 'supabase' ? <EmptyState message="Uploads ficam disponiveis quando o painel esta no modo online." /> : null}
          <SelectField
            label="Tema"
            value={form.themeMode}
            onChange={(value) => setForm((current) => ({ ...current, themeMode: value === 'dark' ? 'dark' : 'light' }))}
            options={[
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
            ]}
          />
          <label className="block">
            <span className="mb-2 block text-sm font-black text-[color:var(--bc-text)]">Cor principal</span>
            <div className="grid gap-3 sm:grid-cols-[64px_1fr]">
              <input
                type="color"
                value={isValidHexColor(form.primaryColor) ? form.primaryColor : '#7C3AED'}
                onChange={(event) => setForm((current) => ({ ...current, primaryColor: event.target.value.toUpperCase() }))}
                className="h-11 w-full rounded-lg border border-[rgba(120,84,162,0.16)] bg-white p-1"
              />
              <input
                value={form.primaryColor}
                onChange={(event) => setForm((current) => ({ ...current, primaryColor: event.target.value.toUpperCase() }))}
                className="h-11 rounded-lg border border-[rgba(120,84,162,0.16)] bg-white px-3 text-sm font-semibold text-[color:var(--bc-text)] outline-none transition focus:border-[#7854a2] focus:ring-4 focus:ring-[rgba(120,84,162,0.12)]"
                placeholder="#7C3AED"
              />
            </div>
          </label>
          {message ? <SuccessState message={message} /> : null}
          {error || lastSyncError ? <EmptyState message={error ?? lastSyncError ?? ''} /> : null}
          <button type="submit" className="bc-admin-primary-button">
            Salvar aparencia
          </button>
        </form>
      </Panel>

      <Panel title="Preview para cliente" eyebrow={data.salon.name || 'Salao'}>
        <div
          className={[
            'overflow-hidden rounded-lg border shadow-[0_18px_42px_rgba(110,84,144,0.08)]',
            isDark ? 'border-white/10 bg-[#171321] text-white' : 'border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-text)]',
          ].join(' ')}
        >
          <div className="relative h-44 bg-[linear-gradient(135deg,#f7eefc,#fff0cf)]">
            {form.coverUrl ? <img src={form.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/42 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-end gap-3">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-white text-lg font-black text-[#6e4c98] shadow-lg">
                {form.logoUrl ? <img src={form.logoUrl} alt="" className="h-full w-full object-cover" /> : getInitials(data.salon.name)}
              </span>
              <div>
                <h3 className="text-2xl font-black text-white">{data.salon.name || 'Seu salao'}</h3>
                <p className="text-sm font-semibold text-white/82">Beleza | Agendamento online</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5">
            <p className={isDark ? 'text-sm leading-7 text-white/72' : 'text-sm leading-7 text-[color:var(--bc-muted)]'}>
              Seus clientes veem logo, capa, tema e cor principal nos destaques do agendamento.
            </p>
            <button
              type="button"
              className="h-11 rounded-lg px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)]"
              style={{ backgroundColor: isValidHexColor(form.primaryColor) ? form.primaryColor : '#7C3AED' }}
            >
              Agendar
            </button>
          </div>
        </div>
      </Panel>
    </section>
  );
}

function ServicesManager() {
  const { data, actions } = usePlatformData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceInput>(emptyServiceForm);
  const [feedback, setFeedback] = useState<string | null>(null);

  function resetForm() {
    setEditingId(null);
    setForm(emptyServiceForm);
  }

  function handleProfessionalToggle(professionalId: string) {
    setForm((current) => ({
      ...current,
      professionalIds: current.professionalIds.includes(professionalId)
        ? current.professionalIds.filter((item) => item !== professionalId)
        : [...current.professionalIds, professionalId],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      actions.updateService(editingId, form);
      setFeedback('Serviço atualizado com sucesso.');
    } else {
      actions.createService(form);
      setFeedback('Serviço cadastrado com sucesso.');
    }

    resetForm();
  }

  async function handleDeleteService(serviceId: string) {
    setFeedback(null);
    const result = await actions.deleteService(serviceId);

    setFeedback(result.message);

    if (result.ok && editingId === serviceId) {
      resetForm();
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title={editingId ? 'Editar servico' : 'Novo servico'} eyebrow="Catalogo">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label="Nome" value={form.name} required onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <Field label="Categoria" value={form.category} required onChange={(value) => setForm((current) => ({ ...current, category: value }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Duracao (min)"
              type="number"
              value={String(form.durationMinutes)}
              required
              onChange={(value) => setForm((current) => ({ ...current, durationMinutes: Math.max(5, Number(value) || 0) }))}
            />
            <Field
              label="Preco base (R$)"
              type="number"
              step="0.01"
              value={centsToInputValue(form.priceCents)}
              required
              onChange={(value) => setForm((current) => ({ ...current, priceCents: parseMoneyToCents(value) }))}
            />
          </div>
          <SelectField
            label="Status"
            value={form.active ? 'active' : 'inactive'}
            onChange={(value) => setForm((current) => ({ ...current, active: value === 'active' }))}
            options={[
              { value: 'active', label: 'Ativo' },
              { value: 'inactive', label: 'Inativo' },
            ]}
          />
          <div>
            <span className="mb-2 block text-sm font-black text-[color:var(--bc-text)]">Profissionais habilitados</span>
            <div className="grid gap-2">
              {data.professionals.map((professional) => (
                <label
                  key={professional.id}
                  className="flex items-center gap-3 rounded-lg border border-[rgba(120,84,162,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--bc-muted)]"
                >
                  <input
                    type="checkbox"
                    checked={form.professionalIds.includes(professional.id)}
                    onChange={() => handleProfessionalToggle(professional.id)}
                    className="h-4 w-4 accent-[#7854a2]"
                  />
                  {professional.name}
                </label>
              ))}
              {data.professionals.length === 0 ? <EmptyState message="Cadastre profissionais antes de especializar servicos." /> : null}
            </div>
          </div>
          <TextArea label="Observacoes" value={form.notes ?? ''} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
          <FormActions isEditing={Boolean(editingId)} onCancel={resetForm} />
        </form>
      </Panel>

      <Panel title="Servicos cadastrados" eyebrow={`${data.services.length} registros`}>
        {feedback ? <p className="mb-3 rounded-lg bg-[rgba(120,84,162,0.08)] px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)]">{feedback}</p> : null}
        {data.services.length > 0 ? (
          <div className="grid gap-3">
            {data.services.map((service) => {
              const enabledProfessionals = data.professionals
                .filter((professional) => service.professionalIds.includes(professional.id))
                .map((professional) => professional.name);

              return (
                <RecordCard
                  key={service.id}
                  title={service.name}
                  subtitle={`${service.category} | ${service.durationMinutes} min | ${formatCurrency(service.priceCents)} | ${
                    service.active ? 'ativo' : 'inativo'
                  }`}
                  body={`Profissionais: ${enabledProfessionals.join(', ') || 'todos/nao especificado'}${
                    service.notes ? ` | ${service.notes}` : ''
                  }`}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(service.id);
                          setForm({
                            name: service.name,
                            category: service.category,
                            durationMinutes: service.durationMinutes,
                            priceCents: service.priceCents,
                            active: service.active,
                            professionalIds: service.professionalIds,
                            notes: service.notes ?? '',
                          });
                        }}
                        className="bc-admin-secondary-button"
                      >
                        Editar
                      </button>
                      <button type="button" onClick={() => void handleDeleteService(service.id)} className="bc-admin-secondary-button">
                        Excluir
                      </button>
                    </div>
                  }
                />
              );
            })}
          </div>
        ) : (
          <EmptyState message="Nenhum servico cadastrado ainda." />
        )}
      </Panel>
    </section>
  );
}

function FinanceManager() {
  return <FinanceiroPage />;
}

type EnrichedAppointment = AppointmentRecord & {
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  professionalName: string;
  serviceName: string;
  servicePriceCents: number;
  accountClosure?: AccountClosureRecord;
  attendanceRecord?: AttendanceRecord;
  charge?: ChargeRecord;
  payments: PaymentRecord[];
};

function getEnrichedAppointments(data: PlatformDataSnapshot): EnrichedAppointment[] {
  return data.appointments
    .map((appointment) => {
      const client = data.clients.find((item) => item.id === appointment.clientId);
      const professional = data.professionals.find((item) => item.id === appointment.professionalId);
      const service = data.services.find((item) => item.id === appointment.serviceId);
      const attendanceRecord = data.attendanceRecords.find((item) => item.appointmentId === appointment.id);
      const accountClosure = data.accountClosures.find((item) => item.appointmentId === appointment.id);
      const charge = data.charges.find((item) => item.accountClosureId === accountClosure?.id || item.appointmentId === appointment.id);
      const payments = data.payments.filter((item) => item.accountClosureId === accountClosure?.id || item.appointmentId === appointment.id);

      return {
        ...appointment,
        clientEmail: client?.email ?? '',
        clientName: client?.name ?? 'Cliente removido',
        clientPhone: client?.phone ?? '',
        professionalName: professional?.name ?? 'Profissional removido',
        serviceName: service?.name ?? 'Servico removido',
        servicePriceCents: service?.priceCents ?? 0,
        accountClosure,
        attendanceRecord,
        charge,
        payments,
      };
    })
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());
}

function isVisibleClient(client: ClientRecord) {
  return !client.archivedAt && !client.deletedAt;
}

function getClientInsights(data: PlatformDataSnapshot, clientId: string) {
  const appointments = getEnrichedAppointments(data)
    .filter((appointment) => appointment.clientId === clientId)
    .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime());
  const paidClosureIds = new Set(
    data.payments.filter((payment) => payment.clientId === clientId && payment.status === 'paid').map((payment) => payment.accountClosureId),
  );
  const totalSpentCents = data.accountClosures
    .filter((closure) => closure.clientId === clientId && (closure.status === 'paid' || paidClosureIds.has(closure.id)))
    .reduce((total, closure) => total + closure.finalAmountCents, 0);
  const lastVisit = appointments.find((appointment) => appointment.status === 'completed')?.startsAt;

  return {
    totalSpentCents,
    lastVisit,
    lastStatuses: appointments.slice(0, 3).map((appointment) => getStatusLabel(appointment.status)),
  };
}

function getChargeSummaries(charges: ChargeRecord[]) {
  const statuses: ChargeRecord['status'][] = ['draft', 'pending', 'paid', 'cancelled'];

  return statuses.map((status) => ({
    status,
    count: charges.filter((charge) => charge.status === status).length,
  }));
}

function createAdminHistoryFilters(): AdminHistoryFilters {
  const today = new Date();
  const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    clientQuery: '',
    period: '30d',
    professionalId: 'all',
    serviceId: 'all',
    startDate: formatDateKey(startDate),
    endDate: formatDateKey(today),
    status: 'all',
  };
}

function getUpcomingAdminAppointments(appointments: EnrichedAppointment[]) {
  const now = Date.now();
  const visibleStatuses: AppointmentStatus[] = ['requested', 'scheduled', 'confirmed', 'inService'];

  return appointments
    .filter((appointment) => visibleStatuses.includes(appointment.status) && new Date(appointment.startsAt).getTime() >= now)
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());
}

function groupAppointmentsByDay(appointments: EnrichedAppointment[]) {
  const groups = new Map<string, EnrichedAppointment[]>();

  for (const appointment of appointments) {
    const date = appointment.startsAt.slice(0, 10);
    groups.set(date, [...(groups.get(date) ?? []), appointment]);
  }

  return [...groups.entries()].map(([date, groupedAppointments]) => ({
    date,
    appointments: groupedAppointments,
  }));
}

function getFilteredHistoryAppointments(appointments: EnrichedAppointment[], filters: AdminHistoryFilters) {
  const period = getAdminHistoryPeriod(filters);
  const query = filters.clientQuery.trim().toLowerCase();

  return appointments
    .filter((appointment) => isHistoricalAppointment(appointment))
    .filter((appointment) => filters.status === 'all' || appointment.status === filters.status)
    .filter((appointment) => filters.professionalId === 'all' || appointment.professionalId === filters.professionalId)
    .filter((appointment) => filters.serviceId === 'all' || appointment.serviceId === filters.serviceId)
    .filter((appointment) => {
      const time = new Date(appointment.startsAt).getTime();

      return time >= period.start.getTime() && time <= period.end.getTime();
    })
    .filter((appointment) => {
      if (!query) {
        return true;
      }

      return [appointment.clientName, appointment.clientPhone, appointment.clientEmail].some((value) => value.toLowerCase().includes(query));
    })
    .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime());
}

function getAdminHistoryPeriod(filters: AdminHistoryFilters) {
  const now = new Date();

  if (filters.period === 'today') {
    return {
      start: new Date(`${formatDateKey(now)}T00:00:00`),
      end: new Date(`${formatDateKey(now)}T23:59:59`),
    };
  }

  if (filters.period === '7d' || filters.period === '30d') {
    const days = filters.period === '7d' ? 7 : 30;

    return {
      start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
      end: new Date(`${formatDateKey(now)}T23:59:59`),
    };
  }

  return {
    start: new Date(`${filters.startDate || formatDateKey(now)}T00:00:00`),
    end: new Date(`${filters.endDate || formatDateKey(now)}T23:59:59`),
  };
}

function isHistoricalAppointment(appointment: EnrichedAppointment) {
  const historicalStatuses: AppointmentStatus[] = ['completed', 'cancelled', 'rejected', 'noShow'];
  const isPast = new Date(appointment.startsAt).getTime() < Date.now();

  return historicalStatuses.includes(appointment.status) || (appointment.status === 'confirmed' && isPast);
}

function getDefaultSelectedAppointmentId(data: PlatformDataSnapshot) {
  return data.accountClosures[0]?.appointmentId ?? data.appointments[0]?.id ?? null;
}

function createSalonSettingsForm(salon: SalonRecord): SalonSettingsFormState {
  return {
    clientCancellationLeadHours: String(salon.settings.clientCancellationLeadHours),
  };
}

function getBookingPublicationStatus(data: PlatformDataSnapshot) {
  const hasActiveProfessionalWithSchedule = data.professionals.some((professional) => {
    const schedule = normalizeProfessionalSchedule(professional.schedule);

    return professional.active && isUuid(professional.id) && schedule.active && schedule.weekdays.length > 0 && schedule.startTime < schedule.endTime;
  });
  const activeProfessionalsCount = data.publicBookingDiagnostics?.activeProfessionalsCount ?? data.professionals.filter((professional) => professional.active).length;
  const activeEmployeesCount = data.publicBookingDiagnostics?.activeEmployeesCount ?? (hasActiveProfessionalWithSchedule ? 1 : 0);
  const activeWorkingHoursCount = data.publicBookingDiagnostics?.activeWorkingHoursCount ?? (hasActiveProfessionalWithSchedule ? 1 : 0);
  const activeServicesCount = data.publicBookingDiagnostics?.activeServicesCount ?? data.services.filter((service) => service.active).length;
  const hasActiveEmployees = activeEmployeesCount > 0;
  const hasActiveWorkingHours = activeWorkingHoursCount > 0;
  const isPublished = data.salon.isPublic && activeProfessionalsCount > 0 && hasActiveEmployees && hasActiveWorkingHours && activeServicesCount > 0;

  return {
    isPublished,
    items: [
      { label: `Salao atual: ${data.salon.name} (${data.salon.id})`, ok: true },
      { label: 'Salao publicado para clientes', ok: data.salon.isPublic },
      { label: `Professionals ativos no salon_id atual: ${activeProfessionalsCount}`, ok: activeProfessionalsCount > 0 },
      { label: `Employees ativos no salon_id atual: ${activeEmployeesCount}`, ok: hasActiveEmployees },
      { label: `Working_hours ativos no salon_id atual: ${activeWorkingHoursCount}`, ok: hasActiveWorkingHours },
      { label: `Services ativos no salon_id atual: ${activeServicesCount}`, ok: activeServicesCount > 0 },
      { label: 'Agenda ativa no cadastro do profissional', ok: hasActiveProfessionalWithSchedule || hasActiveWorkingHours },
    ],
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function createOperationalCalendarFilters(data: PlatformDataSnapshot): OperationalCalendarFilters {
  const professionalId = data.professionals[0]?.id ?? '';
  const serviceId =
    data.services.find((service) => service.active && isServiceAvailableForProfessional(service.professionalIds, professionalId))?.id ?? '';
  const now = new Date();

  return {
    date: `${now.getFullYear()}-${padDate(now.getMonth() + 1)}-${padDate(now.getDate())}`,
    professionalId,
    serviceId,
    status: 'all',
  };
}

function applyOperationalAgendaPreferences(
  current: OperationalCalendarFilters,
  preferences: OperationalAgendaPreferences,
  data: PlatformDataSnapshot,
): OperationalCalendarFilters {
  const professionalId =
    preferences.professionalId && data.professionals.some((professional) => professional.id === preferences.professionalId)
      ? preferences.professionalId
      : current.professionalId;
  const services = data.services.filter(
    (service) => service.active && isServiceAvailableForProfessional(service.professionalIds, professionalId),
  );
  const serviceId = services.some((service) => service.id === current.serviceId) ? current.serviceId : services[0]?.id ?? '';

  return {
    ...current,
    professionalId,
    serviceId,
    status: preferences.status,
  };
}

function readOperationalAgendaPreferences(): OperationalAgendaPreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawPreferences = window.localStorage.getItem(operationalAgendaPreferencesStorageKey);

    if (!rawPreferences) {
      return null;
    }

    const preferences = JSON.parse(rawPreferences) as unknown;

    if (!isObjectRecord(preferences)) {
      return null;
    }

    return {
      hideFreeSlots: preferences.hideFreeSlots === true,
      professionalId: typeof preferences.professionalId === 'string' ? preferences.professionalId : '',
      status: isCalendarStatusFilter(preferences.status) ? preferences.status : 'all',
    };
  } catch {
    return null;
  }
}

function writeOperationalAgendaPreferences(preferences: OperationalAgendaPreferences) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(operationalAgendaPreferencesStorageKey, JSON.stringify(preferences));
  } catch {
    // If browser storage is blocked, keep the session-only filters working.
  }
}

function isCalendarStatusFilter(value: unknown): value is CalendarStatusFilter {
  return value === 'all' || appointmentStatuses.some((status) => status.id === value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function createOperationalCalendarModel(
  data: PlatformDataSnapshot,
  appointments: EnrichedAppointment[],
  filters: OperationalCalendarFilters,
): OperationalCalendarModel {
  const professional = data.professionals.find((item) => item.id === filters.professionalId);
  const service = data.services.find((item) => item.id === filters.serviceId);
  const context = getAvailabilityScheduleContext(data, filters.professionalId, filters.date);
  const exceptions = context?.dayExceptions ?? (filters.professionalId && filters.date ? getProfessionalDayExceptions(data, filters.professionalId, filters.date) : []);
  const freeSlots = service
    ? getAvailabilitySlots(data, {
        date: filters.date,
        professionalId: filters.professionalId,
        serviceId: service.id,
        status: 'scheduled',
      })
    : [];
  const dayAppointments = appointments.filter(
    (appointment) => appointment.professionalId === filters.professionalId && toDateTimeControls(appointment.startsAt).date === filters.date,
  );
  const visibleAppointments =
    filters.status === 'all' ? dayAppointments : dayAppointments.filter((appointment) => appointment.status === filters.status);
  const entries: OperationalCalendarEntry[] = [];
  const weekSummary = createOperationalWeekSummary(data, appointments, filters);

  for (const exception of exceptions.filter((item) => item.type === 'dayOff')) {
    entries.push({
      body: exception.reason ? `Motivo: ${exception.reason}` : 'Folga cadastrada para o dia inteiro.',
      id: `day-off-${exception.id}`,
      kind: 'dayOff',
      label: 'Folga',
      minute: 0,
      time: 'Dia inteiro',
      title: 'Profissional indisponivel nesta data',
    });
  }

  if (context?.specialHours) {
    entries.push({
      body: context.specialHours.reason ? `Motivo: ${context.specialHours.reason}` : 'Jornada regular substituida nesta data.',
      id: `special-${context.specialHours.id}`,
      kind: 'specialHours',
      label: 'Horario especial',
      minute: context.startMinute ?? parseClockToMinutes(context.specialHours.startTime) ?? 0,
      time: `${context.specialHours.startTime}-${context.specialHours.endTime}`,
      title: 'Horario especial aplicado',
    });
  }

  if (
    context &&
    context.breakStartMinute !== null &&
    context.breakEndMinute !== null &&
    context.breakEndMinute > context.breakStartMinute
  ) {
    entries.push({
      body: 'Pausa da jornada regular do profissional.',
      id: `pause-${filters.professionalId}-${filters.date}`,
      kind: 'pause',
      label: 'Pausa',
      minute: context.breakStartMinute,
      time: `${formatMinutesAsClock(context.breakStartMinute)}-${formatMinutesAsClock(context.breakEndMinute)}`,
      title: 'Pausa da agenda',
    });
  }

  for (const block of context?.manualBlocks ?? []) {
    entries.push({
      body: block.exception.reason ? `Motivo: ${block.exception.reason}` : 'Bloqueio operacional nesta data.',
      id: `manual-block-${block.exception.id}`,
      kind: 'manualBlock',
      label: 'Bloqueio manual',
      minute: block.startMinute,
      time: `${formatMinutesAsClock(block.startMinute)}-${formatMinutesAsClock(block.endMinute)}`,
      title: 'Horario bloqueado',
    });
  }

  for (const appointment of visibleAppointments) {
    const controls = toDateTimeControls(appointment.startsAt);

    entries.push({
      appointment,
      body: `${appointment.clientName} | ${appointment.serviceName} | ${getStatusLabel(appointment.status)}${
        appointment.notes ? ` | ${appointment.notes}` : ''
      }`,
      id: `appointment-${appointment.id}`,
      kind: 'appointment',
      label: getOperationalAppointmentStateLabel(appointment.status),
      minute: parseClockToMinutes(controls.time) ?? 0,
      status: appointment.status,
      time: `${controls.time}-${toDateTimeControls(appointment.endsAt).time}`,
      title: appointment.clientName,
    });
  }

  for (const slot of freeSlots) {
    entries.push({
      body: service ? `Disponivel para ${service.name} (${service.durationMinutes} min).` : 'Horario disponivel.',
      id: `free-${slot.startsAt}`,
      kind: 'free',
      label: 'Horario livre',
      minute: parseClockToMinutes(slot.time) ?? 0,
      slot,
      time: slot.label,
      title: 'Slot livre',
    });
  }

  return {
    entries: entries.sort((left, right) => left.minute - right.minute || getCalendarSortWeight(left.kind) - getCalendarSortWeight(right.kind)),
    exceptions,
    freeSlots,
    professionalName: professional?.name ?? 'Profissional nao selecionado',
    scheduleSummary: getOperationalScheduleSummary(context),
    serviceName: service?.name ?? 'Sem servico para slots',
    stateMessage: getOperationalCalendarStateMessage(context, service, filters),
    weekRangeLabel: `${formatDateOnly(weekSummary[0]?.date ?? filters.date)} a ${formatDateOnly(weekSummary.at(-1)?.date ?? filters.date)}`,
    weekSummary,
  };
}

function createOperationalWeekSummary(
  data: PlatformDataSnapshot,
  appointments: EnrichedAppointment[],
  filters: OperationalCalendarFilters,
): OperationalWeekSummaryDay[] {
  const weekStart = getWeekStartDate(filters.date);

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + index);
    const date = formatDateKey(currentDate);
    const dayAppointments = appointments.filter(
      (appointment) => appointment.professionalId === filters.professionalId && toDateTimeControls(appointment.startsAt).date === date,
    );
    const exceptions = getProfessionalDayExceptions(data, filters.professionalId, date);
    const pendingCount = dayAppointments.filter(hasOperationalPending).length;
    const hasException = exceptions.length > 0;

    return {
      appointmentsCount: dayAppointments.length,
      cancelledOrNoShowCount: dayAppointments.filter((appointment) => appointment.status === 'cancelled' || appointment.status === 'noShow').length,
      completedCount: dayAppointments.filter((appointment) => appointment.status === 'completed').length,
      date,
      exceptionCount: exceptions.length,
      hasException,
      hasDayOff: exceptions.some((exception) => exception.type === 'dayOff'),
      hasManualBlock: exceptions.some((exception) => exception.type === 'manualBlock'),
      hasMovement: dayAppointments.length > 0 || hasException,
      hasPending: pendingCount > 0,
      hasSpecialHours: exceptions.some((exception) => exception.type === 'specialHours'),
      isSelected: date === filters.date,
      label: `${weekdayLabels[currentDate.getDay() as Weekday].label} ${padDate(currentDate.getDate())}/${padDate(currentDate.getMonth() + 1)}`,
      pendingCount,
    };
  });
}

function createAppointmentForm(data: PlatformDataSnapshot): AppointmentFormState {
  const now = new Date();
  const client = data.clients.find(isVisibleClient);
  const professionalId = data.professionals[0]?.id ?? '';
  const serviceId =
    data.services.find((service) => service.active && isServiceAvailableForProfessional(service.professionalIds, professionalId))?.id ??
    data.services.find((service) => service.active)?.id ??
    '';

  return {
    clientId: client?.id ?? '',
    professionalId,
    serviceId,
    date: `${now.getFullYear()}-${padDate(now.getMonth() + 1)}-${padDate(now.getDate())}`,
    time: '09:00',
    status: 'scheduled',
    notes: '',
  };
}

function createClientAppointmentForm(data: PlatformDataSnapshot, clientId?: string): AppointmentFormState {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const service = data.services.find((item) => item.active);
  const professional = service ? getProfessionalsForService(data, service.id)[0] : undefined;

  return {
    clientId: clientId ?? '',
    professionalId: professional?.id ?? '',
    serviceId: service?.id ?? '',
    date: `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`,
    time: '10:00',
    status: 'requested',
    notes: '',
  };
}

function createScheduleExceptionForm(data: PlatformDataSnapshot, professionalId?: string): ScheduleExceptionFormState {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return {
    professionalId: professionalId ?? data.professionals[0]?.id ?? '',
    date: `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`,
    type: 'dayOff',
    startTime: '',
    endTime: '',
    reason: '',
  };
}

function createClosureForm(closure?: AccountClosureRecord): ClosureFormState {
  return {
    discountAmount: centsToInputValue(closure?.discountCents ?? 0),
    additionAmount: centsToInputValue(closure?.additionCents ?? 0),
    status: closure?.status ?? 'open',
    notes: closure?.notes ?? '',
  };
}

function createPaymentForm(closure?: AccountClosureRecord): PaymentFormState {
  return {
    amount: centsToInputValue(closure?.finalAmountCents ?? 0),
    method: 'pix',
    status: 'paid',
  };
}

function toDateTimeControls(value: string) {
  const date = new Date(value);

  return {
    date: formatDateKey(date),
    time: `${padDate(date.getHours())}:${padDate(date.getMinutes())}`,
  };
}

function fromDateTimeControls(date: string, time: string) {
  return new Date(`${date}T${time || '09:00'}:00`).toISOString();
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;
}

function parseDateKey(date: string) {
  return new Date(`${date}T00:00:00`);
}

function addDaysToDateKey(date: string, days: number) {
  const next = parseDateKey(date);
  next.setDate(next.getDate() + days);

  return formatDateKey(next);
}

function todayDateKey() {
  return formatDateKey(new Date());
}

function getWeekStartDate(date: string) {
  const selectedDate = parseDateKey(date);
  const daysSinceMonday = (selectedDate.getDay() + 6) % 7;
  selectedDate.setDate(selectedDate.getDate() - daysSinceMonday);

  return selectedDate;
}

function padDate(value: number) {
  return String(value).padStart(2, '0');
}

function centsToInputValue(value: number) {
  return (value / 100).toFixed(2);
}

function parseMoneyToCents(value: string) {
  const normalized = Number(value.replace(',', '.'));

  if (Number.isNaN(normalized)) {
    return 0;
  }

  return Math.max(0, Math.round(normalized * 100));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(value / 100);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(`${value}T00:00:00`));
}

function isUpcomingAppointment(appointment: AppointmentRecord) {
  return new Date(appointment.startsAt).getTime() >= Date.now();
}

function isSameDay(value: string, date: Date) {
  const current = new Date(value);

  return (
    current.getFullYear() === date.getFullYear() &&
    current.getMonth() === date.getMonth() &&
    current.getDate() === date.getDate()
  );
}

function isServiceAvailableForProfessional(professionalIds: string[], professionalId: string) {
  return professionalIds.length === 0 || professionalIds.includes(professionalId);
}

function getProfessionalsForService(data: PlatformDataSnapshot, serviceId: string) {
  const service = data.services.find((item) => item.id === serviceId);

  if (!service?.active) {
    return [];
  }

  return data.professionals.filter(
    (professional) => professional.active && isServiceAvailableForProfessional(service.professionalIds, professional.id),
  );
}

function formatProfessionalSchedule(schedule: ProfessionalSchedule) {
  const normalized = normalizeProfessionalSchedule(schedule);
  const days = weekdayLabels
    .filter((weekday) => normalized.weekdays.includes(weekday.id))
    .map((weekday) => weekday.label)
    .join(', ');
  const pause =
    normalized.breakStartTime && normalized.breakEndTime ? ` | Pausa ${normalized.breakStartTime}-${normalized.breakEndTime}` : '';

  return `${normalized.active ? 'agenda ativa' : 'agenda inativa'} | ${days || 'sem dias'} | ${normalized.startTime}-${normalized.endTime}${pause}`;
}

function getOperationalScheduleSummary(context: ReturnType<typeof getAvailabilityScheduleContext>) {
  if (!context) {
    return 'Sem jornada ativa para esta selecao';
  }

  if (context.hasDayOff) {
    return 'Folga cadastrada para a data';
  }

  const base = context.specialHours
    ? `Horario especial ${context.schedule.startTime}-${context.schedule.endTime}`
    : `${context.schedule.active ? 'Jornada regular' : 'Agenda inativa'} ${context.schedule.startTime}-${context.schedule.endTime}`;
  const pause =
    context.breakStartMinute !== null && context.breakEndMinute !== null
      ? ` | Pausa ${formatMinutesAsClock(context.breakStartMinute)}-${formatMinutesAsClock(context.breakEndMinute)}`
      : '';

  if (!context.isWorkingDay) {
    return `${base} | sem atendimento neste dia`;
  }

  return `${base}${pause}`;
}

function getOperationalCalendarStateMessage(
  context: ReturnType<typeof getAvailabilityScheduleContext>,
  service: { id: string } | undefined,
  filters: OperationalCalendarFilters,
) {
  if (!filters.professionalId) {
    return 'Escolha um profissional para visualizar a agenda operacional.';
  }

  if (!service) {
    return 'Escolha ou cadastre um servico ativo para visualizar slots livres.';
  }

  if (!context) {
    return 'Profissional sem jornada ativa para esta data.';
  }

  if (context.hasDayOff) {
    return 'Profissional indisponivel nesta data.';
  }

  if (!context.isWorkingDay) {
    return 'Dia sem atendimento configurado para este profissional.';
  }

  if (filters.status !== 'all') {
    return 'Nenhum agendamento encontrado para este status; os slots livres seguem visiveis quando houver disponibilidade.';
  }

  return 'Nenhum item operacional para esta data.';
}

function getOperationalAppointmentStateLabel(status: AppointmentStatus) {
  if (status === 'inService') {
    return 'Em atendimento';
  }

  if (status === 'completed') {
    return 'Concluido';
  }

  if (status === 'cancelled') {
    return 'Cancelado';
  }

  if (status === 'rejected') {
    return 'Recusado';
  }

  if (status === 'noShow') {
    return 'Faltou';
  }

  return 'Agendado';
}

function getVisibleWeekSummary(days: OperationalWeekSummaryDay[], filters: OperationalWeekSummaryFilters) {
  return days.filter((day) => (!filters.exceptionsOnly || day.hasException) && (!filters.pendingOnly || day.hasPending));
}

function getVisibleOperationalEntries(entries: OperationalCalendarEntry[], hideFreeSlots: boolean) {
  return hideFreeSlots ? entries.filter((entry) => entry.kind !== 'free') : entries;
}

function getOperationalSlotPrefillHighlights(form: AppointmentFormState, context: OperationalSlotPrefillContext | null) {
  return {
    date: context?.date === form.date,
    professional: context?.professionalId === form.professionalId,
    service: context?.serviceId === form.serviceId,
    time: context?.time === form.time,
  };
}

function isOperationalSlotPrefillActive(
  form: AppointmentFormState,
  context: OperationalSlotPrefillContext | null,
): context is OperationalSlotPrefillContext {
  return Boolean(
    context &&
      context.date === form.date &&
      context.professionalId === form.professionalId &&
      context.serviceId === form.serviceId &&
      context.time === form.time,
  );
}

function createOperationalSlotPrefillSummary(data: PlatformDataSnapshot, context: OperationalSlotPrefillContext) {
  const professionalName = data.professionals.find((professional) => professional.id === context.professionalId)?.name ?? 'Profissional';
  const serviceName = data.services.find((service) => service.id === context.serviceId)?.name ?? 'Servico';

  return `${professionalName} | ${serviceName} | ${formatDateOnly(context.date)} | ${context.slotLabel}`;
}

function getOperationalPrefillFieldClass(isHighlighted: boolean) {
  return [
    'rounded-lg border p-2 transition',
    isHighlighted ? 'border-[#7854a2] bg-[rgba(120,84,162,0.08)] shadow-[0_0_0_4px_rgba(120,84,162,0.08)]' : 'border-transparent',
  ].join(' ');
}

function hasOperationalPending(appointment: EnrichedAppointment) {
  const needsAttentionStatuses: AppointmentStatus[] = ['requested', 'confirmed', 'checkedIn', 'inService'];

  if (needsAttentionStatuses.includes(appointment.status)) {
    return true;
  }

  if (appointment.accountClosure && ['open', 'review', 'closed'].includes(appointment.accountClosure.status)) {
    return true;
  }

  if (appointment.charge && ['draft', 'pending', 'overdue'].includes(appointment.charge.status)) {
    return true;
  }

  return appointment.payments.some((payment) => payment.status === 'pending');
}

function formatWeekSummaryExceptionLabel(day: OperationalWeekSummaryDay) {
  if (day.hasDayOff) {
    return 'Folga';
  }

  const labels = [
    day.hasManualBlock ? 'bloqueio' : '',
    day.hasSpecialHours ? 'horario especial' : '',
  ].filter(Boolean);

  if (labels.length > 0) {
    return labels.join(' + ');
  }

  return day.exceptionCount > 0 ? `${day.exceptionCount} excecoes` : 'sem excecoes';
}

function formatWeekSummaryMovementLabel(day: OperationalWeekSummaryDay) {
  if (day.hasPending) {
    return 'com pendencia';
  }

  if (!day.hasMovement) {
    return 'sem movimento';
  }

  if (day.hasException) {
    return 'com excecao';
  }

  return 'movimento normal';
}

function getQuickFilterButtonClass(isActive: boolean) {
  return [
    'rounded-lg border px-4 py-2 text-xs font-black transition',
    isActive
      ? 'border-[#7854a2] bg-[#7854a2] text-white shadow-[0_0_0_4px_rgba(120,84,162,0.12)]'
      : 'border-[rgba(120,84,162,0.16)] bg-white text-[color:var(--bc-text)] hover:border-[#7854a2]',
  ].join(' ');
}

function getWeekSummaryCardClass(day: OperationalWeekSummaryDay) {
  const base = 'min-h-32 rounded-lg border p-3 text-left transition';
  const emphasis = day.hasPending
    ? 'border-[#b9843c] bg-[#fff7e8]'
    : day.hasException
      ? 'border-[#9468b7] bg-[#faf6fd]'
      : day.hasMovement
        ? 'border-[#9bd0ab] bg-[#f4fbf6]'
        : 'border-[rgba(120,84,162,0.12)] bg-white';
  const selected = day.isSelected ? 'shadow-[0_0_0_4px_rgba(120,84,162,0.12)] ring-1 ring-[#7854a2]' : 'hover:border-[#7854a2]';

  return `${base} ${emphasis} ${selected}`;
}

function getCalendarSortWeight(kind: OperationalCalendarEntryKind) {
  const weights: Record<OperationalCalendarEntryKind, number> = {
    dayOff: 0,
    specialHours: 1,
    pause: 2,
    manualBlock: 3,
    appointment: 4,
    free: 5,
  };

  return weights[kind];
}

function getCalendarEntryStyle(state: OperationalCalendarEntryKind | AppointmentStatus) {
  if (state === 'free') {
    return {
      badge: 'border-[#4b8a61] bg-[#e8f6ed] text-[#2f6b45]',
      card: 'border-[#9bd0ab] bg-[#f4fbf6]',
    };
  }

  if (state === 'inService') {
    return {
      badge: 'border-[#4f74ba] bg-[#e9f0ff] text-[#2f5295]',
      card: 'border-[#a8bde7] bg-[#f4f7ff]',
    };
  }

  if (state === 'completed') {
    return {
      badge: 'border-[#558f87] bg-[#e8f5f3] text-[#326c65]',
      card: 'border-[#a5d3cd] bg-[#f3fbfa]',
    };
  }

  if (state === 'cancelled' || state === 'noShow' || state === 'rejected') {
    return {
      badge: 'border-[#bd5c54] bg-[#fff0ee] text-[#8f352f]',
      card: 'border-[#e2aaa4] bg-[#fff8f7]',
    };
  }

  if (state === 'dayOff') {
    return {
      badge: 'border-[#9468b7] bg-[#f4ecfb] text-[#653b88]',
      card: 'border-[#cdb1df] bg-[#faf6fd]',
    };
  }

  if (state === 'manualBlock') {
    return {
      badge: 'border-[#b9843c] bg-[#fff4df] text-[#81551d]',
      card: 'border-[#e1bf82] bg-[#fffaf0]',
    };
  }

  if (state === 'specialHours') {
    return {
      badge: 'border-[#438496] bg-[#e8f6f9] text-[#2d6574]',
      card: 'border-[#9ecbd5] bg-[#f3fbfd]',
    };
  }

  if (state === 'pause') {
    return {
      badge: 'border-[#858b94] bg-[#f1f3f5] text-[#565d66]',
      card: 'border-[#c8ccd2] bg-[#fafafa]',
    };
  }

  return {
    badge: 'border-[#7854a2] bg-[rgba(120,84,162,0.08)] text-[#5e3d82]',
    card: 'border-[rgba(120,84,162,0.18)] bg-[rgba(120,84,162,0.04)]',
  };
}

function parseClockToMinutes(value?: string) {
  const [hour, minute] = (value ?? '').split(':').map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function formatMinutesAsClock(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;

  return `${padDate(hour)}:${padDate(minute)}`;
}

function getAvailabilityEmptyMessage(data: PlatformDataSnapshot, form: AppointmentFormState) {
  const professional = data.professionals.find((item) => item.id === form.professionalId);

  if (!professional) {
    return 'Escolha um profissional para ver horarios disponiveis.';
  }

  const schedule = normalizeProfessionalSchedule(professional.schedule);
  const exceptions = form.date ? getProfessionalDayExceptions(data, form.professionalId, form.date) : [];
  const hasSpecialHours = exceptions.some((exception) => exception.type === 'specialHours' && exception.startTime && exception.endTime);

  if (exceptions.some((exception) => exception.type === 'dayOff')) {
    return 'Profissional indisponivel nesta data.';
  }

  if (!schedule.active && !hasSpecialHours) {
    return 'Este profissional esta com a agenda inativa.';
  }

  if (form.date) {
    const weekday = new Date(`${form.date}T00:00:00`).getDay() as Weekday;

    if (!schedule.weekdays.includes(weekday) && !hasSpecialHours) {
      return 'Este profissional nao atende neste dia da semana.';
    }
  }

  if (hasSpecialHours) {
    return 'Horario especial aplicado, mas nao ha horarios livres.';
  }

  if (exceptions.some((exception) => exception.type === 'manualBlock')) {
    return 'Horarios bloqueados nesta data.';
  }

  return 'Nao ha horarios livres para este profissional, servico e data.';
}

function getScheduleExceptionTypeLabel(type: ProfessionalScheduleExceptionType) {
  return scheduleExceptionTypes.find((item) => item.id === type)?.label ?? type;
}

function formatScheduleException(exception: ProfessionalScheduleExceptionRecord) {
  const period =
    exception.type === 'dayOff'
      ? 'Dia inteiro'
      : `${exception.startTime ?? 'inicio'}-${exception.endTime ?? 'fim'}`;
  const reason = exception.reason ? ` | Motivo: ${exception.reason}` : '';

  return `${period}${reason}`;
}

function canStartAttendance(status: AppointmentStatus) {
  return status === 'scheduled' || status === 'confirmed' || status === 'checkedIn';
}

function canClientCancel(status: AppointmentStatus) {
  return status === 'scheduled' || status === 'requested' || status === 'confirmed';
}

function isClientCancellationVisible(appointment: AppointmentRecord) {
  return canClientCancel(appointment.status) && isUpcomingAppointment(appointment);
}

function getClientRescheduleEligibility(appointment: AppointmentRecord, salon: SalonRecord) {
  return getClientCancellationEligibility(appointment, salon);
}

function canClientReschedule(appointment: AppointmentRecord, salon: SalonRecord) {
  const allowedStatuses: AppointmentStatus[] = ['requested', 'scheduled', 'confirmed'];

  return (
    allowedStatuses.includes(appointment.status) &&
    isUpcomingAppointment(appointment) &&
    getClientRescheduleEligibility(appointment, salon).allowed
  );
}

function canClientCancelAppointment(appointment: AppointmentRecord) {
  return isClientCancellationVisible(appointment) && getClientCancellationEligibility(appointment).allowed;
}

function isTerminalAppointment(status: AppointmentStatus) {
  return status === 'completed' || status === 'cancelled' || status === 'rejected' || status === 'noShow';
}

function getStatusLabel(status: AppointmentStatus) {
  return appointmentStatuses.find((item) => item.id === status)?.label ?? status;
}

function getAttendanceStatusLabel(status: AttendanceStatus) {
  return attendanceStatuses.find((item) => item.id === status)?.label ?? status;
}

function getClosureStatusLabel(status: AccountClosureStatus) {
  return closureStatuses.find((item) => item.id === status)?.label ?? status;
}

function getPaymentMethodLabel(method: PaymentMethod) {
  return paymentMethods.find((item) => item.id === method)?.label ?? method;
}

function getPaymentStatusLabel(status: PaymentStatus) {
  return paymentStatuses.find((item) => item.id === status)?.label ?? status;
}

function getChargeStatusLabel(status: ChargeRecord['status']) {
  const labels: Record<ChargeRecord['status'], string> = {
    draft: 'Rascunho',
    pending: 'Pendente',
    paid: 'Pago',
    overdue: 'Vencido',
    refunded: 'Estornado',
    cancelled: 'Cancelado',
  };

  return labels[status];
}

function getChargeOriginLabel(origin: ChargeRecord['origin']) {
  const labels: Record<ChargeRecord['origin'], string> = {
    appointment: 'Atendimento',
    manual: 'Lancamento manual',
    subscription: 'Assinatura',
  };

  return labels[origin];
}

function getProfessionalPermissionLabel(permission: string) {
  const labels: Record<string, string> = {
    finalizar_atendimento: 'Finalizar atendimento',
    iniciar_atendimento: 'Iniciar atendimento',
    ver_agenda_propria: 'Ver agenda propria',
    ver_comissoes: 'Ver comissoes',
  };

  return labels[permission] ?? permission.replaceAll('_', ' ');
}

function createSalonAppearanceForm(salon: SalonRecord): SalonAppearanceFormState {
  return {
    coverUrl: salon.coverUrl ?? '',
    logoUrl: salon.logoUrl ?? '',
    primaryColor: isValidHexColor(salon.primaryColor) ? salon.primaryColor : '#7C3AED',
    themeMode: salon.themeMode === 'dark' ? 'dark' : 'light',
  };
}

function isValidHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BC';
}

function UploadField({
  accept,
  assetType,
  disabled,
  label,
  onUploaded,
  professionalId,
}: {
  accept: string;
  assetType: 'cover' | 'logo' | 'professionalAvatar';
  disabled?: boolean;
  label: string;
  onUploaded: (url: string) => void | Promise<void>;
  professionalId?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file?: File) {
    setError(null);

    if (!file) {
      return;
    }

    const body = new FormData();
    body.set('file', file);
    body.set('assetType', assetType);

    if (professionalId) {
      body.set('professionalId', professionalId);
    }

    setIsUploading(true);
    const response = await fetch('/api/platform/assets', {
      method: 'POST',
      body,
    }).catch(() => null);
    setIsUploading(false);

    if (!response?.ok) {
      const payload = (await response?.json().catch(() => null)) as { message?: string } | null;
      console.error('[platform-assets] Falha ao enviar imagem:', payload);
      setError(
        assetType === 'professionalAvatar'
          ? 'N\u00e3o foi poss\u00edvel atualizar a foto. Tente novamente.'
          : payload?.message ?? 'Nao foi possivel enviar a imagem.',
      );
      return;
    }

    const payload = (await response.json()) as { url: string };
    await onUploaded(payload.url);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-black text-[color:var(--bc-text)]">{label}</span>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[rgba(120,84,162,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)] transition hover:border-[#7854a2]">
        <span className="inline-flex items-center gap-2">
          <ImagePlus size={18} className="text-[#7854a2]" />
          {isUploading ? 'Enviando imagem...' : 'Selecionar imagem'}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled || isUploading}
          onChange={(event) => void handleFileChange(event.target.files?.[0])}
          className="sr-only"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-[#ad352d]">{error}</p> : null}
    </div>
  );
}

function Panel({
  action,
  children,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_18px_42px_rgba(110,84,144,0.08)]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="bc-kicker">{eyebrow}</p>
          <h2 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <article className="rounded-lg border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_12px_30px_rgba(110,84,144,0.08)]">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(120,84,162,0.08)] text-[#7854a2]">
        {icon}
      </span>
      <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[color:var(--bc-muted)]">{label}</p>
    </article>
  );
}

function AppointmentSummaryCard({
  action,
  appointment,
  isSelected,
}: {
  action?: ReactNode;
  appointment: EnrichedAppointment;
  isSelected?: boolean;
}) {
  const closureLabel = appointment.accountClosure ? ` | Fechamento: ${getClosureStatusLabel(appointment.accountClosure.status)}` : '';
  const paymentLabel = appointment.payments.length > 0 ? ` | Pagamentos: ${appointment.payments.length}` : '';
  const responseLabel = appointment.rejectedReason
    ? ` | Motivo: ${appointment.rejectedReason}`
    : appointment.salonResponseMessage
      ? ` | Resposta: ${appointment.salonResponseMessage}`
      : '';

  return (
    <RecordCard
      title={`${appointment.clientName} - ${appointment.serviceName}`}
      subtitle={`${formatDateTime(appointment.startsAt)} | ${appointment.professionalName}`}
      body={`${getStatusLabel(appointment.status)} | ${formatCurrency(appointment.servicePriceCents)}${closureLabel}${paymentLabel}${responseLabel}${appointment.notes ? ` | ${appointment.notes}` : ''}`}
      action={action}
      isSelected={isSelected}
    />
  );
}

function RecordCard({
  action,
  body,
  isSelected,
  subtitle,
  title,
}: {
  action?: ReactNode;
  body: string;
  isSelected?: boolean;
  subtitle: string;
  title: string;
}) {
  return (
    <article
      className={[
        'rounded-lg border bg-[rgba(255,253,249,0.82)] p-4',
        isSelected ? 'border-[#7854a2] shadow-[0_0_0_4px_rgba(120,84,162,0.1)]' : 'border-[rgba(120,84,162,0.12)]',
      ].join(' ')}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-[color:var(--bc-text)]">{title}</h3>
          <p className="mt-1 text-sm font-semibold text-[#7854a2]">{subtitle}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--bc-muted)]">{body}</p>
        </div>
        {action}
      </div>
    </article>
  );
}

function AvailabilitySlotPicker({
  emptyMessage,
  onSelect,
  selectedTime,
  slots,
}: {
  emptyMessage: string;
  onSelect: (time: string) => void;
  selectedTime: string;
  slots: AvailabilitySlot[];
}) {
  if (slots.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-black text-[color:var(--bc-text)]">Horarios disponiveis</span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {slots.map((slot) => (
          <button
            key={slot.startsAt}
            type="button"
            onClick={() => onSelect(slot.time)}
            className={[
              'h-11 rounded-lg border px-3 text-sm font-black transition',
              selectedTime === slot.time
                ? 'border-[#7854a2] bg-[#7854a2] text-white shadow-[0_0_0_4px_rgba(120,84,162,0.12)]'
                : 'border-[rgba(120,84,162,0.16)] bg-white text-[color:var(--bc-text)] hover:border-[#7854a2] hover:text-[#7854a2]',
            ].join(' ')}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReadonlyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[rgba(120,84,162,0.12)] bg-white px-3 py-2">
      <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#8d6a39]">{label}</span>
      <strong className="mt-1 block text-sm text-[color:var(--bc-text)]">{value}</strong>
    </div>
  );
}

function Field({
  label,
  max,
  min,
  onChange,
  required,
  step,
  type = 'text',
  value,
}: {
  label: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  required?: boolean;
  step?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[color:var(--bc-text)]">{label}</span>
      <input
        type={type}
        value={value}
        max={max}
        min={min}
        step={step}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-[rgba(120,84,162,0.16)] bg-white px-3 text-sm font-semibold text-[color:var(--bc-text)] outline-none transition focus:border-[#7854a2] focus:ring-4 focus:ring-[rgba(120,84,162,0.12)]"
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[color:var(--bc-text)]">{label}</span>
      <select
        value={value}
        required
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-[rgba(120,84,162,0.16)] bg-white px-3 text-sm font-semibold text-[color:var(--bc-text)] outline-none transition focus:border-[#7854a2] focus:ring-4 focus:ring-[rgba(120,84,162,0.12)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[color:var(--bc-text)]">{label}</span>
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[rgba(120,84,162,0.16)] bg-white px-3 py-3 text-sm font-semibold text-[color:var(--bc-text)] outline-none transition focus:border-[#7854a2] focus:ring-4 focus:ring-[rgba(120,84,162,0.12)]"
      />
    </label>
  );
}

function FormActions({ isEditing, onCancel }: { isEditing: boolean; onCancel: () => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button type="submit" className="bc-admin-primary-button">
        {isEditing ? 'Salvar alteracoes' : 'Criar registro'}
      </button>
      {isEditing ? (
        <button type="button" onClick={onCancel} className="bc-admin-secondary-button">
          Cancelar edicao
        </button>
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[rgba(120,84,162,0.24)] bg-[rgba(120,84,162,0.05)] p-5 text-sm font-semibold text-[color:var(--bc-muted)]">
      {message}
    </div>
  );
}

function SuccessState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#b9efcb] bg-[#effcf4] p-5 text-sm font-semibold text-[#1f7a3d]">
      {message}
    </div>
  );
}
