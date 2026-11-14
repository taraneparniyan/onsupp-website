import type { SeoLang } from "./types";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/**
 * Normalizes Persian/Arabic characters, digits, and diacritics for accurate SEO matching.
 */
export function normalizePersianText(input: string): string {
  if (!input) return "";
  let out = input
    .replace(/\u064A/g, "\u06CC") // ي -> ی
    .replace(/\u0649/g, "\u06CC") // ى -> ی
    .replace(/\u0643/g, "\u06A9") // ك -> ک
    .replace(/\u0629/g, "\u0647") // ة -> ه
    .replace(/\u06C0/g, "\u0647") // ۀ -> ه
    .replace(/[\u0622\u0623\u0625]/g, "\u0627") // آ أ إ -> ا
    .replace(/\u0624/g, "\u0648") // ؤ -> و
    .replace(/\u0626/g, "\u06CC") // ئ -> ی
    .replace(/[\u064B-\u065F\u0670\u0640]/g, ""); // diacritics & tatweel

  out = out.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
  out = out.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
  return out.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Creates ZWNJ-tolerant variants so "سئو تکنیکال", "سئو‌تکنیکال", and "سئوتکنیکال" all match.
 */
export function buildKeywordVariants(keyword: string, lang: SeoLang): string[] {
  const base = lang === "fa" ? normalizePersianText(keyword) : keyword.toLowerCase().trim();
  if (!base) return [];

  if (lang === "en") {
    return Array.from(new Set([base.replace(/\s+/g, " ")]));
  }

  const withSpace = base.replace(/\u200c+/g, " ").replace(/\s+/g, " ").trim();
  const withZwnj = base.replace(/\u200c+/g, "\u200c").trim();
  const collapsed = base.replace(/[\u200c\s]+/g, "").trim();

  return Array.from(new Set([withZwnj, withSpace, collapsed].filter((v) => v.length > 0)));
}

export function normalizeTextForLang(text: string, lang: SeoLang): string {
  if (!text) return "";
  if (lang === "fa") return normalizePersianText(text);
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function countKeywordOccurrences(text: string, keyword: string, lang: SeoLang): number {
  const normText = normalizeTextForLang(text, lang);
  const variants = buildKeywordVariants(keyword, lang);
  if (!normText || variants.length === 0) return 0;

  if (lang === "en") {
    const escaped = variants[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "gi");
    return (normText.match(regex) || []).length;
  }

  // For Persian, match the primary space-normalized form and collapsed form safely
  const spaceText = normText.replace(/\u200c+/g, " ").replace(/\s+/g, " ");
  const spaceVariant = variants[1] || variants[0];
  const escaped = spaceVariant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "g");
  const spaceMatches = (spaceText.match(regex) || []).length;
  if (spaceMatches > 0) return spaceMatches;

  if (variants.length > 2 && variants[2].length >= 4) {
    const collapsedText = normText.replace(/[\u200c\s]+/g, "");
    const collapsedEscaped = variants[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return (collapsedText.match(new RegExp(collapsedEscaped, "g")) || []).length;
  }

  return 0;
}

export function containsKeyword(text: string, keyword: string, lang: SeoLang): boolean {
  return countKeywordOccurrences(text, keyword, lang) > 0;
}

export function tokenizeWords(text: string, lang: SeoLang): string[] {
  const norm = normalizeTextForLang(text, lang).replace(/\u200c/g, "\u200c");
  if (!norm) return [];
  // Keep ZWNJ inside Persian compound words as one token
  const tokens = norm
    .replace(/[^\p{L}\p{N}\u200c]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0 && t !== "\u200c");
  return tokens;
}

export function splitSentences(text: string, lang: SeoLang): string[] {
  if (!text) return [];
  const sep = lang === "fa" ? /[.!؟?!\n]+/ : /[.!?\n]+/;
  return text
    .split(sep)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

/**
 * Approximates Google SERP pixel width for a string (Arial/Vazirmatn-like 20px title or 14px desc).
 */
export function estimatePixelWidth(text: string, kind: "title" | "description"): number {
  if (!text) return 0;
  const scale = kind === "title" ? 1 : 0.72;
  let width = 0;
  for (const ch of text) {
    if (ch === " ") {
      width += 4.5 * scale;
    } else if (/[\u0600-\u06FF]/.test(ch)) {
      width += 10.5 * scale;
    } else if (/[A-ZWM]/.test(ch)) {
      width += 12.2 * scale;
    } else if (/[ilI1.,:;|!]/.test(ch)) {
      width += 4.6 * scale;
    } else {
      width += 9.2 * scale;
    }
  }
  return Math.round(width);
}

export interface ParsedHtmlContent {
  plainText: string;
  paragraphs: string[];
  headings: Array<{ level: number; text: string }>;
  images: Array<{ src: string; alt: string }>;
  links: Array<{ href: string; isInternal: boolean; isNofollow: boolean; isValidHttp: boolean }>;
}

export function parseHtmlForSeo(html: string, siteUrl = "https://onsupp.ir"): ParsedHtmlContent {
  const raw = html || "";
  const decode = (s: string) =>
    s
      .replace(/&nbsp;/gi, " ")
      .replace(/&zwnj;/gi, "\u200c")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");

  const stripTags = (s: string) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

  const headings: Array<{ level: number; text: string }> = [];
  const headingRe = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let hm: RegExpExecArray | null;
  while ((hm = headingRe.exec(raw)) !== null) {
    const text = stripTags(hm[2]);
    if (text) headings.push({ level: Number(hm[1]), text });
  }

  const paragraphs: string[] = [];
  const pRe = /<(p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let pm: RegExpExecArray | null;
  while ((pm = pRe.exec(raw)) !== null) {
    const text = stripTags(pm[2]);
    if (text) paragraphs.push(text);
  }

  const images: Array<{ src: string; alt: string }> = [];
  const imgRe = /<img\b([^>]*)>/gi;
  let im: RegExpExecArray | null;
  while ((im = imgRe.exec(raw)) !== null) {
    const attrs = im[1];
    const srcM = attrs.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const altM = attrs.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const src = (srcM?.[1] ?? srcM?.[2] ?? srcM?.[3] ?? "").trim();
    const alt = decode((altM?.[1] ?? altM?.[2] ?? altM?.[3] ?? "").trim());
    images.push({ src, alt });
  }

  const links: Array<{ href: string; isInternal: boolean; isNofollow: boolean; isValidHttp: boolean }> = [];
  const siteHost = (() => {
    try {
      return new URL(siteUrl).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return "onsupp.ir";
    }
  })();

  const aRe = /<a\b([^>]*)>/gi;
  let am: RegExpExecArray | null;
  while ((am = aRe.exec(raw)) !== null) {
    const attrs = am[1];
    const hrefM = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const relM = attrs.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = (hrefM?.[1] ?? hrefM?.[2] ?? hrefM?.[3] ?? "").trim();
    const rel = (relM?.[1] ?? relM?.[2] ?? relM?.[3] ?? "").toLowerCase();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;

    let isInternal = href.startsWith("/") && !href.startsWith("//");
    let isValidHttp = isInternal;
    if (!isInternal) {
      try {
        const u = new URL(href);
        isValidHttp = u.protocol === "http:" || u.protocol === "https:";
        const host = u.hostname.replace(/^www\./, "").toLowerCase();
        if (host === siteHost || host.endsWith("." + siteHost)) {
          isInternal = true;
        }
      } catch {
        isValidHttp = false;
      }
    }
    links.push({
      href,
      isInternal,
      isNofollow: rel.includes("nofollow"),
      isValidHttp,
    });
  }

  const plainText = stripTags(raw.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ""));
  if (paragraphs.length === 0 && plainText.length > 0) {
    paragraphs.push(...plainText.split(/\n+/).map((s) => s.trim()).filter(Boolean));
  }

  return { plainText, paragraphs, headings, images, links };
}

export function resolveSeoVariables(
  template: string,
  vars: { title?: string; sitename?: string; sep?: string }
): string {
  if (!template) return "";
  const nowYear = String(new Date().getFullYear());
  return template
    .replace(/%title%/gi, vars.title || "")
    .replace(/%sitename%/gi, vars.sitename || "آن‌ساپ | OnSupp")
    .replace(/%sep%/gi, vars.sep || "|")
    .replace(/%date%|%currentyear%/gi, nowYear)
    .replace(/\s+/g, " ")
    .trim();
}
