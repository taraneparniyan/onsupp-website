import {
  containsKeyword,
  countKeywordOccurrences,
  estimatePixelWidth,
  normalizeTextForLang,
  parseHtmlForSeo,
  resolveSeoVariables,
  splitSentences,
  tokenizeWords,
} from "./normalize";
import type {
  SeoAnalysisInput,
  SeoAnalysisResult,
  SeoCheckItem,
  SeoCheckStatus,
} from "./types";

function addCheck(
  checks: SeoCheckItem[],
  item: Omit<SeoCheckItem, "points"> & { ratio: number }
) {
  const { ratio, ...rest } = item;
  checks.push({
    ...rest,
    points: Math.round(item.maxPoints * Math.max(0, Math.min(1, ratio)) * 10) / 10,
  });
}

/**
 * Dynamic, bilingual SEO analysis engine (0-100 score, never stored statically).
 */
export function analyzeSeo(input: SeoAnalysisInput): SeoAnalysisResult {
  const lang = input.language;
  const isFa = lang === "fa";
  const checks: SeoCheckItem[] = [];

  const siteName = input.siteName || (isFa ? "آن‌ساپ" : "OnSupp");
  const rawTitle = (input.metaTitle || "").trim() || (input.title || "").trim();
  const resolvedTitle = resolveSeoVariables(rawTitle, {
    title: input.title,
    sitename: siteName,
    sep: "|",
  });

  const rawDesc = (input.metaDesc || "").trim() || (input.excerpt || "").trim();
  const resolvedDescription = resolveSeoVariables(rawDesc, {
    title: input.title,
    sitename: siteName,
    sep: "|",
  });

  const parsed = parseHtmlForSeo(input.contentHtml || "", input.siteUrl || "https://onsupp.ir");
  const fullBodyText = [input.excerpt || "", parsed.plainText].filter(Boolean).join(" ").trim();
  const words = tokenizeWords(fullBodyText, lang);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / (isFa ? 180 : 210)));

  const fk = (input.focusKeyword || "").trim();
  const hasFk = fk.length > 0;
  const secondaryList = (input.secondaryKeywords || []).map((k) => k.trim()).filter(Boolean);

  // Images: include cover image if present
  const allImages = [...parsed.images];
  if (input.coverImageUrl && input.coverImageUrl.trim()) {
    allImages.unshift({
      src: input.coverImageUrl.trim(),
      alt: (input.coverImageAlt || "").trim(),
    });
  }
  const missingAltCount = allImages.filter((img) => !img.alt || img.alt.trim().length < 2).length;

  // Links
  const internalLinks = parsed.links.filter((l) => l.isInternal);
  const externalLinks = parsed.links.filter((l) => !l.isInternal && l.isValidHttp);
  const nofollowExternalCount = externalLinks.filter((l) => l.isNofollow).length;

  // Headings
  const h1Count = parsed.headings.filter((h) => h.level === 1).length;
  const h2Headings = parsed.headings.filter((h) => h.level === 2);
  const h3Headings = parsed.headings.filter((h) => h.level === 3);
  const subheadings = [...h2Headings, ...h3Headings];

  // Keyword frequency & density
  const keywordCount = hasFk ? countKeywordOccurrences(fullBodyText, fk, lang) : 0;
  const fkWordLen = hasFk ? Math.max(1, tokenizeWords(fk, lang).length) : 1;
  const keywordDensity =
    wordCount > 0 && hasFk
      ? Math.round(((keywordCount * fkWordLen) / wordCount) * 1000) / 10
      : 0;

  // Secondary keywords matched
  const secondaryMatchedCount = secondaryList.filter(
    (sk) =>
      containsKeyword(fullBodyText, sk, lang) ||
      containsKeyword(resolvedTitle, sk, lang) ||
      subheadings.some((h) => containsKeyword(h.text, sk, lang))
  ).length;

  // Readability stats
  const sentences = splitSentences(parsed.plainText, lang);
  const sentenceWordCounts = sentences.map((s) => tokenizeWords(s, lang).length).filter((c) => c > 0);
  const avgSentenceWords =
    sentenceWordCounts.length > 0
      ? Math.round(
          (sentenceWordCounts.reduce((a, b) => a + b, 0) / sentenceWordCounts.length) * 10
        ) / 10
      : 0;

  const maxParagraphWords = isFa ? 140 : 120;
  const longParagraphCount = parsed.paragraphs.filter(
    (p) => tokenizeWords(p, lang).length > maxParagraphWords
  ).length;

  const titleLength = resolvedTitle.length;
  const titlePixelWidth = estimatePixelWidth(resolvedTitle, "title");
  const descLength = resolvedDescription.length;
  const descPixelWidth = estimatePixelWidth(resolvedDescription, "description");
  const slugClean = (input.slug || "").trim();
  const slugLength = slugClean.length;

  // ─── 1. BASIC SEO (45 pts) ─────────────────────────────────────────────────
  if (!hasFk) {
    addCheck(checks, {
      id: "basic-focus-keyword-defined",
      category: "basic",
      status: "fail",
      title: "تعیین کلمه کلیدی کانونی (Focus Keyword)",
      reason: "هنوز هیچ کلمه کلیدی کانونی برای تحلیل این صفحه وارد نشده است.",
      suggestion: "در تب «عمومی»، یک عبارت یا کلمه کلیدی اصلی مرتبط با هدف جست‌وجوی کاربر وارد کنید.",
      maxPoints: 8,
      ratio: 0,
    });
  } else {
    addCheck(checks, {
      id: "basic-focus-keyword-defined",
      category: "basic",
      status: "pass",
      title: "تعیین کلمه کلیدی کانونی (Focus Keyword)",
      reason: `کلمه کلیدی «${fk}» به‌عنوان هدف اصلی تحلیل تنظیم شده است.`,
      suggestion: "پیشنهاد می‌شود برای جلوگیری از هم‌پوشانی (Cannibalization)، این عبارت در صفحات دیگر تکرار نشود.",
      maxPoints: 8,
      ratio: 1,
    });
  }

  // Keyword in SEO Title
  const kwInTitle = hasFk && containsKeyword(resolvedTitle, fk, lang);
  addCheck(checks, {
    id: "basic-kw-in-title",
    category: "basic",
    status: !hasFk ? "warn" : kwInTitle ? "pass" : "fail",
    title: "حضور کلمه کلیدی در عنوان سئو (SEO Title)",
    reason: !hasFk
      ? "برای بررسی حضور کلمه کلیدی در عنوان، ابتدا Focus Keyword را وارد کنید."
      : kwInTitle
      ? "کلمه کلیدی کانونی در عنوان سئو وجود دارد."
      : "کلمه کلیدی کانونی در SEO Title دیده نمی‌شود.",
    suggestion: kwInTitle
      ? "عنوان شما با عبارت هدف هم‌راستاست."
      : "کلمه کلیدی اصلی را به‌صورت طبیعی در عنوان سئو (ترجیحاً در بخش ابتدایی) قرار دهید.",
    maxPoints: 8,
    ratio: !hasFk ? 0.3 : kwInTitle ? 1 : 0,
  });

  // Keyword in Meta Description
  const kwInDesc = hasFk && containsKeyword(resolvedDescription, fk, lang);
  addCheck(checks, {
    id: "basic-kw-in-desc",
    category: "basic",
    status: !hasFk ? "warn" : kwInDesc ? "pass" : "fail",
    title: "حضور کلمه کلیدی در توضیحات متا (Meta Description)",
    reason: !hasFk
      ? "کلمه کلیدی کانونی هنوز مشخص نشده است."
      : kwInDesc
      ? "کلمه کلیدی کانونی در توضیحات متا به کار رفته است."
      : "توضیحات متا فاقد کلمه کلیدی کانونی است.",
    suggestion: kwInDesc
      ? "موتورهای جست‌وجو عبارت منطبق را در نتایج جست‌وجو برجسته (Bold) می‌کنند."
      : "کلمه کلیدی کانونی را با لحن ترغیب‌کننده در توضیحات متا بگنجانید.",
    maxPoints: 6,
    ratio: !hasFk ? 0.3 : kwInDesc ? 1 : 0,
  });

  // Keyword in Slug
  const decodedSlug = (() => {
    try {
      return decodeURIComponent(slugClean);
    } catch {
      return slugClean;
    }
  })();
  const normalizedSlugText = decodedSlug.replace(/[-_]+/g, " ");
  const kwWords = hasFk ? tokenizeWords(fk, lang) : [];
  const kwInSlugExact = hasFk && containsKeyword(normalizedSlugText, fk, lang);
  const kwInSlugPartial =
    hasFk &&
    kwWords.length > 0 &&
    kwWords.some((w) => w.length > 2 && containsKeyword(normalizedSlugText, w, lang));
  addCheck(checks, {
    id: "basic-kw-in-slug",
    category: "basic",
    status: !slugClean
      ? "fail"
      : !hasFk
      ? "warn"
      : kwInSlugExact
      ? "pass"
      : kwInSlugPartial
      ? "warn"
      : "warn",
    title: "حضور کلمه کلیدی در نشانی (URL / Slug)",
    reason: !slugClean
      ? "اسلاگ (Slug) صفحه خالی است."
      : kwInSlugExact
      ? "کلمه کلیدی در Slug صفحه حضور دارد."
      : "کلمه کلیدی به‌طور مستقیم در Slug دیده نمی‌شود (در اسلاگ‌های انگلیسی برای کلمات کلیدی فارسی این مورد طبیعی است).",
    suggestion: !slugClean
      ? "یک نامک کوتاه، خوانا و مرتبط با موضوع وارد کنید."
      : kwInSlugExact
      ? "ساختار URL با موضوع صفحه هماهنگ است."
      : "در صورت امکان، معادل کوتاه و معنادار کلمه کلیدی را در Slug استفاده کنید.",
    maxPoints: 5,
    ratio: !slugClean ? 0 : kwInSlugExact ? 1 : 0.6,
  });

  // Keyword in opening 10% of content
  const firstSliceLen = Math.max(150, Math.floor(parsed.plainText.length * 0.12));
  const openingText = parsed.plainText.slice(0, firstSliceLen);
  const kwInOpening = hasFk && containsKeyword(openingText, fk, lang);
  addCheck(checks, {
    id: "basic-kw-in-opening",
    category: "basic",
    status: !hasFk || wordCount === 0 ? "warn" : kwInOpening ? "pass" : "fail",
    title: "حضور کلمه کلیدی در ابتدای محتوا (۱۰٪ اول)",
    reason:
      wordCount === 0
        ? "هنوز متنی در بدنه محتوا ثبت نشده است."
        : !hasFk
        ? "کلمه کلیدی کانونی تعیین نشده است."
        : kwInOpening
        ? "کلمه کلیدی در پاراگراف آغازین محتوا حضور دارد."
        : "کلمه کلیدی کانونی در ۱۰٪ ابتدایی متن یافت نشد.",
    suggestion: kwInOpening
      ? "شروع محتوا به‌خوبی موضوع صفحه را برای کاربر و خزنده مشخص می‌کند."
      : "در اولین پاراگراف محتوا، کلمه کلیدی کانونی را به‌صورت طبیعی به کار ببرید.",
    maxPoints: 6,
    ratio: !hasFk || wordCount === 0 ? 0.2 : kwInOpening ? 1 : 0,
  });

  // Keyword in body content
  addCheck(checks, {
    id: "basic-kw-in-body",
    category: "basic",
    status: !hasFk ? "warn" : keywordCount > 0 ? "pass" : "fail",
    title: "حضور کلمه کلیدی در متن اصلی",
    reason: !hasFk
      ? "کلمه کلیدی کانونی مشخص نشده است."
      : keywordCount > 0
      ? `کلمه کلیدی ${keywordCount} بار در متن شناسایی شد.`
      : "کلمه کلیدی در متن اصلی یافت نشد.",
    suggestion:
      keywordCount > 0
        ? "توزیع کلمه کلیدی در بخش‌های مختلف متن بررسی شود."
        : "موضوع اصلی را با استفاده طبیعی از کلمه کلیدی در بدنه مقاله/خدمت توضیح دهید.",
    maxPoints: 5,
    ratio: !hasFk ? 0.2 : keywordCount > 0 ? 1 : 0,
  });

  // Content length
  const recommendedMinWords = input.entityType === "article" ? 600 : 300;
  const acceptableMinWords = input.entityType === "article" ? 300 : 150;
  const lengthStatus: SeoCheckStatus =
    wordCount >= recommendedMinWords
      ? "pass"
      : wordCount >= acceptableMinWords
      ? "warn"
      : "fail";
  addCheck(checks, {
    id: "basic-content-length",
    category: "basic",
    status: lengthStatus,
    title: "حجم و عمق محتوا (تعداد کلمات)",
    reason: `محتوای فعلی ${wordCount} کلمه است (زمان مطالعه تقریبی: ${readingTimeMinutes} دقیقه).`,
    suggestion:
      lengthStatus === "pass"
        ? "حجم محتوا برای پوشش جامع موضوع مناسب است."
        : `برای پوشش عمیق‌تر موضوع در ${
            input.entityType === "article" ? "مقالات" : "صفحات خدمات"
          }، حداقل ${recommendedMinWords} کلمه محتوای ارزشمند پیشنهاد می‌شود.`,
    maxPoints: 7,
    ratio: lengthStatus === "pass" ? 1 : lengthStatus === "warn" ? 0.6 : 0.15,
  });

  // ─── 2. ADDITIONAL SEO (25 pts) ────────────────────────────────────────────
  // Keyword in H2/H3
  const kwInSubheadings =
    hasFk && subheadings.some((h) => containsKeyword(h.text, fk, lang));
  addCheck(checks, {
    id: "add-kw-in-headings",
    category: "additional",
    status: !hasFk || subheadings.length === 0 ? "warn" : kwInSubheadings ? "pass" : "warn",
    title: "حضور کلمه کلیدی در زیرتیترها (H2 / H3)",
    reason:
      subheadings.length === 0
        ? "هیچ زیرتیتر H2 یا H3 در متن وجود ندارد."
        : !hasFk
        ? "کلمه کلیدی کانونی تعیین نشده است."
        : kwInSubheadings
        ? "کلمه کلیدی در حداقل یک زیرتیتر H2/H3 استفاده شده است."
        : "کلمه کلیدی در زیرتیترهای H2/H3 یافت نشد.",
    suggestion: kwInSubheadings
      ? "ساختار زیرتیترها سیگنال موضوعی خوبی ایجاد کرده است."
      : "حداقل در یکی از زیرتیترهای H2 یا H3 از کلمه کلیدی یا هم‌معنی آن استفاده کنید.",
    maxPoints: 4,
    ratio: !hasFk || subheadings.length === 0 ? 0.3 : kwInSubheadings ? 1 : 0.4,
  });

  // Image ALT attributes
  const kwInAlt =
    hasFk && allImages.some((img) => img.alt && containsKeyword(img.alt, fk, lang));
  const altStatus: SeoCheckStatus =
    allImages.length === 0
      ? "warn"
      : missingAltCount > 0
      ? "fail"
      : !hasFk || kwInAlt
      ? "pass"
      : "warn";
  addCheck(checks, {
    id: "add-image-alt",
    category: "additional",
    status: altStatus,
    title: "متن جایگزین تصاویر (Image ALT)",
    reason:
      allImages.length === 0
        ? "تصویری در محتوا یا کاور برای بررسی ALT یافت نشد."
        : missingAltCount > 0
        ? `${missingAltCount} تصویر از ${allImages.length} تصویر فاقد ویژگی ALT معتبر است.`
        : kwInAlt
        ? "تمام تصاویر دارای ALT هستند و کلمه کلیدی نیز در ALT تصویر دیده شد."
        : "تمام تصاویر ALT دارند، اما کلمه کلیدی در ALT تصاویر نیست.",
    suggestion:
      altStatus === "pass"
        ? "بهینه‌سازی ALT تصاویر در وضعیت مطلوب است."
        : "برای تمام تصاویر، متن جایگزین توصیفی (ALT) بنویسید و در یکی از تصاویر مرتبط از کلمه کلیدی استفاده کنید.",
    maxPoints: 4,
    ratio: altStatus === "pass" ? 1 : altStatus === "warn" ? 0.6 : 0.2,
  });

  // Keyword density
  const densityStatus: SeoCheckStatus =
    !hasFk || wordCount < 30
      ? "warn"
      : keywordDensity >= 0.5 && keywordDensity <= 2.5
      ? "pass"
      : keywordDensity > 2.5
      ? "fail"
      : "warn";
  addCheck(checks, {
    id: "add-kw-density",
    category: "additional",
    status: densityStatus,
    title: "تراکم کلمه کلیدی (Keyword Density)",
    reason: !hasFk
      ? "بدون کلمه کلیدی، محاسبه تراکم امکان‌پذیر نیست."
      : `تراکم فعلی کلمه کلیدی ${keywordDensity}٪ (${keywordCount} بار در ${wordCount} کلمه) است.`,
    suggestion:
      densityStatus === "pass"
        ? "تراکم کلمه کلیدی در بازه استاندارد (۰٫۵٪ تا ۲٫۵٪) قرار دارد."
        : keywordDensity > 2.5
        ? "تراکم بیش از حد (Keyword Stuffing) می‌تواند تجربه کاربری را کاهش دهد؛ از مترادف‌ها استفاده کنید."
        : "کلمه کلیدی را چند بار دیگر به‌صورت طبیعی در بخش‌های میانی متن به کار ببرید.",
    maxPoints: 4,
    ratio: densityStatus === "pass" ? 1 : densityStatus === "warn" ? 0.5 : 0.1,
  });

  // URL Length
  const urlStatus: SeoCheckStatus =
    slugLength === 0 ? "fail" : slugLength <= 75 ? "pass" : "warn";
  addCheck(checks, {
    id: "add-url-length",
    category: "additional",
    status: urlStatus,
    title: "طول نشانی صفحه (URL / Slug Length)",
    reason:
      slugLength === 0
        ? "اسلاگ صفحه تنظیم نشده است."
        : `طول اسلاگ فعلی ${slugLength} کاراکتر است.`,
    suggestion:
      urlStatus === "pass"
        ? "طول URL کوتاه و استاندارد است."
        : "اسلاگ را زیر ۷۵ کاراکتر نگه دارید تا در نتایج جست‌وجو برش نخورد.",
    maxPoints: 3,
    ratio: urlStatus === "pass" ? 1 : urlStatus === "warn" ? 0.6 : 0,
  });

  // Internal Links
  const internalLinkStatus: SeoCheckStatus =
    internalLinks.length >= 2 ? "pass" : internalLinks.length === 1 ? "warn" : "fail";
  addCheck(checks, {
    id: "add-internal-links",
    category: "additional",
    status: internalLinkStatus,
    title: "لینک‌سازی داخلی (Internal Links)",
    reason:
      internalLinks.length > 0
        ? `${internalLinks.length} لینک داخلی در محتوا شناسایی شد.`
        : "هیچ لینک داخلی به سایر مقالات یا خدمات سایت در محتوا وجود ندارد.",
    suggestion:
      internalLinkStatus === "pass"
        ? "ساختار لینک‌سازی داخلی مناسب است."
        : "حداقل ۲ لینک داخلی مرتبط به مقالات آموزشی یا صفحات خدمات آن‌ساپ اضافه کنید.",
    maxPoints: 4,
    ratio: internalLinkStatus === "pass" ? 1 : internalLinkStatus === "warn" ? 0.6 : 0,
  });

  // External Links
  const extStatus: SeoCheckStatus =
    externalLinks.length > 0 ? "pass" : "warn";
  addCheck(checks, {
    id: "add-external-links",
    category: "additional",
    status: extStatus,
    title: "لینک‌های خروجی معتبر (External Links)",
    reason:
      externalLinks.length > 0
        ? `${externalLinks.length} لینک خارجی معتبر شناسایی شد${
            nofollowExternalCount > 0 ? ` (${nofollowExternalCount} مورد nofollow)` : ""
          }.`
        : "لینک خروجی به منابع معتبر دیده نشد.",
    suggestion:
      externalLinks.length > 0
        ? "ارجاع به منابع معتبر به غنای محتوا کمک می‌کند."
        : "در صورت استناد به آمار یا استانداردها، به منابع معتبر خارجی لینک بدهید.",
    maxPoints: 3,
    ratio: extStatus === "pass" ? 1 : 0.5,
  });

  // Secondary Keywords coverage
  const secStatus: SeoCheckStatus =
    secondaryList.length === 0
      ? "warn"
      : secondaryMatchedCount === secondaryList.length
      ? "pass"
      : secondaryMatchedCount > 0
      ? "warn"
      : "fail";
  addCheck(checks, {
    id: "add-secondary-keywords",
    category: "additional",
    status: secStatus,
    title: "پوشش کلمات کلیدی فرعی (Secondary Keywords)",
    reason:
      secondaryList.length === 0
        ? "هنوز کلمه کلیدی فرعی تعریف نشده است."
        : `${secondaryMatchedCount} مورد از ${secondaryList.length} کلمه کلیدی فرعی در محتوا پوشش داده شده است.`,
    suggestion:
      secStatus === "pass"
        ? "تمام کلمات کلیدی فرعی در متن پوشش داده شده‌اند."
        : "عبارات هم‌معنی و کلمات کلیدی فرعی مرتبط را تعریف و در زیربخش‌های متن استفاده کنید.",
    maxPoints: 3,
    ratio:
      secondaryList.length === 0
        ? 0.4
        : secondaryList.length > 0
        ? secondaryMatchedCount / secondaryList.length
        : 0,
  });

  // ─── 3. TITLE READABILITY (15 pts) ─────────────────────────────────────────
  const titleLenPass =
    titleLength >= 30 && titleLength <= 65 && titlePixelWidth <= 600;
  const titleLenStatus: SeoCheckStatus =
    titleLength === 0 ? "fail" : titleLenPass ? "pass" : "warn";
  addCheck(checks, {
    id: "title-length",
    category: "title",
    status: titleLenStatus,
    title: "طول و عرض پیکسلی عنوان سئو (Title Length)",
    reason: `عنوان فعلی ${titleLength} کاراکتر (~${titlePixelWidth}px) دارد.`,
    suggestion: titleLenPass
      ? "طول عنوان برای نمایش کامل در دسکتاپ و موبایل گوگل مناسب است."
      : titleLength < 30
      ? "عنوان خیلی کوتاه است؛ بازه ۳۰ تا ۶۰ کاراکتر (حداکثر ~۵۸۰px) توصیه می‌شود."
      : "عنوان ممکن است در نتایج جست‌وجوی گوگل برش بخورد؛ آن را به زیر ۶۰ کاراکتر (~۵۸۰px) کوتاه‌تر کنید.",
    maxPoints: 6,
    ratio: titleLength === 0 ? 0 : titleLenPass ? 1 : 0.5,
  });

  // Keyword at beginning of title
  const normTitle = normalizeTextForLang(resolvedTitle, lang);
  const normFk = normalizeTextForLang(fk, lang);
  const kwPos = hasFk && normFk ? normTitle.indexOf(normFk) : -1;
  const kwAtBeginning = kwPos >= 0 && kwPos <= Math.max(12, Math.floor(normTitle.length * 0.35));
  addCheck(checks, {
    id: "title-kw-start",
    category: "title",
    status: !hasFk ? "warn" : kwAtBeginning ? "pass" : kwInTitle ? "warn" : "fail",
    title: "قرارگیری کلمه کلیدی در ابتدای عنوان",
    reason: !hasFk
      ? "کلمه کلیدی کانونی مشخص نشده است."
      : kwAtBeginning
      ? "کلمه کلیدی در بخش ابتدایی عنوان سئو قرار گرفته است."
      : kwInTitle
      ? "کلمه کلیدی در عنوان هست اما در بخش انتهایی قرار دارد."
      : "کلمه کلیدی در عنوان یافت نشد.",
    suggestion: kwAtBeginning
      ? "جایگاه کلمه کلیدی در عنوان ایده‌آل است."
      : "برای درک سریع‌تر توسط کاربر و موتور جست‌وجو، کلمه کلیدی را به ابتدای عنوان منتقل کنید.",
    maxPoints: 5,
    ratio: !hasFk ? 0.3 : kwAtBeginning ? 1 : kwInTitle ? 0.6 : 0,
  });

  // Title appeal / structure
  const hasNumberOrPowerWord =
    /[0-9۰-۹]/.test(resolvedTitle) ||
    /(راهنمای|آموزش|جامع|کامل|حرفه‌ای|تخصصی|جدید|بهترین|چگونه|سریع|افزایش|استراتژی|guide|complete|best|how to|strategy|enterprise|ultimate)/i.test(
      resolvedTitle
    );
  addCheck(checks, {
    id: "title-appeal",
    category: "title",
    status: resolvedTitle.length === 0 ? "fail" : hasNumberOrPowerWord ? "pass" : "warn",
    title: "ساختار و جذابیت عنوان (CTR Appeal)",
    reason: hasNumberOrPowerWord
      ? "عنوان شامل عدد یا واژه‌های شفاف‌کننده ارزش/اقدام است."
      : "عنوان ساده است و فاقد عدد یا کلمات ارزش‌آفرین (مانند راهنمای جامع، سال، مزایا) است.",
    suggestion: hasNumberOrPowerWord
      ? "ساختار عنوان برای کلیک‌پذیری مناسب است."
      : "افزودن سال، عدد مشخص یا واژه ارزش‌آفرین می‌تواند نرخ کلیک (CTR) را بهبود دهد.",
    maxPoints: 4,
    ratio: resolvedTitle.length === 0 ? 0 : hasNumberOrPowerWord ? 1 : 0.5,
  });

  // ─── 4. CONTENT READABILITY & META DESC LENGTH (15 pts) ────────────────────
  // Meta description length
  const descLenOk =
    descLength >= 110 && descLength <= 165 && descPixelWidth <= 940;
  const descLenStatus: SeoCheckStatus =
    descLength === 0 ? "fail" : descLenOk ? "pass" : "warn";
  addCheck(checks, {
    id: "read-meta-desc-length",
    category: "readability",
    status: descLenStatus,
    title: "طول استاندارد توضیحات متا (Meta Description)",
    reason: `توضیحات متا ${descLength} کاراکتر (~${descPixelWidth}px) است.`,
    suggestion: descLenOk
      ? "طول توضیحات متا در بازه استاندارد (۱۲۰ تا ۱۶۰ کاراکتر) قرار دارد."
      : descLength < 110
      ? "توضیحات متا کوتاه است؛ بازه ۱۲۰ تا ۱۶۰ کاراکتر فضای بیشتری در نتایج گوگل می‌سازد."
      : "توضیحات متا طولانی است و ممکن است در SERP کوتاه شود.",
    maxPoints: 4,
    ratio: descLength === 0 ? 0 : descLenOk ? 1 : 0.5,
  });

  // Headings structure
  const headingStatus: SeoCheckStatus =
    subheadings.length >= 2 && h1Count <= 1
      ? "pass"
      : subheadings.length >= 1
      ? "warn"
      : "fail";
  addCheck(checks, {
    id: "read-heading-structure",
    category: "readability",
    status: headingStatus,
    title: "ساختار سلسله‌مراتبی تیترها (H2 / H3)",
    reason: `تعداد تیترها: H1=${h1Count}، H2=${h2Headings.length}، H3=${h3Headings.length}.`,
    suggestion:
      headingStatus === "pass"
        ? "ساختار تیترها خوانایی و اسکن بصری صفحه را تسهیل می‌کند."
        : h1Count > 1
        ? "در بدنه محتوا از تکرار H1 خودداری کنید (عنوان اصلی صفحه H1 است) و از H2/H3 بهره ببرید."
        : "متن را با حداقل ۲ زیرتیتر H2/H3 بخش‌بندی کنید تا خوانش‌پذیری افزایش یابد.",
    maxPoints: 4,
    ratio: headingStatus === "pass" ? 1 : headingStatus === "warn" ? 0.6 : 0.1,
  });

  // Paragraph length
  const paraStatus: SeoCheckStatus =
    parsed.paragraphs.length === 0
      ? "warn"
      : longParagraphCount === 0
      ? "pass"
      : "warn";
  addCheck(checks, {
    id: "read-paragraph-length",
    category: "readability",
    status: paraStatus,
    title: "طول پاراگراف‌ها (بلاک‌های متراکم)",
    reason:
      parsed.paragraphs.length === 0
        ? "پاراگرافی برای بررسی وجود ندارد."
        : longParagraphCount === 0
        ? "تمام پاراگراف‌ها طول متعادلی دارند."
        : `${longParagraphCount} پاراگراف طولانی‌تر از ${maxParagraphWords} کلمه شناسایی شد.`,
    suggestion:
      paraStatus === "pass"
        ? "تفکیک پاراگراف‌ها برای مطالعه وب عالی است."
        : "پاراگراف‌های طولانی را به بخش‌های کوتاه‌تر (۳ تا ۴ خط) یا بولت‌لیست بشکنید.",
    maxPoints: 4,
    ratio: paraStatus === "pass" ? 1 : 0.45,
  });

  // Sentence length (separate threshold for FA vs EN)
  const maxAvgSentence = isFa ? 24 : 20;
  const sentStatus: SeoCheckStatus =
    sentenceWordCounts.length === 0
      ? "warn"
      : avgSentenceWords <= maxAvgSentence
      ? "pass"
      : "warn";
  addCheck(checks, {
    id: "read-sentence-length",
    category: "readability",
    status: sentStatus,
    title: `خوانایی جملات (${isFa ? "قواعد فارسی" : "قواعد انگلیسی"})`,
    reason:
      sentenceWordCounts.length === 0
        ? "جمله‌ای برای تحلیل خوانایی یافت نشد."
        : `میانگین طول جملات ${avgSentenceWords} کلمه است (سقف پیشنهادی ${
            isFa ? "فارسی" : "انگلیسی"
          }: ${maxAvgSentence} کلمه).`,
    suggestion:
      sentStatus === "pass"
        ? "جملات روان، شفاف و متناسب با زبان محتوا هستند."
        : "جملات مرکب و بسیار طولانی را به جملات کوتاه‌تر و روشن‌تر تبدیل کنید.",
    maxPoints: 3,
    ratio: sentStatus === "pass" ? 1 : 0.45,
  });

  // Total Score (0-100)
  const totalEarned = checks.reduce((sum, c) => sum + c.points, 0);
  const totalMax = checks.reduce((sum, c) => sum + c.maxPoints, 0);
  const score = totalMax > 0 ? Math.min(100, Math.max(0, Math.round((totalEarned / totalMax) * 100))) : 0;
  const grade = score >= 80 ? "good" : score >= 50 ? "ok" : "poor";

  const counts = {
    pass: checks.filter((c) => c.status === "pass").length,
    warn: checks.filter((c) => c.status === "warn").length,
    fail: checks.filter((c) => c.status === "fail").length,
  };

  return {
    score,
    grade,
    resolvedTitle,
    resolvedDescription,
    checks,
    metrics: {
      wordCount,
      readingTimeMinutes,
      keywordCount,
      keywordDensity,
      secondaryMatchedCount,
      titleLength,
      titlePixelWidth,
      descLength,
      descPixelWidth,
      slugLength,
      internalLinkCount: internalLinks.length,
      externalLinkCount: externalLinks.length,
      nofollowExternalCount,
      imageCount: allImages.length,
      missingAltCount,
      h1Count,
      h2Count: h2Headings.length,
      h3Count: h3Headings.length,
      avgSentenceWords,
      longParagraphCount,
    },
    counts,
  };
}
