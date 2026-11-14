export type SeoLang = "fa" | "en";
export type SeoEntityType = "article" | "service";
export type SeoCheckStatus = "pass" | "warn" | "fail";
export type SeoCheckCategory = "basic" | "additional" | "title" | "readability";

export interface SeoRobotsConfig {
  index: boolean;
  follow: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  maxSnippet?: number;
}

export interface LocaleSeoConfig {
  focusKeyword?: string;
  secondaryKeywords?: string[];
  metaTitle?: string;
  metaDesc?: string;
  canonicalUrl?: string;
  isPillar?: boolean;
  robots?: {
    index: boolean;
    follow: boolean;
  };
}

export interface SeoConfig {
  robots: SeoRobotsConfig;
  social: {
    inheritGeneral: boolean;
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterCard?: "summary_large_image" | "summary";
  };
  schema: {
    enabled: boolean;
    type: string;
    serviceArea?: string;
    providerName?: string;
    priceRange?: string;
    articleSection?: string;
  };
  locales?: {
    fa?: LocaleSeoConfig;
    en?: LocaleSeoConfig;
  };
}

export interface SeoPanelValue {
  focusKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDesc: string;
  slug: string;
  canonicalUrl: string;
  ogImage: string;
  isPillar: boolean;
  seoConfig: SeoConfig;
}

export interface SeoCheckItem {
  id: string;
  category: SeoCheckCategory;
  status: SeoCheckStatus;
  title: string;
  reason: string;
  suggestion: string;
  points: number;
  maxPoints: number;
}

export interface SeoMetrics {
  wordCount: number;
  readingTimeMinutes: number;
  keywordCount: number;
  keywordDensity: number;
  secondaryMatchedCount: number;
  titleLength: number;
  titlePixelWidth: number;
  descLength: number;
  descPixelWidth: number;
  slugLength: number;
  internalLinkCount: number;
  externalLinkCount: number;
  nofollowExternalCount: number;
  imageCount: number;
  missingAltCount: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  avgSentenceWords: number;
  longParagraphCount: number;
}

export interface SeoAnalysisInput {
  entityType: SeoEntityType;
  language: SeoLang;
  title: string;
  metaTitle: string;
  metaDesc: string;
  slug: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  contentHtml: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  siteName?: string;
  siteUrl?: string;
}

export interface SeoAnalysisResult {
  score: number;
  grade: "good" | "ok" | "poor";
  resolvedTitle: string;
  resolvedDescription: string;
  checks: SeoCheckItem[];
  metrics: SeoMetrics;
  counts: {
    pass: number;
    warn: number;
    fail: number;
  };
}

export function createDefaultSeoConfig(entityType: SeoEntityType): SeoConfig {
  return {
    robots: {
      index: true,
      follow: true,
    },
    social: {
      inheritGeneral: true,
      twitterCard: "summary_large_image",
    },
    schema: {
      enabled: true,
      type: entityType === "service" ? "Service" : "BlogPosting",
    },
  };
}

export function mergeSeoConfig(raw: unknown, entityType: SeoEntityType): SeoConfig {
  const def = createDefaultSeoConfig(entityType);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return def;
  const obj = raw as Record<string, any>;
  return {
    robots: {
      ...def.robots,
      ...(obj.robots && typeof obj.robots === "object" ? obj.robots : {}),
      index: obj.robots?.index !== false,
      follow: obj.robots?.follow !== false,
    },
    social: {
      ...def.social,
      ...(obj.social && typeof obj.social === "object" ? obj.social : {}),
      inheritGeneral: obj.social?.inheritGeneral !== false,
    },
    schema: {
      ...def.schema,
      ...(obj.schema && typeof obj.schema === "object" ? obj.schema : {}),
      enabled: obj.schema?.enabled !== false,
      type: typeof obj.schema?.type === "string" && obj.schema.type ? obj.schema.type : def.schema.type,
    },
    ...(obj.locales && typeof obj.locales === "object" ? { locales: obj.locales } : {}),
  };
}
