import type { Metadata } from 'next';

import { PlatformWorkspace } from '@/components/platform/PlatformWorkspace';

export const metadata: Metadata = {
  title: 'Acesso profissional | Beleza Carioca',
  description: 'Base do acesso profissional para agenda, atendimento e comissoes.',
};

export default function ProfessionalWorkspacePage() {
  return <PlatformWorkspace profileId="professional" />;
}
