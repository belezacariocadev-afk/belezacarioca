"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => setLoaded(true), 650);
          return 100;
        }

        return Math.min(current + 1, 100);
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <div className={`loading-screen ${loaded ? "loading-screen-hidden" : ""}`}>
        <div className="loading-card">
          <img
            src="/logo-beleza-carioca-azul.png"
            alt="Beleza Carioca"
            className="loading-logo"
          />
          <p>Preparando sua nova experiência...</p>
          <strong>{progress}%</strong>
          <div className="loading-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <main className={`construction-page ${loaded ? "page-visible" : ""}`}>
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
          </div>

          <form
            className="question-card"
            action="https://formsubmit.co/belezacarioca.dev@gmail.com"
            method="POST"
          >
            <input type="hidden" name="_subject" value="Nova dúvida no site Beleza Carioca" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value="https://www.belezacariocarj.com.br/obrigado" />

            <div className="question-header">
              <span>💬</span>
              <div>
                <strong>Tem dúvidas ou sugestões?</strong>
                <p>Envie sua pergunta. A mensagem vai direto para o e-mail da Beleza Carioca.</p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Nome
                <input name="nome" type="text" placeholder="Seu nome" required />
              </label>
              <label>
                E-mail ou WhatsApp
                <input name="contato" type="text" placeholder="Como podemos responder?" required />
              </label>
            </div>

            <label>
              Sua dúvida
              <textarea
                name="duvida"
                placeholder="Digite sua dúvida, sugestão ou o que gostaria de ver na plataforma..."
                rows={4}
                required
              />
            </label>

            <button type="submit">Enviar dúvida</button>
          </form>

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
          <div className="footer-copy">
            <span>© 2026 Beleza Carioca. Todos os direitos reservados.</span>
            <span className="footer-divider">|</span>
            <a href="https://www.instagram.com/gbdevapps/" target="_blank" rel="noreferrer">
              Desenvolvido por Gabriel Gonçalves · @gbdevapps
            </a>
          </div>

          <nav className="social-links" aria-label="Redes sociais da Beleza Carioca">
            <a
              href="https://www.instagram.com/comercialbelezacarioca/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Comercial Beleza Carioca"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm4.2 3.2A4.8 4.8 0 1 1 12 16.8a4.8 4.8 0 0 1 0-9.6Zm0 2A2.8 2.8 0 1 0 12 14.8a2.8 2.8 0 0 0 0-5.6Zm5-2.15a1.15 1.15 0 1 1-1.15 1.15A1.15 1.15 0 0 1 17 7.05Z" />
              </svg>
              <span>Instagram</span>
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61588905107980"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Beleza Carioca"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 8.6V6.9c0-.82.19-1.23 1.12-1.23H17V2.22C16.68 2.18 15.58 2 14.3 2 11.64 2 9.82 3.62 9.82 6.6v2H7v3.86h2.82V22h4.24v-9.54h2.88l.44-3.86H14Z" />
              </svg>
              <span>Facebook</span>
            </a>
          </nav>
        </footer>
      </main>
    </>
  );
}
