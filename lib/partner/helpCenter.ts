export type PartnerHelpCenterFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const partnerHelpCenterFaq: PartnerHelpCenterFaqItem[] = [
  {
    id: 'link-parceiro',
    question: 'Como copiar meu link de parceiro?',
    answer:
      'Acesse o bloco "Meu link", clique em "Copiar link" e use sempre esse link nas suas indicacoes para manter o rastreio correto.',
  },
  {
    id: 'materiais-divulgacao',
    question: 'Como usar os materiais de divulgacao?',
    answer:
      'Entre em "Materiais", abra Story, Feed, Textos prontos, Manual e Apresentacao comercial. Combine os recursos para manter um padrao profissional.',
  },
  {
    id: 'leads-conversoes',
    question: 'Como acompanhar leads e conversoes?',
    answer:
      'No painel, use as secoes "Leads" e "Conversoes" para acompanhar status, etapas e evolucao das oportunidades indicadas.',
  },
  {
    id: 'comissoes-pagamentos',
    question: 'Como consultar comissoes e pagamentos?',
    answer:
      'Consulte os blocos "Comissoes" e "Pagamentos" para visualizar valores pendentes, pagos e historico financeiro.',
  },
  {
    id: 'contato-suporte',
    question: 'Como entrar em contato com o suporte?',
    answer:
      'Voce pode falar com nosso time por WhatsApp ou e-mail diretamente pelas acoes desta central. O tempo medio de resposta aparece no card de suporte.',
  },
];

