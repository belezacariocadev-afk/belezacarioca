import { Quote } from 'lucide-react';

import { SectionHeading } from '@/components/SectionHeading';
import { testimonials } from '@/lib/data';

export function TestimonialsSection() {
  return (
    <section className="bc-section">
      <div className="bc-container">
        <SectionHeading
          kicker="O que nossos clientes dizem"
          title="Depoimentos que dão peso comercial sem perder elegância."
          description="Cards claros, premium e sofisticados para transmitir confiança de produto e percepção de startup pronta para apresentar."
          center
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="bc-card-hover rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,233,0.94))] p-6 shadow-[0_18px_38px_rgba(110,84,144,0.08)]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(216,178,123,0.16)] text-[#8d6a39]">
                <Quote size={18} />
              </span>
              <p className="mt-5 text-sm leading-8 text-[color:var(--bc-muted)]">{testimonial.quote}</p>
              <div className="mt-6 border-t border-[rgba(120,84,162,0.08)] pt-4">
                <p className="font-semibold text-[color:var(--bc-text)]">{testimonial.name}</p>
                <p className="mt-1 text-sm text-[color:var(--bc-muted)]">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
