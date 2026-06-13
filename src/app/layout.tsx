import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VocaTwin · Descubre la carrera que eres",
  description:
    "Test vocacional gratuito: responde 25 preguntas en 5 rondas y descubre tus carreras ideales entre más de 40 opciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lato.variable}`}>
      <body>{children}</body>
    </html>
  );
}
