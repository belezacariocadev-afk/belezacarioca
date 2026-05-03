export type ServiceItem = {
  name: string;
  category: string;
  duration: string;
  price: string;
};

export type SearchVenue = {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  address: string;
  rating: string;
  reviewCount: number;
  description: string;
  badge: string;
  services: ServiceItem[];
  phone: string;
  hours: string;
  team: string[];
  amenities: string[];
  highlights: string[];
};

export const venues: SearchVenue[] = [
  {
    id: 'studio-orla-barra',
    name: 'Studio Orla Beauty',
    neighborhood: 'Barra da Tijuca',
    city: 'Rio de Janeiro',
    address: 'Av. das Americas, 500',
    rating: '4.9',
    reviewCount: 128,
    description: 'Salao completo para cabelo, manicure, maquiagem e tratamentos.',
    badge: 'Agenda hoje',
    phone: '(21) 98888-1200',
    hours: 'Seg a sab, 09:00 as 20:00',
    team: ['Aline Rocha', 'Bianca Moura', 'Camila Reis'],
    amenities: ['Wi-Fi', 'Estacionamento proximo', 'Cartao e Pix', 'Ambiente climatizado'],
    highlights: ['Agenda online', 'Atendimento premium', 'Confirmacao rapida'],
    services: [
      { name: 'Escova modelada', category: 'Cabelos', duration: '50 min', price: 'R$ 85' },
      { name: 'Corte feminino', category: 'Cabelos', duration: '60 min', price: 'R$ 120' },
      { name: 'Manicure premium', category: 'Unhas', duration: '45 min', price: 'R$ 55' },
    ],
  },
  {
    id: 'recreio-lumi',
    name: 'Lumi Studio Recreio',
    neighborhood: 'Recreio dos Bandeirantes',
    city: 'Rio de Janeiro',
    address: 'Av. Genaro de Carvalho, 920',
    rating: '4.8',
    reviewCount: 96,
    description: 'Atendimento para cabelos, sobrancelhas e estetica facial.',
    badge: 'Mais procurado',
    phone: '(21) 97777-4500',
    hours: 'Ter a sab, 10:00 as 19:00',
    team: ['Luiza Nunes', 'Mari Torres', 'Paula Lima'],
    amenities: ['Agendamento online', 'Pix', 'Sala privativa', 'Acessibilidade'],
    highlights: ['Especialistas em sobrancelhas', 'Estetica facial', 'Produtos profissionais'],
    services: [
      { name: 'Design de sobrancelhas', category: 'Sobrancelhas', duration: '35 min', price: 'R$ 65' },
      { name: 'Limpeza de pele', category: 'Estetica', duration: '70 min', price: 'R$ 160' },
      { name: 'Hidratacao capilar', category: 'Cabelos', duration: '60 min', price: 'R$ 140' },
    ],
  },
  {
    id: 'centro-jerson',
    name: 'Jerson Coiffeur Centro',
    neighborhood: 'Centro',
    city: 'Rio de Janeiro',
    address: 'Rua da Assembleia, 88',
    rating: '4.7',
    reviewCount: 211,
    description: 'Cortes, coloracao, escova e servicos rapidos perto do trabalho.',
    badge: 'Perto do metro',
    phone: '(21) 96666-3100',
    hours: 'Seg a sex, 08:00 as 19:00',
    team: ['Jerson Silva', 'Renata Alves', 'Diego Costa'],
    amenities: ['Perto do metro', 'Atendimento express', 'Cartao e Pix', 'Sala de espera'],
    highlights: ['Ideal para rotina de trabalho', 'Servicos rapidos', 'Equipe senior'],
    services: [
      { name: 'Corte masculino', category: 'Barbearia', duration: '35 min', price: 'R$ 70' },
      { name: 'Coloracao raiz', category: 'Cabelos', duration: '90 min', price: 'R$ 190' },
      { name: 'Escova express', category: 'Cabelos', duration: '35 min', price: 'R$ 70' },
    ],
  },
  {
    id: 'copa-nails',
    name: 'Casa Duna Nails',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
    address: 'Rua Barata Ribeiro, 410',
    rating: '4.9',
    reviewCount: 174,
    description: 'Unhas, spa dos pes e beleza express para rotina corrida.',
    badge: 'Confirmacao rapida',
    phone: '(21) 95555-9800',
    hours: 'Seg a sab, 09:00 as 18:30',
    team: ['Duda Martins', 'Nina Castro', 'Sofia Leal'],
    amenities: ['Esmaltaria completa', 'Pix', 'Atendimento express', 'Cafe'],
    highlights: ['Unhas premium', 'Spa dos pes', 'Alongamento'],
    services: [
      { name: 'Manicure e pedicure', category: 'Unhas', duration: '70 min', price: 'R$ 95' },
      { name: 'Alongamento em gel', category: 'Unhas', duration: '120 min', price: 'R$ 210' },
      { name: 'Spa dos pes', category: 'Unhas', duration: '50 min', price: 'R$ 90' },
    ],
  },
  {
    id: 'ipanema-aura',
    name: 'Atelie Aura Ipanema',
    neighborhood: 'Ipanema',
    city: 'Rio de Janeiro',
    address: 'Rua Visconde de Piraja, 320',
    rating: '5.0',
    reviewCount: 82,
    description: 'Experiencia premium para maquiagem, cabelo e atendimento de noivas.',
    badge: 'Premium',
    phone: '(21) 94444-7200',
    hours: 'Ter a dom, 10:00 as 20:00',
    team: ['Aura Mendes', 'Helena Prado', 'Lara Duarte'],
    amenities: ['Noivas', 'Sala privativa', 'Produtos importados', 'Cartao e Pix'],
    highlights: ['Maquiagem premium', 'Penteados', 'Eventos'],
    services: [
      { name: 'Maquiagem social', category: 'Maquiagem', duration: '60 min', price: 'R$ 180' },
      { name: 'Penteado', category: 'Cabelos', duration: '75 min', price: 'R$ 220' },
      { name: 'Consultoria de beleza', category: 'Estetica', duration: '50 min', price: 'R$ 150' },
    ],
  },
  {
    id: 'tijuca-barber',
    name: 'Barbearia Lumina Tijuca',
    neighborhood: 'Tijuca',
    city: 'Rio de Janeiro',
    address: 'Rua Conde de Bonfim, 650',
    rating: '4.8',
    reviewCount: 137,
    description: 'Corte, barba e acabamento com agenda organizada.',
    badge: 'Atende hoje',
    phone: '(21) 93333-5100',
    hours: 'Seg a sab, 09:00 as 21:00',
    team: ['Andre Reis', 'Caio Lima', 'Rafael Rocha'],
    amenities: ['Barbearia classica', 'Bebidas', 'Pix', 'Agenda online'],
    highlights: ['Corte + barba', 'Atendimento rapido', 'Acabamento premium'],
    services: [
      { name: 'Corte + barba', category: 'Barbearia', duration: '60 min', price: 'R$ 110' },
      { name: 'Barba completa', category: 'Barbearia', duration: '35 min', price: 'R$ 65' },
      { name: 'Sobrancelha masculina', category: 'Sobrancelhas', duration: '20 min', price: 'R$ 35' },
    ],
  },
  {
    id: 'botafogo-spa',
    name: 'Bella Rio Spa',
    neighborhood: 'Botafogo',
    city: 'Rio de Janeiro',
    address: 'Rua Voluntarios da Patria, 210',
    rating: '4.8',
    reviewCount: 118,
    description: 'Massagem, drenagem e estetica corporal em ambiente calmo.',
    badge: 'Relax',
    phone: '(21) 92222-6300',
    hours: 'Seg a sab, 10:00 as 20:00',
    team: ['Marta Soares', 'Clara Assis', 'Tais Moreira'],
    amenities: ['Sala privativa', 'Ambiente relaxante', 'Pix', 'Produtos naturais'],
    highlights: ['Massagem', 'Drenagem', 'Estetica corporal'],
    services: [
      { name: 'Massagem relaxante', category: 'Massagem', duration: '60 min', price: 'R$ 170' },
      { name: 'Drenagem linfatica', category: 'Massagem', duration: '70 min', price: 'R$ 190' },
      { name: 'Limpeza de pele', category: 'Estetica', duration: '70 min', price: 'R$ 160' },
    ],
  },
  {
    id: 'campo-grande-beauty',
    name: 'Espaco Bela Campo Grande',
    neighborhood: 'Campo Grande',
    city: 'Rio de Janeiro',
    address: 'Estrada do Monteiro, 1200',
    rating: '4.7',
    reviewCount: 74,
    description: 'Cabelo, unhas e sobrancelhas para quem quer agendar no bairro.',
    badge: 'Bairro atendido',
    phone: '(21) 91111-2800',
    hours: 'Seg a sab, 08:30 as 19:30',
    team: ['Bruna Matos', 'Nath Souza', 'Tamires Lopes'],
    amenities: ['Perto do comercio', 'Pix', 'Atendimento familiar', 'Agenda online'],
    highlights: ['Cabelos', 'Unhas', 'Sobrancelhas'],
    services: [
      { name: 'Escova progressiva', category: 'Cabelos', duration: '150 min', price: 'R$ 260' },
      { name: 'Manicure simples', category: 'Unhas', duration: '40 min', price: 'R$ 45' },
      { name: 'Design com henna', category: 'Sobrancelhas', duration: '45 min', price: 'R$ 80' },
    ],
  },
];

export const serviceFilters = ['Cabelos', 'Unhas', 'Barbearia', 'Sobrancelhas', 'Estetica', 'Massagem', 'Maquiagem'];

export function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function textContains(source: string, query: string) {
  return normalize(source).includes(normalize(query));
}

export function getVenueById(id: string) {
  return venues.find((venue) => venue.id === id);
}

export function matchesLocation(venue: SearchVenue, location?: string) {
  if (!location) {
    return true;
  }

  const target = `${venue.neighborhood} ${venue.city} ${venue.address}`;
  return textContains(target, location);
}

export function matchesService(venue: SearchVenue, service?: string) {
  if (!service) {
    return true;
  }

  const target = `${venue.name} ${venue.description} ${venue.services
    .map((item) => `${item.name} ${item.category}`)
    .join(' ')}`;

  return textContains(target, service);
}

export function getFilteredVenues(service?: string, location?: string) {
  const exactMatches = venues.filter((venue) => matchesLocation(venue, location) && matchesService(venue, service));

  if (exactMatches.length > 0) {
    return {
      matches: exactMatches,
      usedFallback: false,
    };
  }

  return {
    matches: venues.filter((venue) => matchesService(venue, service)),
    usedFallback: true,
  };
}

export function getAreas(items: SearchVenue[]) {
  return Array.from(new Set(items.map((venue) => venue.neighborhood))).sort((a, b) => a.localeCompare(b));
}

export function getVisibleServices(venue: SearchVenue, service?: string) {
  if (!service) {
    return venue.services;
  }

  const serviceMatches = venue.services.filter((item) => textContains(`${item.name} ${item.category}`, service));
  return serviceMatches.length > 0 ? serviceMatches : venue.services;
}
