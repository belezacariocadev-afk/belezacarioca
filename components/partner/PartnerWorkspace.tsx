'use client';

import {
  CircleHelp,
  CreditCard,
  Gauge,
  Gift,
  Link2,
  LogOut,
  Megaphone,
  ReceiptText,
  UserCog,
  UserCheck,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import type { PartnerAreaData } from '@/lib/partner/mockData';

import { PartnerAreaNavigation } from './PartnerAreaNavigation';
import { PartnerCommissionsCard } from './PartnerCommissionsCard';
import { PartnerConversionsTable } from './PartnerConversionsTable';
import { PartnerDashboardHeader } from './PartnerDashboardHeader';
import { PartnerLeadsTable } from './PartnerLeadsTable';
import { PartnerMaterialsSection } from './PartnerMaterialsSection';
import { PartnerPaymentsTable } from './PartnerPaymentsTable';
import { PartnerHelpCenterModal } from './PartnerHelpCenterModal';
import { PartnerReferralLinkCard } from './PartnerReferralLinkCard';
import { PartnerStatsCards } from './PartnerStatsCards';
import { PartnerWorkspaceSkeleton } from './PartnerWorkspaceSkeleton';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge },
  { id: 'meu-link', label: 'Meu link', icon: Link2 },
  { id: 'materiais', label: 'Materiais', icon: Megaphone },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'conversoes', label: 'Conversoes', icon: UserCheck },
  { id: 'comissoes', label: 'Comissoes', icon: Gift },
  { id: 'pagamentos', label: 'Pagamentos', icon: ReceiptText },
  { id: 'minha-conta', label: 'Minha conta', icon: UserCog, href: '/parceiro/minha-conta' },
  { id: 'suporte', label: 'Suporte', icon: CircleHelp },
] as const;

type PartnerWorkspaceProps = {
  initialData: PartnerAreaData;
};

export function PartnerWorkspace({ initialData }: PartnerWorkspaceProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string>(navItems[0].id);
  const [heroCopyFeedback, setHeroCopyFeedback] = useState<string | null>(null);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const data = useMemo(() => initialData, [initialData]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.15, 0.3, 0.5, 0.75],
        rootMargin: '-15% 0px -60% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  async function handleHeroCopyLink() {
    try {
      await navigator.clipboard.writeText(data.partner.referralLink);
      setHeroCopyFeedback('Link copiado');
      window.setTimeout(() => setHeroCopyFeedback(null), 1800);
    } catch {
      setHeroCopyFeedback('Copie manualmente');
      window.setTimeout(() => setHeroCopyFeedback(null), 1800);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
    } catch {
      // Keep redirect even when API call fails to avoid trapping the user in the partner UI.
    } finally {
      router.replace('/parceiro/login');
      router.refresh();
    }
  }

  if (isLoading) {
    return <PartnerWorkspaceSkeleton />;
  }

  return (
    <main className="relative z-10 min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f6efe6_100%)]">
      <section className="bc-section pt-8 md:pt-10">
        <div className="bc-container">
          <PartnerDashboardHeader
            partnerName={data.partner.name}
            partnerRole={data.partner.role}
            copyFeedback={heroCopyFeedback}
            onCopyLink={handleHeroCopyLink}
            recentStatuses={data.recentStatuses}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
            <PartnerAreaNavigation
              items={[...navItems]}
              activeSectionId={activeSectionId}
              actionItem={{
                label: isLoggingOut ? 'Saindo...' : 'Sair',
                icon: LogOut,
                onClick: () => {
                  void handleLogout();
                },
                disabled: isLoggingOut,
              }}
            />

            <div className="space-y-8">
              <PartnerStatsCards metrics={data.metrics} />

              <PartnerReferralLinkCard
                partnerCode={data.partner.partnerCode}
                referralLink={data.partner.referralLink}
                disclosureText={data.partner.disclosureText}
              />

              <PartnerMaterialsSection materials={data.materials} />
              <PartnerLeadsTable leads={data.leads} />
              <PartnerConversionsTable conversions={data.conversions} />
              <PartnerCommissionsCard
                monthlyCommissionCents={data.metrics.monthlyCommissionCents}
                pendingCommissionCents={data.metrics.pendingCommissionCents}
                paidCommissionCents={data.metrics.paidCommissionCents}
                commissionHistory={data.commissionHistory}
              />
              <PartnerPaymentsTable payments={data.payments} />

              <section id="suporte" className="scroll-mt-24">
                <div className="rounded-[1.85rem] border border-[rgba(120,84,162,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(110,84,144,0.1)]">
                  <p className="bc-kicker">Suporte</p>
                  <h2 className="text-[clamp(1.35rem,3vw,1.95rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
                    Canal dedicado para parceiros
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--bc-muted)]">
                    Sempre que precisar de apoio comercial, ajustes de campanha ou alinhamento estrategico, nosso
                    time esta pronto para ajudar.
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <SupportCard title="Canal principal" value={data.support.channel} />
                    <SupportCard title="Tempo medio de resposta" value={data.support.responseTime} />
                    <SupportCard title="Contato rapido" value={`${data.support.email} | ${data.support.whatsapp}`} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={`mailto:${data.support.email}`}
                      className="bc-button-primary h-11 px-6 text-sm"
                    >
                      Falar por e-mail
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsHelpCenterOpen(true)}
                      className="bc-button-secondary h-11 px-6 text-sm"
                    >
                      Abrir central de ajuda
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <PartnerHelpCenterModal
        open={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
        support={data.support}
      />
    </main>
  );
}

function SupportCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-[1.2rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.05)] px-4 py-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--bc-muted)]">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-[color:var(--bc-text)]">{value}</p>
    </article>
  );
}
