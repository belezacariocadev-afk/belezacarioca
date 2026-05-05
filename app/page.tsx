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
          background: #eaf4ff;
        }

        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .page {
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          background:
            radial-gradient(circle at 20% 10%, rgba(255,255,255,.95), transparent 34%),
            linear-gradient(135deg, #ffffff 0%, #eaf4ff 52%, #b7dcff 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .stage {
          width: 100vw;
          height: 100svh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .stage img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          position: relative;
          z-index: 1;
        }

        .shine {
          position: absolute;
          inset: -25%;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 25%,
            rgba(255,255,255,.42) 45%,
            transparent 63%
          );
          animation: shineMove 7s ease-in-out infinite;
          mix-blend-mode: screen;
        }

        .wave {
          position: absolute;
          left: -6%;
          right: -6%;
          bottom: -2%;
          height: 16%;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(37,99,235,.08) 64%,
            rgba(37,99,235,.16) 100%
          );
          clip-path: polygon(0 42%, 12% 50%, 26% 43%, 39% 51%, 52% 44%, 66% 52%, 80% 43%, 92% 51%, 100% 44%, 100% 100%, 0 100%);
          animation: waveMove 6s ease-in-out infinite alternate;
        }

        .instagram-link {
          position: absolute;
          left: 50%;
          bottom: 2.5%;
          transform: translateX(-50%);
          width: min(480px, 78vw);
          height: 44px;
          z-index: 4;
          border-radius: 999px;
        }

        @keyframes shineMove {
          0%, 100% {
            transform: translateX(-35%);
            opacity: .12;
          }
          50% {
            transform: translateX(35%);
            opacity: .55;
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
          .page {
            overflow: auto;
            align-items: start;
          }

          .stage {
            min-height: 100svh;
            height: auto;
            align-items: start;
          }

          .stage img {
            width: 100%;
            height: auto;
            min-height: auto;
            object-fit: contain;
          }

          .instagram-link {
            bottom: 14px;
            height: 42px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shine,
          .wave {
            animation: none !important;
          }
        }
      `}</style>

      <section className="stage" aria-label="Beleza Carioca - site no ar em breve">
        <img src="/mockup-rio.png" alt="Beleza Carioca - site no ar em breve" />
        <div className="shine" />
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
