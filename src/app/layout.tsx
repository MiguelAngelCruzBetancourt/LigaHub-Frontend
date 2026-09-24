import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { DataProvider } from "@/context/DataContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Gol Admin · Gestión deportiva",
  description: "Panel de administración de usuarios, roles y permisos para la plataforma de fútbol.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <ToastProvider>
            <DataProvider>{children}</DataProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
