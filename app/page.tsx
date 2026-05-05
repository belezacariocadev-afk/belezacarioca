export default function Page() {
  return (
    <main className="construction-page">
      <div className="background" aria-hidden="true" />
      <div className="white-overlay" aria-hidden="true" />
      <div className="blue-glow blue-glow-one" aria-hidden="true" />
      <div className="blue-glow blue-glow-two" aria-hidden="true" />

      <section className="hero-content">
        <header className="brand-area">
          <img
            src="/logo-beleza-carioca-azul.png"
            alt="Beleza Carioca"
            className="brand-logo"
          />
        </header>

        <p className="eyebrow">Site em construção</p>

        <h1 className="hero-title">
          Estamos construindo algo incrível para{" "}
          <span>transformar a beleza do Brasil.</span>
        </h1>

        <p className="hero-description">
          Em breve, uma plataforma completa para salões, barbearias e profissionais da beleza gerenciarem agendas, clientes e serviços com mais praticidade.
        </p>

        <div className="notify-card">
          <div className="notify-icon">✦</div>
          <div className="notify-text">
            <strong>Lançamento em breve!</strong>
            <span>Estamos preparando uma experiência simples, bonita e profissional.</span>
          </div>
          <a className="notify-button" href="https://www.instagram.com/gbdevapps/" target="_blank" rel="noreferrer">
            Acompanhar
          </a>
        </div>

        <div className="features-grid" aria-label="Recursos da plataforma">
          <article>
            <span>📅</span>
            <strong>Agendamento online</strong>
            <p>Horários organizados para você e seus clientes.</p>
          </article>
          <article>
            <span>👥</span>
            <strong>Gestão de clientes</strong>
            <p>Informações centralizadas para fidelizar mais.</p>
          </article>
          <article>
            <span>📈</span>
            <strong>Mais controle</strong>
            <p>Relatórios e rotina do salão em um só lugar.</p>
          </article>
          <article>
            <span>🔒</span>
            <strong>Segurança</strong>
            <p>Dados protegidos com tecnologia moderna.</p>
          </article>
        </div>
      </section>

      <footer className="footer-credit">
        <span>© 2026 Beleza Carioca. Todos os direitos reservados.</span>
        <span className="footer-divider">|</span>
        <a href="https://www.instagram.com/gbdevapps/" target="_blank" rel="noreferrer">
          Desenvolvido por Gabriel Gonçalves · @gbdevapps
        </a>
      </footer>
    </main>
  );
}
