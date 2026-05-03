import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Users2,
} from 'lucide-react';

import { VenueBookingPanel } from '@/components/VenueBookingPanel';
import type { SearchVenue } from '@/lib/venues';

type VenueProfileProps = {
  venue: SearchVenue;
  selectedService?: string;
};

const reviews = [
  {
    name: 'Juliana Santos',
    text: 'Atendimento muito organizado, agenda clara e equipe super pontual.',
  },
  {
    name: 'Carlos Mendes',
    text: 'Consegui escolher o horario e o servico sem precisar ficar trocando mensagem.',
  },
  {
    name: 'Marina Rocha',
    text: 'O perfil transmite confianca e os servicos ficam faceis de comparar.',
  },
];

export function VenueProfile({ venue, selectedService }: VenueProfileProps) {
  const searchHref = `/negocios?local=${encodeURIComponent(venue.neighborhood)}`;

  return (
    <section className="bc-section pt-8 md:pt-12">
      <div className="bc-container">
        <Link
          href={searchHref}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.1)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--bc-muted)] shadow-[0_10px_24px_rgba(110,84,144,0.06)] transition hover:text-[#6e4c98]"
        >
          <ArrowLeft size={16} />
          Voltar para resultados
        </Link>

        <div className="mt-6 overflow-hidden rounded-[2.4rem] border border-[rgba(120,84,162,0.1)] bg-white shadow-[0_26px_70px_rgba(110,84,144,0.1)]">
          <div className="relative min-h-[280px] overflow-hidden bg-[linear-gradient(135deg,#241a35,#6e4c98_52%,#c79b5c)] px-6 py-8 text-white md:min-h-[360px] md:px-10 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.22),transparent_26%),radial-gradient(circle_at_82%_72%,rgba(255,255,255,0.16),transparent_30%)]" />
            <div className="absolute right-8 top-8 hidden grid-cols-2 gap-3 opacity-90 lg:grid">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 w-36 rounded-[1.6rem] border border-white/18 bg-white/12 backdrop-blur-md"
                >
                  <div className="h-full rounded-[1.6rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.18))]" />
                </div>
              ))}
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f1d7b1] backdrop-blur-md">
                <BadgeCheck size={15} />
                {venue.badge}
              </div>

              <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-white/30 bg-white text-[#6e4c98] shadow-[0_18px_40px_rgba(36,26,53,0.22)]">
                  <Building2 size={38} />
                </div>
                <div>
                  <h1 className="text-[clamp(2.1rem,4vw,3.8rem)] font-black leading-[1.02] tracking-[-0.05em]">
                    {venue.name}
                  </h1>
                  <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/82">
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} />
                      {venue.neighborhood}, {venue.city}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Star size={16} className="fill-[#f1d7b1] text-[#f1d7b1]" />
                      {venue.rating} ({venue.reviewCount} avaliacoes)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px]">
            <div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoCard icon={<Clock3 size={18} />} label="Horario" value={venue.hours} />
                <InfoCard icon={<Phone size={18} />} label="Contato" value={venue.phone} />
                <InfoCard icon={<ShieldCheck size={18} />} label="Confirmacao" value="Online e rapida" />
              </div>

              <section className="mt-8 rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,233,0.92))] p-5 md:p-6">
                <p className="bc-kicker">Sobre o estabelecimento</p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--bc-text)]">
                  Perfil completo para decidir e agendar com confianca.
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--bc-muted)]">{venue.description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {venue.highlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.1)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#6e4c98]"
                    >
                      <Sparkles size={14} />
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section className="mt-8" id="servicos">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="bc-kicker">Servicos</p>
                    <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--bc-text)]">
                      Escolha um servico para agendar.
                    </h2>
                  </div>
                  <span className="text-sm text-[color:var(--bc-muted)]">{venue.services.length} servicos disponiveis</span>
                </div>

                <div className="mt-5 space-y-3">
                  {venue.services.map((service) => (
                    <article
                      key={service.name}
                      className="grid gap-4 rounded-[1.6rem] border border-[rgba(120,84,162,0.1)] bg-white p-5 shadow-[0_14px_30px_rgba(110,84,144,0.06)] md:grid-cols-[1fr_auto_auto] md:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
                          <Scissors size={18} />
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-[color:var(--bc-text)]">{service.name}</h3>
                          <p className="mt-1 text-sm text-[color:var(--bc-muted)]">
                            {service.category} - {service.duration}
                          </p>
                        </div>
                      </div>
                      <strong className="text-lg text-[#6e4c98]">{service.price}</strong>
                      <Link
                        href={`/estabelecimentos/${venue.id}?servico=${encodeURIComponent(service.name)}#agendar`}
                        className="inline-flex h-11 items-center justify-center rounded-full bg-[#6e4c98] px-6 text-sm font-bold text-white transition hover:bg-[#5f3f86]"
                      >
                        Agendar
                      </Link>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_16px_34px_rgba(110,84,144,0.07)]">
                  <p className="bc-kicker">Equipe</p>
                  <div className="mt-5 grid gap-3">
                    {venue.team.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-[1.2rem] bg-[rgba(120,84,162,0.05)] px-4 py-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7a58a6]">
                          <Users2 size={16} />
                        </span>
                        <span className="font-semibold text-[color:var(--bc-text)]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_16px_34px_rgba(110,84,144,0.07)]">
                  <p className="bc-kicker">Comodidades</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {venue.amenities.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[rgba(120,84,162,0.1)] bg-[rgba(251,247,242,0.86)] px-4 py-2 text-sm text-[color:var(--bc-muted)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-8 rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_16px_34px_rgba(110,84,144,0.07)]">
                <p className="bc-kicker">Avaliacoes</p>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {reviews.map((review) => (
                    <article key={review.name} className="rounded-[1.4rem] bg-[rgba(120,84,162,0.05)] p-5">
                      <div className="flex gap-1 text-[#c79b5c]">
                        {[0, 1, 2, 3, 4].map((item) => (
                          <Star key={item} size={14} className="fill-current" />
                        ))}
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">"{review.text}"</p>
                      <strong className="mt-4 block text-sm text-[color:var(--bc-text)]">{review.name}</strong>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <VenueBookingPanel venueId={venue.id} venueName={venue.name} services={venue.services} selectedService={selectedService} />
              <div className="overflow-hidden rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white shadow-[0_16px_34px_rgba(110,84,144,0.08)]">
                <div className="relative h-56 bg-[linear-gradient(135deg,rgba(120,84,162,0.12),rgba(216,178,123,0.16))]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(120,84,162,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,84,162,0.1)_1px,transparent_1px)] bg-[length:34px_34px]" />
                  <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#6e4c98] text-white shadow-[0_14px_30px_rgba(120,84,162,0.24)]">
                    <MapPin size={24} />
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-[color:var(--bc-text)]">{venue.address}</p>
                  <p className="mt-2 text-sm text-[color:var(--bc-muted)]">
                    {venue.neighborhood}, {venue.city}
                  </p>
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.address} ${venue.city}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bc-button-secondary mt-4 h-12 w-full text-sm"
                  >
                    Abrir no mapa
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,233,0.92))] p-5 shadow-[0_16px_34px_rgba(110,84,144,0.08)]">
                <div className="flex items-center gap-3 text-[#6e4c98]">
                  <Heart size={18} />
                  <p className="text-sm font-bold uppercase tracking-[0.16em]">Salvar favorito</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">
                  Perfil pronto para simular uma experiencia profissional de marketplace e agenda online.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[rgba(120,84,162,0.1)] bg-white p-4 shadow-[0_12px_28px_rgba(110,84,144,0.06)]">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
        {icon}
      </span>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8d6a39]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--bc-text)]">{value}</p>
    </div>
  );
}
