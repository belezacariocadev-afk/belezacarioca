export default function Home() {
  return (
    <main className="bc-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #f8fbff;
        }

        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .bc-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: #071a3d;
          background:
            radial-gradient(circle at 12% 10%, rgba(37, 99, 235, 0.12), transparent 27%),
            radial-gradient(circle at 88% 16%, rgba(56, 189, 248, 0.30), transparent 34%),
            linear-gradient(135deg, #ffffff 0%, #f8fbff 42%, #eaf4ff 100%);
        }

        .rio-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(90deg, rgba(255,255,255,.98) 0%, rgba(255,255,255,.94) 33%, rgba(255,255,255,.48) 58%, rgba(255,255,255,.06) 100%),
            url("/rio-bg.png");
          background-position: center center;
          background-size: cover;
          opacity: .95;
          transform: scale(1.045);
          animation: cinematicZoom 24s ease-in-out infinite alternate;
          will-change: transform;
        }

        .rio-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(115deg, transparent 0%, rgba(255,255,255,.42) 38%, transparent 62%),
            radial-gradient(circle at 72% 22%, rgba(255,255,255,.45), transparent 28%);
          mix-blend-mode: screen;
          animation: lightSweep 8s ease-in-out infinite;
        }

        .rio-bg::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255,255,255,0) 54%, rgba(219,234,254,.48) 86%, rgba(219,234,254,.82) 100%);
        }

        .wave-layer {
          position: absolute;
          left: -5%;
          right: -5%;
          bottom: -8px;
          height: 30vh;
          z-index: 1;
          background:
            linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(219,234,254,.62) 45%, rgba(37,99,235,.20) 100%);
          clip-path: polygon(0 36%, 10% 46%, 22% 38%, 34% 48%, 47% 39%, 60% 50%, 75% 37%, 88% 47%, 100% 35%, 100% 100%, 0 100%);
          animation: waveMove 7s ease-in-out infinite alternate;
        }

        .wave-line,
        .wave-line.two,
        .wave-line.three {
          position: absolute;
          width: 760px;
          height: 210px;
          right: -120px;
          top: 88px;
          border-top: 1px solid rgba(37, 99, 235, .20);
          border-radius: 50%;
          transform: rotate(-9deg);
          z-index: 2;
          animation: lineFloat 10s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .wave-line.two {
          width: 890px;
          top: 120px;
          right: -160px;
          opacity: .58;
          animation-duration: 13s;
        }

        .wave-line.three {
          width: 940px;
          top: auto;
          bottom: 96px;
          right: -220px;
          opacity: .48;
          animation-duration: 16s;
          animation-direction: alternate-reverse;
        }

        .dot-grid {
          position: absolute;
          width: 160px;
          height: 160px;
          left: 42%;
          top: 20%;
          background-image: radial-gradient(rgba(37,99,235,.25) 2px, transparent 2px);
          background-size: 28px 28px;
          animation: dotFloat 6s ease-in-out infinite alternate;
          z-index: 2;
          pointer-events: none;
        }

        .shell {
          width: min(1240px, calc(100% - 48px));
          min-height: 100vh;
          margin: 0 auto;
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          padding: 34px 0 20px;
        }

        .logo {
          width: min(338px, 76vw);
          height: auto;
          display: block;
          filter: drop-shadow(0 18px 28px rgba(15, 23, 42, .08));
        }

        .hero {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 690px) 1fr;
          align-items: center;
          padding: 52px 0 42px;
        }

        .badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: 999px;
          padding: 13px 18px;
          margin-bottom: 28px;
          background: rgba(219, 234, 254, .88);
          border: 1px solid rgba(37, 99, 235, .12);
          color: #0755d8;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .01em;
          box-shadow: 0 16px 35px rgba(37,99,235,.10);
          position: relative;
          overflow: hidden;
        }

        .badge::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-130%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent);
          animation: shimmer 3.2s ease-in-out infinite;
        }

        h1 {
          margin: 0 0 24px;
          max-width: 680px;
          font-size: clamp(58px, 7.4vw, 110px);
          line-height: .89;
          letter-spacing: -.085em;
          color: #071a3d;
        }

        .title-blue {
          color: transparent;
          background: linear-gradient(135deg, #08245c 0%, #075eea 55%, #38bdf8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          filter: drop-shadow(0 12px 26px rgba(37,99,235,.14));
        }

        .subtitle {
          max-width: 660px;
          margin: 0;
          color: #476188;
          font-size: clamp(18px, 1.7vw, 23px);
          line-height: 1.55;
        }

        .subtitle strong {
          color: #075eea;
          font-weight: 950;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          max-width: 710px;
          margin-top: 42px;
        }

        .metric {
          min-height: 128px;
          display: flex;
          gap: 15px;
          align-items: center;
          border-radius: 24px;
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(148, 163, 184, .16);
          box-shadow: 0 24px 55px rgba(15, 23, 42, .08);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          padding: 19px;
          animation: cardFloat 5.5s ease-in-out infinite alternate;
        }

        .metric:nth-child(2) { animation-delay: .45s; }
        .metric:nth-child(3) { animation-delay: .9s; }

        .icon {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          background: #eff6ff;
          color: #075eea;
          font-size: 27px;
          box-shadow: inset 0 0 0 1px rgba(37,99,235,.08);
        }

        .metric strong {
          display: block;
          color: #071a3d;
          font-size: 27px;
          line-height: 1;
          letter-spacing: -.04em;
        }

        .metric span {
          display: block;
          margin-top: 7px;
          color: #60779d;
          font-size: 14px;
          line-height: 1.35;
        }

        .rio-message {
          justify-self: end;
          align-self: center;
          width: min(460px, 100%);
          margin-right: 3vw;
          margin-top: -128px;
          color: #08245c;
          font-family: "Segoe Script", "Brush Script MT", cursive;
          font-size: clamp(31px, 3.2vw, 48px);
          line-height: 1.35;
          transform: rotate(-2deg);
          text-shadow: 0 18px 35px rgba(255,255,255,.75);
          animation: messageFloat 6s ease-in-out infinite alternate;
        }

        .rio-message span {
          color: #075eea;
        }

        .rio-message::after {
          content: "";
          display: block;
          width: 75%;
          height: 2px;
          margin-top: 12px;
          background: linear-gradient(90deg, transparent, #0b63f6, transparent);
        }

        .feature-strip {
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0;
          border-radius: 24px;
          background: rgba(255,255,255,.90);
          border: 1px solid rgba(148, 163, 184, .20);
          box-shadow: 0 30px 70px rgba(15, 23, 42, .11);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          overflow: hidden;
        }

        .feature {
          min-height: 120px;
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 24px;
          border-right: 1px solid rgba(148, 163, 184, .18);
        }

        .feature:last-child {
          border-right: 0;
        }

        .feature-icon {
          width: 58px;
          height: 58px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          background: #eff6ff;
          color: #075eea;
          font-size: 26px;
          flex: 0 0 58px;
        }

        .feature strong {
          display: block;
          color: #071a3d;
          font-size: 15px;
          margin-bottom: 7px;
        }

        .feature p {
          margin: 0;
          color: #536b93;
          font-size: 14px;
          line-height: 1.42;
        }

        .credit {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          color: #5a7197;
          font-size: 15px;
          margin-top: 22px;
          position: relative;
          z-index: 5;
        }

        .credit a {
          color: #075eea;
          font-weight: 900;
          text-decoration: none;
        }

        .credit a:hover {
          text-decoration: underline;
        }

        .dev-icon {
          font-weight: 950;
          color: #075eea;
        }

        @keyframes cinematicZoom {
          0% { transform: scale(1.045) translate3d(0,0,0); }
          100% { transform: scale(1.09) translate3d(-1.1%, .8%, 0); }
        }

        @keyframes lightSweep {
          0%, 100% { opacity: .25; transform: translateX(-12%); }
          50% { opacity: .72; transform: translateX(12%); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-130%); }
          45%, 100% { transform: translateX(130%); }
        }

        @keyframes waveMove {
          0% { transform: translateX(-1.7%) translateY(0); }
          100% { transform: translateX(1.7%) translateY(10px); }
        }

        @keyframes lineFloat {
          0% { transform: translateY(0) rotate(-9deg); }
          100% { transform: translateY(24px) rotate(-7deg); }
        }

        @keyframes dotFloat {
          0% { transform: translateY(0); opacity: .62; }
          100% { transform: translateY(18px); opacity: .28; }
        }

        @keyframes cardFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }

        @keyframes messageFloat {
          0% { transform: translateY(0) rotate(-2deg); }
          100% { transform: translateY(-14px) rotate(-1deg); }
        }

        @media (max-width: 1050px) {
          .hero {
            grid-template-columns: 1fr;
            padding-top: 44px;
          }

          .rio-message {
            justify-self: start;
            margin: 42px 0 0;
          }

          .feature-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .feature:nth-child(2) {
            border-right: 0;
          }

          .feature:nth-child(1),
          .feature:nth-child(2) {
            border-bottom: 1px solid rgba(148, 163, 184, .18);
          }
        }

        @media (max-width: 720px) {
          .shell {
            width: min(100% - 28px, 1240px);
            padding-top: 20px;
          }

          .rio-bg {
            background-image:
              linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(255,255,255,.88) 44%, rgba(255,255,255,.40) 100%),
              url("/rio-bg.png");
            background-position: center bottom;
          }

          h1 {
            font-size: clamp(48px, 16vw, 72px);
          }

          .metrics {
            grid-template-columns: 1fr;
            margin-top: 32px;
          }

          .metric {
            min-height: 104px;
          }

          .feature-strip {
            grid-template-columns: 1fr;
          }

          .feature {
            border-right: 0;
            border-bottom: 1px solid rgba(148, 163, 184, .18);
          }

          .feature:last-child {
            border-bottom: 0;
          }

          .rio-message {
            font-size: 30px;
            margin-top: 34px;
          }

          .logo {
            width: min(310px, 88vw);
          }

          .dot-grid {
            display: none;
          }
        }
      `}</style>

      <div className="rio-bg" />
      <div className="wave-layer" />
      <div className="wave-line" />
      <div className="wave-line two" />
      <div className="wave-line three" />
      <div className="dot-grid" />

      <section className="shell">
        <header>
          <img className="logo" src="/logo.png" alt="Beleza Carioca" />
        </header>

        <section className="hero">
          <div>
            <div className="badge">🚧 Plataforma em construção</div>

            <h1>
              Site no ar <span className="title-blue">em breve.</span>
            </h1>

            <p className="subtitle">
              Estamos preparando uma nova experiência para salões, barbearias e
              profissionais da beleza gerenciarem <strong>agenda</strong>,{" "}
              <strong>clientes</strong> e <strong>serviços</strong> com mais
              praticidade.
            </p>

            <div className="metrics">
              <div className="metric">
                <div className="icon">📅</div>
                <div>
                  <strong>24/7</strong>
                  <span>agenda online sempre disponível</span>
                </div>
              </div>

              <div className="metric">
                <div className="icon">⚡</div>
                <div>
                  <strong>+ rápido</strong>
                  <span>menos tempo com tarefas manuais</span>
                </div>
              </div>

              <div className="metric">
                <div className="icon">📍</div>
                <div>
                  <strong>BR</strong>
                  <span>feito para negócios locais</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="rio-message">
            Feito no <span>Rio</span>,<br />
            pensado para<br />
            transformar a<br />
            <span>beleza</span> do Brasil.
          </aside>
        </section>

        <section className="feature-strip">
          <div className="feature">
            <div className="feature-icon">🛡️</div>
            <div>
              <strong>Segurança de dados</strong>
              <p>Seus dados e os dos seus clientes sempre protegidos.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">🎧</div>
            <div>
              <strong>Suporte especializado</strong>
              <p>Nossa equipe estará pronta para ajudar sempre que precisar.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">☁️</div>
            <div>
              <strong>Acesse de qualquer lugar</strong>
              <p>Use no computador, tablet ou celular. Sua agenda com você.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">⭐</div>
            <div>
              <strong>Feito para salões</strong>
              <p>Recursos pensados para o dia a dia do seu negócio.</p>
            </div>
          </div>
        </section>

        <footer className="credit">
          <span className="dev-icon">&lt;/&gt;</span>
          <span>Desenvolvido por</span>
          <a
            href="https://www.instagram.com/gbdevapps/"
            target="_blank"
            rel="noreferrer"
          >
            Gabriel Gonçalves
          </a>
          <span>|</span>
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
