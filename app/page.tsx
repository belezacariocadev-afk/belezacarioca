export default function Home() {
  return (
    <main className="page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          background: #eaf4ff;
        }

        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow: hidden;
        }

        .page {
          width: 100vw;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          position: relative;
          background: #eaf4ff;
        }

        .art {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #eaf4ff;
        }

        .art img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          object-position: center;
          display: block;
          animation: bgBreath 16s ease-in-out infinite alternate;
          transform-origin: 72% 38%;
          will-change: transform, filter;
        }

        /* brilho de cinema passando no fundo */
        .light-sweep {
          position: absolute;
          inset: -25%;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 26%,
            rgba(255,255,255,.08) 36%,
            rgba(255,255,255,.55) 45%,
            rgba(255,255,255,.10) 54%,
            transparent 66%
          );
          mix-blend-mode: screen;
          animation: lightSweep 7s ease-in-out infinite;
        }

        /* aura azul na área do Cristo */
        .statue-glow {
          position: absolute;
          right: 3.8%;
          top: 9.5%;
          width: 26vw;
          height: 46vh;
          z-index: 3;
          pointer-events: none;
          background:
            radial-gradient(circle at 58% 18%, rgba(255,255,255,.72), transparent 15%),
            radial-gradient(circle at 58% 28%, rgba(56,189,248,.36), transparent 36%),
            radial-gradient(circle at 58% 42%, rgba(37,99,235,.18), transparent 54%);
          filter: blur(2px);
          mix-blend-mode: screen;
          animation: statuePulse 3.8s ease-in-out infinite;
        }

        /* linhas finas animadas estilo tech/RJ */
        .line {
          position: absolute;
          right: -8vw;
          top: 7vh;
          width: 52vw;
          height: 24vh;
          border-top: 1px solid rgba(255,255,255,.70);
          border-radius: 50%;
          z-index: 4;
          pointer-events: none;
          transform: rotate(-8deg);
          animation: lineFloat 6.5s ease-in-out infinite alternate;
          opacity: .72;
        }

        .line.two {
          top: 12vh;
          width: 60vw;
          right: -12vw;
          opacity: .48;
          animation-duration: 9s;
        }

        .line.three {
          top: auto;
          bottom: 11vh;
          width: 66vw;
          right: -18vw;
          opacity: .48;
          animation-duration: 11s;
          animation-direction: alternate-reverse;
        }

        /* onda leve no rodapé */
        .wave {
          position: absolute;
          left: -6%;
          right: -6%;
          bottom: -3%;
          height: 18%;
          z-index: 5;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(37,99,235,.08) 55%,
            rgba(37,99,235,.18) 100%
          );
          clip-path: polygon(0 42%, 12% 50%, 26% 43%, 39% 51%, 52% 44%, 66% 52%, 80% 43%, 92% 51%, 100% 44%, 100% 100%, 0 100%);
          animation: waveMove 5.5s ease-in-out infinite alternate;
        }

        /* link invisível em cima do crédito/instagram */
        .instagram-link {
          position: absolute;
          left: 50%;
          bottom: 1.7%;
          transform: translateX(-50%);
          width: min(470px, 80vw);
          height: 46px;
          z-index: 20;
          border-radius: 999px;
        }

        @keyframes bgBreath {
          0% {
            transform: scale(1);
            filter: saturate(1) contrast(1);
          }
          100% {
            transform: scale(1.018) translate3d(-.25%, .2%, 0);
            filter: saturate(1.06) contrast(1.02);
          }
        }

        @keyframes lightSweep {
          0%, 100% {
            transform: translateX(-38%);
            opacity: .18;
          }
          50% {
            transform: translateX(38%);
            opacity: .72;
          }
        }

        @keyframes statuePulse {
          0%, 100% {
            opacity: .36;
            transform: scale(.98);
          }
          50% {
            opacity: .84;
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
            transform: translateX(-1.6%) translateY(0);
          }
          to {
            transform: translateX(1.6%) translateY(7px);
          }
        }

        @media (max-width: 768px) {
          body {
            overflow: auto;
          }

          .page {
            min-height: 100svh;
          }

          .art img {
            object-fit: cover;
            object-position: 34% center;
          }

          .statue-glow {
            right: -4%;
            top: 8%;
            width: 42vw;
            height: 34vh;
          }

          .instagram-link {
            bottom: 12px;
            height: 44px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .art img,
          .light-sweep,
          .statue-glow,
          .line,
          .wave {
            animation: none !important;
          }
        }
      `}</style>

      <section className="art" aria-label="Beleza Carioca - site no ar em breve">
        <img src="/mockup-rio.png" alt="Beleza Carioca - site no ar em breve" />
        <div className="light-sweep" />
        <div className="statue-glow" />
        <div className="line" />
        <div className="line two" />
        <div className="line three" />
        <div className="wave" />
        <a
          className="instagram-link"
          href="https://www.instagram.com/gbdevapps/"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram de Gabriel Gonçalves"
        />
      </section>
    </main>
  );
}
