import { MessageSquareQuote } from 'lucide-react';

import type { PartnerReadyText } from '@/lib/partner/readyTexts';

import { PartnerCopyButton } from './PartnerCopyButton';

type PartnerReadyTextCardProps = {
  item: PartnerReadyText;
  categoryLabel: string;
  onCopied: () => void;
  onCopyError: () => void;
};

export function PartnerReadyTextCard({
  item,
  categoryLabel,
  onCopied,
  onCopyError,
}: PartnerReadyTextCardProps) {
  return (
    <article className="rounded-[1.4rem] border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_12px_30px_rgba(110,84,144,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.18)] bg-[rgba(120,84,162,0.08)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#6e4c98]">
          <MessageSquareQuote size={13} />
          {categoryLabel}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-black tracking-[-0.03em] text-[color:var(--bc-text)]">{item.title}</h3>
      <p className="mt-2 text-sm leading-7 text-[color:var(--bc-muted)]">{item.description}</p>

      <div className="mt-4 rounded-[1.1rem] border border-[rgba(120,84,162,0.12)] bg-[rgba(120,84,162,0.04)] px-4 py-4">
        <p className="whitespace-pre-line text-sm leading-7 text-[color:var(--bc-text)]">{item.content}</p>
      </div>

      <div className="mt-4">
        <PartnerCopyButton textToCopy={item.content} onCopied={onCopied} onCopyError={onCopyError} />
      </div>
    </article>
  );
}
