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
          display: grid;
          place-items: center;
          position: relative;
        }

        .page::before {
          content: "";
          position: absolute;
          inset: -20%;
          background:
            linear-gradient(115deg, transparent 20%, rgba(255,255,255,.55) 44%, transparent 62%);
          animation: lightSweep 8s ease-in-out infinite;
          z-index: 2;
          pointer-events: none;
          mix-blend-mode: screen;
        }

        .art {
          width: 100vw;
          height: 100svh;
          position: relative;
          overflow: hidden;
          background: #eaf4ff;
        }

        .art img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          animation: cinematicZoom 18s ease-in-out infinite alternate;
          will-change: transform;
        }

        .wave {
          position: absolute;
          left: -6%;
          right: -6%;
          bottom: -4%;
          height: 20%;
          background: linear-gradient(180deg, transparent 0%, rgba(37,99,235,.12) 60%, rgba(37,99,235,.20) 100%);
          clip-path: polygon(0 42%, 12% 50%, 26% 43%, 39% 51%, 52% 44%, 66% 52%, 80% 43%, 92% 51%, 100% 44%, 100% 100%, 0 100%);
          animation: waveMove 6s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 3;
        }

        .instagram-link {
          position: absolute;
          left: 50%;
          bottom: 2.7%;
          width: min(480px, 80vw);
          height: 44px;
          transform: translateX(-50%);
          z-index: 5;
          border-radius: 999px;
        }

        @keyframes cinematicZoom {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.025);
          }
        }

        @keyframes lightSweep {
          0%, 100% {
            transform: translateX(-35%);
            opacity: .15;
          }
          50% {
            transform: translateX(35%);
            opacity: .65;
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

          .art {
            width: 100vw;
            height: auto;
            min-height: 100svh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            overflow: visible;
          }

          .art img {
            width: 100%;
            height: auto;
            min-height: 100svh;
            object-fit: cover;
            object-position: 34% center;
            animation: cinematicZoom 18s ease-in-out infinite alternate;
          }

          .instagram-link {
            bottom: 12px;
            height: 42px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .art img,
          .page::before,
          .wave {
            animation: none !important;
          }
        }
      `}</style>

      <section className="art" aria-label="Beleza Carioca - site no ar em breve">
        <img src="/mockup-rio.png" alt="Beleza Carioca - site no ar em breve" />
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
