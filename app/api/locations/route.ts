import { NextResponse } from 'next/server';

type IbgeUf = {
  sigla: string;
  nome: string;
  regiao?: {
    nome: string;
  };
};

type IbgeMunicipality = {
  id: number;
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: IbgeUf;
    };
  };
  'regiao-imediata'?: {
    'regiao-intermediaria'?: {
      UF?: IbgeUf;
    };
  };
};

type ViaCepAddress = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  estado?: string;
  erro?: boolean;
};

type NeighborhoodSuggestion = {
  label: string;
  city: string;
  uf: string;
  description: string;
  cep: string;
  keywords: string[];
};

const ibgeMunicipalitiesUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';

const states = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapa' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceara' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espirito Santo' },
  { uf: 'GO', name: 'Goias' },
  { uf: 'MA', name: 'Maranhao' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Para' },
  { uf: 'PB', name: 'Paraiba' },
  { uf: 'PR', name: 'Parana' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piaui' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondonia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'Sao Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

const cepHints: Record<string, string> = {
  'barra da tijuca-rj': '22600-000 a 22793-000',
  'botafogo-rj': '22250-000 a 22299-999',
  'campo grande-rj': '23000-000 a 23099-999',
  'centro-rj': '20000-000 a 20231-999',
  'copacabana-rj': '22010-000 a 22099-999',
  'ipanema-rj': '22410-000 a 22421-999',
  'recreio dos bandeirantes-rj': '22790-000 a 22795-999',
  'rio de janeiro-rj': '20000-000 a 23799-999',
  'tijuca-rj': '20510-000 a 20561-999',
  'sao paulo-sp': '01000-000 a 05999-999',
};

const neighborhoodSuggestions: NeighborhoodSuggestion[] = [
  {
    label: 'Bangu',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Oeste com saloes, barbearias e estetica',
    cep: 'CEP varia por rua',
    keywords: ['bangu', 'zona oeste'],
  },
  {
    label: 'Campo Grande',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Oeste com servicos de beleza cadastrados',
    cep: 'CEP varia por rua',
    keywords: ['campo grande', 'campo grande rj', 'zona oeste'],
  },
  {
    label: 'Barra da Tijuca',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro com saloes, esmalterias, barbearias e clinicas',
    cep: '22600-000 a 22793-000',
    keywords: ['barra', 'barra da tijuca', 'jardim oceanico'],
  },
  {
    label: 'Recreio dos Bandeirantes',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro com saloes, estetica e servicos de bem-estar',
    cep: '22790-000 a 22795-999',
    keywords: ['recreio', 'recreio dos bandeirantes'],
  },
  {
    label: 'Centro',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro central para atendimento rapido perto do trabalho',
    cep: '20000-000 a 20231-999',
    keywords: ['centro', 'centro rj'],
  },
  {
    label: 'Copacabana',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Sul com unhas, cabelo e beleza express',
    cep: '22010-000 a 22099-999',
    keywords: ['copacabana', 'copa', 'zona sul'],
  },
  {
    label: 'Ipanema',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Sul com experiencias premium de beleza',
    cep: '22410-000 a 22421-999',
    keywords: ['ipanema', 'zona sul'],
  },
  {
    label: 'Leblon',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Sul com saloes e studios premium',
    cep: 'CEP varia por rua',
    keywords: ['leblon', 'zona sul'],
  },
  {
    label: 'Tijuca',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro com barbearias, saloes e sobrancelhas',
    cep: '20510-000 a 20561-999',
    keywords: ['tijuca', 'grande tijuca'],
  },
  {
    label: 'Botafogo',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro com spa, massagem e estetica',
    cep: '22250-000 a 22299-999',
    keywords: ['botafogo', 'zona sul'],
  },
  {
    label: 'Flamengo',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Sul com saloes e clinicas',
    cep: 'CEP varia por rua',
    keywords: ['flamengo', 'zona sul'],
  },
  {
    label: 'Laranjeiras',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro com atendimento de beleza e bem-estar',
    cep: 'CEP varia por rua',
    keywords: ['laranjeiras', 'zona sul'],
  },
  {
    label: 'Meier',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Norte com saloes e barbearias',
    cep: 'CEP varia por rua',
    keywords: ['meier', 'méier', 'zona norte'],
  },
  {
    label: 'Madureira',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Norte com servicos de beleza',
    cep: 'CEP varia por rua',
    keywords: ['madureira', 'zona norte'],
  },
  {
    label: 'Jacarepagua',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Regiao com saloes, estetica e servicos recorrentes',
    cep: 'CEP varia por rua',
    keywords: ['jacarepagua', 'jacarepaguá', 'freguesia', 'taquara'],
  },
  {
    label: 'Taquara',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro de Jacarepagua com saloes e clinicas',
    cep: 'CEP varia por rua',
    keywords: ['taquara', 'jacarepagua'],
  },
  {
    label: 'Freguesia de Jacarepagua',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro com saloes, estetica e studios',
    cep: 'CEP varia por rua',
    keywords: ['freguesia', 'freguesia de jacarepagua', 'jacarepagua'],
  },
  {
    label: 'Vila Isabel',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Norte com saloes e barbearias',
    cep: 'CEP varia por rua',
    keywords: ['vila isabel'],
  },
  {
    label: 'Grajaú',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro com saloes e atendimento de beleza',
    cep: 'CEP varia por rua',
    keywords: ['grajau', 'grajaú'],
  },
  {
    label: 'Realengo',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Oeste com barbearias e saloes',
    cep: 'CEP varia por rua',
    keywords: ['realengo', 'zona oeste'],
  },
  {
    label: 'Padre Miguel',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Oeste com servicos de beleza',
    cep: 'CEP varia por rua',
    keywords: ['padre miguel'],
  },
  {
    label: 'Santa Cruz',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Oeste com servicos cadastrados',
    cep: 'CEP varia por rua',
    keywords: ['santa cruz', 'zona oeste'],
  },
  {
    label: 'Iraja',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Norte com saloes e estetica',
    cep: 'CEP varia por rua',
    keywords: ['iraja', 'irajá'],
  },
  {
    label: 'Penha',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Zona Norte com saloes e barbearias',
    cep: 'CEP varia por rua',
    keywords: ['penha'],
  },
  {
    label: 'Ilha do Governador',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Regiao com saloes, estetica e bem-estar',
    cep: 'CEP varia por rua',
    keywords: ['ilha', 'ilha do governador', 'jardim guanabara'],
  },
  {
    label: 'Jardim Guanabara',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    description: 'Bairro da Ilha do Governador com servicos de beleza',
    cep: 'CEP varia por rua',
    keywords: ['jardim guanabara', 'ilha do governador'],
  },
];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getUf(municipality: IbgeMunicipality) {
  return (
    municipality.microrregiao?.mesorregiao?.UF ??
    municipality['regiao-imediata']?.['regiao-intermediaria']?.UF
  );
}

function findState(query: string) {
  const normalizedQuery = normalize(query);

  return states.find((state) => {
    return normalize(state.uf) === normalizedQuery || normalize(state.name) === normalizedQuery;
  });
}

function getCepHint(label: string, uf: string) {
  return cepHints[`${normalize(label)}-${normalize(uf)}`] ?? 'CEP por logradouro';
}

function searchNeighborhoods(query: string) {
  const normalizedQuery = normalize(query);

  if (['rio', 'rio de janeiro', 'rj'].includes(normalizedQuery)) {
    return [];
  }

  return neighborhoodSuggestions
    .filter((neighborhood) => {
      const target = normalize(`${neighborhood.label} ${neighborhood.keywords.join(' ')}`);
      return target.includes(normalizedQuery);
    })
    .slice(0, 12)
    .map((neighborhood) => ({
      label: neighborhood.label,
      region: `${neighborhood.city}, ${neighborhood.uf}`,
      description: neighborhood.description,
      cep: neighborhood.cep,
      value: neighborhood.label,
      source: 'bairro',
    }));
}

async function searchCep(query: string) {
  const cep = query.replace(/\D/g, '');

  if (cep.length !== 8) {
    return null;
  }

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    next: {
      revalidate: 60 * 60 * 24 * 30,
    },
  });

  if (!response.ok) {
    return null;
  }

  const address = (await response.json()) as ViaCepAddress;

  if (address.erro || !address.cep) {
    return null;
  }

  return {
    label: [address.logradouro, address.bairro].filter(Boolean).join(', ') || address.localidade || address.cep,
    region: `${address.localidade ?? ''}${address.uf ? `, ${address.uf}` : ''}`.trim(),
    description: address.estado ? `Endereco encontrado em ${address.estado}` : 'Endereco encontrado pelo CEP',
    cep: address.cep,
    value: address.localidade ?? address.cep,
    source: 'viacep',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const cepSuggestion = await searchCep(query);

  if (cepSuggestion) {
    return NextResponse.json({ suggestions: [cepSuggestion] });
  }

  const neighborhoodMatches = searchNeighborhoods(query);

  if (neighborhoodMatches.length > 0) {
    return NextResponse.json({ suggestions: neighborhoodMatches });
  }

  const response = await fetch(ibgeMunicipalitiesUrl, {
    next: {
      revalidate: 60 * 60 * 24 * 30,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }

  const municipalities = (await response.json()) as IbgeMunicipality[];
  const normalizedQuery = normalize(query);
  const stateMatch = findState(query);
  const shouldShowRioState = ['rio', 'rio de janeiro', 'rj'].includes(normalizedQuery);

  const filtered = municipalities
    .filter((municipality) => {
      const uf = getUf(municipality);

      if (!uf) {
        return false;
      }

      if (shouldShowRioState) {
        return uf.sigla === 'RJ';
      }

      if (stateMatch) {
        return uf.sigla === stateMatch.uf;
      }

      const target = normalize(`${municipality.nome} ${uf.nome} ${uf.sigla}`);
      return target.includes(normalizedQuery);
    })
    .sort((a, b) => {
      const ufA = getUf(a)?.sigla ?? '';
      const ufB = getUf(b)?.sigla ?? '';

      if (ufA === 'RJ' && ufB !== 'RJ') {
        return -1;
      }

      if (ufA !== 'RJ' && ufB === 'RJ') {
        return 1;
      }

      return a.nome.localeCompare(b.nome);
    })
    .slice(0, shouldShowRioState || stateMatch ? 120 : 30)
    .map((municipality) => {
      const uf = getUf(municipality);
      const ufLabel = uf?.sigla ?? 'BR';

      return {
        label: municipality.nome,
        region: `${ufLabel}, Brasil`,
        description: uf?.nome ? `Cidade de ${uf.nome}` : 'Cidade brasileira',
        cep: getCepHint(municipality.nome, ufLabel),
        value: municipality.nome,
        ibge: municipality.id,
        source: 'ibge',
      };
    });

  return NextResponse.json({ suggestions: filtered });
}
