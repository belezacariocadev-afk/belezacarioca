'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';

const footerColumns = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Buscar servicos', href: '/#buscar' },
      { label: 'Categorias', href: '/#categorias' },
      { label: 'Aplicativo', href: '/#app' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Para negocios',
    links: [
      { label: 'Cadastrar estabelecimento', href: '/cadastro-estabelecimento' },
      { label: 'Agenda online', href: '/#estabelecimentos' },
      { label: 'Gestao de clientes', href: '/#estabelecimentos' },
      { label: 'Entrar no painel', href: '/entrar' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Politica de privacidade', href: '/politica-de-privacidade' },
      { label: 'Termos de uso', href: '/termos' },
      { label: 'Contato', href: 'mailto:contato@belezacarioca.com' },
    ],
  },
];

const socialItems = ['Instagram', 'YouTube', 'LinkedIn'];
const hiddenChromePrefixes = [
  '/entrar',
  '/login-cliente',
  '/login-estabelecimento',
  '/assinatura',
  '/parceiro',
  '/admin',
  '/cliente',
  '/profissional',
  '/acesso-negado',
];

export function Footer() {
  const pathname = usePathname();

  if (hiddenChromePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  return (
    <footer className="relative z-10 pb-12 pt-2">
      <div className="bc-container">
        <div className="overflow-hidden rounded-[2.1rem] border border-[rgba(120,84,162,0.12)] bg-[linear-gradient(145deg,rgba(255,253,250,0.98),rgba(246,238,229,0.96))] shadow-[0_22px_62px_rgba(92,68,130,0.105)]">
          <div className="grid gap-10 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_1.35fr] lg:px-12 lg:py-12">
            <div>
              <Image
                src="/assets/logo-horizontal.png"
                alt="Beleza Carioca"
                width={230}
                height={62}
                className="h-auto w-[214px]"
              />

              <p className="mt-5 max-w-xl text-[0.96rem] leading-8 text-[color:var(--bc-muted)]">
                Marketplace de beleza para clientes descobrirem servicos e para estabelecimentos
                organizarem agenda, clientes e crescimento com uma experiencia clara e premium.
              </p>

              <div className="mt-7 grid gap-3 text-sm font-semibold text-[color:var(--bc-text)] sm:grid-cols-3 lg:grid-cols-1">
                <span className="inline-flex items-center gap-3 rounded-[1.15rem] border border-[rgba(120,84,162,0.08)] bg-white/78 px-4 py-3 shadow-[0_8px_20px_rgba(104,78,140,0.06)]">
                  <Mail size={17} className="text-[color:var(--bc-purple)]" />
                  contato@belezacarioca.com
                </span>
                <span className="inline-flex items-center gap-3 rounded-[1.15rem] border border-[rgba(120,84,162,0.08)] bg-white/78 px-4 py-3 shadow-[0_8px_20px_rgba(104,78,140,0.06)]">
                  <MapPin size={17} className="text-[color:var(--bc-purple)]" />
                  Rio de Janeiro, RJ
                </span>
                <span className="inline-flex items-center gap-3 rounded-[1.15rem] border border-[rgba(120,84,162,0.08)] bg-white/78 px-4 py-3 shadow-[0_8px_20px_rgba(104,78,140,0.06)]">
                  <Phone size={17} className="text-[color:var(--bc-purple)]" />
                  Atendimento comercial
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title} className="rounded-[1.55rem] border border-[rgba(120,84,162,0.08)] bg-white/45 p-5">
                  <p className="bc-kicker">{column.title}</p>
                  <div className="grid gap-3.5">
                    {column.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-sm font-semibold text-[color:var(--bc-muted)] transition hover:translate-x-0.5 hover:text-[color:var(--bc-purple-strong)]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[rgba(120,84,162,0.1)] bg-white/50 px-6 py-6 md:px-10 lg:px-12">
            <div className="flex flex-col gap-5 text-xs font-semibold text-[color:var(--bc-muted)] md:flex-row md:items-center md:justify-between">
              <span>&copy; 2026 Beleza Carioca. Todos os direitos reservados.</span>
              <div className="flex flex-wrap gap-2">
                {socialItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[rgba(120,84,162,0.12)] bg-white px-4 py-2 tracking-[0.08em] text-[color:var(--bc-text)] transition hover:border-[rgba(216,178,123,0.38)] hover:text-[color:var(--bc-purple-strong)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
