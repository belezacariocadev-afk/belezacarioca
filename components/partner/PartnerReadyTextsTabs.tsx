import type { PartnerReadyTextCategory } from '@/lib/partner/readyTexts';

type PartnerReadyTextsTabsProps = {
  categories: PartnerReadyTextCategory[];
  activeCategoryId: PartnerReadyTextCategory['id'];
  onSelectCategory: (categoryId: PartnerReadyTextCategory['id']) => void;
};

export function PartnerReadyTextsTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
}: PartnerReadyTextsTabsProps) {
  return (
    <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
      <div className="flex min-w-max gap-2 rounded-[1rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.05)] p-2">
        {categories.map((category) => {
          const active = category.id === activeCategoryId;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={[
                'rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.11em] transition',
                active
                  ? 'bg-white text-[color:var(--bc-purple-strong)] shadow-[0_8px_18px_rgba(110,84,144,0.12)]'
                  : 'text-[color:var(--bc-muted)] hover:text-[color:var(--bc-text)]',
              ].join(' ')}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
