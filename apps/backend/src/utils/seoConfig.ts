import { Prisma } from "@prisma/client";

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

export interface NormalizedSeoConfig {
  robots: {
    index: boolean;
    follow: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    maxSnippet?: number;
  };
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

export function normalizeFocusKeyword(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, 200);
}

export function normalizeSecondaryKeywords(input: unknown): string[] {
  if (Array.isArray(input)) {
    const cleaned = input
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0)
      .slice(0, 20);
    return Array.from(new Set(cleaned));
  }
  if (typeof input === "string") {
    const cleaned = input
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 20);
    return Array.from(new Set(cleaned));
  }
  return [];
}

function asTrimmedString(val: unknown, maxLen = 500): string | undefined {
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLen) : undefined;
}

function normalizeLocaleEntry(raw: unknown): LocaleSeoConfig | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, any>;
  const robotsRaw = obj.robots && typeof obj.robots === "object" ? obj.robots : {};
  const entry: LocaleSeoConfig = {
    ...(typeof obj.focusKeyword === "string" ? { focusKeyword: normalizeFocusKeyword(obj.focusKeyword) } : {}),
    ...(obj.secondaryKeywords !== undefined
      ? { secondaryKeywords: normalizeSecondaryKeywords(obj.secondaryKeywords) }
      : {}),
    ...(typeof obj.metaTitle === "string" ? { metaTitle: obj.metaTitle.trim().slice(0, 200) } : {}),
    ...(typeof obj.metaDesc === "string" ? { metaDesc: obj.metaDesc.trim().slice(0, 500) } : {}),
    ...(typeof obj.canonicalUrl === "string" ? { canonicalUrl: obj.canonicalUrl.trim().slice(0, 1000) } : {}),
    ...(typeof obj.isPillar === "boolean" ? { isPillar: obj.isPillar } : {}),
    robots: {
      index: robotsRaw.index !== false,
      follow: robotsRaw.follow !== false,
    },
  };
  return entry;
}

export function normalizeSeoConfig(
  raw: unknown,
  defaultSchemaType: "BlogPosting" | "Service" = "BlogPosting"
): Prisma.InputJsonValue {
  const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, any>) : {};

  const robotsRaw = obj.robots && typeof obj.robots === "object" ? obj.robots : {};
  const socialRaw = obj.social && typeof obj.social === "object" ? obj.social : {};
  const schemaRaw = obj.schema && typeof obj.schema === "object" ? obj.schema : {};
  const localesRaw = obj.locales && typeof obj.locales === "object" ? obj.locales : undefined;
  const faLocale = localesRaw ? normalizeLocaleEntry(localesRaw.fa) : undefined;
  const enLocale = localesRaw ? normalizeLocaleEntry(localesRaw.en) : undefined;

  const normalized: NormalizedSeoConfig = {
    robots: {
      index: robotsRaw.index !== false,
      follow: robotsRaw.follow !== false,
      ...(typeof robotsRaw.noarchive === "boolean" ? { noarchive: robotsRaw.noarchive } : {}),
      ...(typeof robotsRaw.nosnippet === "boolean" ? { nosnippet: robotsRaw.nosnippet } : {}),
      ...(typeof robotsRaw.maxSnippet === "number" && Number.isFinite(robotsRaw.maxSnippet)
        ? { maxSnippet: Math.trunc(robotsRaw.maxSnippet) }
        : {}),
    },
    social: {
      inheritGeneral: socialRaw.inheritGeneral !== false,
      ...(asTrimmedString(socialRaw.ogTitle, 200) ? { ogTitle: asTrimmedString(socialRaw.ogTitle, 200) } : {}),
      ...(asTrimmedString(socialRaw.ogDescription, 500)
        ? { ogDescription: asTrimmedString(socialRaw.ogDescription, 500) }
        : {}),
      ...(asTrimmedString(socialRaw.twitterTitle, 200)
        ? { twitterTitle: asTrimmedString(socialRaw.twitterTitle, 200) }
        : {}),
      ...(asTrimmedString(socialRaw.twitterDescription, 500)
        ? { twitterDescription: asTrimmedString(socialRaw.twitterDescription, 500) }
        : {}),
      ...(asTrimmedString(socialRaw.twitterImage, 1000)
        ? { twitterImage: asTrimmedString(socialRaw.twitterImage, 1000) }
        : {}),
      twitterCard: socialRaw.twitterCard === "summary" ? "summary" : "summary_large_image",
    },
    schema: {
      enabled: schemaRaw.enabled !== false,
      type: asTrimmedString(schemaRaw.type, 60) || defaultSchemaType,
      ...(asTrimmedString(schemaRaw.serviceArea, 200)
        ? { serviceArea: asTrimmedString(schemaRaw.serviceArea, 200) }
        : {}),
      ...(asTrimmedString(schemaRaw.providerName, 200)
        ? { providerName: asTrimmedString(schemaRaw.providerName, 200) }
        : {}),
      ...(asTrimmedString(schemaRaw.priceRange, 100)
        ? { priceRange: asTrimmedString(schemaRaw.priceRange, 100) }
        : {}),
      ...(asTrimmedString(schemaRaw.articleSection, 150)
        ? { articleSection: asTrimmedString(schemaRaw.articleSection, 150) }
        : {}),
    },
    ...(faLocale || enLocale
      ? {
          locales: {
            ...(faLocale ? { fa: faLocale } : {}),
            ...(enLocale ? { en: enLocale } : {}),
          },
        }
      : {}),
  };

  return normalized as unknown as Prisma.InputJsonValue;
}
