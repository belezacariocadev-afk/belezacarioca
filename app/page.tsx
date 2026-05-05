const features = [
  {
    icon: "📅",
    title: "Agendamento online",
    text: "Mais praticidade para você e seus clientes.",
  },
  {
    icon: "👥",
    title: "Gestão de clientes",
    text: "Organize informações e fidelize mais.",
  },
  {
    icon: "📈",
    title: "Relatórios inteligentes",
    text: "Acompanhe resultados e tome melhores decisões.",
  },
  {
    icon: "🛡️",
    title: "Segurança total",
    text: "Seus dados protegidos com tecnologia de ponta.",
  },
];

export default function Home() {
  return (
    <main className="bc-page">
      <div className="bc-rio-bg" aria-hidden="true" />
      <div className="bc-white-glow" aria-hidden="true" />
      <div className="bc-blue-orb bc-blue-orb-one" aria-hidden="true" />
      <div className="bc-blue-orb bc-blue-orb-two" aria-hidden="true" />
      <div className="bc-lines" aria-hidden="true" />

      <section className="bc-shell">
        <header className="bc-header">
          <img
            src="/logo-beleza-carioca.png"
            alt="Beleza Carioca"
            className="bc-logo"
          />
        </header>

        <div className="bc-hero">
          <p className="bc-kicker">SITE EM CONSTRUÇÃO</p>

          <h1>
            Estamos construindo algo incrível para{" "}
            <span>transformar a beleza do Brasil.</span>
          </h1>

          <p className="bc-description">
            Em breve, uma plataforma completa para salões, barbearias e
            profissionais da beleza gerenciarem suas agendas, clientes e
            serviços com mais facilidade.
          </p>

          <div className="bc-notify-card">
            <div className="bc-bell">🔔</div>
            <div className="bc-notify-text">
              <strong>Lançamento em breve!</strong>
              <span>Deixe seu contato e seja o primeiro a saber quando lançarmos.</span>
            </div>
            <a className="bc-button" href="mailto:gbdevappsbr@gmail.com">
              Quero saber
              <span>→</span>
            </a>
          </div>
        </div>

        <div className="bc-features" aria-label="Recursos da plataforma">
          {features.map((item) => (
            <article className="bc-feature" key={item.title}>
              <div className="bc-feature-icon">{item.icon}</div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <footer className="bc-footer">
          <span>© 2026 Beleza Carioca. Todos os direitos reservados.</span>
          <span className="bc-heart">♥</span>
          <span>
            Desenvolvido por <strong>Gabriel Gonçalves</strong>
          </span>
          <a
            href="https://www.instagram.com/gbdevapps/"
            target="_blank"
            rel="noreferrer"
          >
            @gbdevapps
          </a>
        </footer>
      </section>
    </main>
  );
}
