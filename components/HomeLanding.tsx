'use client';

import type { FormEvent, ReactNode } from 'react';
import type { PublicSalonShowcase } from '@/lib/public-salons';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Users2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type LocationSuggestion = {
  label: string;
  region: string;
  description: string;
  keywords?: string[];
  cep?: string;
  value?: string;
};

const fallbackLocations: LocationSuggestion[] = [
  { label: 'Rio de Janeiro', region: 'RJ, Brasil', description: 'Todas as areas com saloes cadastrados', cep: '20000-000 a 23799-999', keywords: ['rio', 'rj'] },
  { label: 'Bangu', region: 'Rio de Janeiro, RJ', description: 'Bairro da Zona Oeste com saloes e barbearias', cep: 'CEP varia por rua', keywords: ['bangu', 'zona oeste'] },
  { label: 'Campo Grande', region: 'Rio de Janeiro, RJ', description: 'Bairro da Zona Oeste com servicos de beleza', cep: '23000-000 a 23099-999', keywords: ['campo grande', 'zona oeste'] },
  { label: 'Barra da Tijuca', region: 'Rio de Janeiro, RJ', description: 'Saloes, esmalterias, barbearias e clinicas', cep: '22600-000 a 22793-000', keywords: ['barra', 'barra da tijuca'] },
  { label: 'Recreio dos Bandeirantes', region: 'Rio de Janeiro, RJ', description: 'Servicos de beleza no Recreio', cep: '22790-000 a 22795-999', keywords: ['recreio'] },
  { label: 'Copacabana', region: 'Rio de Janeiro, RJ', description: 'Unhas, cabelo e beleza express', cep: '22010-000 a 22099-999', keywords: ['copacabana', 'copa'] },
  { label: 'Ipanema', region: 'Rio de Janeiro, RJ', description: 'Experiencias premium e maquiagem', cep: '22410-000 a 22421-999', keywords: ['ipanema'] },
  { label: 'Tijuca', region: 'Rio de Janeiro, RJ', description: 'Barbearias, saloes e sobrancelhas', cep: '20510-000 a 20561-999', keywords: ['tijuca'] },
];

const categories = ['Unhas', 'Cabelos', 'Barbearia', 'Estetica', 'Sobrancelhas', 'Massagem', 'Maquiagem'];

const heroStats = [
  { value: '+120 mil', label: 'clientes em jornadas organizadas' },
  { value: '+850 mil', label: 'agendamentos organizados' },
  { value: '+2.500', label: 'espacos parceiros em expansao' },
];

const benefits = [
  { title: 'Busca por bairro e CEP', description: 'Encontre servicos por area, cidade ou CEP com uma experiencia clara.', icon: Search },
  { title: 'Agenda em poucos cliques', description: 'Escolha servico, horario e estabelecimento sem atrito.', icon: CalendarDays },
  { title: 'Favoritos e recorrencia', description: 'Crie uma base para repetir atendimentos e fortalecer relacionamento.', icon: Heart },
  { title: 'Gestao para negocios', description: 'Saloes e clinicas ganham vitrine, agenda e controle comercial.', icon: Building2 },
];

const appHighlights = ['Buscar por bairro, cidade ou CEP', 'Agendar servicos em poucos toques', 'Salvar favoritos e repetir atendimentos'];

const businessFeatures = [
  { title: 'Agenda online', icon: CalendarDays },
  { title: 'Gestao de clientes', icon: Users2 },
  { title: 'Vitrine por bairro', icon: Building2 },
  { title: 'Operacao mais segura', icon: ShieldCheck },
];

const trustItems = [
  { value: '98%', label: 'satisfacao dos clientes' },
  { value: '24/7', label: 'busca sempre disponivel' },
  { value: '8+', label: 'areas do Rio mapeadas' },
  { value: '100%', label: 'layout responsivo' },
];

const testimonials = [
  { quote: 'A experiencia ficou simples de entender e passa mais confianca para agendar.', author: 'Visao de cliente', role: 'Busca e agendamento' },
  { quote: 'A vitrine ajuda a apresentar servicos, horarios e diferenciais com mais clareza.', author: 'Visao de parceiro', role: 'Vitrine de servicos' },
  { quote: 'O fluxo deixa a operacao mais organizada e reduz atrito no primeiro contato.', author: 'Visao de gestao', role: 'Operacao comercial' },
];

const platformSignals = ['Agenda online', 'Vitrine publica', 'Busca por bairro', 'Painel do salao', 'Favoritos', 'Gestao comercial'];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getFallbackSuggestions(query: string): LocationSuggestion[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return fallbackLocations;
  }

  const matches = fallbackLocations.filter((item) =>
    normalize(`${item.label} ${item.region} ${(item.keywords ?? []).join(' ')}`).includes(normalizedQuery),
  );

  return matches.length > 0
    ? matches
    : [
        {
          label: query.trim(),
          region: 'Buscar nesta area',
          description: 'Vamos mostrar os servicos disponiveis mais proximos',
          cep: 'Digite um CEP completo para endereco exato',
          value: query.trim(),
        },
      ];
}

function buildSearchHref(service: string, location: string) {
  const params = new URLSearchParams();

  if (service.trim()) {
    params.set('servico', service.trim());
  }

  if (location.trim()) {
    params.set('local', location.trim());
  }

  const query = params.toString();
  return query ? `/negocios?${query}` : '/negocios';
}

export function HomeLanding({ featuredSalons = [] }: { featuredSalons?: PublicSalonShowcase[] }) {
  const router = useRouter();
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [remoteLocationSuggestions, setRemoteLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const visibleLocationSuggestions = remoteLocationSuggestions.length > 0 ? remoteLocationSuggestions : getFallbackSuggestions(location);

  useEffect(() => {
    if (!showLocationSuggestions || location.trim().length < 2) {
      setRemoteLocationSuggestions([]);
      setIsLoadingLocations(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoadingLocations(true);
        const response = await fetch(`/api/locations?q=${encodeURIComponent(location.trim())}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { suggestions?: LocationSuggestion[] };
        setRemoteLocationSuggestions(data.suggestions ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setRemoteLocationSuggestions([]);
        }
      } finally {
        setIsLoadingLocations(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [location, showLocationSuggestions]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildSearchHref(service, location));
  }

  return (
    <>
      <section id="buscar" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f2_58%,#f2e9df_100%)]">
        <div className="bc-home-confetti" aria-hidden="true" />
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(120,84,162,0.18),transparent_70%)] blur-3xl" />
        <div className="absolute -right-20 top-16 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(216,178,123,0.24),transparent_70%)] blur-3xl" />

        <div className="bc-container relative grid min-h-[620px] items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)] lg:gap-12 lg:py-16 xl:py-[4.5rem]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.14)] bg-white/86 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8d6a39] shadow-[0_12px_30px_rgba(110,84,144,0.08)]">
              <Sparkles size={15} />
              Marketplace premium de beleza
            </div>
            <h1 className="mt-5 max-w-[13ch] text-[clamp(2.3rem,4vw,3.8rem)] font-black leading-[1.02] tracking-[-0.06em] text-[color:var(--bc-text)]">
              Beleza, agenda e gestao no mesmo lugar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--bc-muted)] md:text-[1.18rem] md:leading-9">
              Encontre servicos por bairro, cidade ou CEP, agende com poucos cliques e ajude estabelecimentos
              a venderem com uma presenca digital mais profissional.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/negocios?local=Rio%20de%20Janeiro" className="bc-button-primary h-[3.75rem] px-8 text-[0.96rem]">
                Encontrar um servico
              </Link>
              <Link href="/cadastro-estabelecimento" className="bc-button-secondary h-[3.75rem] px-8 text-[0.96rem]">
                Cadastrar meu espaco
              </Link>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 max-w-4xl rounded-[1.9rem] border border-[rgba(120,84,162,0.13)] bg-white/96 p-3 shadow-[0_24px_58px_rgba(110,84,144,0.13)] backdrop-blur-xl"
            >
              <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr_auto]">
                <SearchInput
                  icon={<Search size={20} />}
                  eyebrow="Servico ou estabelecimento"
                  placeholder="Cabelo, unhas, barbearia..."
                  value={service}
                  onChange={setService}
                />

                <div className="relative">
                  <SearchInput
                    icon={<MapPin size={20} />}
                    eyebrow="Onde gostaria de agendar?"
                    placeholder="Bangu, Barra, Rio..."
                    value={location}
                    onChange={(value) => {
                      setLocation(value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setShowLocationSuggestions(false)}
                    autoCompleteProps={{
                      'aria-autocomplete': 'list',
                      'aria-expanded': showLocationSuggestions,
                      'aria-controls': 'home-location-autocomplete',
                    }}
                  />
                  {showLocationSuggestions ? (
                    <LocationAutocomplete
                      suggestions={visibleLocationSuggestions}
                      loading={isLoadingLocations}
                      onSelect={(item) => {
                        setLocation(item.value ?? item.label);
                        setShowLocationSuggestions(false);
                      }}
                    />
                  ) : null}
                </div>

                <button type="submit" className="bc-button-primary h-[4.35rem] px-9 text-[0.96rem]">
                  Buscar
                </button>
              </div>
            </form>

            <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-[rgba(120,84,162,0.1)] bg-white/82 px-5 py-[1.125rem] shadow-[0_12px_28px_rgba(110,84,144,0.07)]">
                  <strong className="block text-[1.7rem] font-black tracking-[-0.04em] text-[#6e4c98]">{item.value}</strong>
                  <span className="mt-1.5 block text-xs leading-5 text-[color:var(--bc-muted)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <HeroShowcase />
        </div>
      </section>

      <section id="categorias" className="border-y border-[rgba(120,84,162,0.08)] bg-white/88">
        <div className="bc-container flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#8d6a39]">Categorias mais buscadas</p>
          <nav className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <Link key={item} href={`/negocios?servico=${encodeURIComponent(item)}`} className="group inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(251,247,242,0.9))] px-5 py-3 text-sm font-extrabold text-[color:var(--bc-muted)] shadow-[0_8px_20px_rgba(110,84,144,0.05)] transition hover:-translate-y-0.5 hover:border-[rgba(216,178,123,0.42)] hover:bg-white hover:text-[#6e4c98] hover:shadow-[0_12px_26px_rgba(110,84,144,0.09)]">
                <Sparkles size={13} className="text-[#c79b5c] opacity-70 transition group-hover:opacity-100" />
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <FeaturedSalonsSection salons={featuredSalons} />

      <section className="bc-home-section bg-[color:var(--bc-surface)]">
        <div className="bc-container grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustItems.map((item) => (
            <article key={item.label} className="rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-white/94 p-6 shadow-[0_16px_38px_rgba(110,84,144,0.075)]">
              <strong className="block text-[2.2rem] font-black tracking-[-0.055em] text-[#6e4c98]">{item.value}</strong>
              <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--bc-muted)]">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <HighlightSection />
      <BenefitsSection />
      <AppSection />
      <BusinessSection />
      <SocialProofSection />
      <FinalCtaSection />
    </>
  );
}

function SearchInput({
  icon,
  eyebrow,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  autoCompleteProps,
}: {
  icon: ReactNode;
  eyebrow: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoCompleteProps?: Record<string, string | boolean>;
}) {
  return (
    <label className="flex min-h-[4.35rem] items-center gap-4 rounded-[1.35rem] border border-[rgba(120,84,162,0.1)] bg-[rgba(251,247,242,0.72)] px-5 text-left transition focus-within:border-[rgba(120,84,162,0.34)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(120,84,162,0.07)]">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#8d6a39]">{eyebrow}</span>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="mt-1 w-full bg-transparent text-[0.98rem] font-semibold text-[color:var(--bc-text)] outline-none placeholder:font-medium placeholder:text-[color:var(--bc-muted)]"
          {...autoCompleteProps}
        />
      </span>
    </label>
  );
}

function HeroShowcase() {
  return (
    <div className="relative min-h-[590px] lg:min-h-[610px]">
      <div className="absolute inset-0 rounded-[2.75rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(246,240,255,0.82),rgba(247,240,233,0.88))] shadow-[0_30px_78px_rgba(110,84,144,0.13)] backdrop-blur-xl" />
      <div className="absolute left-7 right-7 top-7 rounded-[1.9rem] border border-[rgba(120,84,162,0.1)] bg-white/92 p-5 shadow-[0_16px_36px_rgba(110,84,144,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8d6a39]">Busca ao vivo</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[color:var(--bc-text)]">Servicos perto de voce</h3>
          </div>
          <span className="rounded-full bg-[rgba(120,84,162,0.08)] px-4 py-2 text-xs font-bold text-[#6e4c98]">RJ</span>
        </div>
        <div className="mt-5 grid gap-3">
          {['Studio Orla Beauty', 'Lumi Studio Recreio', 'Casa Duna Nails'].map((item, index) => (
            <div key={item} className="flex items-center justify-between rounded-[1.3rem] border border-[rgba(120,84,162,0.08)] bg-[rgba(251,247,242,0.75)] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6e4c98]">
                  {index === 0 ? <Scissors size={16} /> : <Sparkles size={16} />}
                </span>
                <span>
                  <strong className="block text-sm text-[color:var(--bc-text)]">{item}</strong>
                  <span className="text-xs text-[color:var(--bc-muted)]">Agenda hoje</span>
                </span>
              </div>
              <ChevronRight size={17} className="text-[#8d6a39]" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-8 right-8 h-[320px] rounded-[2.1rem] bg-[linear-gradient(135deg,#6e4c98,#c79b5c)]" />
      <PhoneMockup className="bottom-16 left-[9%] rotate-[-7deg] scale-[1.01]" title="Favoritos" />
      <PhoneMockup className="bottom-20 right-[11%] rotate-[7deg] scale-[1.14]" title="Agenda" featured />

      <div className="absolute bottom-8 left-1/2 w-[280px] -translate-x-1/2 rounded-[1.7rem] border border-white/45 bg-white/92 p-5 shadow-[0_22px_48px_rgba(36,26,53,0.16)] backdrop-blur-xl">
        <div className="flex items-center gap-3 text-[#6e4c98]">
          <BadgeCheck size={20} />
          <span className="text-xs font-black uppercase tracking-[0.16em]">Confirmacao rapida</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[color:var(--bc-muted)]">Cliente escolhe servico, horario e envia a solicitacao para o estabelecimento.</p>
      </div>
    </div>
  );
}

function HighlightSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#6e4c98_0%,#7854a2_44%,#c79b5c_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(255,255,255,0.24),transparent_26%),radial-gradient(circle_at_84%_70%,rgba(255,255,255,0.18),transparent_28%)]" />
      <div className="bc-container relative grid gap-8 py-12 text-white md:py-[3.75rem] lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.26em] text-[#f1d7b1]">Destaque da plataforma</p>
          <h2 className="mt-5 max-w-[12ch] text-[clamp(2rem,4vw,3.7rem)] font-black leading-[1.02] tracking-[-0.055em]">
            Beleza ao alcance de um clique.
          </h2>
        </div>
        <div>
          <p className="text-lg leading-8 text-white/88 md:text-xl md:leading-9">
            Agende, descubra e gerencie servicos de beleza em um so lugar, com uma experiencia que passa confianca
            para clientes e posiciona melhor os estabelecimentos.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Busca por bairro', 'Agenda online', 'Perfis premium'].map((item) => (
              <div key={item} className="rounded-[1.4rem] border border-white/20 bg-white/12 p-4 backdrop-blur-md">
                <CheckCircle2 size={20} className="text-[#f1d7b1]" />
                <p className="mt-3 text-sm font-bold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="bc-home-section bg-[linear-gradient(180deg,#fffdfa,#f7f0e9)]">
      <div className="bc-container">
        <SectionIntro
          eyebrow="Por que escolher"
          title="Uma experiencia mais clara para clientes e mais forte para negocios."
          description="Fluxos simples, informacao bem organizada e uma vitrine que ajuda clientes e estabelecimentos a tomarem a proxima acao."
          center
        />

        <div className="mt-11 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="bc-premium-card group min-h-[280px] p-7 lg:p-8">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(120,84,162,0.12),rgba(216,178,123,0.18))] text-[#6e4c98] transition group-hover:scale-105">
                  <Icon size={22} />
                </span>
                <h3 className="mt-7 text-[1.45rem] font-black leading-tight tracking-[-0.04em] text-[color:var(--bc-text)]">{item.title}</h3>
                <p className="mt-4 text-[0.96rem] leading-7 text-[color:var(--bc-muted)]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AppSection() {
  return (
    <section id="app" className="bc-home-section bg-[color:var(--bc-surface)]">
      <div className="bc-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionIntro
            eyebrow="Produto real"
            title="Seu app de beleza com mais presenca visual."
            description="A composicao destaca busca, agenda e favoritos com leitura mais madura, criando uma percepcao clara de produto em uso."
          />

          <div className="mt-8 grid gap-3.5">
            {appHighlights.map((item) => (
              <div key={item} className="flex items-center gap-4 rounded-[1.35rem] border border-[rgba(120,84,162,0.1)] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(110,84,144,0.055)]">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(216,178,123,0.18)] text-[#8d6a39]">
                  <Star size={17} className="fill-current" />
                </span>
                <span className="font-bold text-[color:var(--bc-text)]">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/solucoes" className="bc-button-primary h-[3.75rem] px-8 text-[0.96rem]">
              Ver experiencia do app
            </Link>
            <Link href="/negocios?local=Rio%20de%20Janeiro" className="bc-button-secondary h-[3.75rem] px-8 text-[0.96rem]">
              Buscar servicos agora
            </Link>
          </div>
        </div>

        <div className="relative min-h-[540px] overflow-hidden rounded-[2.45rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(246,240,255,0.92),rgba(247,240,233,0.94))] p-8 shadow-[0_26px_68px_rgba(110,84,144,0.11)]">
          <div className="absolute inset-x-12 bottom-8 h-44 rounded-[999px] bg-[linear-gradient(90deg,#6e4c98,#c79b5c)] opacity-[0.18] blur-2xl" />
          <PhoneMockup className="left-[8%] top-24 rotate-[-9deg] scale-[1.05]" title="Favoritos" />
          <PhoneMockup className="right-[8%] top-10 rotate-[7deg] scale-[1.18]" title="Agenda" featured />
          <div className="absolute bottom-8 left-8 right-8 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-white/90 p-5 shadow-[0_18px_40px_rgba(110,84,144,0.1)] backdrop-blur-md">
            <p className="text-sm font-black text-[color:var(--bc-text)]">Horario confirmado</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--bc-muted)]">Manicure premium, hoje as 14:30 no Studio Orla Beauty.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BusinessSection() {
  return (
    <section id="estabelecimentos" className="bc-home-section bg-[linear-gradient(180deg,#f8f2ff,#fffdfa)]">
      <div className="bc-container grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="rounded-[2.45rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_24px_62px_rgba(110,84,144,0.11)] md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {businessFeatures.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[1.65rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,233,0.9))] p-5 shadow-[0_10px_24px_rgba(110,84,144,0.045)]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(120,84,162,0.08)] text-[#6e4c98]">
                    <Icon size={18} />
                  </span>
                  <p className="mt-5 text-[1.05rem] font-black tracking-[-0.03em] text-[color:var(--bc-text)]">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <SectionIntro
            eyebrow="Para estabelecimentos"
            title="Uma vitrine comercial para saloes, barbearias e clinicas crescerem."
            description="Destaque servicos, organize horarios, receba solicitacoes e transforme a presenca digital do seu espaco em um canal comercial mais profissional."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cadastro-estabelecimento" className="bc-button-primary h-[3.75rem] px-8 text-[0.96rem]">
              Cadastrar meu estabelecimento
            </Link>
            <Link href="/entrar" className="bc-button-secondary h-[3.75rem] px-8 text-[0.96rem]">
              Entrar no painel
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="bc-home-section bg-[color:var(--bc-surface)]">
      <div className="bc-container">
        <SectionIntro
          eyebrow="Prova social"
          title="Sinais de confianca sem exagero, com leitura limpa e comercial."
          description="Numeros, depoimentos e recursos da plataforma apresentados com uma leitura clara, comercial e facil de atualizar."
          center
        />

        <div className="mt-11 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.author} className="bc-premium-card p-7 lg:p-8">
              <div className="flex gap-1 text-[#c79b5c]">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} size={16} className="fill-current" />
                ))}
              </div>
              <p className="mt-6 text-base leading-8 text-[color:var(--bc-muted)]">"{item.quote}"</p>
              <div className="mt-7 flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(120,84,162,0.08)] text-[#6e4c98]">
                  <Users2 size={18} />
                </span>
                <span>
                  <strong className="block text-[color:var(--bc-text)]">{item.author}</strong>
                  <span className="text-sm text-[color:var(--bc-muted)]">{item.role}</span>
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-3 rounded-[1.9rem] border border-[rgba(120,84,162,0.1)] bg-white/94 p-4 shadow-[0_16px_38px_rgba(110,84,144,0.075)] sm:grid-cols-2 lg:grid-cols-6">
          {platformSignals.map((signal) => (
            <div key={signal} className="rounded-[1.15rem] bg-[rgba(120,84,162,0.045)] px-4 py-4 text-center text-sm font-black text-[color:var(--bc-text)] transition hover:bg-[rgba(216,178,123,0.14)]">
              {signal}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="bc-home-section pt-2">
      <div className="bc-container">
        <div className="relative overflow-hidden rounded-[2.6rem] border border-[rgba(120,84,162,0.12)] bg-[linear-gradient(135deg,#fffdfa,#f6f0ff_48%,#f4e8d7)] px-6 py-12 shadow-[0_26px_76px_rgba(110,84,144,0.12)] md:px-12 md:py-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(120,84,162,0.18),transparent_70%)] blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(216,178,123,0.22),transparent_70%)] blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="bc-kicker">Proximo passo</p>
              <h2 className="max-w-3xl text-[clamp(2.05rem,4vw,3.95rem)] font-black leading-[1.02] tracking-[-0.055em] text-[color:var(--bc-text)]">
                Quer uma forma simples de aumentar sua renda e agregar valor ao seu trabalho?
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--bc-muted)]">
                Conheça nossas soluções para salões e profissionais crescerem com mais clareza.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:w-[340px] lg:flex-col">
              <Link
                href="/programa-de-parceiros"
                className="bc-button-secondary h-[3.75rem] px-8 text-[0.96rem]"
              >
                Quero ser parceiro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSalonsSection({ salons }: { salons: PublicSalonShowcase[] }) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const hasSalons = salons.length > 0;
  const canNavigate = salons.length > 1;

  function scrollPartners(direction: 'left' | 'right') {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    carousel.scrollBy({
      behavior: 'smooth',
      left: direction === 'left' ? -280 : 280,
    });
  }

  return (
    <section className="bc-home-section">
      <div className="bc-container grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <p className="bc-kicker">Saloes em destaque</p>
          <h2 className="text-[clamp(1.75rem,4vw,2.45rem)] font-black tracking-[-0.05em] text-[color:var(--bc-text)]">
            Estabelecimentos parceiros que ja fazem parte da Beleza Carioca.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[color:var(--bc-muted)]">
            Conheca os espacos publicos e ativos cadastrados na plataforma, sem nomes ficticios em producao.
          </p>
        </div>

        <div className="min-w-0 rounded-[2rem] border border-[rgba(120,84,162,0.12)] bg-white/95 p-4 shadow-[0_20px_50px_rgba(110,84,144,0.08)]">
          <div className="flex items-center justify-between gap-3 border-b border-[rgba(120,84,162,0.1)] pb-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">Estabelecimentos parceiros</p>
              <p className="mt-1 text-sm text-[color:var(--bc-muted)]">Conheca os espacos que ja fazem parte da Beleza Carioca.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {canNavigate ? (
                <>
                  <button
                    type="button"
                    aria-label="Ver estabelecimentos anteriores"
                    onClick={() => scrollPartners('left')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(120,84,162,0.14)] bg-white text-[#6e4c98] shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(120,84,162,0.28)]"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button
                    type="button"
                    aria-label="Ver mais estabelecimentos"
                    onClick={() => scrollPartners('right')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(120,84,162,0.14)] bg-white text-[#6e4c98] shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(120,84,162,0.28)]"
                  >
                    <ChevronRight size={17} />
                  </button>
                </>
              ) : null}
              <span className="rounded-full bg-[#f7eefc] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#6e4c98]">
                {hasSalons ? 'Ao vivo' : 'Em breve'}
              </span>
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-[1.75rem] bg-[#fbf8ff] p-3">
            {hasSalons ? (
              <>
                <div ref={carouselRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 pt-1">
                  {salons.map((salon) => {
                    const initials = salon.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('');
                    const location = [salon.neighborhood, salon.city, salon.state].filter(Boolean).join(', ');
                    const content = (
                      <>
                        <div className="-m-4 mb-3 h-24 overflow-hidden rounded-t-[1.6rem] bg-[linear-gradient(135deg,#241a35,#6e4c98_56%,#c79b5c)]">
                          {salon.coverUrl ? <img src={salon.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="-mt-10 mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.2rem] border-2 border-white bg-gradient-to-br from-[#f5e0ff] to-[#efe2ff] text-lg font-black shadow-[0_10px_24px_rgba(110,84,144,0.12)]" style={{ color: salon.primaryColor }}>
                          {salon.logoUrl ? <img src={salon.logoUrl} alt="" className="h-full w-full object-cover" /> : initials}
                        </div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]" style={{ color: salon.primaryColor }}>
                          {salon.category ?? 'Estabelecimento parceiro'}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-sm font-black leading-6 text-[color:var(--bc-text)]">{salon.name}</h3>
                        {location ? (
                          <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-[color:var(--bc-muted)]">
                            <MapPin size={13} className="shrink-0 text-[#c79b5c]" />
                            <span className="truncate">{location}</span>
                          </p>
                        ) : null}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em]" style={{ color: salon.primaryColor }}>
                          {salon.slug ? 'Ver perfil' : 'Em breve'}
                          {salon.slug ? <ChevronRight size={14} /> : null}
                        </span>
                      </>
                    );

                    return salon.slug ? (
                      <Link
                        key={salon.id}
                        href={`/estabelecimentos/${salon.slug}`}
                        className="min-w-[230px] max-w-[230px] snap-start rounded-[1.6rem] border border-[rgba(120,84,162,0.1)] bg-white p-4 shadow-[0_12px_28px_rgba(110,84,144,0.08)] transition hover:-translate-y-1 hover:border-[rgba(216,178,123,0.3)] hover:shadow-[0_18px_36px_rgba(110,84,144,0.14)]"
                      >
                        {content}
                      </Link>
                    ) : (
                      <article
                        key={salon.id}
                        className="min-w-[230px] max-w-[230px] snap-start rounded-[1.6rem] border border-[rgba(120,84,162,0.1)] bg-white p-4 shadow-[0_12px_28px_rgba(110,84,144,0.08)]"
                      >
                        {content}
                      </article>
                    );
                  })}
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#fbf8ff] to-transparent" />
              </>
            ) : (
              <div className="rounded-[1.45rem] border border-dashed border-[rgba(120,84,162,0.22)] bg-white px-5 py-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-[#f7eefc] text-[#6e4c98]">
                      <Building2 size={20} />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-[color:var(--bc-text)]">Em breve, novos parceiros estarao disponiveis aqui.</h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--bc-muted)]">
                        Os primeiros estabelecimentos cadastrados na Beleza Carioca aparecerao nesta vitrine.
                      </p>
                    </div>
                  </div>
                  <Link href="/cadastro-estabelecimento" className="bc-button-secondary h-12 shrink-0 px-5 text-xs">
                    Cadastrar meu espaco
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="max-w-[30rem] text-sm leading-6 text-[color:var(--bc-muted)]">
              A vitrine mostra apenas estabelecimentos disponiveis para receber novos clientes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
}) {
  return (
    <div className={center ? 'mx-auto max-w-4xl text-center' : 'max-w-3xl'}>
      <p className="bc-kicker">{eyebrow}</p>
      <h2 className="text-[clamp(1.9rem,4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.055em] text-[color:var(--bc-text)]">
        {title}
      </h2>
      <p className="mt-5 text-lg leading-8 text-[color:var(--bc-muted)]">{description}</p>
    </div>
  );
}

function PhoneMockup({ title, featured = false, className }: { title: string; featured?: boolean; className: string }) {
  return (
    <div className={`absolute w-[220px] rounded-[2.45rem] bg-[#1f1a2e] p-2.5 shadow-[0_24px_58px_rgba(36,26,53,0.24)] md:w-[235px] ${className}`}>
      <div className="overflow-hidden rounded-[2.1rem] bg-white">
        <div className="flex items-center justify-between border-b border-[rgba(120,84,162,0.1)] px-4 py-3 text-[11px] font-bold text-[color:var(--bc-text)]">
          <span>9:41</span>
          <span>{title}</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(120,84,162,0.09),rgba(216,178,123,0.16))] p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#7a58a6] shadow-[0_10px_20px_rgba(110,84,144,0.08)]">
                {featured ? <CalendarDays size={18} /> : <Scissors size={18} />}
              </span>
              <div>
                <p className="text-sm font-black text-[color:var(--bc-text)]">{featured ? 'Hoje as 14:30' : 'Studio favorito'}</p>
                <p className="mt-1 text-xs text-[color:var(--bc-muted)]">{featured ? 'Corte + finalizacao' : 'Agenda aberta'}</p>
              </div>
            </div>
          </div>
          {['Cabelos', 'Unhas', 'Sobrancelhas'].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-2xl border border-[rgba(120,84,162,0.1)] px-3 py-2.5">
              <span className="text-xs font-semibold text-[color:var(--bc-muted)]">{item}</span>
              <ChevronRight size={14} className="text-[#8d6a39]" />
            </div>
          ))}
          <button type="button" className="h-11 w-full rounded-full bg-[linear-gradient(135deg,#7a58a6,#caa064)] text-sm font-bold text-white">
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationAutocomplete({
  suggestions,
  loading,
  onSelect,
}: {
  suggestions: LocationSuggestion[];
  loading: boolean;
  onSelect: (item: LocationSuggestion) => void;
}) {
  return (
    <div id="home-location-autocomplete" className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 max-h-[390px] overflow-y-auto rounded-[1.4rem] border border-[rgba(120,84,162,0.16)] bg-white text-left shadow-[0_24px_54px_rgba(36,26,53,0.18)]" role="listbox">
      {suggestions.map((item) => (
        <button
          key={`${item.label}-${item.region}-${item.cep ?? 'sem-cep'}`}
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(item);
          }}
          className="flex w-full items-start gap-3 border-b border-[rgba(120,84,162,0.08)] px-4 py-4 text-left transition last:border-b-0 hover:bg-[rgba(120,84,162,0.06)]"
          role="option"
        >
          <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
            <MapPin size={15} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black text-[color:var(--bc-text)]">
              {item.label} <span className="font-semibold text-[color:var(--bc-muted)]">{item.region}</span>
            </span>
            <span className="mt-1 block text-xs leading-5 text-[color:var(--bc-muted)]">{item.description}</span>
            {item.cep ? <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8d6a39]">CEP: {item.cep}</span> : null}
          </span>
        </button>
      ))}
      <div className="flex justify-end bg-[rgba(251,247,242,0.86)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8d6a39]">
        {loading ? 'buscando cidades e ceps...' : 'sugestoes Beleza Carioca'}
      </div>
    </div>
  );
}
