import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beleza Carioca | Site em construção",
  description:
    "Plataforma premium para salões, barbearias e profissionais da beleza gerenciarem agenda, clientes e serviços.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
