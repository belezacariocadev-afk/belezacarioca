'use client';

import type { FormEvent, ReactNode } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPin, Search, Sparkles } from 'lucide-react';

import { DashboardMockup } from '@/components/DashboardMockup';
import { categories } from '@/lib/data';

export function HeroSection() {
  const router = useRouter();
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (service.trim()) {
      params.set('servico', service.trim());
    }

    if (location.trim()) {
      params.set('local', location.trim());
    }

    const query = params.toString();
    router.push(query ? `/negocios?${query}` : '/negocios');
  }

  return (
    <section className="bc-section pt-10 md:pt-14" role="region" aria-labelledby="hero-title">
      <div className="bc-container">
        <div className="relative overflow-hidden rounded-[2.6rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,244,238,0.96),rgba(245,237,229,0.92))] px-5 py-10 shadow-[0_24px_60px_rgba(111,86,148,0.1)] md:px-8 md:py-14 lg:px-12">
          <div className="bc-hero-pattern" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-14 top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(120,84,162,0.12),transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(216,178,123,0.16),transparent_72%)] blur-3xl" />

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-5 flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-[rgba(120,84,162,0.12)] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8d6a39] shadow-[0_10px_22px_rgba(105,80,141,0.06)]">
                Agendamento e gestão premium
              </span>
              <span className="rounded-full border border-[rgba(120,84,162,0.08)] bg-[rgba(120,84,162,0.06)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--bc-muted)]">
                Beleza + tecnologia
              </span>
            </div>

            <h1 id="hero-title" className="bc-display mx-auto max-w-[13ch] text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.02] text-[color:var(--bc-text)]">
              Encontre, agende e administre experiências de beleza com padrão premium.
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">
              Uma entrada mais comercial para a Beleza Carioca: busca de serviços, jornada elegante para clientes
              e uma plataforma completa para salões que querem crescer com clareza.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 max-w-5xl rounded-[2rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(255,255,255,0.92)] p-2 shadow-[0_18px_40px_rgba(110,84,144,0.1)]"
            >
              <div className="grid gap-2 lg:grid-cols-[1.35fr_1fr_auto]">
                <SearchField
                  icon={<Search size={18} />}
                  id="hero-servico"
                  label="Serviço ou estabelecimento"
                  name="servico"
                  value={service}
                  onChange={setService}
                  placeholder="Digite o serviço ou nome do espaço"
                />
                <SearchField
                  icon={<MapPin size={18} />}
                  id="hero-local"
                  label="Onde gostaria de agendar?"
                  name="local"
                  value={location}
                  onChange={setLocation}
                  placeholder="Digite cidade, bairro ou região"
                />
                <button
                  type="submit"
                  className="h-16 rounded-[1.3rem] bg-[linear-gradient(135deg,#2e243f,#4f3a6f)] px-6 text-sm font-extrabold uppercase tracking-[0.14em] text-[#fffaf7] shadow-[0_16px_28px_rgba(52,39,74,0.18)] transition-transform hover:-translate-y-[2px]"
                >
                  Buscar
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/cadastro-estabelecimento" className="bc-button-primary h-14 px-7 text-sm">
                Conhecer a plataforma
              </Link>
              <Link href="/solucoes" className="bc-button-secondary h-14 px-7 text-sm">
                Ver soluções
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-[color:var(--bc-muted)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.08)] bg-white/80 px-4 py-2">
                <Sparkles size={14} className="text-[#8d6a39]" />
                Busca elegante para clientes e negócios
              </span>
              <span>
                <strong className="text-[color:var(--bc-text)]">+2.500 salões</strong> em uma experiência mais organizada
              </span>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-[rgba(120,84,162,0.1)] bg-white/90 px-4 py-2 text-sm font-medium text-[color:var(--bc-text)] shadow-[0_10px_20px_rgba(110,84,144,0.05)]"
                >
                  {item.title}
                </span>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-5xl">
              <DashboardMockup showSearchBar={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchField({
  icon,
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  icon: ReactNode;
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex h-16 items-center gap-4 rounded-[1.3rem] border border-[rgba(120,84,162,0.1)] bg-white px-5 text-left transition-colors focus-within:border-[rgba(120,84,162,0.28)] focus-within:shadow-[0_0_0_4px_rgba(120,84,162,0.08)]"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8d6a39]">{label}</p>
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="mt-1 w-full bg-transparent text-sm text-[color:var(--bc-text)] outline-none placeholder:text-[color:var(--bc-muted)]"
        />
      </div>
    </label>
  );
}
