import type { Metadata } from 'next';

import { PlatformWorkspace } from '@/components/platform/PlatformWorkspace';

export const metadata: Metadata = {
  title: 'Area do cliente | Beleza Carioca',
  description: 'Base da web do cliente para agendamentos, historico e cobrancas.',
};

export default function ClientWorkspacePage() {
  return <PlatformWorkspace profileId="client" />;
}
