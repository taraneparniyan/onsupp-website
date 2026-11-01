import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
  themeColor: "#F8F9FA",
};

export const metadata: Metadata = {
  title: "Onsupp | Digital Marketing Agency",
  description: "Professional digital marketing solutions for your business growth",
};

// Anti-FOUC (Flash of Unstyled Theme) inline script
const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('onsupp-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {}
  })();
`;

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
      suppressHydrationWarning
      className={`${yekanBakh.variable} ${yekanBakh.className}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <ThemeProvider>
        <LanguageProvider>
          <body className="min-h-screen font-sans text-foreground bg-background antialiased w-full transition-colors duration-200">
            <SmoothScroll />
            {children}
          </body>
        </LanguageProvider>
      </ThemeProvider>
    </html>
  );
}
