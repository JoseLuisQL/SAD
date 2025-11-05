import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { WebVitalsTracker } from "@/components/analytics/WebVitalsTracker";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { DynamicFavicon } from "@/components/shared/DynamicFavicon";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema Integrado de Archivos Digitales - DISA CHINCHEROS",
  description: "Sistema de gestión documental para DISA CHINCHEROS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Static favicon links - will be replaced by DynamicFavicon component */}
        <link rel="icon" type="image/png" sizes="32x32" href="/api/favicon" />
        <link rel="icon" type="image/png" sizes="16x16" href="/api/favicon" />
        <link rel="shortcut icon" href="/api/favicon" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <DynamicFavicon />
          <WebVitalsTracker />
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
