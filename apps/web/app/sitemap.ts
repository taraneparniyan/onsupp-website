import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { SHOWCASE_PROJECTS } from "@/lib/case-studies";
import { CANONICAL_PREVIEW_ARTICLES } from "@/lib/articles";
import { BACKEND_URL } from "@/config/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ─── 1. Static Public Pages ────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/case-studies`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // ─── 2. Dynamic Portfolio / Case Studies ───────────────────────────────────
  let caseStudyItems: { slug: string; updatedAt?: string }[] =
    SHOWCASE_PROJECTS.map((project) => ({
      slug: project.slug,
    }));

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/casestudies`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const publishedFromApi = data
          .filter((item: any) => item?.slug && item?.published !== false)
          .map((item: any) => ({
            slug: String(item.slug),
            updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
          }));
        if (publishedFromApi.length > 0) {
          caseStudyItems = publishedFromApi;
        }
      }
    }
  } catch {
    // Graceful fallback to verified SHOWCASE_PROJECTS
  }

  const portfolioRoutes: MetadataRoute.Sitemap = caseStudyItems.map((item) => ({
    url: `${SITE_URL}/portfolio/${item.slug}`,
    lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // ─── 3. Dynamic Blog Articles ──────────────────────────────────────────────
  let articleItems: { slug: string; updatedAt?: string }[] =
    CANONICAL_PREVIEW_ARTICLES.map((article) => ({
      slug: article.slug,
      updatedAt: article.createdAt,
    }));

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/articles`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const publishedFromApi = data
          .filter((item: any) => item?.slug && item?.published !== false)
          .map((item: any) => ({
            slug: String(item.slug),
            updatedAt: item.updatedAt || item.createdAt,
          }));
        if (publishedFromApi.length > 0) {
          articleItems = publishedFromApi;
        }
      }
    }
  } catch {
    // Graceful fallback to verified CANONICAL_PREVIEW_ARTICLES
  }

  const articleRoutes: MetadataRoute.Sitemap = articleItems.map((item) => ({
    url: `${SITE_URL}/blog/${item.slug}`,
    lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Combine static and dynamic routes. Admin and API routes are strictly excluded.
  return [...staticRoutes, ...portfolioRoutes, ...articleRoutes];
}
