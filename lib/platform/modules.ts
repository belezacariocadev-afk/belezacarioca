import type { OperationalModuleId } from '@/lib/platform/domain';

export type PlatformSurfaceId = 'webClient' | 'salonAdmin' | 'professionalAccess';

export type PlatformSurface = {
  id: PlatformSurfaceId;
  label: string;
  route: string;
  description: string;
};

export type OperationalModule = {
  id: OperationalModuleId;
  label: string;
  route: string;
  description: string;
  responsibilities: string[];
  nextDataContracts: string[];
};

export const platformSurfaces: PlatformSurface[] = [
  {
    id: 'webClient',
    label: 'Web para clientes',
    route: '/cliente',
    description: 'Area para o cliente encontrar estabelecimentos, agendar e acompanhar seus horarios.',
  },
  {
    id: 'salonAdmin',
    label: 'Painel admin do salao',
    route: '/admin',
    description: 'Painel do estabelecimento para agenda, cadastros, equipe, financeiro e assinatura.',
  },
  {
    id: 'professionalAccess',
    label: 'Acesso profissional',
    route: '/profissional',
    description: 'Area do profissional para ver agenda, atender clientes e acompanhar comissoes.',
  },
];

export const operationalModules: OperationalModule[] = [
  {
    id: 'agenda',
    label: 'Agenda',
    route: '/admin/agenda',
    description: 'Organize reservas, confirmacoes, atendimento e fechamento de cada horario.',
    responsibilities: ['Disponibilidade por profissional', 'Reserva e reagendamento', 'Fila do dia', 'Atendimento e fechamento'],
    nextDataContracts: [],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    route: '/admin/clientes',
    description: 'Centralize contatos, historico, recorrencia, preferencias e relacionamento.',
    responsibilities: ['Cadastro e historico', 'Favoritos', 'Observacoes internas', 'Gasto e ultima visita'],
    nextDataContracts: [],
  },
  {
    id: 'profissionais',
    label: 'Profissionais',
    route: '/admin/profissionais',
    description: 'Gerencie equipe, agenda individual, servicos habilitados e comissoes.',
    responsibilities: ['Perfis e permissoes', 'Escalas', 'Servicos por profissional', 'Comissoes'],
    nextDataContracts: [],
  },
  {
    id: 'servicos',
    label: 'Servicos',
    route: '/admin/servicos',
    description: 'Cadastre servicos, duracao, preco, categoria e profissionais habilitados.',
    responsibilities: ['Cadastro de servicos', 'Preco base', 'Duracao operacional', 'Profissionais habilitados'],
    nextDataContracts: [],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    route: '/admin/financeiro',
    description: 'Acompanhe fechamentos, pagamentos, assinatura do salao e relatorios.',
    responsibilities: ['Comandas e recebimentos', 'Pagamentos manuais', 'Assinatura do salao', 'Conciliacao e relatorios'],
    nextDataContracts: [],
  },
  {
    id: 'aparencia',
    label: 'Aparencia',
    route: '/admin/aparencia',
    description: 'Personalize logo, capa, tema e cor principal do salao.',
    responsibilities: ['Logo e capa do salao', 'Tema claro ou escuro', 'Cor principal da marca', 'Preview para cliente'],
    nextDataContracts: [],
  },
];

export function getOperationalModule(moduleId: string) {
  return operationalModules.find((module) => module.id === moduleId);
}
