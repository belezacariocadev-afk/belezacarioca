import {
  BarChart3,
  BellRing,
  BookOpenText,
  CalendarRange,
  CircleDollarSign,
  LayoutDashboard,
  LogIn,
  Megaphone,
  UserRound,
  Users,
} from 'lucide-react';

import { SectionHeading } from '@/components/SectionHeading';
import type { FeatureItem } from '@/lib/data';

const featureIcons = {
  agenda: CalendarRange,
  blog: BookOpenText,
  booking: LayoutDashboard,
  clients: Users,
  customerArea: UserRound,
  finance: CircleDollarSign,
  login: LogIn,
  marketing: Megaphone,
  reminders: BellRing,
  reports: BarChart3,
  team: Users,
};

type FeaturesSectionProps = {
  kicker: string;
  title: string;
  description: string;
  items: FeatureItem[];
};

export function FeaturesSection({ kicker, title, description, items }: FeaturesSectionProps) {
  return (
    <section className="bc-section">
      <div className="bc-container">
        <SectionHeading kicker={kicker} title={title} description={description} />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const Icon = featureIcons[item.icon];

            return (
              <article
                key={item.id}
                className={[
                  'bc-card-hover rounded-[1.85rem] border p-6 shadow-[0_18px_38px_rgba(110,84,144,0.08)]',
                  index % 3 === 0
                    ? 'border-[rgba(216,178,123,0.2)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,238,230,0.94))]'
                    : 'border-[rgba(120,84,162,0.1)] bg-white',
                ].join(' ')}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(120,84,162,0.08)] text-[#7a58a6]">
                  <Icon size={18} />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-[color:var(--bc-text)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
