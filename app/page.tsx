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
    }, 55);

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
          <span>© 2026 Beleza Carioca. Todos os direitos reservados.</span>
          <span className="footer-divider">|</span>
          <a href="https://www.instagram.com/gbdevapps/" target="_blank" rel="noreferrer">
            Desenvolvido por Gabriel Gonçalves · @gbdevapps
          </a>
        </footer>
      </main>
    </>
  );
}
