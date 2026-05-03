export type PartnerReadyTextCategoryId =
  | 'whatsapp'
  | 'instagram_direct'
  | 'email'
  | 'follow_up'
  | 'respostas_interessados';

export type PartnerReadyTextCategory = {
  id: PartnerReadyTextCategoryId;
  label: string;
  description: string;
};

export type PartnerReadyText = {
  id: string;
  category: PartnerReadyTextCategoryId;
  title: string;
  description: string;
  content: string;
};

export const readyTextCategories: PartnerReadyTextCategory[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Abordagens rapidas e objetivas para iniciar conversas com saloes e profissionais.',
  },
  {
    id: 'instagram_direct',
    label: 'Instagram / Direct',
    description: 'Mensagens curtas para primeiro contato e continuidade no direct.',
  },
  {
    id: 'email',
    label: 'E-mail',
    description: 'Modelos profissionais para apresentacao comercial por e-mail.',
  },
  {
    id: 'follow_up',
    label: 'Follow-up',
    description: 'Textos de retomada para nao perder oportunidades ao longo do funil.',
  },
  {
    id: 'respostas_interessados',
    label: 'Respostas para interessados',
    description: 'Respostas prontas para perguntas frequentes sobre a parceria.',
  },
];

export const partnerReadyTexts: PartnerReadyText[] = [
  {
    id: 'wa-abordagem-curta',
    category: 'whatsapp',
    title: 'Abordagem curta inicial',
    description: 'Primeiro contato direto e amigavel.',
    content:
      'Oi, [Nome]! Tudo bem?\n' +
      'Estou ajudando saloes e profissionais da beleza a organizarem agenda, clientes e operacao com a Beleza Carioca.\n' +
      'Faz sentido eu te mostrar em 2 minutos como funciona?',
  },
  {
    id: 'wa-abordagem-consultiva',
    category: 'whatsapp',
    title: 'Abordagem consultiva',
    description: 'Contato com foco em diagnostico e valor.',
    content:
      'Oi, [Nome]! Vi seu trabalho e acredito que posso te mostrar uma oportunidade interessante.\n' +
      'A Beleza Carioca tem ajudado saloes a ganhar mais previsibilidade de agenda e melhorar conversao de atendimento.\n' +
      'Hoje, qual e o maior desafio por ai: agenda, relacionamento com clientes ou organizacao comercial?',
  },
  {
    id: 'wa-follow-up-curto',
    category: 'whatsapp',
    title: 'Follow-up curto',
    description: 'Retomada rapida sem parecer insistente.',
    content:
      'Oi, [Nome]! Passando para retomar nossa conversa sobre a Beleza Carioca.\n' +
      'Se quiser, te envio um resumo rapido com os principais ganhos para seu perfil.',
  },
  {
    id: 'ig-primeira-abordagem',
    category: 'instagram_direct',
    title: 'Primeira abordagem no direct',
    description: 'Mensagem curta para iniciar no Instagram.',
    content:
      'Oi, [Nome]! Adorei o trabalho de voces.\n' +
      'Sou parceiro da Beleza Carioca e tenho ajudado negocios de beleza a melhorar rotina comercial e agendamentos.\n' +
      'Posso te mandar um resumo bem rapido?',
  },
  {
    id: 'ig-resposta-interesse',
    category: 'instagram_direct',
    title: 'Resposta para quem demonstrou interesse',
    description: 'Continuidade quando a pessoa responde positivamente.',
    content:
      'Perfeito, [Nome]!\n' +
      'A Beleza Carioca centraliza agenda, clientes e operacao em um fluxo simples e profissional.\n' +
      'Se quiser, te envio os detalhes e te conecto com o time para avaliar o melhor caminho para o seu negocio.',
  },
  {
    id: 'email-apresentacao-curta',
    category: 'email',
    title: 'Apresentacao comercial curta',
    description: 'Modelo objetivo para envio por e-mail.',
    content:
      'Assunto: Uma forma simples de organizar e crescer seu negocio de beleza\n\n' +
      'Oi, [Nome], tudo bem?\n\n' +
      'Sou parceiro da Beleza Carioca e queria te apresentar rapidamente uma solucao que vem ajudando saloes e profissionais a organizar agenda, clientes e operacao comercial com mais clareza.\n\n' +
      'Se fizer sentido, posso te encaminhar um resumo com beneficios e te conectar ao time para avaliarmos juntos o melhor formato para voce.\n\n' +
      'Fico a disposicao.\n' +
      '[Seu nome]',
  },
  {
    id: 'fu-retomada',
    category: 'follow_up',
    title: 'Mensagem de retomada',
    description: 'Reabre o contato com tom consultivo.',
    content:
      'Oi, [Nome]! Como voce esta?\n' +
      'Queria retomar nosso papo sobre a Beleza Carioca.\n' +
      'Acredito que pode te ajudar bastante na organizacao da rotina e no ganho de eficiencia comercial.',
  },
  {
    id: 'fu-reforco-oportunidade',
    category: 'follow_up',
    title: 'Mensagem reforcando oportunidade',
    description: 'Destaca valor e chama para proximo passo.',
    content:
      'Oi, [Nome]! Passando para reforcar a oportunidade.\n' +
      'Com a Beleza Carioca, varios parceiros estao estruturando melhor atendimento e conversao.\n' +
      'Se quiser, agendo um contato rapido com o time para voce entender como aplicar no seu contexto.',
  },
  {
    id: 'faq-como-funciona',
    category: 'respostas_interessados',
    title: 'Resposta: Como funciona?',
    description: 'Explica de forma simples o modelo do programa.',
    content:
      'Funciona de forma bem simples: voce indica saloes ou profissionais que tenham fit com a Beleza Carioca, o time faz o atendimento comercial, e voce acompanha os resultados da parceria.',
  },
  {
    id: 'faq-como-eu-ganho',
    category: 'respostas_interessados',
    title: 'Resposta: Como eu ganho?',
    description: 'Resposta clara sobre comissao.',
    content:
      'Voce ganha por indicacoes qualificadas que avancam conforme as regras do programa. A comissao e apresentada com transparencia no onboarding, junto com os criterios de acompanhamento.',
  },
  {
    id: 'faq-preciso-pagar',
    category: 'respostas_interessados',
    title: 'Resposta: Preciso pagar para entrar?',
    description: 'Quebra objecao de entrada.',
    content:
      'Nao. A entrada no programa de parceiros da Beleza Carioca e gratuita. O foco e gerar resultado para todos os lados por meio de indicacoes de qualidade.',
  },
  {
    id: 'faq-o-que-preciso-fazer',
    category: 'respostas_interessados',
    title: 'Resposta: O que eu preciso fazer?',
    description: 'Orienta proxima acao de forma pratica.',
    content:
      'Voce so precisa preencher o cadastro, receber as orientacoes iniciais e usar seu link/codigo para indicar contatos com potencial. A partir disso, acompanhamos junto os avancos.',
  },
];

export function getReadyTextCategoryById(id: PartnerReadyTextCategoryId) {
  return readyTextCategories.find((item) => item.id === id);
}

export function buildReadyTextsMarkdown(texts: PartnerReadyText[] = partnerReadyTexts) {
  const sections = readyTextCategories.map((category) => {
    const items = texts.filter((text) => text.category === category.id);

    const content =
      items.length > 0
        ? items
            .map(
              (item) =>
                `### ${item.title}\n` +
                `_${item.description}_\n\n` +
                `${item.content}\n`,
            )
            .join('\n')
        : '_Sem textos cadastrados nesta categoria no momento._\n';

    return `## ${category.label}\n\n${category.description}\n\n${content}`;
  });

  return (
    '# Biblioteca de Textos Prontos - Programa de Parceiros Beleza Carioca\n\n' +
    `Atualizado automaticamente em ${new Date().toLocaleDateString('pt-BR')}.\n\n` +
    sections.join('\n\n')
  );
}
