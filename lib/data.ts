export type NavItem = {
  id: string;
  href: string;
  label: string;
  highlight?: boolean;
};

export type CategoryItem = {
  id: string;
  title: string;
  description: string;
  eyebrow: string;
};

export type StatItem = {
  id: string;
  value: string;
  label: string;
};

export type BenefitItem = {
  id: string;
  title: string;
  description: string;
  icon: 'calendar' | 'sparkles' | 'users' | 'shield';
};

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon:
    | 'agenda'
    | 'clients'
    | 'finance'
    | 'team'
    | 'reminders'
    | 'reports'
    | 'booking'
    | 'login'
    | 'blog'
    | 'marketing'
    | 'customerArea';
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
};

export type BlogPostItem = {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  routine: string;
  publishedAt: string;
  author: string;
  coverImage: string;
  content: string[];
};

export type FooterLinkItem = {
  id: string;
  label: string;
  href: string;
};

export type FooterColumnItem = {
  id: string;
  title: string;
  links: FooterLinkItem[];
};

export type SolutionPillarItem = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

export type SupportTopicItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type BusinessSegmentItem = {
  id: string;
  slug: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
};

export type SocialProofItem = {
  id: string;
  label: string;
};

export const navigationItems: NavItem[] = [
  { id: 'blog', href: '/blog', label: 'Blog' },
  { id: 'login', href: '/entrar', label: 'Entrar' },
  { id: 'business', href: '/negocios', label: 'Beleza para Negócios', highlight: true },
];

export const categories: CategoryItem[] = [
  {
    id: 'cabelos',
    title: 'Cabelos',
    description: 'Cortes, coloração, escova e tratamentos com agenda clara e rápida.',
    eyebrow: 'Categoria premium',
  },
  {
    id: 'unhas',
    title: 'Unhas',
    description: 'Manicure, pedicure e rotina recorrente com organização sem atrito.',
    eyebrow: 'Alta recorrência',
  },
  {
    id: 'barbearia',
    title: 'Barbearia',
    description: 'Giro ágil da agenda para corte, barba e atendimento com fluxo enxuto.',
    eyebrow: 'Operação rápida',
  },
  {
    id: 'estetica',
    title: 'Estética',
    description: 'Procedimentos, retorno de clientes e leitura comercial do dia a dia.',
    eyebrow: 'Mais ticket médio',
  },
  {
    id: 'sobrancelhas',
    title: 'Sobrancelhas',
    description: 'Agenda precisa para serviços curtos com mais aproveitamento de horário.',
    eyebrow: 'Atendimento fino',
  },
  {
    id: 'massagem',
    title: 'Massagem',
    description: 'Sessões premium com tempo, profissional e confirmação sempre alinhados.',
    eyebrow: 'Experiência elevada',
  },
];

export const stats: StatItem[] = [
  { id: 'partner-salons', value: '+2.500', label: 'salões parceiros em fase de expansão' },
  { id: 'customers-served', value: '+120 mil', label: 'clientes atendidos com jornadas organizadas' },
  { id: 'appointments-managed', value: '+850 mil', label: 'agendamentos estruturados na operação' },
  { id: 'satisfaction', value: '98%', label: 'satisfação de clientes com experiência mais profissional' },
];

export const benefits: BenefitItem[] = [
  {
    id: 'less-bureaucracy',
    title: 'Mais tempo, menos burocracia',
    description: 'Automatize rotinas e foque no atendimento sem perder o controle da operação.',
    icon: 'calendar',
  },
  {
    id: 'happy-clients',
    title: 'Clientes mais felizes',
    description: 'Agendamentos, lembretes e contato organizado para um relacionamento muito mais fluido.',
    icon: 'sparkles',
  },
  {
    id: 'aligned-team',
    title: 'Equipe alinhada',
    description: 'Permissões, comissões, ausências e visão do dia para cada pessoa da equipe.',
    icon: 'users',
  },
  {
    id: 'real-growth',
    title: 'Crescimento com base real',
    description: 'Acompanhe financeiro, indicadores e expansão com uma plataforma preparada para escalar.',
    icon: 'shield',
  },
];

export const homeFeatures: FeatureItem[] = [
  {
    id: 'smart-booking',
    title: 'Agendamento online inteligente',
    description: 'Busca por serviço, profissional e horário para transmitir sensação de plataforma real desde o primeiro bloco.',
    icon: 'booking',
  },
  {
    id: 'centralized-clients',
    title: 'Clientes centralizados',
    description: 'Histórico, observações, contato e relacionamento em um fluxo visual elegante.',
    icon: 'clients',
  },
  {
    id: 'strategic-finance',
    title: 'Financeiro estratégico',
    description: 'Entradas, despesas, fechamento e leitura visual do caixa com muito mais clareza.',
    icon: 'finance',
  },
  {
    id: 'team-permissions',
    title: 'Equipe e permissões',
    description: 'Profissionais, cargos, acessos e comissões organizados para a rotina do salão.',
    icon: 'team',
  },
  {
    id: 'reminders-confirmation',
    title: 'Lembretes e confirmações',
    description: 'Notificações, check-in e reforços automáticos para reduzir faltas e ruído operacional.',
    icon: 'reminders',
  },
  {
    id: 'customer-area',
    title: 'Área do cliente integrada',
    description: 'Experiência de autoatendimento para reagendar, acompanhar histórico e fortalecer fidelização.',
    icon: 'customerArea',
  },
];

export const businessFeatures: FeatureItem[] = [
  {
    id: 'agenda',
    title: 'Agenda',
    description: 'Fluxo de atendimento com status, recorrência, conflitos e leitura do dia.',
    icon: 'agenda',
  },
  {
    id: 'clients',
    title: 'Clientes',
    description: 'Carteira organizada para relacionamento, retorno e fidelização.',
    icon: 'clients',
  },
  {
    id: 'finance',
    title: 'Financeiro',
    description: 'Visão do caixa, entradas, despesas e fechamento com menos esforço.',
    icon: 'finance',
  },
  {
    id: 'team',
    title: 'Equipe',
    description: 'Comissão, horários, papéis e acesso por módulo em uma camada profissional.',
    icon: 'team',
  },
  {
    id: 'reminders',
    title: 'Lembretes',
    description: 'Rotina de avisos e confirmações para deixar a operação mais segura.',
    icon: 'reminders',
  },
  {
    id: 'reports',
    title: 'Relatórios',
    description: 'Preparação de leitura para crescimento com indicadores de verdade.',
    icon: 'reports',
  },
];

export const solutionPillars: SolutionPillarItem[] = [
  {
    id: 'solution-agenda',
    slug: 'agenda-inteligente',
    eyebrow: 'Operação',
    title: 'Agenda inteligente para reduzir atrito e ganhar ritmo',
    description: 'Organize horários, recorrência, encaixes e confirmação com uma camada premium de gestão.',
    bullets: ['visão diária clara', 'status por atendimento', 'confirmação simplificada'],
  },
  {
    id: 'solution-clients',
    slug: 'relacionamento-com-clientes',
    eyebrow: 'Relacionamento',
    title: 'Clientes centralizados com histórico e recorrência',
    description: 'Crie uma base ativa para retorno, campanhas e atendimento personalizado.',
    bullets: ['cadastro completo', 'observações internas', 'retorno mais previsível'],
  },
  {
    id: 'solution-finance',
    slug: 'financeiro-e-relatorios',
    eyebrow: 'Resultado',
    title: 'Financeiro visual com indicadores para crescer melhor',
    description: 'Entenda receita, despesas, desempenho da equipe e leitura do negócio em um só fluxo.',
    bullets: ['caixa simplificado', 'comissões visíveis', 'relatórios prontos para gestão'],
  },
  {
    id: 'solution-marketing',
    slug: 'marketing-e-area-do-cliente',
    eyebrow: 'Expansão',
    title: 'Marketing, lembretes e área do cliente para fortalecer a marca',
    description: 'Conecte comunicação, conveniência e experiência para aumentar percepção de valor.',
    bullets: ['avisos automáticos', 'campanhas de relacionamento', 'jornada de autoatendimento'],
  },
];

export const supportTopics: SupportTopicItem[] = [
  {
    id: 'support-first-steps',
    title: 'Primeiros passos',
    description: 'Um caminho inicial para configurar seu espaço, serviços, equipe e horários.',
    href: '/entrar',
  },
  {
    id: 'support-schedule',
    title: 'Agenda e confirmações',
    description: 'Entenda como organizar encaixes, reagendamentos, faltas e lembretes.',
    href: '/negocios',
  },
  {
    id: 'support-clients',
    title: 'Clientes e relacionamento',
    description: 'Descubra como registrar histórico, observações e oportunidades de retorno.',
    href: '/blog',
  },
  {
    id: 'support-finance',
    title: 'Financeiro e relatórios',
    description: 'Veja como estruturar uma operação mais saudável e com leitura gerencial clara.',
    href: '/solucoes',
  },
];

export const businessSegments: BusinessSegmentItem[] = [
  {
    id: 'segment-salao',
    slug: 'saloes-de-beleza',
    label: 'Salões de beleza',
    eyebrow: 'Segmento',
    title: 'Gestão premium para salões que precisam de agenda cheia e operação elegante.',
    description: 'Reúna atendimento, equipe, caixa e experiência do cliente em uma estrutura criada para o ritmo do salão.',
    highlights: ['fluxo diário organizado', 'mais recorrência', 'melhor leitura de desempenho'],
  },
  {
    id: 'segment-barbearia',
    slug: 'barbearias',
    label: 'Barbearias',
    eyebrow: 'Segmento',
    title: 'Mais agilidade para barbearias que trabalham com giro alto e relacionamento forte.',
    description: 'Controle agenda, equipe e retorno do cliente com um visual objetivo e uma rotina mais redonda.',
    highlights: ['encaixes rápidos', 'menos faltas', 'crescimento com previsibilidade'],
  },
  {
    id: 'segment-estetica',
    slug: 'clinicas-de-estetica',
    label: 'Clínicas de estética',
    eyebrow: 'Segmento',
    title: 'Organização refinada para procedimentos, jornadas longas e acompanhamento contínuo.',
    description: 'Ganhe clareza sobre tempo de sala, protocolos, clientes recorrentes e metas do negócio.',
    highlights: ['procedimentos estruturados', 'acompanhamento recorrente', 'visão financeira segura'],
  },
  {
    id: 'segment-spa',
    slug: 'studios-e-spas',
    label: 'Studios e spas',
    eyebrow: 'Segmento',
    title: 'Uma operação mais sofisticada para experiências premium e atendimento consultivo.',
    description: 'Combine marca, conveniência e gestão em um ambiente pronto para elevar percepção de valor.',
    highlights: ['jornada premium', 'confirmações automáticas', 'cliente mais bem atendido'],
  },
];

export const testimonials: TestimonialItem[] = [
  {
    id: 'testimonial-juliana',
    name: 'Juliana Santos',
    role: 'Studio Lumi',
    quote:
      'A Beleza Carioca transformou a rotina do salão. A equipe ganhou clareza e os clientes perceberam mais profissionalismo logo nos primeiros dias.',
  },
  {
    id: 'testimonial-carlos',
    name: 'Carlos Mendes',
    role: 'Barbearia Orla',
    quote:
      'Hoje eu consigo enxergar agenda, faturamento e desempenho com muito mais segurança. Ficou elegante, rápido e fácil de usar.',
  },
  {
    id: 'testimonial-liliane',
    name: 'Liliane Lima',
    role: 'Espaço Duna',
    quote:
      'A plataforma é intuitiva, bonita e funcional. O atendimento ficou mais organizado e a operação ficou mais leve.',
  },
];

export const socialProofBrands: SocialProofItem[] = [
  { id: 'brand-studio-orla', label: 'Studio Orla' },
  { id: 'brand-casa-duna', label: 'Casa Duna' },
  { id: 'brand-bella-rio', label: 'Bella Rio' },
  { id: 'brand-lumina-beauty', label: 'Lumina Beauty' },
  { id: 'brand-atelie-aura', label: 'Ateliê Aura' },
];

export const blogPosts: BlogPostItem[] = [
  {
    id: 'post-atrair-clientes',
    slug: 'atrair-clientes',
    category: 'Crescimento',
    title: 'Como atrair mais clientes para seu salão',
    excerpt:
      'Ideias práticas para aumentar sua visibilidade, melhorar a experiência e converter mais atendimentos em recorrência.',
    readTime: '5 min de leitura',
    routine: 'Rotina de captação e atendimento',
    publishedAt: '08 de abril de 2026',
    author: 'Equipe Beleza Carioca',
    coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Aumentar a visibilidade do salão começa por uma presença clara e atraente. Revise fichas de serviço, imagens de antes e depois e a forma como você comunica valores.',
      'Promova pacotes simples, destaques de serviços mais procurados e ofertas sazonais que incentivem a recorrência sem desvalorizar o trabalho.',
      'Invista em atendimentos rápidos de pré-venda: WhatsApp, direcionamento por região e confirmação de horário ajudam o cliente a decidir mais rápido.',
    ],
  },
  {
    id: 'post-tendencias',
    slug: 'tendencias-beleza',
    category: 'Tendências',
    title: 'Tendências de beleza que merecem sua atenção',
    excerpt:
      'Entenda como transformar novidades do mercado em posicionamento, ticket médio e valor percebido.',
    readTime: '4 min de leitura',
    routine: 'Rotina de inspiração e posicionamento',
    publishedAt: '02 de abril de 2026',
    author: 'Equipe Beleza Carioca',
    coverImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
    content: [
      'O mercado de beleza muda rápido, mas algumas tendências se mantêm valiosas: naturalidade, resultado duradouro e atendimento experiente.',
      'Use as tendências como diferenciais: destaque serviços que valorizem o cliente e explique claramente o que está incluído no procedimento.',
      'Mostre tranquilidade e autoridade no seu atendimento, especialmente em temas como cronograma capilar e transformação de cor.',
    ],
  },
  {
    id: 'post-organizar-agenda',
    slug: 'organizar-agenda',
    category: 'Gestão',
    title: 'Como organizar a agenda do salão sem perder tempo',
    excerpt:
      'Uma agenda melhor organizada reduz conflito, melhora o atendimento e libera tempo para crescer.',
    readTime: '6 min de leitura',
    routine: 'Rotina de agenda e confirmações',
    publishedAt: '28 de março de 2026',
    author: 'Equipe Beleza Carioca',
    coverImage: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1200&q=80',
    content: [
      'A gestão de agenda é um dos maiores diferenciais para um salão mais profissional. Use blocos de tempo padrões para facilitar encaixes.',
      'Agrupe serviços semelhantes e deixe espaços realistas para preparação, limpeza e briefing com o cliente.',
      'Digitalize a agenda e envie confirmações automáticas para reduzir faltas e cancelar com antecedência quando necessário.',
    ],
  },
  {
    id: 'post-aumentar-faturamento',
    slug: 'aumentar-faturamento',
    category: 'Financeiro',
    title: 'Como aumentar o faturamento sem depender de mais clientes',
    excerpt:
      'Pequenos ajustes em agenda, serviço, recorrência e relacionamento podem ampliar sua margem com mais consistência.',
    readTime: '7 min de leitura',
    routine: 'Rotina comercial e de upsell',
    publishedAt: '18 de março de 2026',
    author: 'Equipe Beleza Carioca',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Faturamento melhor não precisa significar vender mais horas. Ajuste valores, ofereça upgrades e mostre diferenciais premium.',
      'Use a agenda para vender recorrência: lembretes de retoque, manutenção e cuidados especiais incentivam o cliente a voltar.',
      'Acompanhe o mix de serviços e identifique quais atendimentos geram maior lucro por hora. Foque em resultados com menos desperdício.',
    ],
  },
  {
    id: 'post-marketing-digital',
    slug: 'marketing-digital-saloes',
    category: 'Marketing',
    title: 'Marketing digital para salões: Instagram, Google e WhatsApp',
    excerpt:
      'Domine as redes sociais, anúncios pagos e automação para atrair mais clientes e aumentar sua presença online.',
    readTime: '6 min de leitura',
    routine: 'Rotina de presença digital',
    publishedAt: '20 de abril de 2026',
    author: 'Equipe Beleza Carioca',
    coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=80',
    content: [
      'O marketing digital é essencial para salões modernos. Comece criando perfis profissionais no Instagram e Facebook, com bio clara, localização e link para agendamento.',
      'Publique conteúdo consistente: antes/depois de serviços, dicas de beleza, bastidores do salão. Use stories para interagir diariamente com seguidores.',
      'Invista em anúncios do Google Ads para aparecer quando clientes pesquisarem "salão de beleza" na sua região. Defina orçamento diário e acompanhe resultados.',
    ],
  },
  {
    id: 'post-pacotes-servicos',
    slug: 'pacotes-servicos-vendem-mais',
    category: 'Vendas',
    title: 'Como criar pacotes de serviços que vendem mais',
    excerpt:
      'Aprenda a combinar serviços de forma inteligente para aumentar o ticket médio e fidelizar clientes.',
    readTime: '5 min de leitura',
    routine: 'Rotina de vendas estratégicas',
    publishedAt: '25 de abril de 2026',
    author: 'Equipe Beleza Carioca',
    coverImage: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Pacotes bem estruturados aumentam significativamente a receita. Identifique seus serviços mais rentáveis e crie combinações lógicas.',
      'Ofereça desconto progressivo: quanto mais serviços no pacote, maior o desconto. Isso incentiva upsell durante o atendimento.',
      'Crie pacotes sazonais: "Penteado de casamento", "Tratamento verão", "Cuidado outono". Antecipe necessidades dos clientes.',
    ],
  },
  {
    id: 'post-gestao-financeira',
    slug: 'gestao-financeira-saloes',
    category: 'Financeiro',
    title: 'Gestão financeira básica para donos de salão',
    excerpt:
      'Controle custos, precifique corretamente e mantenha o fluxo de caixa saudável para o crescimento sustentável.',
    readTime: '7 min de leitura',
    routine: 'Rotina financeira semanal',
    publishedAt: '30 de abril de 2026',
    author: 'Equipe Beleza Carioca',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    content: [
      'A gestão financeira começa com o controle rigoroso de custos. Separe custos fixos (aluguel, salários) de variáveis (produtos, energia).',
      'Precifique com margem realista: considere custo do produto/serviço + despesas operacionais + lucro desejado. Revise preços anualmente.',
      'Mantenha fluxo de caixa semanal. Saiba exatamente quanto entra e sai, evitando surpresas que comprometam o pagamento de fornecedores.',
    ],
  },
  {
    id: 'post-fidelizacao-clientes',
    slug: 'fidelizacao-clientes-saloes',
    category: 'Relacionamento',
    title: 'Fidelização de clientes: crie defensores da sua marca',
    excerpt:
      'Transforme clientes satisfeitos em promotores fiéis que indicam seu salão e retornam regularmente.',
    readTime: '5 min de leitura',
    routine: 'Rotina de relacionamento',
    publishedAt: '05 de maio de 2026',
    author: 'Equipe Beleza Carioca',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    content: [
      'Clientes fiéis valem ouro. Comece com um atendimento excepcional em cada visita, superando expectativas consistentemente.',
      'Implemente um programa de fidelidade simples: pontos por serviço realizado, desconto na décima visita, ou aniversário personalizado.',
      'Mantenha contato regular: mensagem de parabéns no aniversário, lembrete de retoque, oferta especial para quem não vem há meses.',
    ],
  },
];

export const footerColumns: FooterColumnItem[] = [
  {
    id: 'footer-platform',
    title: 'Plataforma',
    links: [
      { id: 'footer-business', label: 'Beleza para Negócios', href: '/negocios' },
      { id: 'footer-solutions', label: 'Soluções', href: '/solucoes' },
      { id: 'footer-login', label: 'Entrar', href: '/entrar' },
      { id: 'footer-blog', label: 'Blog', href: '/blog' },
    ],
  },
  {
    id: 'footer-segments',
    title: 'Segmentos',
    links: businessSegments.map((segment) => ({
      id: `footer-segment-${segment.slug}`,
      label: segment.label,
      href: `/negocios/${segment.slug}`,
    })),
  },
  {
    id: 'footer-support',
    title: 'Suporte',
    links: [
      { id: 'footer-help-center', label: 'Central de ajuda', href: '/ajuda' },
      { id: 'footer-first-steps', label: 'Primeiros passos', href: '/ajuda' },
      { id: 'footer-faq', label: 'Dúvidas frequentes', href: '/ajuda' },
      { id: 'footer-contact-platform', label: 'Falar com a plataforma', href: '/entrar' },
    ],
  },
];
