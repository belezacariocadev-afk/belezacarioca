export type IntegrationContract = {
  id: string;
  label: string;
  status: 'planned' | 'readyForAdapter' | 'implemented';
  description: string;
  contracts: string[];
};

export const integrationContracts: IntegrationContract[] = [
  {
    id: 'supabase',
    label: 'Supabase',
    status: 'readyForAdapter',
    description: 'Camada prevista para Auth, Postgres, RLS, storage e chamadas server-side.',
    contracts: [
      'salons',
      'subscriptions',
      'clients',
      'professionals',
      'services',
      'appointments',
      'attendance_records',
      'charges',
      'payment_events',
    ],
  },
  {
    id: 'supabase-edge-functions',
    label: 'Supabase Edge Functions',
    status: 'readyForAdapter',
    description: 'Boundary para acoes transacionais e webhooks sem acoplar UI ao provedor.',
    contracts: [
      'create-appointment',
      'confirm-appointment',
      'start-attendance',
      'finish-attendance',
      'create-asaas-charge',
      'asaas-webhook',
      'sync-subscription',
    ],
  },
  {
    id: 'asaas',
    label: 'Asaas',
    status: 'readyForAdapter',
    description: 'Boundary de cobranca para assinaturas dos saloes, pagamentos de agendamentos e conciliacao.',
    contracts: ['customers', 'subscriptions', 'payments', 'pix', 'webhook-events'],
  },
  {
    id: 'expo-react-native',
    label: 'Expo / React Native',
    status: 'planned',
    description: 'Os modulos de dominio ficam desacoplados para serem reutilizados por um app mobile futuro ou existente.',
    contracts: ['shared-access-profiles', 'shared-module-manifests', 'shared-domain-types'],
  },
];
