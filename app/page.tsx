const features = [
  {
    title: "Agendamento online",
    text: "Mais praticidade para você e seus clientes.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2v3M17 2v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
      </svg>
    ),
  },
  {
    title: "Gestão de clientes",
    text: "Organize informações e fidelize mais.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Relatórios inteligentes",
    text: "Acompanhe resultados e tome melhores decisões.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 3 3 6-7" />
        <path d="M18 6h2v2" />
      </svg>
    ),
  },
  {
    title: "Segurança total",
    text: "Seus dados protegidos com tecnologia de ponta.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export default function Page() {
  return (
    <main className="bc-page">
      <div className="bc-bg" aria-hidden="true">
        <img src="/rio-bg.png" alt="" className="bc-bg-img" />
        <div className="bc-white-layer" />
        <div className="bc-blue-haze" />
        <div className="bc-orb bc-orb-one" />
        <div className="bc-orb bc-orb-two" />
        <div className="bc-lines" />
      </div>

      <section className="bc-shell">
        <header className="bc-header">
          <img src="/logo-beleza-carioca.png" alt="Beleza Carioca" className="bc-logo" />
        </header>

        <div className="bc-content">
          <p className="bc-kicker">Site em construção</p>

          <h1 className="bc-title">
            Estamos construindo algo incrível para <span>transformar a beleza do Brasil.</span>
          </h1>

          <p className="bc-description">
            Em breve, uma plataforma completa para salões, barbearias e profissionais da beleza gerenciarem suas agendas,
            clientes e serviços com mais facilidade.
          </p>

          <div className="bc-card">
            <div className="bc-bell" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="bc-card-copy">
              <strong>Lançamento em breve!</strong>
              <span>Deixe seu contato e seja o primeiro a saber quando lançarmos.</span>
            </div>
            <input aria-label="Seu melhor e-mail" placeholder="Seu melhor e-mail" className="bc-input" />
            <button className="bc-button" type="button">Quero saber <span>→</span></button>
          </div>

          <div className="bc-features">
            {features.map((feature) => (
              <article className="bc-feature" key={feature.title}>
                <div className="bc-feature-icon">{feature.icon}</div>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>

        <footer className="bc-footer">
          <span>© 2026 Beleza Carioca. Todos os direitos reservados.</span>
          <span className="bc-heart">♥</span>
          <span>Desenvolvido por <strong>Gabriel Gonçalves</strong></span>
          <a href="https://www.instagram.com/gbdevapps/" target="_blank" rel="noreferrer">@gbdevapps</a>
        </footer>
      </section>
    </main>
  );
}
