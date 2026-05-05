import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beleza Carioca | Em construção",
  description:
    "Plataforma de gestão e agendamento para salões, barbearias e profissionais da beleza.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
