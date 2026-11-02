
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import SmoothScroll from "@/components/layout/SmoothScroll";

const vazirmatn = localFont({
  src: "./fonts/Vazirmatn[wght].woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
});

const gendy = localFont({
  src: "./fonts/Gendy.woff",
  variable: "--font-gendy",
  weight: "400",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#091413",
};

export const metadata: Metadata = {
  title: "Onsupp | Digital Marketing Agency",
  description: "Professional digital marketing solutions for your business growth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${vazirmatn.variable} ${gendy.variable}`}
    >
      <LanguageProvider>
        <body className="min-h-screen text-foreground bg-background antialiased w-full">
          <SmoothScroll />
          {children}
        </body>
      </LanguageProvider>
    </html>
  );
}
