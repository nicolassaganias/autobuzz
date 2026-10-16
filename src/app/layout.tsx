import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ΛUTOBUZZ",
    template: "%s · ΛUTOBUZZ",
  },
  description:
    "Colectivo de creación sonovisual. Instalaciones, intervenciones y AutobuzzIA.",
  openGraph: {
    title: "ΛUTOBUZZ",
    description:
      "Exploraciones sonoras y tecnológicas. Portfolio y AutobuzzIA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable}`}>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
