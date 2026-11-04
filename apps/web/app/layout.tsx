import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import SmoothScroll from "@/components/layout/SmoothScroll";

const vazirmatn = localFont({
  src: [
    {
      path: "./fonts/Vazirmatn-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

const gendy = localFont({
  src: [
    {
      path: "./fonts/Gendy.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-gendy",
  display: "swap",
});

import siteConfig, { SITE_URL } from "@/config/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1f1f1e" },
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار — OnSupp",
    template: "%s | آن‌ساپ",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: SITE_URL,
    siteName: siteConfig.englishName,
    title: "آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار",
    description: siteConfig.description,
    images: [
      {
        url: "/images/logo/logo-Crimson.webp",
        width: 1200,
        height: 630,
        alt: "آن‌ساپ — OnSupp Digital Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار",
    description: siteConfig.description,
    images: ["/images/logo/logo-Crimson.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo/logo-Crimson.webp", type: "image/webp", sizes: "192x192" },
      { url: "/images/logo/logo-Crimson.webp", type: "image/webp", sizes: "512x512" },
    ],
    apple: [
      { url: "/images/logo/logo-Crimson.webp", type: "image/webp", sizes: "180x180" },
    ],
    shortcut: ["/favicon.ico"],
  },
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
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${vazirmatn.variable} ${gendy.variable} ${vazirmatn.className}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("onsupp-theme");var t=s;if(!t||(t!=="light"&&t!=="dark")){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);if(t==="dark"){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <LanguageProvider>
        <ThemeProvider>
          <body className="min-h-screen font-sans text-foreground bg-background antialiased w-full selection:bg-mint/20 selection:text-foreground">
            <SmoothScroll />
            {children}
          </body>
        </ThemeProvider>
      </LanguageProvider>
    </html>
  );
}
