export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <img
          src="/rio-bg.png"
          alt="Rio de Janeiro ao pôr do sol"
          className="h-full w-full object-cover object-center animate-rioZoom"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96)_0%,rgba(2,6,23,0.82)_34%,rgba(2,6,23,0.48)_62%,rgba(2,6,23,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_28%,rgba(37,99,235,0.36),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.22),transparent_28%)]" />
      </div>

      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl animate-floatSlow" />
      <div className="pointer-events-none absolute right-16 top-24 h-52 w-52 rounded-full border border-cyan-300/25 animate-orbit" />
      <div className="pointer-events-none absolute bottom-16 right-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-floatFast" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_42%,rgba(255,255,255,0.10)_48%,transparent_55%,transparent_100%)] animate-lightSweep" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-6">
          <img
            src="/logo-beleza-carioca.png"
            alt="Beleza Carioca"
            className="h-auto w-48 max-w-[64vw] drop-shadow-[0_10px_28px_rgba(37,99,235,0.35)] sm:w-64"
          />

          <div className="hidden items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white/85 shadow-2xl shadow-blue-950/30 backdrop-blur-md md:flex">
            <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_18px_#60a5fa]" />
            Plataforma em construção
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/12 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-100 backdrop-blur-md">
              <span className="text-lg">🌊</span>
              Feito no Rio para salões
            </div>

            <h1 className="text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Site em <span className="block text-blue-400 drop-shadow-[0_0_28px_rgba(59,130,246,0.75)]">construção.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-100/90 sm:text-xl">
              Estamos preparando uma plataforma SaaS para salões, barbearias e profissionais da beleza controlarem
              <strong className="font800 text-white"> agenda, clientes e serviços</strong> com mais praticidade.
            </p>

            <div className="mt-9 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                ["Agenda 24h", "Reservas online sempre disponíveis", "📅"],
                ["Clientes", "Gestão simples e organizada", "👥"],
                ["Serviços", "Controle completo do salão", "✨"],
              ].map(([title, text, icon]) => (
                <div key={title} className="rounded-3xl border border-white/14 bg-white/10 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/25 text-2xl ring-1 ring-blue-200/20">{icon}</div>
                  <h2 className="text-lg font-bold text-white">{title}</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-200/80">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex max-w-2xl flex-col gap-4 rounded-[2rem] border border-blue-200/20 bg-white/10 p-5 shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xl font-extrabold text-white">Lançamento em breve</p>
                <p className="mt-1 text-sm text-slate-200/80">Uma nova experiência para negócios de beleza.</p>
              </div>
              <a
                href="https://wa.me/5521964589848"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-7 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/35 transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Quero saber
              </a>
            </div>
          </div>

          <aside className="hidden lg:flex justify-end">
            <div className="relative h-[520px] w-full max-w-[460px]">
              <div className="absolute right-0 top-8 h-64 w-64 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm animate-floatSlow" />
              <div className="absolute bottom-8 left-10 h-52 w-52 rounded-full bg-blue-500/15 blur-2xl animate-floatFast" />
              <div className="absolute bottom-16 right-5 w-80 rounded-[2rem] border border-white/18 bg-slate-950/35 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.22em] text-blue-200">Beleza Carioca</p>
                <p className="mt-3 text-3xl font-black leading-tight">Gestão premium para o salão crescer.</p>
                <p className="mt-4 text-sm leading-6 text-slate-200/80">Agenda, clientes, serviços e controle em um só lugar.</p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="relative z-10 pb-4 text-center text-xs font-medium text-white/60">
          Desenvolvido por <span className="text-blue-300">Gabriel Gonçalves</span> · @gbdevapps
        </footer>
      </section>
    </main>
  );
}
