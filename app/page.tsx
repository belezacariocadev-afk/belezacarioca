export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf7f0] text-[#241431]">
      <section className="relative border-b border-[#eadfce] bg-[radial-gradient(circle_at_top_left,#fff7df_0,#fbf7f0_38%,#f5eee4_100%)]">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
          <header className="flex items-center justify-between rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7c4cc2] text-lg font-black text-white shadow-md">
                BC
              </div>
              <div>
                <p className="text-sm font-black leading-none">Beleza Carioca</p>
                <p className="text-xs text-[#6f6178]">Agenda inteligente para beleza</p>
              </div>
            </div>

            <a
              href="https://wa.me/5521964589848"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#241431] px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:scale-[1.02]"
            >
              Falar no WhatsApp
            </a>
          </header>

          <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7c4cc2] shadow-sm">
                🚧 Plataforma em construção
              </div>

              <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#241431] md:text-7xl">
                Beleza, agenda e gestão em um só lugar.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#6f6178] md:text-lg">
                Estamos preparando uma nova experiência para salões, barbearias, clínicas de estética e profissionais da beleza gerenciarem clientes, horários e serviços com mais praticidade.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://wa.me/5521964589848?text=Ol%C3%A1%2C%20quero%20saber%20sobre%20a%20plataforma%20Beleza%20Carioca."
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#7c4cc2] px-7 py-4 text-center text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:scale-[1.02]"
                >
                  Entrar na lista de espera
                </a>

                <a
                  href="mailto:gbdevappsbr@gmail.com"
                  className="rounded-full border border-[#d9cbe8] bg-white px-7 py-4 text-center text-sm font-black text-[#241431] shadow-sm transition hover:scale-[1.02]"
                >
                  Contato por e-mail
                </a>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-xl font-black text-[#7c4cc2]">24/7</p>
                  <p className="mt-1 text-xs font-semibold text-[#6f6178]">agenda online</p>
                </div>
                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-xl font-black text-[#7c4cc2]">100%</p>
                  <p className="mt-1 text-xs font-semibold text-[#6f6178]">pensado para beleza</p>
                </div>
                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-xl font-black text-[#7c4cc2]">BR</p>
                  <p className="mt-1 text-xs font-semibold text-[#6f6178]">feito para negócios locais</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -left-10 top-12 hidden rounded-3xl bg-white p-4 shadow-xl md:block">
                <p className="text-xs font-black text-[#7c4cc2]">Novo agendamento</p>
                <p className="mt-1 text-sm font-bold">Corte + escova</p>
                <p className="text-xs text-[#6f6178]">Hoje às 15:30</p>
              </div>

              <div className="absolute -right-8 bottom-20 hidden rounded-3xl bg-[#241431] p-4 text-white shadow-xl md:block">
                <p className="text-xs font-black text-[#d9b979]">Status</p>
                <p className="mt-1 text-sm font-bold">Em breve no ar</p>
              </div>

              <div className="rounded-[2.2rem] border border-white bg-white/75 p-5 shadow-2xl backdrop-blur">
                <div className="rounded-[1.7rem] bg-[#241431] p-4 text-white">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60">Painel</p>
                      <p className="font-black">Beleza Carioca</p>
                    </div>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Beta</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      ['Manicure', '09:00', 'Confirmado'],
                      ['Corte masculino', '11:30', 'Aguardando'],
                      ['Design de sobrancelha', '14:00', 'Confirmado'],
                    ].map(([service, time, status]) => (
                      <div key={service} className="rounded-2xl bg-white p-4 text-[#241431]">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black">{service}</p>
                            <p className="text-xs text-[#6f6178]">Horário: {time}</p>
                          </div>
                          <span className="rounded-full bg-[#f4edf9] px-3 py-1 text-[10px] font-black text-[#7c4cc2]">
                            {status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Agenda online', 'Clientes poderão marcar horários com facilidade.'],
              ['Gestão de serviços', 'Organize categorias, preços e duração dos atendimentos.'],
              ['Painel do negócio', 'Visualize reservas, clientes e operação do salão.'],
              ['Parceiros locais', 'Conecte seu estabelecimento a uma vitrine digital.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-[#eee5da] bg-[#fbf7f0] p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0e4ff] text-[#7c4cc2]">
                  ✦
                </div>
                <h2 className="text-lg font-black tracking-[-0.03em]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6f6178]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-[#7c4cc2] via-[#9b6ea6] to-[#d0a15f] py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-white/70">Em breve</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">A beleza ao alcance de um clique.</h2>
          </div>
          <a
            href="https://wa.me/5521964589848"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/40 bg-white/15 px-6 py-3 text-sm font-black backdrop-blur transition hover:bg-white/25"
          >
            Quero saber quando lançar
          </a>
        </div>
      </footer>
    </main>
  )
}
