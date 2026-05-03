import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PlatformWorkspace } from '@/components/platform/PlatformWorkspace';
import type { OperationalModuleId } from '@/lib/platform/domain';
import { getOperationalModule, operationalModules } from '@/lib/platform/modules';

type AdminModulePageProps = {
  params: Promise<{
    module: string;
  }>;
};

export function generateStaticParams() {
  return operationalModules.map((module) => ({
    module: module.id,
  }));
}

export async function generateMetadata({ params }: AdminModulePageProps): Promise<Metadata> {
  const { module: moduleId } = await params;
  const module = getOperationalModule(moduleId);

  return {
    title: module ? `${module.label} | Painel admin` : 'Modulo | Painel admin',
    description: module?.description,
  };
}

export default async function AdminModulePage({ params }: AdminModulePageProps) {
  const { module: moduleId } = await params;
  const module = getOperationalModule(moduleId);

  if (!module) {
    notFound();
  }

  return <PlatformWorkspace profileId="salonAdmin" activeModuleId={module.id as OperationalModuleId} />;
}
