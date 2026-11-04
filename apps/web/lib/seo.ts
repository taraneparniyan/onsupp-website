import type { Metadata } from "next";
import { BACKEND_URL } from "@/config/api";

export async function getPageSeo(routePath: string, fallback: Metadata = {}): Promise<Metadata> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/page-seo/by-path?path=${encodeURIComponent(routePath)}`, {
      next: { tags: [`seo-${routePath.replace(/[^a-zA-Z0-9]/g, "-")}`] },
      cache: "no-store",
    });

    if (!res.ok) return fallback;
    const data = await res.json();
    if (!data) return fallback;

    const title = data.titleFa || fallback.title;
    const description = data.descriptionFa || fallback.description;
    const keywords = data.keywordsFa
      ? data.keywordsFa.split(",").map((k: string) => k.trim())
      : fallback.keywords;

    const canonical = data.canonicalUrl || (fallback.alternates?.canonical as string);
    const noIndex = Boolean(data.noIndex);

    return {
      ...fallback,
      ...(title && { title }),
      ...(description && { description }),
      ...(keywords && { keywords }),
      alternates: {
        ...(fallback.alternates || {}),
        ...(canonical && { canonical }),
      },
      robots: noIndex
        ? { index: false, follow: false }
        : fallback.robots || { index: true, follow: true },
      openGraph: {
        ...(fallback.openGraph || {}),
        ...(title && { title: String(title) }),
        ...(description && { description: String(description) }),
        ...(data.ogImageUrl && { images: [{ url: data.ogImageUrl }] }),
      },
    };
  } catch {
    return fallback;
  }
}
