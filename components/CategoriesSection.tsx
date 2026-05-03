import { BrushCleaning, HandMetal, ScanFace, Scissors, Sparkles, Waves } from 'lucide-react';

import { SectionHeading } from '@/components/SectionHeading';
import { categories } from '@/lib/data';

const iconMap = [Scissors, HandMetal, BrushCleaning, Sparkles, ScanFace, Waves];

export function CategoriesSection() {
  return (
    <section className="bc-section pt-6">
      <div className="bc-container">
        <SectionHeading
          kicker="Categorias"
          title="Encontre o serviço perfeito para cada estilo de atendimento."
          description="Uma vitrine de categorias refinada para mostrar amplitude, especialização e sensação de plataforma pronta para operar."
          center
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((item, index) => {
            const Icon = iconMap[index];

            return (
              <article
                key={item.id}
                className="bc-card-hover relative overflow-hidden rounded-[1.9rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,231,0.92))] p-5 shadow-[0_16px_34px_rgba(110,84,144,0.08)]"
              >
                <div
                  className={[
                    'absolute inset-x-0 top-0 h-28',
                    index % 2 === 0
                      ? 'bg-[radial-gradient(circle_at_top_left,rgba(216,178,123,0.18),transparent_60%),linear-gradient(135deg,rgba(120,84,162,0.08),transparent)]'
                      : 'bg-[radial-gradient(circle_at_top_left,rgba(120,84,162,0.12),transparent_60%),linear-gradient(135deg,rgba(216,178,123,0.12),transparent)]',
                  ].join(' ')}
                />

                <div className="relative z-10">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(120,84,162,0.1)] bg-white text-[#7a58a6]">
                    <Icon size={18} />
                  </span>

                  <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8d6a39]">{item.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-[color:var(--bc-text)]">{item.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[color:var(--bc-muted)]">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
