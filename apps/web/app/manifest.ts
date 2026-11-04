import type { MetadataRoute } from "next";
import siteConfig from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    dir: "rtl",
    lang: "fa",
    orientation: "portrait-primary",
    categories: ["business", "marketing", "productivity", "utilities"],
    icons: [
      {
        src: "/images/logo/logo-Crimson.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/images/logo/logo-Crimson.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/images/logo/logo-green.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  };
}
