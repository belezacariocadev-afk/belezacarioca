'use client';

import Link from 'next/link';
import { CalendarDays, MapPin, Scissors, UserRound } from 'lucide-react';
import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';

import type { ClientBookingAppointment, ClientBookingSalon, ClientBookingSalonDiagnostic, ClientBookingSlot } from '@/lib/client-booking';
import { usePlatformSession } from '@/components/platform/PlatformAuthProvider';

type SalonsPayload = {
  diagnostics?: ClientBookingSalonDiagnostic[];
  salons: ClientBookingSalon[];
};

type SlotsPayload = {
  slots: ClientBookingSlot[];
};

type AppointmentsPayload = {
  appointments: ClientBookingAppointment[];
};

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const clientBookingContactStorageKey = 'bc-client-booking-contact';

type StoredClientBookingContact = {
  email?: string;
  phone?: string;
};

export function ClientBookingMarketplace() {
  const { session } = usePlatformSession();
  const [salons, setSalons] = useState<ClientBookingSalon[]>([]);
  const [diagnostics, setDiagnostics] = useState<ClientBookingSalonDiagnostic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalonId, setSelectedSalonId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [date, setDate] = useState(tomorrow);
  const [slots, setSlots] = useState<ClientBookingSlot[]>([]);
  const [appointments, setAppointments] = useState<ClientBookingAppointment[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('Marina Costa');
  const [customerEmail, setCustomerEmail] = useState(session?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [salonSearch, setSalonSearch] = useState('');
  const [salonCityFilter, setSalonCityFilter] = useState('all');
  const [salonCategoryFilter, setSalonCategoryFilter] = useState('all');
  const [salonSort, setSalonSort] = useState<'ready' | 'name' | 'city'>('ready');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const hasContact = Boolean(customerEmail.trim() || customerPhone.trim());

  useEffect(() => {
    const stored = readStoredClientBookingContact();

    if (stored.email || stored.phone) {
      setCustomerEmail((current) => current || stored.email || '');
      setCustomerPhone((current) => current || stored.phone || '');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSalons() {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/client/booking/salons', { cache: 'no-store' }).catch(() => null);

      if (!mounted) {
        return;
      }

      if (!response?.ok) {
        setError('Nao foi possivel carregar estabelecimentos agora.');
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as SalonsPayload;
      setSalons(payload.salons);
      setDiagnostics(payload.diagnostics ?? []);
      setSelectedSalonId((current) => current || payload.salons[0]?.id || '');
      setIsLoading(false);
    }

    void loadSalons();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedSalon = salons.find((salon) => salon.id === selectedSalonId) ?? null;
  const selectedService = selectedSalon?.services.find((service) => service.id === selectedServiceId) ?? selectedSalon?.services[0] ?? null;
  const selectedEmployee =
    selectedSalon?.employees.find((employee) => employee.id === selectedEmployeeId) ?? selectedSalon?.employees[0] ?? null;

  useEffect(() => {
    setSelectedServiceId((current) =>
      selectedSalon?.services.some((service) => service.id === current) ? current : selectedSalon?.services[0]?.id ?? '',
    );
    setSelectedEmployeeId((current) =>
      selectedSalon?.employees.some((employee) => employee.id === current) ? current : selectedSalon?.employees[0]?.id ?? '',
    );
    setSelectedTime('');
  }, [selectedSalon]);

  useEffect(() => {
    if (!selectedSalon || !selectedService || !selectedEmployee || !date) {
      setSlots([]);
      setSelectedTime('');
      return;
    }

    const salonForSlots = selectedSalon;
    const serviceForSlots = selectedService;
    const employeeForSlots = selectedEmployee;
    let mounted = true;

    async function loadSlots() {
      const params = new URLSearchParams({
        date,
        employeeId: employeeForSlots.id,
        salonId: salonForSlots.id,
        serviceId: serviceForSlots.id,
      });
      const response = await fetch(`/api/client/booking/slots?${params.toString()}`, { cache: 'no-store' }).catch(() => null);

      if (!mounted) {
        return;
      }

      if (!response?.ok) {
        setSlots([]);
        setSelectedTime('');
        return;
      }

      const payload = (await response.json()) as SlotsPayload;
      setSlots(payload.slots);
      setSelectedTime((current) => (payload.slots.some((slot) => slot.time === current) ? current : payload.slots[0]?.time ?? ''));
    }

    void loadSlots();

    return () => {
      mounted = false;
    };
  }, [date, selectedEmployee, selectedSalon, selectedService]);

  useEffect(() => {
    let mounted = true;

    async function loadAppointments() {
      const params = new URLSearchParams();

      if (customerEmail.trim()) {
        params.set('email', customerEmail.trim());
      }

      if (customerPhone.trim()) {
        params.set('phone', customerPhone.trim());
      }

      if (!params.toString()) {
        setAppointments([]);
        return;
      }

      const response = await fetch(`/api/client/booking/appointments?${params.toString()}`, { cache: 'no-store' }).catch(() => null);

      if (!mounted || !response?.ok) {
        return;
      }

      const payload = (await response.json()) as AppointmentsPayload;
      setAppointments(payload.appointments);
    }

    const timeout = window.setTimeout(() => void loadAppointments(), 350);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [customerEmail, customerPhone]);

  const salonLocation = useMemo(() => {
    if (!selectedSalon) {
      return '';
    }

    return [selectedSalon.neighborhood, selectedSalon.city, selectedSalon.state].filter(Boolean).join(', ');
  }, [selectedSalon]);
  const salonCities = useMemo(() => unique(salons.map((salon) => salon.city).filter((value): value is string => Boolean(value))), [salons]);
  const salonCategories = useMemo(() => unique(salons.map((salon) => salon.category).filter((value): value is string => Boolean(value))), [salons]);
  const visibleSalons = useMemo(
    () => getVisibleSalons(salons, {
      category: salonCategoryFilter,
      city: salonCityFilter,
      query: salonSearch,
      sort: salonSort,
    }),
    [salonCategoryFilter, salonCityFilter, salonSearch, salonSort, salons],
  );
  const upcomingAppointments = appointments.filter(isClientUpcomingAppointment);
  const historicalAppointments = appointments.filter((appointment) => !isClientUpcomingAppointment(appointment));
  const theme = selectedSalon ? getSalonTheme(selectedSalon) : getSalonTheme(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setConfirmation(null);

    if (!selectedSalon || !selectedService || !selectedEmployee || !selectedTime) {
      setError('Escolha estabelecimento, servico, profissional e horario.');
      return;
    }

    if (!hasContact) {
      setError('Informe seu WhatsApp ou e-mail para confirmar o agendamento.');
      return;
    }

    if (hasDuplicateAppointmentForSelectedSlot(appointments, selectedSalon.id, selectedEmployee.id, date, selectedTime)) {
      setError('Voce ja tem uma solicitacao pendente ou confirmada neste horario.');
      return;
    }

    setIsSubmitting(true);
    const response = await fetch('/api/client/booking/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail,
        customerName,
        customerPhone,
        date,
        employeeId: selectedEmployee.id,
        notes,
        salonId: selectedSalon.id,
        serviceId: selectedService.id,
        time: selectedTime,
      }),
    }).catch(() => null);
    setIsSubmitting(false);

    if (!response?.ok) {
      const payload = (await response?.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? 'Nao foi possivel confirmar o agendamento.');
      return;
    }

    saveStoredClientBookingContact({
      email: customerEmail.trim(),
      phone: customerPhone.trim(),
    });
    setConfirmation('Solicitacao enviada. Aguarde confirmacao do estabelecimento.');
    setNotes('');
    setSlots((current) => current.filter((slot) => slot.time !== selectedTime));
    setSelectedTime('');
    const params = new URLSearchParams({ email: customerEmail, phone: customerPhone });
    const appointmentsResponse = await fetch(`/api/client/booking/appointments?${params.toString()}`, { cache: 'no-store' }).catch(() => null);

    if (appointmentsResponse?.ok) {
      const payload = (await appointmentsResponse.json()) as AppointmentsPayload;
      setAppointments(payload.appointments);
    }
  }

  if (isLoading) {
    return <StateCard title="Carregando estabelecimentos..." text="Estamos buscando saloes disponiveis para agendamento." />;
  }

  if (salons.length === 0) {
    return (
      <StateCard
        title="Ainda nao ha estabelecimentos disponiveis para agendamento."
        text={diagnostics.length > 0 ? 'Encontramos estabelecimentos cadastrados, mas nenhum esta pronto para receber agendamentos.' : 'Em breve voce podera encontrar saloes parceiros por aqui.'}
        action={<Link href="/" className="bc-button-secondary h-12 px-5 text-xs">Voltar para home</Link>}
      >
        {diagnostics.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {diagnostics.slice(0, 5).map((diagnostic) => (
              <div key={diagnostic.id} className="rounded-2xl border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.04)] p-4">
                <p className="text-sm font-black text-[color:var(--bc-text)]">{diagnostic.name}</p>
                <ul className="mt-2 grid gap-1 text-sm text-[color:var(--bc-muted)]">
                  {diagnostic.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </StateCard>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_18px_42px_rgba(110,84,144,0.08)]">
        <p className="bc-kicker">Meus agendamentos</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">Acompanhe suas solicitacoes.</h2>
        {!hasContact ? (
          <p className="mt-4 rounded-2xl bg-[rgba(120,84,162,0.06)] px-4 py-3 text-sm text-[color:var(--bc-muted)]">
            Informe seu WhatsApp ou e-mail para acompanhar seus agendamentos.
          </p>
        ) : appointments.length > 0 ? (
          <div className="mt-5 grid gap-5">
            <div>
              <h3 className="text-lg font-black text-[color:var(--bc-text)]">Proximos agendamentos</h3>
              <div className="mt-3 grid gap-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
                ) : (
                  <p className="rounded-2xl bg-[rgba(120,84,162,0.06)] px-4 py-3 text-sm text-[color:var(--bc-muted)]">
                    Nenhum proximo agendamento para este contato.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-[color:var(--bc-text)]">Historico de atendimentos</h3>
              <div className="mt-3 grid gap-3">
                {historicalAppointments.length > 0 ? (
                  historicalAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
                ) : (
                  <p className="rounded-2xl bg-[rgba(120,84,162,0.06)] px-4 py-3 text-sm text-[color:var(--bc-muted)]">
                    Nenhum historico encontrado para este contato.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-[rgba(120,84,162,0.06)] px-4 py-3 text-sm text-[color:var(--bc-muted)]">
            Nenhum agendamento encontrado para este contato.
          </p>
        )}
      </div>

      <div className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_18px_42px_rgba(110,84,144,0.08)]">
        <p className="bc-kicker">Area do cliente</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">Escolha onde quer ser atendido.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--bc-muted)]">
          Encontre estabelecimentos disponiveis, escolha o servico, selecione o profissional e envie sua solicitacao de agendamento.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {salons.length > 1 ? (
        <div className="grid gap-4">
          <div className="rounded-[1.4rem] border border-[rgba(120,84,162,0.1)] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Buscar salao" value={salonSearch} required={false} onChange={setSalonSearch} />
              <Select label="Ordenar por" value={salonSort} onChange={(value) => setSalonSort(value as typeof salonSort)}>
                <option value="ready">Mais prontos</option>
                <option value="name">Nome</option>
                <option value="city">Cidade</option>
              </Select>
              <Select label="Cidade/bairro" value={salonCityFilter} onChange={setSalonCityFilter}>
                <option value="all">Todos</option>
                {salonCities.map((city) => <option key={city} value={city}>{city}</option>)}
              </Select>
              <Select label="Categoria" value={salonCategoryFilter} onChange={setSalonCategoryFilter}>
                <option value="all">Todas</option>
                {salonCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
          {visibleSalons.map((salon) => {
            const active = salon.id === selectedSalonId;
            const location = [salon.neighborhood, salon.city, salon.state].filter(Boolean).join(', ');

            return (
              <button
                key={salon.id}
                type="button"
                onClick={() => setSelectedSalonId(salon.id)}
                className={[
                  'overflow-hidden rounded-[1.6rem] border bg-white text-left shadow-[0_12px_28px_rgba(110,84,144,0.07)] transition',
                  active ? 'border-[#8d6a39]' : 'border-[rgba(120,84,162,0.1)] hover:border-[rgba(120,84,162,0.28)]',
                ].join(' ')}
              >
                <div className="h-24 bg-[linear-gradient(135deg,#f7eefc,#fff0cf)]">
                  {salon.coverUrl ? <img src={salon.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="p-5">
                  <span className="-mt-12 inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1rem] border-2 border-white bg-[#f7eefc] text-[#6e4c98] shadow-md">
                    {salon.logoUrl ? <img src={salon.logoUrl} alt="" className="h-full w-full object-cover" /> : <Scissors size={18} />}
                  </span>
                  <h3 className="mt-4 text-lg font-black text-[color:var(--bc-text)]">{salon.name}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[color:var(--bc-muted)]">
                    <MapPin size={14} />
                    {location || 'Localizacao em configuracao'}
                  </p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: salon.primaryColor }}>
                    {salon.category ?? 'Beleza'}
                  </p>
                  <span className="mt-4 inline-flex rounded-full px-4 py-2 text-xs font-black text-white" style={{ backgroundColor: salon.primaryColor }}>
                    Agendar
                  </span>
                </div>
              </button>
            );
          })}
          </div>
          {visibleSalons.length === 0 ? <StateCard title="Nenhum estabelecimento encontrado." text="Ajuste os filtros para ver outros saloes disponiveis." /> : null}
        </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className={['overflow-hidden rounded-[2rem] border p-0 shadow-[0_18px_42px_rgba(110,84,144,0.08)]', salons.length <= 1 ? 'lg:col-span-2' : '', theme.panelClass].join(' ')}
          style={theme.style}
        >
          {selectedSalon ? (
            <>
              <div className="relative h-44 bg-[linear-gradient(135deg,#f7eefc,#fff0cf)]">
                {selectedSalon.coverUrl ? <img src={selectedSalon.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/48 to-transparent" />
                <div className="absolute bottom-5 left-5 flex items-end gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border-2 border-white bg-white text-lg font-black shadow-md" style={{ color: selectedSalon.primaryColor }}>
                    {selectedSalon.logoUrl ? <img src={selectedSalon.logoUrl} alt="" className="h-full w-full object-cover" /> : <CalendarDays size={22} />}
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">Novo agendamento</p>
                    <h3 className="mt-1 text-2xl font-black text-white">{selectedSalon.name}</h3>
                    {salonLocation ? <p className="mt-1 text-sm text-white/80">{salonLocation}</p> : null}
                  </div>
                </div>
              </div>

              {selectedSalon.services.length === 0 ? (
                <StateCard title="Este estabelecimento ainda esta configurando seus servicos." text="Tente novamente em outro momento." />
              ) : (
                <div className="grid gap-4 p-6">
                  <Select label="Servico" value={selectedService?.id ?? ''} onChange={setSelectedServiceId}>
                    {selectedSalon.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.durationMinutes} min - {formatCurrency(service.priceCents)}
                      </option>
                    ))}
                  </Select>
                  <Select label="Profissional" value={selectedEmployee?.id ?? ''} onChange={setSelectedEmployeeId}>
                    {selectedSalon.employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName}{employee.specialty ? ` - ${employee.specialty}` : ''}
                      </option>
                    ))}
                  </Select>
                  {selectedEmployee ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-[rgba(120,84,162,0.12)] bg-white/80 p-3">
                      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#f7eefc] text-sm font-black" style={{ color: selectedSalon.primaryColor }}>
                        {selectedEmployee.avatarUrl ? <img src={selectedEmployee.avatarUrl} alt="" className="h-full w-full object-cover" /> : getInitials(selectedEmployee.fullName)}
                      </span>
                      <div>
                        <p className="text-sm font-black text-[color:var(--bc-text)]">{selectedEmployee.fullName}</p>
                        {selectedEmployee.specialty ? <p className="text-xs font-semibold text-[color:var(--bc-muted)]">{selectedEmployee.specialty}</p> : null}
                      </div>
                    </div>
                  ) : null}
                  <Input label="Data" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={setDate} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--bc-muted)]">Horario</p>
                    {slots.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedTime(slot.time)}
                            className={[
                              'rounded-full border px-4 py-2 text-sm font-black transition',
                              selectedTime === slot.time
                                ? 'text-white'
                                : 'border-[rgba(120,84,162,0.16)] bg-white text-[color:var(--bc-text)]',
                            ].join(' ')}
                            style={selectedTime === slot.time ? { backgroundColor: selectedSalon.primaryColor, borderColor: selectedSalon.primaryColor } : undefined}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-2xl bg-[#fff7f5] px-4 py-3 text-sm text-[#ad352d]">Nenhum horario disponivel nesta data.</p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Seu nome" value={customerName} onChange={setCustomerName} />
                    <Input label="WhatsApp" value={customerPhone} required={false} onChange={setCustomerPhone} />
                  </div>
                  <Input label="E-mail" type="email" value={customerEmail} required={false} onChange={setCustomerEmail} />
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--bc-muted)]">Observacoes</span>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="min-h-24 rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6e4c98]"
                    />
                  </label>
                  {error ? <p className="rounded-2xl bg-[#fff7f5] px-4 py-3 text-sm text-[#ad352d]">{error}</p> : null}
                  {confirmation ? <p className="rounded-2xl bg-[#f4fffa] px-4 py-3 text-sm text-[#326c65]">{confirmation}</p> : null}
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedTime}
                    className="h-12 rounded-full px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: selectedSalon.primaryColor }}
                  >
                    {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function StateCard({ action, children, text, title }: { action?: ReactNode; children?: ReactNode; text: string; title: string }) {
  return (
    <div className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_18px_42px_rgba(110,84,144,0.08)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[#f7eefc] text-[#6e4c98]">
        <UserRound size={20} />
      </span>
      <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{text}</p>
      {children}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: ClientBookingAppointment }) {
  return (
    <article className="rounded-2xl border border-[rgba(120,84,162,0.12)] bg-[rgba(255,253,249,0.82)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-base font-black text-[color:var(--bc-text)]">{appointment.salonName}</h4>
          <p className="mt-1 text-sm font-semibold text-[#7854a2]">
            {appointment.serviceName} | {appointment.employeeName} | {formatDate(appointment.date)} as {appointment.time}
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--bc-muted)]">{getAppointmentStatusMessage(appointment)}</p>
          <p className="mt-2 text-sm font-semibold text-[color:var(--bc-muted)]">Valor: {formatCurrency(appointment.priceCents)}</p>
          {appointment.salonResponseMessage ? (
            <p className="mt-2 rounded-xl bg-[#f4fffa] px-3 py-2 text-sm text-[#326c65]">{appointment.salonResponseMessage}</p>
          ) : null}
          {appointment.rejectedReason ? (
            <p className="mt-2 rounded-xl bg-[#fff7f5] px-3 py-2 text-sm text-[#ad352d]">Motivo: {appointment.rejectedReason}</p>
          ) : null}
        </div>
        <span className={getPublicStatusBadgeClass(appointment.status)}>{getPublicStatusLabel(appointment.status)}</span>
      </div>
    </article>
  );
}

function Select({ children, label, onChange, value }: { children: ReactNode; label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--bc-muted)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#6e4c98]"
      >
        {children}
      </select>
    </label>
  );
}

function Input({
  label,
  min,
  onChange,
  type = 'text',
  value,
  required = true,
}: {
  label: string;
  min?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--bc-muted)]">{label}</span>
      <input
        min={min}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#6e4c98]"
      />
    </label>
  );
}

function hasDuplicateAppointmentForSelectedSlot(
  appointments: ClientBookingAppointment[],
  salonId: string,
  employeeId: string,
  date: string,
  time: string,
) {
  return appointments.some(
    (appointment) =>
      appointment.salonId === salonId &&
      appointment.employeeId === employeeId &&
      appointment.date === date &&
      appointment.time === time &&
      (appointment.status === 'pending' || appointment.status === 'confirmed'),
  );
}

function readStoredClientBookingContact(): StoredClientBookingContact {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(clientBookingContactStorageKey);

    return raw ? (JSON.parse(raw) as StoredClientBookingContact) : {};
  } catch {
    return {};
  }
}

function saveStoredClientBookingContact(contact: StoredClientBookingContact) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    clientBookingContactStorageKey,
    JSON.stringify({
      email: contact.email?.trim() || '',
      phone: contact.phone?.trim() || '',
    }),
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(value / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T00:00:00`));
}

function getPublicStatusLabel(status: ClientBookingAppointment['status']) {
  const labels = {
    cancelled: 'Cancelado',
    completed: 'Concluido',
    confirmed: 'Confirmado',
    inService: 'Em atendimento',
    noShow: 'Falta',
    pending: 'Pendente',
    rejected: 'Recusado',
    scheduled: 'Agendado',
  };

  return labels[status];
}

function getAppointmentStatusMessage(appointment: ClientBookingAppointment) {
  if (appointment.status === 'confirmed') {
    return 'Seu agendamento foi confirmado.';
  }

  if (appointment.status === 'scheduled') {
    return 'Seu agendamento esta agendado.';
  }

  if (appointment.status === 'inService') {
    return 'Seu atendimento esta em andamento.';
  }

  if (appointment.status === 'completed') {
    return 'Atendimento concluido.';
  }

  if (appointment.status === 'rejected') {
    return 'Seu agendamento foi recusado.';
  }

  if (appointment.status === 'cancelled') {
    return 'Seu agendamento foi cancelado.';
  }

  if (appointment.status === 'noShow') {
    return 'Este agendamento foi marcado como falta.';
  }

  return 'Aguardando confirmacao do estabelecimento.';
}

function getPublicStatusBadgeClass(status: ClientBookingAppointment['status']) {
  const base = 'inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em]';

  if (status === 'confirmed' || status === 'scheduled' || status === 'inService' || status === 'completed') {
    return `${base} border-[#9bd0ab] bg-[#f4fbf6] text-[#2f6b45]`;
  }

  if (status === 'rejected' || status === 'cancelled') {
    return `${base} border-[#e2aaa4] bg-[#fff8f7] text-[#8f352f]`;
  }

  return `${base} border-[#e1bf82] bg-[#fffaf0] text-[#81551d]`;
}

function isClientUpcomingAppointment(appointment: ClientBookingAppointment) {
  const upcomingStatuses: ClientBookingAppointment['status'][] = ['pending', 'scheduled', 'confirmed', 'inService'];
  const appointmentTime = new Date(`${appointment.date}T${appointment.time}:00`).getTime();

  return upcomingStatuses.includes(appointment.status) && appointmentTime >= Date.now();
}

function getVisibleSalons(
  salons: ClientBookingSalon[],
  filters: { category: string; city: string; query: string; sort: 'ready' | 'name' | 'city' },
) {
  const query = filters.query.trim().toLowerCase();

  return salons
    .filter((salon) => !query || salon.name.toLowerCase().includes(query))
    .filter((salon) => filters.city === 'all' || salon.city === filters.city || salon.neighborhood === filters.city)
    .filter((salon) => filters.category === 'all' || salon.category === filters.category)
    .sort((left, right) => {
      if (filters.sort === 'city') {
        return (left.city ?? '').localeCompare(right.city ?? '') || left.name.localeCompare(right.name);
      }

      if (filters.sort === 'name') {
        return left.name.localeCompare(right.name);
      }

      return right.services.length + right.employees.length - (left.services.length + left.employees.length) || left.name.localeCompare(right.name);
    });
}

function getSalonTheme(salon: ClientBookingSalon | null): { panelClass: string; style: CSSProperties } {
  const isDark = salon?.themeMode === 'dark';

  return {
    panelClass: isDark ? 'border-white/10 bg-[#171321]' : 'border-[rgba(120,84,162,0.1)] bg-white',
    style: isDark
      ? ({
          '--bc-text': '#F8F4FF',
          '--bc-muted': '#CFC5DD',
        } as CSSProperties)
      : {},
  };
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BC';
}

function unique(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
