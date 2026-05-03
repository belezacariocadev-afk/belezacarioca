import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarDays, CreditCard, Palette, Scissors, Users2 } from 'lucide-react';

import { PlatformAuthProvider } from '@/components/platform/PlatformAuthProvider';
import { PlatformDataProvider } from '@/components/platform/PlatformDataProvider';
import { AppearanceProvider } from '@/components/appearance/AppearanceProvider';
import { AdminModuleWorkspace, ProfileHomeWorkspace } from '@/components/platform/modules/OperationalWorkspace';
import { TrialStatusBanner } from '@/components/billing/TrialStatusBanner';
import { accessProfiles, canAccessModule } from '@/lib/platform/access';
import { appointmentToChargeFlow, type AccessProfileId, type OperationalModuleId } from '@/lib/platform/domain';
import { getOperationalModule, operationalModules } from '@/lib/platform/modules';
import { PlatformWorkspaceHeader } from '@/components/platform/PlatformWorkspaceHeader';

const moduleIcons = {
  agenda: CalendarDays,
  clientes: Users2,
  profissionais: Scissors,
  servicos: Scissors,
  financeiro: CreditCard,
  aparencia: Palette,
} as const;

const adminValueCards = [
  {
    title: 'Agenda organizada',
    description: 'Veja solicitacoes, confirmacoes e atendimentos do dia em uma rotina simples de acompanhar.',
  },
  {
    title: 'Clientes centralizados',
    description: 'Mantenha contatos, historico e preferencias em um unico lugar.',
  },
  {
    title: 'Equipe e servicos',
    description: 'Cadastre profissionais, horarios e servicos para manter a operacao pronta para agendar.',
  },
  {
    title: 'Controle financeiro',
    description: 'Acompanhe recebimentos, pendencias e fechamento dos atendimentos.',
  },
];

const profileHeroCopy: Record<AccessProfileId, { eyebrow: string; title: string; subtitle: string }> = {
  client: {
    eyebrow: 'Area do cliente',
    title: 'Agende e acompanhe seus horarios',
    subtitle: 'Escolha estabelecimento, servico, profissional e acompanhe o status das suas solicitacoes.',
  },
  partner: {
    eyebrow: 'Area do parceiro',
    title: 'Acompanhe suas indicacoes',
    subtitle: 'Veja materiais, leads, conversoes e comissoes de forma clara.',
  },
  salonAdmin: {
    eyebrow: 'Painel do estabelecimento',
    title: 'Gerencie seu salao em um so lugar',
    subtitle: 'Acompanhe agendamentos, clientes, profissionais, servicos e financeiro com praticidade.',
  },
  reception: {
    eyebrow: 'Recepcao',
    title: 'Organize a rotina de atendimento',
    subtitle: 'Acompanhe agenda, clientes, servicos e check-in sem complicar o dia a dia.',
  },
  professional: {
    eyebrow: 'Area do profissional',
    title: 'Acompanhe sua agenda e seus atendimentos',
    subtitle: 'Veja seus proximos horarios, inicie atendimentos e acompanhe seu historico.',
  },
  platformAdmin: {
    eyebrow: 'Painel administrativo',
    title: 'Acompanhe a operacao da plataforma',
    subtitle: 'Monitore estabelecimentos, acessos e rotinas de suporte com clareza.',
  },
};

function getModuleHref(profileId: AccessProfileId, moduleId: OperationalModuleId, adminRoute: string) {
  return profileId === 'salonAdmin' ? adminRoute : `${accessProfiles[profileId].entryPath}#${moduleId}`;
}

type PortalNavItem = {
  href: string;
  label: string;
  active?: boolean;
};

function getWorkspaceNavigation(profileId: AccessProfileId, activeModuleId?: OperationalModuleId) {
  const profile = accessProfiles[profileId];

  const navItems: PortalNavItem[] = [
    { href: profile.entryPath, label: 'Dashboard', active: !activeModuleId },
    ...operationalModules
      .filter((module) => canAccessModule(profile.id, module.id))
      .map((module) => ({
        href: getModuleHref(profile.id, module.id, module.route),
        label: module.label,
        active: activeModuleId === module.id,
      })),
  ];

  if (profileId === 'salonAdmin' || profileId === 'reception' || profileId === 'platformAdmin') {
    navItems.push({ href: '/assinatura', label: 'Assinatura' });
  }

  return navItems;
}

type PlatformWorkspaceProps = {
  profileId: AccessProfileId;
  activeModuleId?: OperationalModuleId;
};

export function PlatformWorkspace({ profileId, activeModuleId }: PlatformWorkspaceProps) {
  const profile = accessProfiles[profileId];
  const activeModule = activeModuleId ? getOperationalModule(activeModuleId) : undefined;
  const visibleModules = operationalModules.filter((module) => canAccessModule(profile.id, module.id));
  const hero = activeModule
    ? {
        eyebrow: activeModule.label,
        title: activeModule.description,
        subtitle: getModuleSubtitle(activeModule.id),
      }
    : profileHeroCopy[profile.id];

  return (
    <PlatformAuthProvider>
      <PlatformDataProvider>
        <AppearanceProvider>
          <main className="relative z-10 min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f7f0e9_100%)]">
            <section className="bc-section pt-8 md:pt-10">
              <div className="bc-container">
                <PlatformWorkspaceHeader navItems={getWorkspaceNavigation(profileId, activeModuleId)} profileLabel={accessProfiles[profileId].label} />

              {profileId === 'salonAdmin' || profileId === 'reception' || profileId === 'professional' ? (
                <TrialStatusBanner className="mt-4" />
              ) : null}

              <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
                <aside className="h-fit rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-5 shadow-[0_18px_42px_rgba(110,84,144,0.09)] lg:sticky lg:top-6">
                  <p className="bc-kicker">Perfil de acesso</p>
                  <h1 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{profile.label}</h1>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">{profile.description}</p>

                  <nav className="mt-6 grid gap-2">
                    <Link
                      href={profile.entryPath}
                      className={[
                        'rounded-2xl px-4 py-3 text-sm font-extrabold transition',
                        activeModuleId
                          ? 'text-[color:var(--bc-muted)] hover:bg-[rgba(120,84,162,0.06)] hover:text-[color:var(--bc-text)]'
                          : 'bg-[rgba(120,84,162,0.1)] text-[#6e4c98]',
                      ].join(' ')}
                    >
                      Visao geral
                    </Link>
                    {visibleModules.map((module) => (
                      <Link
                        key={module.id}
                        href={getModuleHref(profile.id, module.id, module.route)}
                        className={[
                          'rounded-2xl px-4 py-3 text-sm font-extrabold transition',
                          activeModuleId === module.id
                            ? 'bg-[rgba(120,84,162,0.1)] text-[#6e4c98]'
                            : 'text-[color:var(--bc-muted)] hover:bg-[rgba(120,84,162,0.06)] hover:text-[color:var(--bc-text)]',
                        ].join(' ')}
                      >
                        {module.label}
                      </Link>
                    ))}
                  </nav>
                </aside>

                <div className="space-y-8">
                  <section className="overflow-hidden rounded-[2.35rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(135deg,#241a35,#6e4c98_54%,#c79b5c)] p-6 text-white shadow-[0_26px_70px_rgba(36,26,53,0.18)] md:p-8">
                    <div className="max-w-4xl">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f1d7b1]">
                        {hero.eyebrow}
                      </p>
                      <h2 className="mt-4 text-[clamp(1.9rem,4vw,3.4rem)] font-black leading-[1.02] tracking-[-0.05em]">
                        {hero.title}
                      </h2>
                      <p className="mt-6 max-w-3xl text-base leading-8 text-white/82">
                        {hero.subtitle}
                      </p>
                      {!activeModule && profile.id === 'salonAdmin' ? (
                        <div className="mt-7 flex flex-wrap gap-3">
                          <Link href="/admin/agenda" className="bc-button-primary h-12 px-5 text-xs">
                            Novo agendamento
                          </Link>
                          <Link href="/admin/profissionais" className="bc-button-secondary h-12 px-5 text-xs">
                            Cadastrar profissional
                          </Link>
                          <Link href="/admin/servicos" className="bc-button-secondary h-12 px-5 text-xs">
                            Cadastrar servico
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </section>

                  {activeModule ? (
                    <ModuleDetail moduleId={activeModule.id} />
                  ) : (
                    <ProfileOverview profileId={profile.id} moduleIds={visibleModules.map((module) => module.id)} />
                  )}
                </div>
              </div>
              </div>
            </section>
          </main>
        </AppearanceProvider>
      </PlatformDataProvider>
    </PlatformAuthProvider>
  );
}

function ProfileOverview({ profileId, moduleIds }: { profileId: AccessProfileId; moduleIds: OperationalModuleId[] }) {
  const profile = accessProfiles[profileId];
  const modules = operationalModules.filter((module) => moduleIds.includes(module.id));

  return (
    <>
      <ProfileHomeWorkspace profileId={profileId} />

      {profileId === 'salonAdmin' ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminValueCards.map((card) => (
            <article key={card.title} className="rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_16px_34px_rgba(110,84,144,0.08)]">
              <h3 className="text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{card.description}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = moduleIcons[module.id];

          return (
            <Link
              key={module.id}
              id={module.id}
              href={getModuleHref(profile.id, module.id, module.route)}
              className="bc-card-hover rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_16px_34px_rgba(110,84,144,0.08)]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(120,84,162,0.08)] text-[#6e4c98]">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">{module.label}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{module.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#6e4c98]">
                Abrir modulo <ArrowRight size={15} />
              </span>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_18px_42px_rgba(110,84,144,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="bc-kicker">O que voce pode fazer</p>
          <h3 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
            Acoes disponiveis para {profile.label.toLowerCase()}
          </h3>
          <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">
            Seu acesso mostra apenas as areas e rotinas importantes para o seu trabalho.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {profile.capabilities.map((capability) => (
            <div key={capability} className="flex items-start gap-3 rounded-2xl bg-[rgba(120,84,162,0.06)] px-4 py-3">
              <BadgeCheck size={17} className="mt-0.5 shrink-0 text-[#6e4c98]" />
              <span className="text-sm font-semibold text-[color:var(--bc-text)]">{getCapabilityLabel(capability)}</span>
            </div>
          ))}
        </div>
      </section>

      <ServiceFlow />
    </>
  );
}

function ModuleDetail({ moduleId }: { moduleId: OperationalModuleId }) {
  const module = getOperationalModule(moduleId);

  if (!module) {
    return null;
  }

  const Icon = moduleIcons[module.id];

  return (
    <>
      <AdminModuleWorkspace moduleId={module.id} />

      <section className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_18px_42px_rgba(110,84,144,0.08)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="bc-kicker">Modulo operacional</p>
            <h3 className="text-4xl font-black tracking-[-0.05em] text-[color:var(--bc-text)]">{module.label}</h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--bc-muted)]">{module.description}</p>
          </div>
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgba(120,84,162,0.08)] text-[#6e4c98]">
            <Icon size={24} />
          </span>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.6rem] bg-[rgba(120,84,162,0.06)] p-5">
            <h4 className="text-lg font-black text-[color:var(--bc-text)]">Rotinas principais</h4>
            <div className="mt-4 grid gap-3">
              {module.responsibilities.map((item) => (
                <p key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)]">
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-[1.6rem] bg-[rgba(216,178,123,0.14)] p-5">
            <h4 className="text-lg font-black text-[color:var(--bc-text)]">Beneficios para a rotina</h4>
            <div className="mt-4 grid gap-3">
              {getModuleBenefits(module.id).map((item) => (
                <p key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[color:var(--bc-muted)]">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServiceFlow />
    </>
  );
}

function ServiceFlow() {
  return (
    <section className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white p-6 shadow-[0_18px_42px_rgba(110,84,144,0.08)]">
      <p className="bc-kicker">Fluxo completo</p>
      <h3 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
        Da solicitacao ao fechamento
      </h3>
      <div className="mt-6 grid gap-4">
        {appointmentToChargeFlow.map((step, index) => (
          <div key={step.id} className="grid gap-3 rounded-[1.4rem] border border-[rgba(120,84,162,0.1)] bg-white p-4 md:grid-cols-[auto_1fr]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#6e4c98] text-sm font-black text-white">
              {index + 1}
            </span>
            <span>
              <strong className="block text-[color:var(--bc-text)]">{step.title}</strong>
              <span className="mt-1 block text-sm leading-6 text-[color:var(--bc-muted)]">{step.description}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getModuleSubtitle(moduleId: OperationalModuleId) {
  const subtitles: Record<OperationalModuleId, string> = {
    agenda: 'Organize solicitacoes, confirmacoes, reagendamentos e atendimentos do dia.',
    clientes: 'Mantenha contatos, historico e preferencias sempre a mao.',
    profissionais: 'Cuide da equipe, da agenda individual e dos servicos de cada profissional.',
    servicos: 'Atualize catalogo, duracao, valores e profissionais habilitados.',
    financeiro: 'Acompanhe fechamento, recebimentos e pendencias do estabelecimento.',
    aparencia: 'Ajuste identidade visual, tema e imagens usadas pelo cliente.',
  };

  return subtitles[moduleId];
}

function getModuleBenefits(moduleId: OperationalModuleId) {
  const benefits: Record<OperationalModuleId, string[]> = {
    agenda: ['Menos conflito de horarios', 'Mais clareza sobre pedidos pendentes', 'Atendimentos organizados por status'],
    clientes: ['Historico facil de consultar', 'Contato centralizado', 'Relacionamento mais proximo'],
    profissionais: ['Escalas mais claras', 'Servicos por profissional', 'Acompanhamento da produtividade'],
    servicos: ['Valores atualizados', 'Duracao padronizada', 'Catalogo pronto para agendamento'],
    financeiro: ['Recebimentos acompanhados', 'Pendencias visiveis', 'Fechamento mais simples'],
    aparencia: ['Marca consistente', 'Experiencia do cliente mais profissional', 'Preview antes de publicar'],
  };

  return benefits[moduleId];
}

function getCapabilityLabel(capability: string) {
  const labels: Record<string, string> = {
    acompanhar_comissoes: 'Acompanhar comissoes',
    acompanhar_dashboard_parceiro: 'Acompanhar painel do parceiro',
    acompanhar_financeiro: 'Acompanhar financeiro',
    acompanhar_historico: 'Acompanhar historico',
    auditoria: 'Acompanhar auditorias',
    baixar_materiais_divulgacao: 'Baixar materiais de divulgacao',
    billing_global: 'Acompanhar cobrancas',
    buscar_servicos: 'Buscar servicos',
    configurar_integracoes: 'Configurar recursos da plataforma',
    copiar_link_exclusivo: 'Copiar link exclusivo',
    criar_agendamento: 'Criar agendamento',
    fazer_check_in: 'Fazer check-in',
    finalizar_atendimento: 'Finalizar atendimento',
    gerenciar_agenda: 'Gerenciar agenda',
    gerenciar_assinatura: 'Gerenciar assinatura',
    gerenciar_clientes: 'Gerenciar clientes',
    gerenciar_profissionais: 'Gerenciar profissionais',
    gerenciar_servicos: 'Gerenciar servicos',
    iniciar_atendimento: 'Iniciar atendimento',
    pagar_cobranca: 'Pagar cobranca',
    personalizar_aparencia: 'Personalizar aparencia',
    suporte_global: 'Atender suporte',
    ver_agenda_propria: 'Ver agenda propria',
    ver_comissoes: 'Ver comissoes',
    ver_servicos: 'Ver servicos',
  };

  return labels[capability] ?? capability.replaceAll('_', ' ');
}
