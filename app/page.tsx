const features = [
  {
    title: "Agendamento online",
    text: "Mais praticidade para você e seus clientes.",
    icon: "📅",
  },
  {
    title: "Gestão de clientes",
    text: "Organize informações e fidelize mais.",
    icon: "👥",
  },
  {
    title: "Relatórios inteligentes",
    text: "Acompanhe resultados e tome melhores decisões.",
    icon: "📈",
  },
  {
    title: "Segurança total",
    text: "Seus dados protegidos com tecnologia de ponta.",
    icon: "🛡️",
  },
];

export default function Page() {
  return (
    <main className="home-page">
      <div className="background" aria-hidden="true">
        <img src="/rio-bg.png" alt="" className="background-image" />
        <div className="white-overlay" />
        <div className="blue-glow glow-one" />
        <div className="blue-glow glow-two" />
      </div>

      <section className="content-wrap">
        <header className="header">
          <img
            src="/logo-beleza-carioca.png"
            alt="Beleza Carioca"
            className="logo"
          />
        </header>

        <section className="hero-content">
          <p className="kicker">Site em construção</p>

          <h1>
            Estamos construindo algo incrível para{" "}
            <span>transformar a beleza do Brasil.</span>
          </h1>

          <p className="description">
            Em breve, uma plataforma completa para salões, barbearias e
            profissionais da beleza gerenciarem suas agendas, clientes e
            serviços com mais facilidade.
          </p>

          <div className="launch-card">
            <div className="bell">🔔</div>
            <div className="launch-text">
              <strong>Lançamento em breve!</strong>
              <p>Deixe seu contato e seja o primeiro a saber quando lançarmos.</p>
            </div>
            <input type="email" placeholder="Seu melhor e-mail" />
            <button>Quero saber →</button>
          </div>

          <div className="features">
            {features.map((feature) => (
              <article className="feature" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <footer className="footer">
        <span>© 2026 Beleza Carioca. Todos os direitos reservados.</span>
        <span className="heart">♥</span>
        <span>
          Desenvolvido por <strong>Gabriel Gonçalves</strong>
        </span>
        <a href="https://www.instagram.com/gbdevapps/" target="_blank" rel="noreferrer">
          @gbdevapps
        </a>
      </footer>
    </main>
  );
}
