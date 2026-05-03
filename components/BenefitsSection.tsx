import { CalendarClock, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/SectionHeading';
import { benefits } from '@/lib/data';

const benefitIcons = {
  calendar: CalendarClock,
  shield: ShieldCheck,
  sparkles: Sparkles,
  users: UsersRound,
};

export function BenefitsSection() {
  return (
    <section className="bc-section">
      <div className="bc-container">
        <SectionHeading
          kicker="Por que escolher a Beleza Carioca?"
          title="Uma experiência premium para quem precisa vender bem e operar melhor."
          description="Visual refinado, menos burocracia, clientes mais felizes e uma base que já comunica profissionalismo desde a primeira tela."
          center
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {benefits.map((item) => {
            const Icon = benefitIcons[item.icon];

            return (
              <Card key={item.id} hover>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
                  <Icon size={18} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-[color:var(--bc-text)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{item.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
