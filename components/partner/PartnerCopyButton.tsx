'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type PartnerCopyButtonProps = {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  onCopied?: () => void;
  onCopyError?: () => void;
};

export function PartnerCopyButton({
  textToCopy,
  label = 'Copiar texto',
  copiedLabel = 'Texto copiado',
  className = '',
  onCopied,
  onCopyError,
}: PartnerCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopied?.();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      onCopyError?.();
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={[
        'inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(120,84,162,0.14)] bg-white px-4 text-xs font-black uppercase tracking-[0.11em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.35)]',
        className,
      ].join(' ')}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
