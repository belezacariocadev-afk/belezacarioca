export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="rio-bg" aria-hidden="true" />
      <section className="hero">
        <div className="hero-copy">
          <div className="brand">
            <div className="brand-mark">B</div>
            <div>
              <strong>Beleza</strong>
              <span>Carioca</span>
              <small>gestão premium para salões</small>
            </div>
          </div>

          <div className="badge">🚧 Plataforma em construção</div>

          <h1>
            Site no ar
            <span>em breve.</span>
          </h1>

          <p>
            Estamos preparando uma nova experiência para salões, barbearias e profissionais da beleza gerenciarem
            <strong> agenda, clientes e serviços</strong> com mais praticidade.
          </p>

          <div className="stats">
            <article>
              <b>📅</b>
              <strong>24/7</strong>
              <span>agenda online sempre disponível</span>
            </article>
            <article>
              <b>⚡</b>
              <strong>+ rápido</strong>
              <span>menos tempo com tarefas manuais</span>
            </article>
            <article>
              <b>📍</b>
              <strong>BR</strong>
              <span>feito para negócios locais</span>
            </article>
          </div>
        </div>

        <div className="hero-note">
          <p>Feito no <strong>Rio</strong>, pensado para transformar a beleza do Brasil.</p>
        </div>
      </section>

      <section className="feature-bar">
        <article>
          <b>🛡️</b>
          <div><strong>Segurança de dados</strong><span>Seus dados e clientes protegidos.</span></div>
        </article>
        <article>
          <b>🎧</b>
          <div><strong>Suporte especializado</strong><span>Equipe pronta para ajudar.</span></div>
        </article>
        <article>
          <b>☁️</b>
          <div><strong>Acesso de qualquer lugar</strong><span>Use no computador, tablet ou celular.</span></div>
        </article>
        <article>
          <b>⭐</b>
          <div><strong>Feito para salões</strong><span>Recursos pensados para o dia a dia.</span></div>
        </article>
      </section>

      <footer>
        <span>⌘ Desenvolvido por <strong>Gabriel Gonçalves</strong></span>
        <span>Instagram: <strong>@gbdevapps</strong></span>
      </footer>
    </main>
  );
}
