import type { AccessProfileId, OperationalModuleId } from '@/lib/platform/domain';

export type AccessProfile = {
  id: AccessProfileId;
  label: string;
  entryPath: string;
  description: string;
  modules: OperationalModuleId[];
  capabilities: string[];
};

export const accessProfiles: Record<AccessProfileId, AccessProfile> = {
  client: {
    id: 'client',
    label: 'Cliente',
    entryPath: '/cliente',
    description: 'Web publica e area logada para busca, favoritos, historico e agendamentos.',
    modules: ['agenda', 'servicos', 'financeiro'],
    capabilities: ['buscar_servicos', 'criar_agendamento', 'acompanhar_historico', 'pagar_cobranca'],
  },
  partner: {
    id: 'partner',
    label: 'Parceiro',
    entryPath: '/parceiro#dashboard',
    description: 'Painel do parceiro para acompanhar link, materiais, leads, conversoes e comissoes.',
    modules: [],
    capabilities: [
      'acompanhar_dashboard_parceiro',
      'copiar_link_exclusivo',
      'baixar_materiais_divulgacao',
      'acompanhar_comissoes',
    ],
  },
  salonAdmin: {
    id: 'salonAdmin',
    label: 'Admin do salao',
    entryPath: '/admin',
    description: 'Painel do estabelecimento para operar agenda, clientes, equipe, assinaturas e caixa.',
    modules: ['agenda', 'clientes', 'profissionais', 'servicos', 'financeiro', 'aparencia'],
    capabilities: [
      'gerenciar_agenda',
      'gerenciar_clientes',
      'gerenciar_profissionais',
      'gerenciar_servicos',
      'acompanhar_financeiro',
      'gerenciar_assinatura',
      'personalizar_aparencia',
    ],
  },
  reception: {
    id: 'reception',
    label: 'Recepcao',
    entryPath: '/admin',
    description: 'Operacao de recepcao para agenda, clientes, servicos e check-in sem acesso financeiro completo.',
    modules: ['agenda', 'clientes', 'servicos'],
    capabilities: ['gerenciar_agenda', 'gerenciar_clientes', 'ver_servicos', 'fazer_check_in'],
  },
  professional: {
    id: 'professional',
    label: 'Profissional',
    entryPath: '/profissional',
    description: 'Acesso operacional para agenda propria, check-in, atendimento e comissoes.',
    modules: ['agenda', 'clientes', 'servicos', 'financeiro'],
    capabilities: ['ver_agenda_propria', 'iniciar_atendimento', 'finalizar_atendimento', 'ver_comissoes'],
  },
  platformAdmin: {
    id: 'platformAdmin',
    label: 'Admin da plataforma',
    entryPath: '/admin',
    description: 'Operacao interna para suporte, auditoria, billing e saude da plataforma.',
    modules: ['agenda', 'clientes', 'profissionais', 'servicos', 'financeiro', 'aparencia'],
    capabilities: ['suporte_global', 'auditoria', 'billing_global', 'configurar_integracoes'],
  },
};

export const loginProfiles = [
  accessProfiles.salonAdmin,
  accessProfiles.reception,
  accessProfiles.professional,
  accessProfiles.partner,
  accessProfiles.client,
];

export function canAccessModule(profileId: AccessProfileId, moduleId: OperationalModuleId) {
  return accessProfiles[profileId].modules.includes(moduleId);
}
