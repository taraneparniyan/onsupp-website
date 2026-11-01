import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import SmoothScroll from "@/components/layout/SmoothScroll";

const yekanBakh = localFont({
  src: [
    {
      path: "./fonts/YekanBakh-Hairline.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/YekanBakh-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/YekanBakh-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/YekanBakh-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/YekanBakh-Medium.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/YekanBakh-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/YekanBakh-Heavy.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/YekanBakh-Fat.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-yekan-bakh",
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
      className={`${yekanBakh.variable} ${yekanBakh.className}`}
    >
      <LanguageProvider>
        <body className="min-h-screen font-sans text-foreground bg-background antialiased w-full">
          <SmoothScroll />
          {children}
        </body>
      </LanguageProvider>
    </html>
  );
}
