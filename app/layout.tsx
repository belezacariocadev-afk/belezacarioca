import './globals.css';

export const metadata = {
  title: 'Beleza Carioca | Em construção',
  description: 'SaaS de agendamentos para salões, barbearias e profissionais da beleza.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
