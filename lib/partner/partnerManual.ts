export type PartnerManualPage = {
  id:
    | 'capa'
    | 'boas-vindas'
    | 'primeiros-passos'
    | 'usar-link'
    | 'usar-materiais'
    | 'indicar-corretamente'
    | 'acompanhamento-ganhos'
    | 'boas-praticas';
  title: string;
  subtitle?: string;
  body: string;
  points?: string[];
  highlight?: string;
};

export const partnerManualPages: PartnerManualPage[] = [
  {
    id: 'capa',
    title: 'Manual do Parceiro',
    subtitle:
      'Guia pratico para usar sua area, divulgar com mais consistencia e acompanhar seus resultados.',
    body:
      'Este manual foi criado para orientar sua rotina de parceria com passos claros, materiais prontos e acompanhamento estruturado.',
    highlight: 'Use este conteudo como referencia para manter consistencia comercial.',
  },
  {
    id: 'boas-vindas',
    title: 'Boas-vindas',
    body:
      'Seu painel foi pensado para organizar divulgacao, acompanhamento de indicacoes e leitura de resultados com mais clareza. O objetivo deste manual e facilitar sua execucao no dia a dia, com orientacoes simples e praticas.',
    points: [
      'Visao unica da rotina de parceria',
      'Fluxo organizado para indicacoes',
      'Material de apoio para comunicacao',
    ],
    highlight: 'Com padrao e consistencia, seus resultados ficam mais previsiveis.',
  },
  {
    id: 'primeiros-passos',
    title: 'Primeiros passos',
    body: 'Comece sua operacao com um roteiro simples dentro da area do parceiro.',
    points: [
      'Acesse sua area exclusiva de parceiro',
      'Localize e valide seu link oficial',
      'Conheca os materiais disponiveis para divulgacao',
      'Entenda onde acompanhar oportunidades e ganhos',
    ],
    highlight: 'Dica: reserve alguns minutos por semana para revisar o painel.',
  },
  {
    id: 'usar-link',
    title: 'Como usar seu link',
    body:
      'Seu link oficial conecta suas indicacoes ao seu acompanhamento interno. Use sempre esse link em todas as abordagens.',
    points: [
      'Copie o link diretamente do painel',
      'Divulgue em canais com potencial de conversao',
      'Compartilhe com mensagem clara e profissional',
    ],
    highlight: 'Evite links alternativos para nao perder rastreabilidade.',
  },
  {
    id: 'usar-materiais',
    title: 'Como usar os materiais',
    body:
      'A biblioteca da plataforma oferece conteudo para acelerar sua comunicacao e manter padrao visual.',
    points: [
      'Artes para Story',
      'Artes para Feed',
      'Textos prontos para abordagem',
      'Apresentacao comercial',
    ],
    highlight: 'Combine arte + texto para manter consistencia e ganho de tempo.',
  },
  {
    id: 'indicar-corretamente',
    title: 'Como indicar corretamente',
    body:
      'O foco da indicacao deve ser contatos com aderencia ao perfil da plataforma e potencial real de avancar.',
    points: [
      'Priorize contatos com potencial comercial',
      'Use abordagem objetiva e contexto claro',
      'Mantenha consistencia no acompanhamento',
    ],
    highlight: 'Indicacoes qualificadas melhoram conversao e reduzem retrabalho.',
  },
  {
    id: 'acompanhamento-ganhos',
    title: 'Acompanhamento e ganhos',
    body:
      'No painel, voce acompanha o ciclo completo da parceria com visibilidade sobre etapas, avancos e pagamentos.',
    points: ['Leads', 'Conversoes', 'Comissoes', 'Pagamentos'],
    highlight: 'Acompanhar com frequencia ajuda a otimizar sua estrategia de divulgacao.',
  },
  {
    id: 'boas-praticas',
    title: 'Boas praticas e encerramento',
    body:
      'Com rotina simples e constancia, voce transforma a divulgacao em um processo profissional e escalavel.',
    points: [
      'Use sempre seu link oficial',
      'Mantenha comunicacao profissional',
      'Aproveite os materiais da plataforma',
      'Acompanhe seus resultados com frequencia',
    ],
    highlight: 'Proximo passo: revisar semanalmente materiais, indicacoes e status no painel.',
  },
];

