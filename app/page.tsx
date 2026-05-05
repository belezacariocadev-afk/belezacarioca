export default function Home() {
  return (
    <main className="construction-page">
      <section className="hero-shell">
        <div className="hero-content">
          <header className="brand-row" aria-label="Beleza Carioca">
            <img
              src="/logo-beleza-carioca.png"
              alt="Beleza Carioca"
              className="brand-logo"
            />
            <div>
              <p className="brand-name">Beleza Carioca</p>
              <p className="brand-subtitle">SaaS de agendamentos para salões</p>
            </div>
          </header>

          <div className="status-pill">Em construção</div>

          <h1 className="hero-title">
            Estamos construindo algo incrível para transformar a beleza do Brasil.
          </h1>

          <p className="hero-description">
            Em breve, uma plataforma completa para salões, barbearias e profissionais da beleza gerenciarem agenda, clientes e serviços com praticidade.
          </p>

          <div className="features-grid" aria-label="Recursos da plataforma">
            <article className="feature-card">
              <span>Agenda online</span>
              <small>Horários organizados em tempo real.</small>
            </article>
            <article className="feature-card">
              <span>Gestão de clientes</span>
              <small>Histórico, contatos e preferências.</small>
            </article>
            <article className="feature-card">
              <span>Serviços e equipe</span>
              <small>Controle para profissionais da beleza.</small>
            </article>
          </div>
        </div>

        <div className="hero-image-panel" aria-hidden="true">
          <div className="floating-card card-top">
            <strong>+ agendamentos</strong>
            <span>menos trabalho manual</span>
          </div>
          <div className="floating-card card-bottom">
            <strong>Rio de Janeiro</strong>
            <span>beleza, tecnologia e gestão</span>
          </div>
        </div>
      </section>

      <footer className="page-footer">
        <span>© 2026 Beleza Carioca.</span>
        <a href="https://www.instagram.com/gbdevapps/" target="_blank" rel="noreferrer">
          Desenvolvido por Gabriel Gonçalves
        </a>
      </footer>
    </main>
  );
}
