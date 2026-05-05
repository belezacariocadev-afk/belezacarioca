export default function Home() {
  return (
    <main className="bc-page">
      <section className="bc-hero">
        <div className="bc-bg" aria-hidden="true">
          <div className="bc-sun" />
          <div className="bc-mountain bc-mountain-one" />
          <div className="bc-mountain bc-mountain-two" />
          <div className="bc-circle bc-circle-one" />
          <div className="bc-circle bc-circle-two" />
        </div>

        <div className="bc-container">
          <div className="bc-content">
            <div className="bc-logo-row">
              <div className="bc-logo-mark">B</div>
              <div>
                <p className="bc-logo-title">Beleza</p>
                <p className="bc-logo-subtitle">CARIOCA</p>
                <p className="bc-logo-caption">gestão premium para salões</p>
              </div>
            </div>

            <div className="bc-badge">🚧 Plataforma em construção</div>

            <h1>
              Site no ar
              <span>em breve.</span>
            </h1>

            <p className="bc-description">
              Estamos preparando uma nova experiência para salões, barbearias e profissionais da beleza gerenciarem
              <strong> agenda, clientes e serviços </strong>
              com mais praticidade.
            </p>

            <div className="bc-stats">
              <div className="bc-stat-card">
                <span>📅</span>
                <strong>24/7</strong>
                <small>agenda online sempre disponível</small>
              </div>
              <div className="bc-stat-card">
                <span>⚡</span>
                <strong>+ rápido</strong>
                <small>menos tempo com tarefas manuais</small>
              </div>
              <div className="bc-stat-card">
                <span>📍</span>
                <strong>BR</strong>
                <small>feito para negócios locais</small>
              </div>
            </div>
          </div>

          <div className="bc-rio-copy">
            <p>
              Feito no <strong>Rio</strong>,<br />
              pensado para<br />
              transformar a<br />
              beleza do Brasil.
            </p>
          </div>
        </div>

        <div className="bc-benefits-wrap">
          <div className="bc-benefits">
            <div className="bc-benefit">
              <span>🛡️</span>
              <div>
                <strong>Segurança de dados</strong>
                <p>Seus dados e clientes protegidos.</p>
              </div>
            </div>
            <div className="bc-benefit">
              <span>🎧</span>
              <div>
                <strong>Suporte especializado</strong>
                <p>Equipe pronta para ajudar.</p>
              </div>
            </div>
            <div className="bc-benefit">
              <span>☁️</span>
              <div>
                <strong>Acesso de qualquer lugar</strong>
                <p>Use no computador, tablet ou celular.</p>
              </div>
            </div>
            <div className="bc-benefit">
              <span>⭐</span>
              <div>
                <strong>Feito para salões</strong>
                <p>Recursos pensados para o dia a dia.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="bc-footer">
          <span>⌘ Desenvolvido por</span>
          <strong>Gabriel Gonçalves</strong>
          <span>|</span>
          <span>Instagram</span>
          <strong>@gbdevapps</strong>
        </footer>
      </section>
    </main>
  );
}
