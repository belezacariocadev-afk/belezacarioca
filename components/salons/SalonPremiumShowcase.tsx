'use client';

import Link from 'next/link';
import { CalendarDays, Clock3, MapPin, Scissors, Sparkles, Star } from 'lucide-react';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

import type { PublicSalonProfile, PublicSalonProfessional, PublicSalonService } from '@/lib/public-salons';

type SalonPremiumShowcaseProps = {
  salon: PublicSalonProfile;
};

const publicSalonRefreshEvent = 'beleza-carioca:public-salon-refresh';

export function SalonPremiumShowcase({ salon: initialSalon }: SalonPremiumShowcaseProps) {
  const [salon, setSalon] = useState(initialSalon);
  const themeStyle = {
    '--primary-color': salon.primaryColor,
  } as CSSProperties;

  useEffect(() => {
    setSalon(initialSalon);
  }, [initialSalon]);

  useEffect(() => {
    const salonIdentifier = initialSalon.slug ?? initialSalon.id;
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function scheduleNextRefresh() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (isMounted) {
        timeoutId = setTimeout(refreshPublicSalonProfile, 4000);
      }
    }

    async function refreshPublicSalonProfile() {
      try {
        const response = await fetch(`/api/public/salons/${encodeURIComponent(salonIdentifier)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { salon?: PublicSalonProfile };

        if (isMounted && payload.salon) {
          setSalon(payload.salon);
        }
      } catch (error) {
        console.error('[salon-showcase] Falha ao atualizar perfil publico:', error);
      } finally {
        scheduleNextRefresh();
      }
    }

    function shouldRefreshForSalon(detail: unknown) {
      if (!detail || typeof detail !== 'object') {
        return false;
      }

      const payload = detail as { salonId?: unknown; salonSlug?: unknown };

      return (
        payload.salonId === initialSalon.id ||
        (typeof payload.salonSlug === 'string' && payload.salonSlug === initialSalon.slug)
      );
    }

    function refreshNow() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      void refreshPublicSalonProfile();
    }

    function handlePublicSalonRefresh(event: Event) {
      const detail = event instanceof CustomEvent ? event.detail : null;

      if (shouldRefreshForSalon(detail)) {
        refreshNow();
      }
    }

    function handleStorageRefresh(event: StorageEvent) {
      if (event.key !== publicSalonRefreshEvent || !event.newValue) {
        return;
      }

      try {
        const detail = JSON.parse(event.newValue) as unknown;

        if (shouldRefreshForSalon(detail)) {
          refreshNow();
        }
      } catch (error) {
        console.error('[salon-showcase] Falha ao ler evento publico do salao:', error);
      }
    }

    const channel = 'BroadcastChannel' in window ? new BroadcastChannel(publicSalonRefreshEvent) : null;

    if (channel) {
      channel.onmessage = (event) => {
        if (shouldRefreshForSalon(event.data)) {
          refreshNow();
        }
      };
    }

    window.addEventListener(publicSalonRefreshEvent, handlePublicSalonRefresh);
    window.addEventListener('storage', handleStorageRefresh);
    refreshNow();

    return () => {
      isMounted = false;
      window.removeEventListener(publicSalonRefreshEvent, handlePublicSalonRefresh);
      window.removeEventListener('storage', handleStorageRefresh);
      channel?.close();

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [initialSalon.id, initialSalon.slug]);

  useEffect(() => {
    // Tema global do perfil publico. Ajuste aqui caso queira limitar o tema a um container.
    document.body.dataset.theme = salon.themeMode;
    document.body.style.setProperty('--primary-color', salon.primaryColor);

    return () => {
      delete document.body.dataset.theme;
      document.body.style.removeProperty('--primary-color');
    };
  }, [salon.primaryColor, salon.themeMode]);

  return (
    <main data-theme={salon.themeMode} style={themeStyle} className="relative z-10 bg-[color:var(--bc-bg)] text-[color:var(--bc-text)]">
      <section className="bc-section pt-6 md:pt-10">
        <div className="bc-container">
          <Banner salon={salon} />

          <AnimatedReveal className="mt-6">
            <section className="grid gap-5 rounded-[1.5rem] border border-[color:var(--bc-line)] bg-[color:var(--bc-card)] p-5 shadow-lg md:grid-cols-[1fr_auto] md:items-center md:p-6">
              <div>
                <p className="bc-kicker">Agendamento online</p>
                <h2 className="text-2xl font-black tracking-[-0.04em] md:text-3xl">Escolha seu horario com uma experiencia mais fluida.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--bc-muted)]">
                  O perfil publico acompanha a identidade visual do salao e destaca equipe, servicos e proximos passos para o cliente.
                </p>
              </div>
              <CTAButton href="/cliente">Agendar agora</CTAButton>
            </section>
          </AnimatedReveal>

          <AnimatedReveal className="mt-8">
            <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.75rem] border border-[color:var(--bc-line)] bg-[color:var(--bc-card)] p-6 shadow-md">
                <p className="bc-kicker">Perfil publico</p>
                <h2 className="text-3xl font-black tracking-[-0.05em] md:text-4xl">{salon.name}</h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">
                  {salon.description || 'Um espaco parceiro da Beleza Carioca preparado para apresentar servicos, equipe e agendamento com uma vitrine profissional.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Highlight icon={<Star size={18} />} label="Premium" text="Vitrine personalizada" />
                <Highlight icon={<MapPin size={18} />} label="Cidade" text={salon.city || 'Atendimento local'} />
                <Highlight icon={<Sparkles size={18} />} label="Estilo" text={salon.category || 'Beleza'} />
              </div>
            </section>
          </AnimatedReveal>

          <section className="mt-10">
            <SectionHeader eyebrow="Equipe" title="Profissionais do salao" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {salon.professionals.length > 0 ? (
                salon.professionals.map((professional, index) => (
                  <AnimatedReveal key={professional.id} delay={index * 80}>
                    <ProfissionalCard professional={professional} />
                  </AnimatedReveal>
                ))
              ) : (
                <EmptyCard text="A equipe sera exibida assim que o salao publicar profissionais ativos." />
              )}
            </div>
          </section>

          <section className="mt-10">
            <SectionHeader eyebrow="Servicos" title="Catalogo em destaque" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {salon.services.length > 0 ? (
                salon.services.map((service, index) => (
                  <AnimatedReveal key={service.id} delay={index * 80}>
                    <ServiceCard service={service} />
                  </AnimatedReveal>
                ))
              ) : (
                <EmptyCard text="Os servicos serao exibidos quando o catalogo publico estiver pronto." />
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Banner({ salon }: { salon: PublicSalonProfile }) {
  const location = [salon.city].filter(Boolean).join(', ');
  const initials = getInitials(salon.name);

  return (
    <AnimatedReveal>
      <section className="group relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#171321] shadow-xl md:min-h-[34rem]">
        {/* Banner: personalize overlay, altura e fallback visual aqui. */}
        {salon.coverUrl ? (
          <img src={salon.coverUrl} alt={`Capa de ${salon.name}`} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#241a35,var(--primary-color)_58%,#c79b5c)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,12,27,0.9),rgba(18,12,27,0.48)_55%,rgba(18,12,27,0.18))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(255,255,255,0.22),transparent_26%),radial-gradient(circle_at_82%_74%,rgba(255,255,255,0.12),transparent_28%)]" />

        <div className="relative z-10 flex min-h-[28rem] flex-col justify-end p-5 text-white md:min-h-[34rem] md:p-8 lg:p-10">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/86 backdrop-blur-md">
            <Sparkles size={15} />
            Salao em destaque
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/30 bg-white text-2xl font-black shadow-[0_18px_40px_rgba(0,0,0,0.26)] md:h-28 md:w-28" style={{ color: salon.primaryColor }}>
              {salon.logoUrl ? <img src={salon.logoUrl} alt={`Logo de ${salon.name}`} className="h-full w-full object-cover" /> : initials}
            </div>
            <div>
              <h1 className="max-w-4xl text-[clamp(2.4rem,6vw,5rem)] font-black leading-[0.95] tracking-[-0.06em]">{salon.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/82">
                {location ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    {location}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <Scissors size={16} />
                  {salon.category || 'Beleza e bem-estar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimatedReveal>
  );
}

function CTAButton({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-black text-white shadow-[0_16px_34px_color-mix(in_srgb,var(--primary-color)_28%,transparent)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_color-mix(in_srgb,var(--primary-color)_42%,transparent)]"
      style={{ backgroundColor: 'var(--primary-color)' }}
    >
      {children}
    </Link>
  );
}

function ProfissionalCard({ professional }: { professional: PublicSalonProfessional }) {
  return (
    <article className="group h-full rounded-[1.5rem] border border-[color:var(--bc-line)] bg-[color:var(--bc-card)] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-[color:var(--bc-bg-soft)] text-lg font-black" style={{ color: 'var(--primary-color)' }}>
          {professional.avatarUrl ? <img src={professional.avatarUrl} alt={professional.name} className="h-full w-full object-cover" /> : getInitials(professional.name)}
        </div>
        <div>
          <h3 className="text-lg font-black tracking-[-0.03em] text-[color:var(--bc-text)]">{professional.name}</h3>
          <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--primary-color)' }}>{professional.role || 'Profissional'}</p>
        </div>
      </div>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--bc-bg-soft)] px-3 py-2 text-xs font-bold text-[color:var(--bc-muted)]">
        <Clock3 size={14} />
        {professional.scheduleLabel}
      </p>
    </article>
  );
}

function ServiceCard({ service }: { service: PublicSalonService }) {
  return (
    <article className="group h-full rounded-[1.5rem] border border-[color:var(--bc-line)] bg-[color:var(--bc-card)] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{service.name}</h3>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--bc-muted)]">
            <CalendarDays size={15} />
            {service.durationMinutes} min
          </p>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ backgroundColor: 'var(--primary-color)' }}>
          {formatCurrency(service.priceCents)}
        </span>
      </div>
    </article>
  );
}

function Highlight({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <article className="rounded-[1.4rem] border border-[color:var(--bc-line)] bg-[color:var(--bc-card)] p-5 shadow-sm">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: 'var(--primary-color)' }}>
        {icon}
      </span>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: 'var(--primary-color)' }}>{label}</p>
      <p className="mt-2 text-sm font-bold text-[color:var(--bc-text)]">{text}</p>
    </article>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="bc-kicker">{eyebrow}</p>
      <h2 className="text-3xl font-black tracking-[-0.05em] text-[color:var(--bc-text)] md:text-4xl">{title}</h2>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[color:var(--bc-line-strong)] bg-[color:var(--bc-card)] p-6 text-sm font-semibold text-[color:var(--bc-muted)] sm:col-span-2 xl:col-span-3">
      {text}
    </div>
  );
}

function AnimatedReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        'transition duration-700 ease-out',
        isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-5 scale-[0.98] opacity-0',
        className,
      ].join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(value / 100);
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BC';
}
