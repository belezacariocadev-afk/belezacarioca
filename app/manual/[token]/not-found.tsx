import Link from 'next/link';

export default function PublicManualNotFound() {
  return (
    <main className="relative z-10">
      <section className="bc-container py-20">
        <div className="mx-auto max-w-[680px] rounded-[1.8rem] border border-[rgba(120,84,162,0.14)] bg-white/95 px-7 py-10 text-center shadow-[0_20px_54px_rgba(110,84,144,0.1)]">
          <p className="bc-kicker">Link invalido</p>
          <h1 className="text-[clamp(1.5rem,3.2vw,2.4rem)] font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
            Manual do parceiro nao encontrado
          </h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--bc-muted)] sm:text-base">
            Este link nao esta ativo ou nao existe mais. Solicite um novo link ao time Beleza Carioca.
          </p>

          <div className="mt-6 flex justify-center">
            <Link href="/" className="bc-button-secondary h-11 px-6 text-xs uppercase tracking-[0.11em]">
              Voltar ao inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

