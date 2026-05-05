import { useState } from 'react';
import {
  Bell,
  CalendarCheck,
  Users,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Heart,
} from 'lucide-react';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-300">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const features = [
  {
    icon: CalendarCheck,
    title: 'Agendamento online',
    description: 'Mais praticidade para você e seus clientes.',
  },
  {
    icon: Users,
    title: 'Gestão de clientes',
    description: 'Organize informações e fidelize mais.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios inteligentes',
    description: 'Acompanhe resultados e tome melhores decisões.',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança total',
    description: 'Seus dados protegidos com tecnologia de ponta.',
  },
];

export default function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-[#030a1a] text-white relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/rio-bg.jpg"
          alt="Rio de Janeiro"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030a1aee] via-[#030a1acc] to-[#030a1a33]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030a1a] via-[#030a1a99] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030a1a55] via-transparent to-[#030a1a]" />
      </div>

      {/* Glowing network lines effect */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {/* Horizontal glow line at bottom */}
        <div className="absolute bottom-[200px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        {/* Glow dots */}
        <div className="absolute bottom-[198px] left-[15%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_15px_5px_rgba(59,130,246,0.5)] glow-dot" />
        <div className="absolute bottom-[198px] left-[40%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_15px_5px_rgba(59,130,246,0.5)] glow-dot" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[198px] left-[65%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_15px_5px_rgba(59,130,246,0.5)] glow-dot" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[198px] left-[85%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_15px_5px_rgba(59,130,246,0.5)] glow-dot" style={{ animationDelay: '0.5s' }} />
        {/* Diagonal lines */}
        <div className="absolute bottom-[200px] left-[15%] w-[200px] h-[1px] bg-gradient-to-r from-blue-500/40 to-transparent origin-left -rotate-[30deg]" />
        <div className="absolute bottom-[200px] left-[40%] w-[150px] h-[1px] bg-gradient-to-r from-blue-500/30 to-transparent origin-left -rotate-[45deg]" />
        <div className="absolute bottom-[200px] right-[15%] w-[250px] h-[1px] bg-gradient-to-l from-blue-500/30 to-transparent origin-right rotate-[20deg]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-6 md:px-12 lg:px-16 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in-up">
            {/* Logo */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl border-2 border-blue-500/60 bg-blue-950/40 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
              <span className="relative text-xl font-bold text-blue-400">B</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-bold tracking-wide">
                <span className="text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Beleza</span>
              </span>
              <span className="text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">Carioca</span>
              <span className="text-[10px] text-blue-400/70 tracking-wide">gestão premium para salões</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 animate-fade-in-up">
            <span className="hidden md:inline text-sm text-gray-300">Acompanhe nossas redes</span>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-blue-500/40 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-blue-500/40 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon />
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 pb-8 pt-4 md:pt-0">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="animate-fade-in-up-delay-1">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="text-blue-400 font-semibold text-sm tracking-[0.15em] uppercase">
                  Site em construção
                </span>
                <span className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
                <span className="w-8 h-[2px] bg-gradient-to-r from-blue-400 to-transparent" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
              Estamos construindo{' '}
              <br className="hidden sm:block" />
              algo incrível para{' '}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400">
                transformar a beleza
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400">
                do Brasil.
              </span>
            </h1>

            {/* Subtitle */}
            <div className="animate-fade-in-up-delay-2 flex items-stretch gap-4 mb-10">
              <div className="w-[3px] bg-gradient-to-b from-blue-500 to-blue-500/0 rounded-full flex-shrink-0" />
              <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-lg">
                Em breve, uma plataforma completa para salões,
                barbearias e profissionais da beleza gerenciarem
                suas agendas, clientes e serviços com mais facilidade.
              </p>
            </div>

            {/* Email Form */}
            <div className="animate-fade-in-up-delay-3">
              <div className="bg-[#0a1628]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 md:p-6 max-w-xl shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Lançamento em breve!</p>
                      <p className="text-xs text-gray-400">
                        Deixe seu contato e seja o primeiro a saber
                        <br className="hidden sm:block" />
                        quando lançarmos.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu melhor e-mail"
                      className="flex-1 px-4 py-2.5 bg-[#0d1f3c]/80 border border-blue-500/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300"
                      required
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] flex-shrink-0 cursor-pointer"
                    >
                      Quero saber
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
                {submitted && (
                  <p className="mt-3 text-sm text-green-400 animate-fade-in-up">
                    ✅ Obrigado! Você será notificado quando lançarmos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="px-6 md:px-12 lg:px-16 pb-6">
          <div className="animate-fade-in-up-delay-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-[#0a1628]/60 backdrop-blur-md border border-blue-500/15 rounded-xl p-5 hover:border-blue-500/40 hover:bg-[#0a1628]/80 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-500">
                    <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-500" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 lg:px-16 py-6 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5">
            © 2025 Beleza Carioca. Todos os direitos reservados.
            <Heart className="w-4 h-4 text-blue-500 fill-blue-500" />
          </p>
        </footer>
      </div>
    </div>
  );
}
