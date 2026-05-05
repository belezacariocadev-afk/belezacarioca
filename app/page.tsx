export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, rgba(134, 88, 255, 0.28), transparent 34%), radial-gradient(circle at 80% 10%, rgba(255, 191, 105, 0.28), transparent 32%), linear-gradient(135deg, #140f1f 0%, #21132f 45%, #100b17 100%)",
        color: "#fff",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 35px rgba(165, 112, 255, .35); }
          50% { box-shadow: 0 0 75px rgba(255, 191, 105, .45); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .glass {
          background: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .shine {
          position: relative;
          overflow: hidden;
        }
        .shine:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "999px",
          background: "rgba(132, 87, 255, 0.22)",
          filter: "blur(50px)",
          left: -160,
          top: -180,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "999px",
          background: "rgba(255, 191, 105, 0.18)",
          filter: "blur(55px)",
          right: -120,
          bottom: -120,
        }}
      />

      <section
        style={{
          width: "min(1180px, calc(100% - 32px))",
          margin: "0 auto",
          padding: "34px 0 48px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <header
          className="glass"
          style={{
            minHeight: 72,
            borderRadius: 24,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 18,
            marginBottom: 42,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, #8B5CF6, #F3B86B)",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                color: "#fff",
              }}
            >
              BC
            </div>
            <div>
              <strong style={{ display: "block", fontSize: 17 }}>
                Beleza Carioca
              </strong>
              <span style={{ color: "rgba(255,255,255,.68)", fontSize: 13 }}>
                SaaS de agenda e gestão para beleza
              </span>
            </div>
          </div>

          <a
            href="https://wa.me/5521964589848"
            style={{
              textDecoration: "none",
              color: "#21132f",
              background: "#fff",
              padding: "12px 16px",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            Falar no WhatsApp
          </a>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr .95fr",
            gap: 34,
            alignItems: "center",
          }}
        >
          <div>
            <div
              className="glass shine"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 999,
                padding: "10px 15px",
                marginBottom: 18,
                color: "#FFE7B8",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              🚧 Plataforma em construção
            </div>

            <h1
              style={{
                fontSize: "clamp(42px, 7vw, 86px)",
                lineHeight: 0.92,
                letterSpacing: "-0.07em",
                margin: "0 0 20px",
                maxWidth: 760,
              }}
            >
              Site no ar em breve.
            </h1>

            <p
              style={{
                fontSize: "clamp(18px, 2vw, 23px)",
                lineHeight: 1.55,
                color: "rgba(255,255,255,.78)",
                maxWidth: 690,
                margin: "0 0 30px",
              }}
            >
              Estamos preparando uma nova experiência para salões, barbearias,
              clínicas de estética e profissionais da beleza gerenciarem
              agenda, clientes e serviços em um só lugar.
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 34,
              }}
            >
              <a
                href="https://wa.me/5521964589848"
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  background: "linear-gradient(135deg, #8B5CF6, #B989FF)",
                  padding: "16px 22px",
                  borderRadius: 18,
                  fontWeight: 900,
                  boxShadow: "0 20px 50px rgba(139, 92, 246, .35)",
                }}
              >
                Entrar na lista de espera
              </a>

              <a
                href="mailto:gbdevappsbr@gmail.com"
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  padding: "16px 22px",
                  borderRadius: 18,
                  fontWeight: 800,
                  border: "1px solid rgba(255,255,255,.20)",
                  background: "rgba(255,255,255,.08)",
                }}
              >
                Contato por e-mail
              </a>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                maxWidth: 620,
              }}
            >
              {[
                ["24/7", "agenda online"],
                ["100%", "pensado para beleza"],
                ["BR", "feito para negócios locais"],
              ].map(([big, small]) => (
                <div
                  key={big}
                  className="glass"
                  style={{
                    borderRadius: 20,
                    padding: 18,
                  }}
                >
                  <strong style={{ fontSize: 26 }}>{big}</strong>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "rgba(255,255,255,.64)",
                      fontSize: 13,
                    }}
                  >
                    {small}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="glass"
            style={{
              borderRadius: 34,
              padding: 22,
              minHeight: 520,
              position: "relative",
              animation: "float 5s ease-in-out infinite, pulseGlow 4s ease-in-out infinite",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,.14)",
                right: -45,
                top: -45,
                animation: "spinSlow 18s linear infinite",
              }}
            />

            <div
              style={{
                borderRadius: 28,
                background: "#fbf8f3",
                color: "#20152e",
                padding: 18,
                minHeight: 475,
                boxShadow: "0 30px 80px rgba(0,0,0,.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 22,
                }}
              >
                <strong>Painel Beleza Carioca</strong>
                <span
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    background: "#efe7ff",
                    color: "#7c3aed",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  Em breve
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <Card title="Novo agendamento" text="Corte + escova" />
                <Card title="Status" text="Agenda inteligente" />
              </div>

              <div
                style={{
                  borderRadius: 24,
                  background: "linear-gradient(135deg, #7C3AED, #D6A65D)",
                  color: "#fff",
                  padding: 22,
                  marginBottom: 16,
                }}
              >
                <small style={{ opacity: 0.8, fontWeight: 800 }}>
                  LANÇAMENTO
                </small>
                <h2
                  style={{
                    fontSize: 34,
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    margin: "10px 0 8px",
                  }}
                >
                  Beleza ao alcance de um clique.
                </h2>
                <p style={{ margin: 0, opacity: 0.82 }}>
                  Agenda, clientes, serviços e gestão em uma única plataforma.
                </p>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {["Cadastro de clientes", "Serviços e horários", "Painel do estabelecimento"].map(
                  (item) => (
                    <div
                      key={item}
                      style={{
                        borderRadius: 18,
                        background: "#fff",
                        border: "1px solid #eee7f8",
                        padding: "14px 15px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 10px 30px rgba(30,20,50,.06)",
                      }}
                    >
                      <span style={{ fontWeight: 800 }}>{item}</span>
                      <span style={{ color: "#7c3aed", fontWeight: 900 }}>
                        ✓
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        borderRadius: 22,
        background: "#fff",
        border: "1px solid #eee7f8",
        padding: 16,
        minHeight: 110,
        boxShadow: "0 10px 30px rgba(30,20,50,.06)",
      }}
    >
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 12,
          color: "#8B5CF6",
          fontWeight: 900,
        }}
      >
        {title}
      </p>
      <strong style={{ fontSize: 18 }}>{text}</strong>
      <p style={{ color: "#8b8199", fontSize: 13, margin: "8px 0 0" }}>
        Visual moderno em preparação.
      </p>
    </div>
  );
}
