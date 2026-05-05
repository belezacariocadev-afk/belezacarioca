export default function Home() {
  return (
    <main className="page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          background: #eaf4ff;
        }

        body {
          overflow: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .page {
          width: 100vw;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          position: relative;
          background: #eaf4ff;
        }

        /* Fundo preenchendo a tela sem distorcer: fica desfocado atrás */
        .bg-fill {
          position: absolute;
          inset: -26px;
          background: url("/mockup-rio.png") center center / cover no-repeat;
          filter: blur(24px) saturate(1.12);
          transform: scale(1.06);
          opacity: .52;
          animation: bgMove 18s ease-in-out infinite alternate;
          z-index: 0;
        }

        .bg-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 75% 22%, rgba(255,255,255,.56), transparent 25%),
            linear-gradient(180deg, rgba(255,255,255,.36), rgba(219,234,254,.42));
        }

        /* Arte principal sem esticar */
        .stage {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 0;
        }

        .stage img {
          width: 100vw;
          height: 100vh;
          height: 100svh;
          object-fit: contain;
          object-position: center;
          display: block;
          filter: drop-shadow(0 30px 80px rgba(15, 23, 42, .12));
          animation: artFloat 16s ease-in-out infinite alternate;
          will-change: transform;
          z-index: 2;
        }

        /* Movimento profissional no fundo */
        .shine {
          position: absolute;
          inset: -30%;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 28%,
            rgba(255,255,255,.16) 39%,
            rgba(255,255,255,.62) 47%,
            rgba(255,255,255,.14) 55%,
            transparent 68%
          );
          mix-blend-mode: screen;
          animation: shineMove 7.5s ease-in-out infinite;
        }

        /* Glow sutil na estátua */
        .statue-glow {
          position: absolute;
          z-index: 4;
          right: 4.5%;
          top: 8.5%;
          width: 25vw;
          height: 43vh;
          pointer-events: none;
          background:
            radial-gradient(circle at 62% 14%, rgba(255,255,255,.82), transparent 13%),
            radial-gradient(circle at 62% 28%, rgba(56,189,248,.34), transparent 36%),
            radial-gradient(circle at 62% 46%, rgba(37,99,235,.15), transparent 56%);
          mix-blend-mode: screen;
          animation: statuePulse 4.2s ease-in-out infinite;
        }

        .tech-line {
          position: absolute;
          z-index: 4;
          pointer-events: none;
          border-top: 1px solid rgba(255,255,255,.75);
          border-radius: 50%;
          transform: rotate(-8deg);
          animation: lineFloat 7s ease-in-out infinite alternate;
        }

        .tech-line.one {
          width: 52vw;
          height: 22vh;
          right: -8vw;
          top: 8vh;
        }

        .tech-line.two {
          width: 62vw;
          height: 25vh;
          right: -13vw;
          top: 13vh;
          opacity: .52;
          animation-duration: 10s;
        }

        .tech-line.three {
          width: 68vw;
          height: 24vh;
          right: -20vw;
          bottom: 9vh;
          opacity: .46;
          animation-duration: 12s;
          animation-direction: alternate-reverse;
        }

        .wave {
          position: absolute;
          left: -6%;
          right: -6%;
          bottom: -3%;
          height: 17%;
          z-index: 5;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(37,99,235,.07) 58%,
            rgba(37,99,235,.16) 100%
          );
          clip-path: polygon(0 42%, 12% 50%, 26% 43%, 39% 51%, 52% 44%, 66% 52%, 80% 43%, 92% 51%, 100% 44%, 100% 100%, 0 100%);
          animation: waveMove 6s ease-in-out infinite alternate;
        }

        .instagram-link {
          position: absolute;
          left: 50%;
          bottom: 2.3%;
          transform: translateX(-50%);
          width: min(460px, 80vw);
          height: 44px;
          z-index: 20;
          border-radius: 999px;
        }

        @keyframes bgMove {
          0% {
            transform: scale(1.06) translate3d(0,0,0);
          }
          100% {
            transform: scale(1.1) translate3d(-.6%, .4%, 0);
          }
        }

        @keyframes artFloat {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.006) translate3d(0, -3px, 0);
          }
        }

        @keyframes shineMove {
          0%, 100% {
            transform: translateX(-35%);
            opacity: .18;
          }
          50% {
            transform: translateX(35%);
            opacity: .70;
          }
        }

        @keyframes statuePulse {
          0%, 100% {
            opacity: .34;
            transform: scale(.98);
          }
          50% {
            opacity: .82;
            transform: scale(1.04);
          }
        }

        @keyframes lineFloat {
          from {
            transform: translateY(0) rotate(-8deg);
          }
          to {
            transform: translateY(18px) rotate(-6deg);
          }
        }

        @keyframes waveMove {
          from {
            transform: translateX(-1.5%) translateY(0);
          }
          to {
            transform: translateX(1.5%) translateY(8px);
          }
        }

        @media (max-width: 768px) {
          body {
            overflow: auto;
          }

          .page {
            min-height: 100svh;
          }

          .stage {
            align-items: flex-start;
          }

          .stage img {
            width: 100vw;
            height: auto;
            min-height: 100svh;
            object-fit: contain;
            object-position: top center;
          }

          .bg-fill {
            background-position: center top;
          }

          .statue-glow {
            right: -6%;
            top: 7%;
            width: 42vw;
            height: 34vh;
          }

          .instagram-link {
            bottom: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-fill,
          .stage img,
          .shine,
          .statue-glow,
          .tech-line,
          .wave {
            animation: none !important;
          }
        }
      `}</style>

      <div className="bg-fill" />

      <section className="stage" aria-label="Beleza Carioca - site no ar em breve">
        <img src="/mockup-rio.png" alt="Beleza Carioca - site no ar em breve" />
      </section>

      <div className="shine" />
      <div className="statue-glow" />
      <div className="tech-line one" />
      <div className="tech-line two" />
      <div className="tech-line three" />
      <div className="wave" />

      <a
        className="instagram-link"
        href="https://www.instagram.com/gbdevapps/"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram de Gabriel Gonçalves"
      />
    </main>
  );
}
