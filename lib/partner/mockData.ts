import type {
  PartnerReferralSource,
  ReferredAccountType,
  ReferralConversionStatus,
  SubscriptionStatus,
} from '@/lib/partner/program';

export type LeadStatus = 'novo' | 'em_contato' | 'proposta_enviada' | 'convertido' | 'nao_avancou';

export type ConversionStatus = Extract<ReferralConversionStatus, 'qualified' | 'subscribed' | 'paid' | 'canceled'>;

export type PaymentStatus = 'pago' | 'em_processamento' | 'agendado' | 'falhou';

export type PartnerLead = {
  accountType: ReferredAccountType;
  conversionStatus: ReferralConversionStatus;
  createdAt: string;
  id: string;
  name: string;
  company: string;
  source: PartnerReferralSource | null;
  status: LeadStatus;
};

export type PartnerConversion = {
  accountType: ReferredAccountType;
  commissionCents: number;
  convertedAt: string;
  establishmentName: string;
  id: string;
  paymentConfirmed: boolean;
  planName: string;
  source: PartnerReferralSource | null;
  status: ConversionStatus;
  subscriptionStatus: SubscriptionStatus;
};

export type PartnerMaterial = {
  id: string;
  title: string;
  description: string;
  category: 'story' | 'feed' | 'texto' | 'apresentacao' | 'manual';
  format: string;
  updatedAt: string;
  previewUrl?: string;
  downloadUrl?: string;
  copyText?: string;
};

export type PartnerPayment = {
  id: string;
  date: string;
  valueCents: number;
  method: string;
  status: PaymentStatus;
  reference: string;
};

export type PartnerRecentStatus = {
  id: string;
  title: string;
  description: string;
  happenedAtLabel: string;
};

export type PartnerAreaData = {
  partner: {
    name: string;
    role: string;
    partnerCode: string;
    referralLink: string;
    disclosureText: string;
  };
  metrics: {
    activatedPaidPlans: number;
    capturedLeads: number;
    linkClicks: number;
    monthlyCommissionCents: number;
    paidCommissionCents: number;
    pendingCommissionCents: number;
    registeredEstablishments: number;
  };
  recentStatuses: PartnerRecentStatus[];
  materials: PartnerMaterial[];
  leads: PartnerLead[];
  conversions: PartnerConversion[];
  commissionHistory: Array<{
    monthLabel: string;
    generatedCents: number;
    paidCents: number;
  }>;
  payments: PartnerPayment[];
  support: {
    channel: string;
    responseTime: string;
    email: string;
    whatsapp: string;
  };
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatCurrencyBRL(valueCents: number) {
  return currencyFormatter.format(valueCents / 100);
}

export function formatDateBR(isoDate: string) {
  return dateFormatter.format(new Date(`${isoDate}T12:00:00`));
}

const defaultPartnerMaterials: PartnerMaterial[] = [
  {
    id: 'material-story',
    title: 'Artes para story',
    description: 'Pacote com artes verticais prontas para divulgar o programa em redes sociais.',
    category: 'story',
    format: 'PNG (4 artes)',
    updatedAt: '2026-04-10',
    previewUrl: '/assets/partner/materials/story/01.png',
    downloadUrl: '/assets/partner/materials/story/pacote-story.zip',
  },
  {
    id: 'material-feed',
    title: 'Artes para feed',
    description: 'Criativos quadrados e carrossel para campanhas de indicacao.',
    category: 'feed',
    format: 'PNG (3 artes)',
    updatedAt: '2026-04-09',
    previewUrl: '/assets/partner/materials/feed/01.png',
    downloadUrl: '/assets/partner/materials/feed/pacote-feed.zip',
  },
  {
    id: 'material-textos',
    title: 'Textos prontos',
    description: 'Modelos de mensagem para WhatsApp, direct e e-mail comercial.',
    category: 'texto',
    format: 'PDF',
    updatedAt: '2026-04-12',
    downloadUrl: '/assets/partner/biblioteca_textos_beleza_carioca.pdf',
    copyText:
      'Oi! Estou indicando a Beleza Carioca para estabelecimentos que querem organizar agenda, clientes e comercial com mais previsibilidade. Se fizer sentido para o seu salao, posso te enviar os detalhes.',
  },
  {
    id: 'material-apresentacao',
    title: 'Apresentacao comercial',
    description: 'Deck com proposta de valor, diferenciadores e fluxo de onboarding.',
    category: 'apresentacao',
    format: 'PDF',
    updatedAt: '2026-04-05',
    previewUrl: '#',
    downloadUrl: '#',
  },
  {
    id: 'material-manual',
    title: 'Manual do parceiro',
    description: 'Guia com processos, politicas comerciais e melhores praticas de indicacao.',
    category: 'manual',
    format: 'PDF',
    updatedAt: '2026-04-03',
    previewUrl: '#',
    downloadUrl: '#',
  },
];

// Estado padrao para novo parceiro: sem funil movimentado e sem comissao ate haver plano pago confirmado.
export function createDefaultPartnerData(): PartnerAreaData {
  return {
    partner: {
      name: 'Novo Parceiro',
      role: 'Parceiro em ativacao',
      partnerCode: 'BC-PARCEIRO-NEW',
      referralLink: 'https://belezacarioca.com/negocios?ref=BC-PARCEIRO-NEW',
      disclosureText:
        'Indico a Beleza Carioca para estabelecimentos que querem crescer com mais organizacao. Se seu salao estiver avaliando uma plataforma, acesse meu link: https://belezacarioca.com/negocios?ref=BC-PARCEIRO-NEW',
    },
    metrics: {
      activatedPaidPlans: 0,
      capturedLeads: 0,
      linkClicks: 0,
      monthlyCommissionCents: 0,
      paidCommissionCents: 0,
      pendingCommissionCents: 0,
      registeredEstablishments: 0,
    },
    recentStatuses: [],
    materials: defaultPartnerMaterials,
    leads: [],
    conversions: [],
    commissionHistory: [],
    payments: [],
    support: {
      channel: 'Gerente de parceiros dedicado',
      responseTime: 'Resposta media em ate 1 dia util',
      email: 'parceiros@belezacarioca.com',
      whatsapp: '+55 (21) 99999-0042',
    },
  };
}

export const partnerMockData: PartnerAreaData = createDefaultPartnerData();
