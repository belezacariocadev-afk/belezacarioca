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
            radial-gradient(circle at 15% 8%, rgba(37, 99, 235, 0.16), transparent 26%),
            radial-gradient(circle at 90% 18%, rgba(56, 189, 248, 0.30), transparent 31%),
            linear-gradient(135deg, #ffffff 0%, #f7fbff 40%, #e8f3ff 100%);
        }

        .rio-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,.98) 0%, rgba(255,255,255,.92) 32%, rgba(255,255,255,.42) 57%, rgba(255,255,255,.10) 100%),
            url("/rio-bg.png") center right / cover no-repeat;
          opacity: 0.92;
          transform: scale(1.04);
          animation: cinematicZoom 22s ease-in-out infinite alternate;
          will-change: transform;
        }

        .rio-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 75% 30%, rgba(255,255,255,.34), transparent 22%),
            linear-gradient(120deg, transparent 20%, rgba(255,255,255,.38) 38%, transparent 55%);
          mix-blend-mode: screen;
          animation: lightSweep 9s ease-in-out infinite;
        }

        .animated-water {
          position: absolute;
          left: -5%;
          right: -5%;
          bottom: -2px;
          height: 31vh;
          background:
            linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(219,234,254,.64) 42%, rgba(37,99,235,.22) 100%);
          clip-path: polygon(0 34%, 11% 45%, 24% 36%, 37% 48%, 50% 38%, 63% 50%, 77% 37%, 89% 47%, 100% 35%, 100% 100%, 0 100%);
          animation: waveMove 7s ease-in-out infinite alternate;
          z-index: 1;
        }

        .animated-water::before,
        .animated-water::after {
          content: "";
          position: absolute;
          inset: 18% -10% auto -10%;
          height: 120px;
          border-top: 1px solid rgba(37,99,235,.20);
          border-radius: 50%;
          animation: waveLine 6s ease-in-out infinite alternate;
        }

        .animated-water::after {
          inset: 26% -14% auto -14%;
          border-top-color: rgba(56,189,248,.28);
          animation-duration: 8s;
          animation-direction: alternate-reverse;
        }

        .sky-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          overflow: hidden;
        }

        .sky-line {
          position: absolute;
          width: 720px;
          height: 180px;
          border-top: 1px solid rgba(37,99,235,.20);
          border-radius: 50%;
          right: -120px;
          top: 120px;
          transform: rotate(-8deg);
          animation: lineFloat 8s ease-in-out infinite alternate;
        }

        .sky-line.two {
          top: 155px;
          right: -170px;
          width: 860px;
          opacity: .68;
          animation-duration: 11s;
        }

        .dot-grid {
          position: absolute;
          width: 150px;
          height: 150px;
          left: 41%;
          top: 20%;
          background-image: radial-gradient(rgba(37,99,235,.24) 2px, transparent 2px);
          background-size: 26px 26px;
          animation: dotFloat 5.5s ease-in-out infinite alternate;
          z-index: 2;
        }

        .container {
          width: min(1240px, calc(100% - 48px));
          min-height: 100vh;
          margin: 0 auto;
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          padding: 32px 0 22px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-logo {
          width: min(330px, 72vw);
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 18px 28px rgba(15, 23, 42, .08));
        }

        .hero {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 650px) 1fr;
          align-items: center;
          padding: 36px 0 68px;
        }

        .badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: 999px;
          padding: 13px 18px;
          margin-bottom: 26px;
          background: rgba(219, 234, 254, .85);
          border: 1px solid rgba(37, 99, 235, .12);
          color: #0755d8;
          font-weight: 850;
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
          font-size: clamp(58px, 7.5vw, 112px);
          line-height: .88;
          letter-spacing: -.085em;
          color: #071a3d;
          text-wrap: balance;
        }

        .blue {
          display: inline-block;
          color: #0b63f6;
          background: linear-gradient(135deg, #0a2b6b 0%, #075eea 55%, #38bdf8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 12px 26px rgba(37,99,235,.14));
        }

        .subtitle {
          max-width: 640px;
          margin: 0;
          color: #476188;
          font-size: clamp(18px, 1.65vw, 23px);
          line-height: 1.55;
        }

        .subtitle strong {
          color: #075eea;
          font-weight: 900;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          max-width: 710px;
          margin-top: 44px;
        }

        .metric {
          min-height: 136px;
          display: flex;
          gap: 15px;
          align-items: center;
          border-radius: 24px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(148, 163, 184, .18);
          box-shadow: 0 24px 55px rgba(15, 23, 42, .08);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          padding: 20px;
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
          width: min(420px, 100%);
          margin-right: 2vw;
          margin-top: -120px;
          color: #08245c;
          font-family: "Segoe Script", "Brush Script MT", cursive;
          font-size: clamp(28px, 3vw, 45px);
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
          width: 70%;
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
          background: rgba(255,255,255,.86);
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
          text-align: center;
          color: #5a7197;
          font-size: 15px;
          margin-top: 20px;
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

        @keyframes cinematicZoom {
          0% { transform: scale(1.04) translate3d(0,0,0); }
          100% { transform: scale(1.095) translate3d(-1.2%, .8%, 0); }
        }

        @keyframes lightSweep {
          0%, 100% { opacity: .25; transform: translateX(-12%); }
          50% { opacity: .75; transform: translateX(12%); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-130%); }
          45%, 100% { transform: translateX(130%); }
        }

        @keyframes waveMove {
          0% { transform: translateX(-1.8%) translateY(0); }
          100% { transform: translateX(1.8%) translateY(10px); }
        }

        @keyframes waveLine {
          0% { transform: translateX(-2%) scaleX(1); }
          100% { transform: translateX(2%) scaleX(1.08); }
        }

        @keyframes lineFloat {
          0% { transform: translateY(0) rotate(-8deg); }
          100% { transform: translateY(22px) rotate(-6deg); }
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
            padding-bottom: 42px;
          }

          .rio-message {
            justify-self: start;
            margin: 38px 0 0;
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
          .container {
            width: min(100% - 28px, 1240px);
            padding-top: 20px;
          }

          .rio-bg {
            background:
              linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.86) 38%, rgba(255,255,255,.34) 100%),
              url("/rio-bg.png") center bottom / cover no-repeat;
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

          .brand-logo {
            width: min(300px, 86vw);
          }
        }
      `}</style>

      <div className="rio-bg" />
      <div className="animated-water" />
      <div className="sky-lines">
        <div className="sky-line" />
        <div className="sky-line two" />
      </div>
      <div className="dot-grid" />

      <section className="container">
        <header className="brand">
          <img className="brand-logo" src="/logo.png" alt="Beleza Carioca" />
        </header>

        <section className="hero">
          <div>
            <div className="badge">🚧 Plataforma em construção</div>

            <h1>
              Site no ar <span className="blue">em breve.</span>
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
              <p>Nossa equipe estará pronta para ajudar quando precisar.</p>
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
          Desenvolvido por{" "}
          <a
            href="https://www.instagram.com/gbdevapps/"
            target="_blank"
            rel="noreferrer"
          >
            Gabriel Gonçalves
          </a>{" "}
          ·{" "}
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
