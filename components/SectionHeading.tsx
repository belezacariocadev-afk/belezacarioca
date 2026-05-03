type SectionHeadingProps = {
  kicker: string;
  title: string;
  description?: string;
  center?: boolean;
};

export function SectionHeading({ kicker, title, description, center = false }: SectionHeadingProps) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="bc-kicker">{kicker}</p>
      <h2 className="bc-title">{title}</h2>
      {description ? <p className="mt-5 text-base leading-8 text-[color:var(--bc-muted)] md:text-lg">{description}</p> : null}
    </div>
  );
}
