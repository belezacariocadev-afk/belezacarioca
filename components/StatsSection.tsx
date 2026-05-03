import { stats } from '@/lib/data';

export function StatsSection() {
  return (
    <section className="bc-section pt-0">
      <div className="bc-container">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => (
            <article
              key={item.id}
              className={[
                'rounded-[1.8rem] border p-6 text-center shadow-[0_18px_38px_rgba(110,84,144,0.08)]',
                index === 3
                  ? 'border-[rgba(216,178,123,0.22)] bg-[linear-gradient(180deg,rgba(255,249,241,0.98),rgba(244,233,216,0.92))]'
                  : 'border-[rgba(120,84,162,0.1)] bg-white',
              ].join(' ')}
            >
              <strong className="block text-[clamp(2rem,4vw,2.8rem)] font-semibold text-[#6e4c98]">{item.value}</strong>
              <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)]">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
