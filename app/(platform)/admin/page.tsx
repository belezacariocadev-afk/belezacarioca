import type { Metadata } from 'next';

import { PlatformWorkspace } from '@/components/platform/PlatformWorkspace';

export const metadata: Metadata = {
  title: 'Painel admin | Beleza Carioca',
  description: 'Base do painel admin para saloes operarem agenda, clientes, profissionais e financeiro.',
};

export default function AdminWorkspacePage() {
  return <PlatformWorkspace profileId="salonAdmin" />;
}
