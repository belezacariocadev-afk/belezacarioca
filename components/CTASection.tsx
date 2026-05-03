import Link from 'next/link';

type CTASectionProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function CTASection({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CTASectionProps) {
  return (
    <section className="bc-section pt-4">
      <div className="bc-container">
        <div className="overflow-hidden rounded-[2.2rem] border border-[rgba(120,84,162,0.12)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,240,233,0.88))] px-6 py-8 shadow-[0_24px_60px_rgba(104,78,142,0.12)] md:px-10 md:py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <p className="bc-kicker">Pronta para acelerar</p>
              <h2 className="bc-title">{title}</h2>
              <p className="mt-5 text-base leading-8 text-[color:var(--bc-muted)]">{description}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={primaryHref} className="bc-button-primary h-14 px-7 text-sm">
                {primaryLabel}
              </Link>
              {secondaryHref && secondaryLabel ? (
                <Link href={secondaryHref} className="bc-button-secondary h-14 px-7 text-sm">
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
