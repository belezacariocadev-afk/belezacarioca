export default function Page() {
  return (
    <main className="landing-page">
      <div className="rio-bg" aria-hidden="true" />
      <div className="white-overlay" aria-hidden="true" />
      <div className="soft-orb orb-one" aria-hidden="true" />
      <div className="soft-orb orb-two" aria-hidden="true" />

      <section className="hero-shell">
        <header className="brand-header">
          <img
            src="/logo-beleza-carioca-azul.png"
            alt="Beleza Carioca"
            className="brand-logo"
          />
        </header>

        <div className="hero-content">
          <p className="eyebrow">Site em construção</p>

          <h1 className="hero-title">
            Estamos construindo algo incrível para{" "}
            <span>transformar a beleza do Brasil.</span>
          </h1>

          <p className="hero-text">
            Em breve, uma plataforma completa para salões, barbearias e
            profissionais da beleza gerenciarem suas agendas, clientes e serviços
            com mais facilidade.
          </p>

          <div className="launch-card">
            <div className="launch-icon">🔔</div>
            <div className="launch-copy">
              <strong>Lançamento em breve!</strong>
              <span>Deixe seu contato e seja o primeiro a saber quando lançarmos.</span>
            </div>
            <a className="launch-button" href="https://www.instagram.com/gbdevapps/" target="_blank">
              Quero saber
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">📅</div>
              <h2>Agendamento online</h2>
              <p>Mais praticidade para você e seus clientes.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">👥</div>
              <h2>Gestão de clientes</h2>
              <p>Organize informações e fidelize mais.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">📈</div>
              <h2>Relatórios inteligentes</h2>
              <p>Acompanhe resultados e tome melhores decisões.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h2>Segurança total</h2>
              <p>Seus dados protegidos com tecnologia de ponta.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>© 2026 Beleza Carioca. Todos os direitos reservados.</span>
        <span className="footer-dot">♥</span>
        <span>
          Desenvolvido por <strong>Gabriel Gonçalves</strong>
        </span>
        <a href="https://www.instagram.com/gbdevapps/" target="_blank">
          @gbdevapps
        </a>
      </footer>
    </main>
  );
}
