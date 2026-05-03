export type CommercialPresentationSlide = {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  bullets?: string[];
  steps?: string[];
  highlights?: Array<{
    label: string;
    value: string;
  }>;
  cta?: string;
};

export const commercialPresentationSlides: CommercialPresentationSlide[] = [
  {
    id: 'cover',
    title: 'Apresentacao Comercial',
    subtitle: 'Programa de Parceiros Beleza Carioca',
    body: 'Uma forma pratica de divulgar, acompanhar indicacoes e crescer com mais organizacao.',
  },
  {
    id: 'sobre',
    title: 'O que e a Beleza Carioca',
    body:
      'A Beleza Carioca e uma plataforma pensada para organizar a divulgacao, o acompanhamento de indicacoes e a jornada comercial de parceiros com mais clareza, praticidade e estrutura.',
    bullets: [
      'Mais clareza no processo comercial',
      'Rotina de divulgacao com padrao profissional',
      'Estrutura para acompanhar cada oportunidade',
    ],
  },
  {
    id: 'fluxo',
    title: 'Como funciona',
    body: 'Um fluxo simples para iniciar, divulgar e acompanhar resultados com consistencia.',
    steps: [
      'O parceiro acessa sua area exclusiva',
      'Recebe link e materiais prontos para divulgacao',
      'Indica saloes e profissionais com potencial',
      'Acompanha os avancos das oportunidades',
      'Consulta comissoes e pagamentos no painel',
    ],
  },
  {
    id: 'entregas',
    title: 'Tudo o que voce precisa para divulgar com mais estrutura',
    body: 'Materiais e recursos organizados para voce atuar com consistencia e confianca.',
    bullets: [
      'Link exclusivo para indicacoes',
      'Artes prontas',
      'Textos prontos',
      'Apresentacao comercial',
      'Manual do parceiro',
      'Painel com acompanhamento',
    ],
  },
  {
    id: 'ganhos',
    title: 'Acompanhamento',
    subtitle: 'Mais visibilidade sobre suas indicacoes e ganhos',
    body:
      'No painel do parceiro, voce acompanha oportunidades, conversoes, comissoes e pagamentos com mais organizacao e transparencia.',
    highlights: [
      { label: 'Oportunidades', value: 'Visao consolidada por etapa' },
      { label: 'Conversoes', value: 'Acompanhamento com historico' },
      { label: 'Comissoes', value: 'Indicadores de pendente e pago' },
      { label: 'Pagamentos', value: 'Extrato para consulta rapida' },
    ],
  },
  {
    id: 'cta',
    title: 'Pronto para indicar com mais estrutura?',
    body:
      'Acesse sua area de parceiro, use os materiais disponiveis e acompanhe seus resultados com mais clareza.',
    cta: 'Comece agora com a Beleza Carioca',
  },
];
