'use client';

import type { FormEvent } from 'react';

import { CalendarDays, CheckCircle2, Clock3, LoaderCircle, UserRound } from 'lucide-react';
import { useState } from 'react';

import type { ServiceItem } from '@/lib/venues';

type VenueBookingPanelProps = {
  venueId: string;
  venueName: string;
  services: ServiceItem[];
  selectedService?: string;
};

const dates = ['Hoje', 'Amanha', 'Sexta', 'Sabado'];
const times = ['09:00', '10:30', '12:00', '14:30', '16:00', '18:30'];

export function VenueBookingPanel({ venueId, venueName, services, selectedService }: VenueBookingPanelProps) {
  const initialService = services.find((service) => service.name === selectedService)?.name ?? services[0]?.name ?? '';
  const [service, setService] = useState(initialService);
  const [date, setDate] = useState(dates[0]);
  const [time, setTime] = useState(times[3]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const selected = services.find((item) => item.name === service) ?? services[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setConfirmation('Preencha nome e telefone para concluir a reserva.');
      return;
    }

    setIsSubmitting(true);
    setConfirmation('');

    window.setTimeout(() => {
      setIsSubmitting(false);
      setConfirmation(`Agendamento solicitado para ${service} em ${date}, ${time}. O ${venueName} recebera seus dados.`);
    }, 700);
  }

  return (
    <form
      id="agendar"
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-5 shadow-[0_20px_46px_rgba(110,84,144,0.1)]"
      data-venue-id={venueId}
    >
      <p className="bc-kicker">Agendar horario</p>
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--bc-text)]">Finalize sua escolha</h2>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-[color:var(--bc-text)]">Servico</span>
        <select
          value={service}
          onChange={(event) => setService(event.target.value)}
          className="h-12 w-full rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none focus:border-[rgba(120,84,162,0.38)]"
        >
          {services.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} - {item.price}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 rounded-[1.4rem] bg-[rgba(120,84,162,0.06)] p-4">
        <p className="text-sm font-semibold text-[color:var(--bc-text)]">{selected?.name}</p>
        <p className="mt-1 text-xs text-[color:var(--bc-muted)]">
          {selected?.category} - {selected?.duration} - {selected?.price}
        </p>
      </div>

      <div className="mt-5">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[color:var(--bc-text)]">
          <CalendarDays size={16} className="text-[#7a58a6]" />
          Data
        </span>
        <div className="grid grid-cols-2 gap-2">
          {dates.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDate(item)}
              className={[
                'h-11 rounded-2xl border text-sm font-semibold transition',
                date === item
                  ? 'border-[#6e4c98] bg-[#6e4c98] text-white'
                  : 'border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-muted)] hover:text-[color:var(--bc-text)]',
              ].join(' ')}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[color:var(--bc-text)]">
          <Clock3 size={16} className="text-[#7a58a6]" />
          Horario
        </span>
        <div className="grid grid-cols-3 gap-2">
          {times.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTime(item)}
              className={[
                'h-11 rounded-2xl border text-sm font-semibold transition',
                time === item
                  ? 'border-[#6e4c98] bg-[#6e4c98] text-white'
                  : 'border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-muted)] hover:text-[color:var(--bc-text)]',
              ].join(' ')}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[color:var(--bc-text)]">Seu nome</span>
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 focus-within:border-[rgba(120,84,162,0.38)]">
            <UserRound size={16} className="text-[#7a58a6]" />
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--bc-muted)]"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[color:var(--bc-text)]">Telefone</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="(21) 99999-9999"
            className="h-12 w-full rounded-2xl border border-[rgba(120,84,162,0.14)] bg-white px-4 text-sm outline-none placeholder:text-[color:var(--bc-muted)] focus:border-[rgba(120,84,162,0.38)]"
          />
        </label>
      </div>

      {confirmation ? (
        <div className="mt-5 flex items-start gap-3 rounded-[1.3rem] border border-[rgba(120,84,162,0.16)] bg-[rgba(120,84,162,0.06)] p-4 text-sm leading-6 text-[#5f3f86]">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{confirmation}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#6e4c98] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#5f3f86] disabled:cursor-not-allowed disabled:bg-[#b9a7cf]"
      >
        {isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : null}
        {isSubmitting ? 'Enviando...' : 'Solicitar agendamento'}
      </button>
    </form>
  );
}
