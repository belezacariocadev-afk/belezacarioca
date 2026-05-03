import Link from 'next/link';
import { Building2, ChevronDown, MapPin, Search, Sparkles, Star } from 'lucide-react';

import {
  getAreas,
  getFilteredVenues,
  getVisibleServices,
  serviceFilters,
  type SearchVenue,
  textContains,
} from '@/lib/venues';

type BusinessSearchResultsProps = {
  service?: string;
  location?: string;
};

export function BusinessSearchResults({ service, location }: BusinessSearchResultsProps) {
  const { matches, usedFallback } = getFilteredVenues(service, location);
  const areas = getAreas(matches);
  const resultLabel = location ? `proximos a ${location}` : 'disponiveis';

  return (
    <section className="bc-section pt-10 md:pt-14">
      <div className="bc-container">
        <div className="rounded-[2.2rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,233,0.92))] p-4 shadow-[0_20px_46px_rgba(110,84,144,0.08)] md:p-6">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_auto]">
            <SearchSummaryCard icon={<Search size={17} />} label="Servico ou estabelecimento" value={service || 'Todos os servicos'} />
            <SearchSummaryCard icon={<MapPin size={17} />} label="Onde gostaria de agendar?" value={location || 'Rio de Janeiro'} />
            <Link href="/" className="bc-button-primary h-16 px-7 text-sm">
              Nova busca
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-white p-5 shadow-[0_18px_36px_rgba(110,84,144,0.07)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8d6a39]">Filtros</p>

            <div className="mt-5 space-y-5">
              <FilterGroup title="Area pesquisada">
                <FilterPill active label={location || 'Rio de Janeiro'} />
                {areas.map((area) => (
                  <Link key={area} href={`/negocios?${new URLSearchParams({ ...(service ? { servico: service } : {}), local: area }).toString()}`}>
                    <FilterPill label={area} />
                  </Link>
                ))}
              </FilterGroup>

              <FilterGroup title="Categorias">
                {serviceFilters.map((item) => (
                  <Link key={item} href={`/negocios?${new URLSearchParams({ servico: item, ...(location ? { local: location } : {}) }).toString()}`}>
                    <FilterPill active={service ? textContains(item, service) : false} label={item} />
                  </Link>
                ))}
              </FilterGroup>
            </div>
          </aside>

          <div>
            <div className="flex flex-col gap-5 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-white/82 p-5 shadow-[0_18px_36px_rgba(110,84,144,0.06)] md:flex-row md:items-center md:justify-between">
              <div>
                <p className="bc-kicker mb-2">Resultados de busca</p>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--bc-text)] md:text-4xl">
                  Estabelecimentos {resultLabel}
                </h1>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                  {usedFallback
                    ? 'Nao encontrei uma correspondencia exata para essa area, entao estou mostrando areas com servicos disponiveis.'
                    : `${matches.length} opcoes encontradas com servicos disponiveis para agendamento.`}
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-[rgba(120,84,162,0.1)] bg-[rgba(120,84,162,0.05)] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a58a6]">Areas atendidas</p>
                <p className="mt-1 text-sm text-[color:var(--bc-muted)]">{areas.join(', ')}</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {matches.map((venue) => (
                <VenueResultCard key={venue.id} venue={venue} service={service} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchSummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex h-16 items-center gap-4 rounded-[1.35rem] border border-[rgba(120,84,162,0.1)] bg-white px-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8d6a39]">{label}</p>
        <p className="mt-1 text-sm font-semibold text-[color:var(--bc-text)]">{value}</p>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between border-b border-[rgba(120,84,162,0.1)] pb-3 text-left text-sm font-bold text-[color:var(--bc-text)]"
      >
        {title}
        <ChevronDown size={15} className="text-[color:var(--bc-muted)]" />
      </button>
      <div className="mt-3 grid gap-2">{children}</div>
    </div>
  );
}

function FilterPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={[
        'block rounded-xl border px-3 py-2 text-sm transition',
        active
          ? 'border-[rgba(120,84,162,0.28)] bg-[rgba(120,84,162,0.08)] font-semibold text-[#6e4c98]'
          : 'border-[rgba(120,84,162,0.1)] bg-white text-[color:var(--bc-muted)] hover:border-[rgba(120,84,162,0.24)] hover:text-[color:var(--bc-text)]',
      ].join(' ')}
    >
      {label}
    </span>
  );
}

function VenueResultCard({ venue, service }: { venue: SearchVenue; service?: string }) {
  const visibleServices = getVisibleServices(venue, service);
  const profileHref = `/estabelecimentos/${venue.id}`;

  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-white shadow-[0_18px_38px_rgba(110,84,144,0.08)]">
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:p-6">
        <div className="flex gap-4">
          <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(120,84,162,0.16),rgba(216,178,123,0.18))] text-[#6e4c98] sm:inline-flex">
            <Building2 size={28} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={profileHref}
                className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--bc-text)] transition hover:text-[#6e4c98]"
              >
                {venue.name}
              </Link>
              <span className="rounded-full bg-[rgba(216,178,123,0.18)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8d6a39]">
                {venue.badge}
              </span>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[color:var(--bc-muted)]">
              <MapPin size={15} className="text-[#7a58a6]" />
              {venue.neighborhood}, {venue.city} - {venue.address}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--bc-muted)]">{venue.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-[1.2rem] border border-[rgba(120,84,162,0.1)] bg-[rgba(251,247,242,0.82)] px-4 py-3 md:self-start">
          <Star size={16} className="fill-[#c79b5c] text-[#c79b5c]" />
          <div>
            <p className="text-sm font-bold text-[color:var(--bc-text)]">{venue.rating}</p>
            <p className="text-xs text-[color:var(--bc-muted)]">{venue.reviewCount} avaliacoes</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(120,84,162,0.08)] bg-[rgba(251,247,242,0.56)]">
        {visibleServices.map((item) => (
          <div
            key={`${venue.id}-${item.name}`}
            className="grid gap-3 border-b border-[rgba(120,84,162,0.08)] px-5 py-4 last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-center md:px-6"
          >
            <div>
              <p className="font-semibold text-[color:var(--bc-text)]">{item.name}</p>
              <p className="mt-1 text-xs text-[color:var(--bc-muted)]">
                {item.category} - {item.duration}
              </p>
            </div>
            <span className="text-sm font-bold text-[#6e4c98]">{item.price}</span>
            <Link
              href={`/estabelecimentos/${venue.id}?servico=${encodeURIComponent(item.name)}#agendar`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#6e4c98] px-5 text-sm font-bold text-white transition hover:bg-[#5f3f86]"
            >
              Agendar
            </Link>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-6">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8d6a39]">
          <Sparkles size={14} />
          Servicos disponiveis nesta area
        </span>
        <Link href={profileHref} className="text-sm font-semibold text-[#6e4c98] transition hover:text-[#5f3f86]">
          Ver perfil do estabelecimento
        </Link>
      </div>
    </article>
  );
}
