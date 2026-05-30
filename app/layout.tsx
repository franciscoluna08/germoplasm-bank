import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Banco de Germoplasma",
  description: "Catálogo público de accesiones de germoplasma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
