import type { Metadata } from "next";
import { CANONICAL_PREVIEW_ARTICLES } from "@/lib/articles";
import { SITE_URL } from "@/config/site";
import { BACKEND_URL } from "@/config/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let article = CANONICAL_PREVIEW_ARTICLES.find((a) => a.slug === slug);

  // If not found in preview, try fetching from backend
  if (!article) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/articles/by-slug/${slug}`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        article = await res.json();
      }
    } catch {
      // ignore
    }
  }

  if (!article) {
    return {
      title: "مقاله یافت نشد",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = article.metaTitleFa || `${article.titleFa} | وبلاگ آن‌ساپ`;
  const description = article.metaDescFa || article.excerptFa || "";
  const canonicalUrl = article.canonicalUrl || `${SITE_URL}/blog/${article.slug}`;
  const rawImage = article.ogImage || article.imageUrl;
  const imageUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${SITE_URL}${rawImage}`
    : undefined;

  return {
    title: article.metaTitleFa || article.titleFa,
    description,
    keywords: article.keywordsFa ? article.keywordsFa.split(",").map((k) => k.trim()) : undefined,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "fa_IR",
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default function BlogDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
