'use client';

import type { LucideIcon } from 'lucide-react';

type PartnerNavItem = {
  href?: string;
  id: string;
  label: string;
  icon: LucideIcon;
};

type PartnerNavActionItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
};

type PartnerAreaNavigationProps = {
  items: PartnerNavItem[];
  activeSectionId: string;
  actionItem?: PartnerNavActionItem;
};

function ItemLink({ item, active, compact = false }: { item: PartnerNavItem; active: boolean; compact?: boolean }) {
  const Icon = item.icon;

  return (
    <a
      href={item.href ?? `#${item.id}`}
      className={[
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
        compact ? 'whitespace-nowrap' : 'w-full',
        active
          ? 'border-[rgba(120,84,162,0.28)] bg-[rgba(120,84,162,0.12)] text-[color:var(--bc-purple-strong)]'
          : 'border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-muted)] hover:border-[rgba(216,178,123,0.34)] hover:text-[color:var(--bc-text)]',
      ].join(' ')}
    >
      <Icon size={16} />
      {item.label}
    </a>
  );
}

function ActionItemButton({ item, compact = false }: { item: PartnerNavActionItem; compact?: boolean }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={item.onClick}
      disabled={item.disabled}
      className={[
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
        compact ? 'whitespace-nowrap' : 'w-full',
        'border-[rgba(120,84,162,0.12)] bg-white text-[color:var(--bc-muted)] hover:border-[rgba(216,178,123,0.34)] hover:text-[color:var(--bc-text)]',
        'disabled:cursor-not-allowed disabled:opacity-60',
      ].join(' ')}
    >
      <Icon size={16} />
      {item.label}
    </button>
  );
}

export function PartnerAreaNavigation({ items, activeSectionId, actionItem }: PartnerAreaNavigationProps) {
  return (
    <>
      <div className="no-scrollbar -mx-1 overflow-x-auto px-1 pb-1 lg:hidden">
        <nav className="flex min-w-max gap-2 rounded-[1.1rem] border border-[rgba(120,84,162,0.12)] bg-white/90 p-2 shadow-[0_10px_28px_rgba(110,84,144,0.09)]">
          {items.map((item) => (
            <ItemLink key={item.id} item={item} active={item.id === activeSectionId} compact />
          ))}
          {actionItem ? <ActionItemButton item={actionItem} compact /> : null}
        </nav>
      </div>

      <aside className="hidden h-fit rounded-[1.7rem] border border-[rgba(120,84,162,0.12)] bg-white/95 p-4 shadow-[0_16px_40px_rgba(110,84,144,0.09)] lg:sticky lg:top-5 lg:block">
        <p className="bc-kicker">Navegacao</p>
        <nav className="mt-4 grid gap-2">
          {items.map((item) => (
            <ItemLink key={item.id} item={item} active={item.id === activeSectionId} />
          ))}
          {actionItem ? <ActionItemButton item={actionItem} /> : null}
        </nav>
      </aside>
    </>
  );
}
