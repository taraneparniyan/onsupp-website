"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import JoditWysiwyg, { JoditWysiwygHandle } from "@/components/editor/JoditWysiwyg";
import MediaPickerModal, { MediaItem } from "@/components/admin/MediaPickerModal";
import { adminFetch, BACKEND_URL } from "@/lib/adminApi";

type FaqItem = {
  id?: number;
  question: string;
  answer: string;
  order?: number;
};

type ArticleTranslationRef = {
  id: number;
  titleFa: string;
  titleEn: string;
  slug: string;
  language: string;
  published: boolean;
};

type Article = {
  id: number;
  titleFa: string;
  titleEn: string;
  slug: string;
  language: "fa" | "en";
  categoryFa: string;
  categoryEn: string;
  excerptFa: string;
  excerptEn: string;
  contentFa: string;
  contentEn: string;
  readTimeFa: string;
  readTimeEn: string;
  imageUrl: string;
  author: string;
  published: boolean;
  translationId?: number | null;
  relatedTranslation?: ArticleTranslationRef | null;
  faqs?: FaqItem[];
  metaTitleFa?: string;
  metaTitleEn?: string;
  metaDescFa?: string;
  metaDescEn?: string;
  keywordsFa?: string;
  keywordsEn?: string;
  canonicalUrl?: string;
  ogImage?: string;
  createdAt: string;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "fa" | "en" | "published" | "draft">("all");

  const editorRef = useRef<JoditWysiwygHandle>(null);

  // Media Picker State
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "content">("cover");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    language: "fa" as "fa" | "en",
    translationId: null as number | null,
    category: "آموزش سئو",
    readTime: "۵ دقیقه مطالعه",
    excerpt: "",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    author: "آن‌ساپورت",
    published: true,
    metaTitle: "",
    metaDesc: "",
    keywords: "",
    canonicalUrl: "",
    ogImage: "",
  });

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [adminUser, setAdminUser] = useState("ادمین سیستم (آن‌ساپ)");

  const loadArticles = () => {
    setLoading(true);
    adminFetch("/api/v1/articles", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArticles(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user") || localStorage.getItem("adminUser");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.name || parsed.username || parsed.email) {
            setAdminUser(parsed.name || parsed.username || parsed.email);
          }
        } catch {
          if (typeof storedUser === "string" && storedUser.trim() !== "") {
            setAdminUser(storedUser);
          }
        }
      }
    }
  }, []);

  const handleMediaSelect = (media: MediaItem) => {
    const fullMediaUrl = media.url.startsWith("http")
      ? media.url
      : `${BACKEND_URL}${media.url}`;

    if (mediaPickerTarget === "cover") {
      setFormData((prev) => ({
        ...prev,
        imageUrl: fullMediaUrl,
        ogImage: prev.ogImage || fullMediaUrl,
      }));
    } else {
      // Inline insertion exactly at cursor position with preserved selection
      editorRef.current?.insertImage(fullMediaUrl, media.alt || formData.title);
    }
    setMediaPickerOpen(false);
  };

  const handleCloseMediaPicker = () => {
    if (mediaPickerTarget === "content") {
      editorRef.current?.restoreSelection();
    }
    setMediaPickerOpen(false);
  };

  const handleOpenContentMediaPicker = useCallback(() => {
    setMediaPickerTarget("content");
    setMediaPickerOpen(true);
  }, []);

  const handleOpenForm = (article?: Article, initialLanguage: "fa" | "en" = "fa") => {
    if (article) {
      setEditingId(article.id);
      const isEnglish = article.language === "en";
      const initialTransId = article.translationId || article.relatedTranslation?.id || null;

      setFormData({
        title: isEnglish ? (article.titleEn || article.titleFa) : (article.titleFa || article.titleEn),
        slug: article.slug || "",
        language: isEnglish ? "en" : "fa",
        translationId: initialTransId,
        category: isEnglish ? (article.categoryEn || "SEO Tutorial") : (article.categoryFa || "آموزش سئو"),
        readTime: isEnglish ? (article.readTimeEn || "5 min read") : (article.readTimeFa || "۵ دقیقه مطالعه"),
        excerpt: isEnglish ? (article.excerptEn || article.excerptFa) : (article.excerptFa || article.excerptEn),
        content: isEnglish ? (article.contentEn || article.contentFa) : (article.contentFa || article.contentEn),
        imageUrl: article.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        author: article.author || adminUser,
        published: article.published,
        metaTitle: isEnglish ? (article.metaTitleEn || "") : (article.metaTitleFa || ""),
        metaDesc: isEnglish ? (article.metaDescEn || "") : (article.metaDescFa || ""),
        keywords: isEnglish ? (article.keywordsEn || "") : (article.keywordsFa || ""),
        canonicalUrl: article.canonicalUrl || "",
        ogImage: article.ogImage || article.imageUrl || "",
      });

      setFaqs(Array.isArray(article.faqs) ? article.faqs.map((f, i) => ({ ...f, order: f.order ?? i })) : []);
    } else {
      setEditingId(null);
      const isEnglish = initialLanguage === "en";
      setFormData({
        title: "",
        slug: "",
        language: initialLanguage,
        translationId: null,
        category: isEnglish ? "SEO Tutorial" : "آموزش سئو",
        readTime: isEnglish ? "5 min read" : "۵ دقیقه مطالعه",
        excerpt: "",
        content: "",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        author: adminUser,
        published: true,
        metaTitle: "",
        metaDesc: "",
        keywords: "",
        canonicalUrl: "",
        ogImage: "",
      });
      setFaqs([]);
    }
    setViewMode("form");
  };

  const handleSaveWithStatus = async (targetPublishedStatus: boolean) => {
    if (!formData.title.trim()) {
      alert("لطفاً عنوان مقاله را وارد نمایید.");
      return;
    }

    const endpoint = editingId ? `/api/v1/articles/${editingId}` : `/api/v1/articles`;
    const method = editingId ? "PUT" : "POST";

    const isEnglish = formData.language === "en";
    const liveContent = editorRef.current?.getEditor()?.value ?? formData.content;
    const payload = {
      titleFa: isEnglish ? "" : formData.title,
      titleEn: isEnglish ? formData.title : "",
      slug: formData.slug.trim(),
      language: formData.language,
      translationId: formData.translationId || null,
      categoryFa: isEnglish ? "آموزش سئو" : formData.category,
      categoryEn: isEnglish ? formData.category : "SEO Tutorial",
      excerptFa: isEnglish ? "" : formData.excerpt,
      excerptEn: isEnglish ? formData.excerpt : "",
      contentFa: isEnglish ? "" : liveContent,
      contentEn: isEnglish ? liveContent : "",
      readTimeFa: isEnglish ? "۵ دقیقه مطالعه" : formData.readTime,
      readTimeEn: isEnglish ? formData.readTime : "5 min read",
      imageUrl: formData.imageUrl,
      author: formData.author,
      published: targetPublishedStatus,
      metaTitleFa: isEnglish ? "" : formData.metaTitle,
      metaTitleEn: isEnglish ? formData.metaTitle : "",
      metaDescFa: isEnglish ? "" : formData.metaDesc,
      metaDescEn: isEnglish ? formData.metaDesc : "",
      keywordsFa: isEnglish ? "" : formData.keywords,
      keywordsEn: isEnglish ? formData.keywords : "",
      canonicalUrl: formData.canonicalUrl,
      ogImage: formData.ogImage || formData.imageUrl,
      faqs: faqs
        .filter((f) => f.question.trim() || f.answer.trim())
        .map((f, idx) => ({
          question: f.question.trim(),
          answer: f.answer.trim(),
          order: idx,
        })),
    };

    try {
      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setViewMode("list");
        loadArticles();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "خطا در ذخیره‌سازی مقاله!");
      }
    } catch {
      alert("خطای ارتباط با سرور");
    }
  };

  const handleTogglePublishStatus = async (article: Article) => {
    const res = await adminFetch(`/api/v1/articles/${article.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !article.published }),
    });

    if (res.ok) loadArticles();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این مقاله اطمینان دارید؟")) return;
    const res = await adminFetch(`/api/v1/articles/${id}`, {
      method: "DELETE",
    });
    if (res.ok) loadArticles();
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "", order: prev.length }]);
  };

  const handleUpdateFaq = (index: number, field: "question" | "answer", val: string) => {
    setFaqs((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, order: idx })));
  };

  const handleMoveFaq = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= faqs.length) return;
    setFaqs((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((f, i) => ({ ...f, order: i }));
    });
  };

  // Filter candidates for Related Translation:
  // Must be in the other language, and cannot be the article itself!
  const translationCandidates = articles.filter((a) => {
    if (editingId && a.id === editingId) return false;
    return formData.language === "fa" ? a.language === "en" : a.language === "fa";
  });

  const linkedTranslationArticle = articles.find((a) => a.id === formData.translationId);

  // Filtered articles for list view
  const filteredArticles = articles.filter((art) => {
    if (activeFilter === "fa") return art.language !== "en";
    if (activeFilter === "en") return art.language === "en";
    if (activeFilter === "published") return art.published;
    if (activeFilter === "draft") return !art.published;
    return true;
  });

  const isFormEn = formData.language === "en";

  // =========================================================================
  // FORM VIEW
  // =========================================================================
  if (viewMode === "form") {
    return (
      <div className="space-y-8 w-full" dir="rtl">
        {/* Navigation Bar */}
        <div className="p-6 rounded-xl bg-panel border border-foreground/10 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("list")}
              className="p-2.5 rounded-xl bg-raised border border-primary/20 text-mint hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>بازگشت به لیست مقالات</span>
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>{editingId ? (isFormEn ? "Edit English Article" : "ویرایش مقاله فارسی") : (isFormEn ? "Create English Article" : "نوشتن مقاله جدید")}</span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${isFormEn ? "bg-blue-500/10 text-blue-300 border-blue-500/30" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"}`}>
                {isFormEn ? "🇬🇧 انگلیسی (EN)" : "🇮🇷 فارسی (FA)"}
              </span>
            </h1>
          </div>

          {/* Language Switcher for creating/editing */}
          <div className="flex items-center gap-2 bg-raised/70 p-1.5 rounded-xl border border-foreground/10">
            <span className="text-[11px] font-bold text-foreground/60 px-2">زبان مقاله:</span>
            <button
              type="button"
              onClick={() => {
                if (formData.language !== "fa") {
                  setFormData((prev) => ({
                    ...prev,
                    language: "fa",
                    translationId: null,
                    category: prev.category === "SEO Tutorial" ? "آموزش سئو" : prev.category,
                    readTime: prev.readTime === "5 min read" ? "۵ دقیقه مطالعه" : prev.readTime,
                  }));
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                formData.language === "fa"
                  ? "bg-mint text-ink shadow-sm"
                  : "text-foreground/70 hover:text-white"
              }`}
            >
              🇮🇷 فارسی
            </button>
            <button
              type="button"
              onClick={() => {
                if (formData.language !== "en") {
                  setFormData((prev) => ({
                    ...prev,
                    language: "en",
                    translationId: null,
                    category: prev.category === "آموزش سئو" ? "SEO Tutorial" : prev.category,
                    readTime: prev.readTime === "۵ دقیقه مطالعه" ? "5 min read" : prev.readTime,
                  }));
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                formData.language === "en"
                  ? "bg-mint text-ink shadow-sm"
                  : "text-foreground/70 hover:text-white"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Full Width Admin Form Container */}
        <form onSubmit={(e) => e.preventDefault()} className="bg-panel border border-foreground/10 rounded-xl p-8 space-y-10 shadow-md w-full">

          {/* Section 1: Basic Information */}
          <div className="space-y-6">
            <h2 className="text-base font-bold text-mint pb-2 border-b border-foreground/10 flex items-center justify-between">
              <span>۱. مشخصات اصلی مقاله</span>
              <span className="text-xs font-normal text-foreground/50">
                {isFormEn ? "Enter English article details" : "اطلاعات به زبان فارسی وارد شوند"}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div dir={isFormEn ? "ltr" : "rtl"}>
                <label htmlFor="article-title-input" className="block text-xs font-semibold text-mint mb-2">
                  {isFormEn ? "Article Title *" : "عنوان اصلی مقاله *"}
                </label>
                <input
                  id="article-title-input"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isFormEn ? "e.g. Top 10 Modern SEO Strategies in 2026..." : "مثلاً: ۱۰ استراتژی برتر سئو در سال ۲۰۲۶"}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label htmlFor="article-slug-input" className="block text-xs font-semibold text-mint mb-2">
                  شناسه یکتا در URL (Slug) *
                </label>
                <input
                  id="article-slug-input"
                  name="slug"
                  type="text"
                  required
                  dir="ltr"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="top-seo-strategies-2026"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-mint font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="article-category-input" className="block text-xs font-semibold text-mint mb-2">
                  {isFormEn ? "Category" : "دسته‌بندی"}
                </label>
                <input
                  id="article-category-input"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder={isFormEn ? "SEO Tutorial / News" : "آموزش سئو / دیجیتال مارکتینگ"}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label htmlFor="article-readtime-input" className="block text-xs font-semibold text-mint mb-2">
                  {isFormEn ? "Estimated Read Time" : "زمان مطالعه"}
                </label>
                <input
                  id="article-readtime-input"
                  name="readTime"
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  placeholder={isFormEn ? "5 min read" : "۵ دقیقه مطالعه"}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label htmlFor="article-author-input" className="block text-xs font-semibold text-mint mb-2">
                  {isFormEn ? "Author" : "نام نویسنده"}
                </label>
                <input
                  id="article-author-input"
                  name="author"
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="نام نویسنده..."
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-mint"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Related Translation Linking */}
          <div className="space-y-4 p-6 rounded-xl bg-raised/40 border border-foreground/10">
            <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <span className="text-mint font-bold text-base">🌐 ۲. ترجمه مرتبط (Related Translation)</span>
                <span className="text-[11px] text-foreground/50 bg-background px-2 py-0.5 rounded border border-foreground/10">
                  اختیاری (Optional 1-to-1)
                </span>
              </div>
              <span className="text-xs text-foreground/50">
                {isFormEn ? "Link to corresponding Persian article" : "پیوند به نسخه انگلیسی این مقاله"}
              </span>
            </div>

            <p className="text-xs text-foreground/70 leading-6">
              هر مقاله به صورت کاملاً مستقل ایجاد و منتشر می‌شود. در صورت تمایل می‌توانید این مقاله را به نسخه متناظر آن در زبان دیگر ({isFormEn ? "فارسی" : "انگلیسی"}) پیوند دهید تا کاربران در سایت بتوانند بین دو زبان جابجا شوند.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label htmlFor="article-translation-select" className="block text-xs font-semibold text-mint mb-2">
                  انتخاب مقاله مرتبط از میان مقالات {isFormEn ? "فارسی" : "انگلیسی"}:
                </label>
                <select
                  id="article-translation-select"
                  name="translationId"
                  value={formData.translationId || ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null;
                    setFormData({ ...formData, translationId: val });
                  }}
                  className="w-full bg-raised border border-foreground/15 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-mint"
                >
                  <option value="">-- بدون ترجمه مرتبط (مقاله مستقل) --</option>
                  {translationCandidates.map((cand) => (
                    <option key={cand.id} value={cand.id}>
                      [{cand.language.toUpperCase()}] #{cand.id} - {cand.language === "en" ? cand.titleEn || cand.slug : cand.titleFa || cand.slug} ({cand.slug})
                    </option>
                  ))}
                </select>
              </div>

              {linkedTranslationArticle ? (
                <div className="p-4 rounded-xl bg-mint/10 border border-mint/30 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-mint uppercase tracking-wider block">
                      ترجمه متصل‌شده فعلی:
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {linkedTranslationArticle.language === "en" ? linkedTranslationArticle.titleEn : linkedTranslationArticle.titleFa}
                    </h4>
                    <span className="text-[11px] text-foreground/60 font-mono block">
                      /{linkedTranslationArticle.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenForm(linkedTranslationArticle)}
                      className="px-3 py-1.5 rounded-lg bg-mint text-ink text-xs font-bold hover:scale-105 transition-all"
                    >
                      ویرایش ترجمه
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, translationId: null })}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold"
                      title="حذف پیوند ترجمه"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-background/50 border border-foreground/10 text-xs text-foreground/40 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-foreground/30" />
                  <span>این مقاله در حال حاضر پیوند ترجمه فعالی ندارد (مستقل).</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Image & Excerpt */}
          <div className="space-y-6">
            <h2 className="text-base font-bold text-mint pb-2 border-b border-foreground/10 flex items-center gap-2">
              <span>۳. چکیده کوتاه و تصویر کاور اصلی</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div dir={isFormEn ? "ltr" : "rtl"}>
                <label htmlFor="article-excerpt-input" className="block text-xs font-semibold text-mint mb-2">
                  {isFormEn ? "Article Excerpt / Summary" : "چکیده و خلاصه مقاله"}
                </label>
                <textarea
                  id="article-excerpt-input"
                  name="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder={isFormEn ? "Short summary for article card preview..." : "خلاصه‌ای کوتاه برای نمایش روی کارت مقاله..."}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl p-4 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="article-image-url-input" className="block text-xs font-semibold text-mint">تصویر کاور اصلی (Cover Image URL)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget("cover");
                      setMediaPickerOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-raised/50 border border-primary/20 text-mint hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>انتخاب از کتابخانه رسانه</span>
                  </button>
                </div>
                <input
                  id="article-image-url-input"
                  name="imageUrl"
                  type="text"
                  dir="ltr"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none font-mono focus:border-mint"
                />
                {formData.imageUrl && (
                  <div className="mt-2.5 h-24 w-40 rounded-lg overflow-hidden border border-foreground/10 bg-raised relative">
                    <img src={formData.imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Jodit Content Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
              <h2 className="text-base font-bold text-mint flex items-center gap-2">
                <span>۴. متن و محتوای کامل مقاله (ویرایشگر پیشرفته)</span>
              </h2>
              <span className="text-xs text-foreground/50">
                درج تصویر در محل کرسر، لینک‌دهی با تب جدید، استایل‌های غنی
              </span>
            </div>

            <div dir={isFormEn ? "ltr" : "rtl"}>
              <JoditWysiwyg
                ref={editorRef}
                value={formData.content}
                onChange={(newContent) => setFormData((prev) => ({ ...prev, content: newContent }))}
                placeholder={isFormEn ? "Type the full English article content here..." : "محتوای کامل مقاله را اینجا وارد نمایید..."}
                direction={isFormEn ? "ltr" : "rtl"}
                onOpenMediaPicker={handleOpenContentMediaPicker}
              />
            </div>
          </div>

          {/* Section 5: FAQ Management (پرسش و پاسخ‌های متداول مقاله) */}
          <div className="space-y-6 p-6 rounded-xl bg-raised/30 border border-foreground/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-foreground/10">
              <div>
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <span>❓ ۵. پرسش و پاسخ‌های متداول مقاله (FAQ)</span>
                  <span className="text-[11px] text-foreground/50 bg-background px-2 py-0.5 rounded border border-foreground/10">
                    اختیاری
                  </span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  {isFormEn
                    ? "Add question & answer pairs for this article. Displays as an accordion and generates valid FAQPage JSON-LD schema."
                    : "پرسش و پاسخ‌های متداول این مقاله را اضافه نمایید. به صورت آکاردئون جذاب در انتهای مقاله و با اسکیما استاندارد FAQPage گوگل نمایش می‌یابد."}
                </p>
              </div>

              <button
                type="button"
                id="btn-add-faq"
                onClick={handleAddFaq}
                className="px-4 py-2 rounded-xl bg-mint/10 border border-mint/30 text-mint hover:bg-mint hover:text-ink font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{isFormEn ? "Add FAQ Item" : "افزودن پرسش جدید"}</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-background/40 border border-dashed border-foreground/10 text-xs text-foreground/40">
                {isFormEn
                  ? "No FAQ items added yet for this article. Click \"Add FAQ Item\" above to create one."
                  : "هنوز هیچ پرسش و پاسخی برای این مقاله ثبت نشده است. برای ایجاد روی «افزودن پرسش جدید» کلیک فرمایید."}
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={faq.id || index}
                    className="p-5 rounded-xl bg-panel border border-foreground/15 space-y-4 shadow-sm"
                    dir={isFormEn ? "ltr" : "rtl"}
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-raised text-mint text-xs font-mono font-bold border border-foreground/10">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {isFormEn ? `Question ${index + 1}` : `پرسش شماره ${index + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveFaq(index, "up")}
                          className="p-1.5 rounded-lg bg-raised text-foreground/70 hover:text-mint disabled:opacity-30 disabled:pointer-events-none transition-all"
                          title="انتقال به بالا"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === faqs.length - 1}
                          onClick={() => handleMoveFaq(index, "down")}
                          className="p-1.5 rounded-lg bg-raised text-foreground/70 hover:text-mint disabled:opacity-30 disabled:pointer-events-none transition-all"
                          title="انتقال به پایین"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Delete FAQ */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(index)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all mr-2"
                          title="حذف این پرسش"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-mint mb-1">
                          {isFormEn ? "Question Text *" : "متن پرسش *"}
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleUpdateFaq(index, "question", e.target.value)}
                          placeholder={isFormEn ? "e.g. How does technical SEO improve ROI?" : "مثلاً: سئو تکنیکال چقدر بر فروش و بازگشت سرمایه اثر دارد؟"}
                          className="faq-question-input w-full bg-raised border border-foreground/10 text-xs text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-mint"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-mint mb-1">
                          {isFormEn ? "Answer Text *" : "متن پاسخ *"}
                        </label>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => handleUpdateFaq(index, "answer", e.target.value)}
                          placeholder={isFormEn ? "Provide a clear and concise answer..." : "پاسخ کامل و شفاف را اینجا بنویسید..."}
                          className="faq-answer-input w-full bg-raised border border-foreground/10 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-mint"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Advanced SEO Settings */}
          <div className="space-y-6 p-6 rounded-lg bg-background border border-[#1b3d33]" dir={isFormEn ? "ltr" : "rtl"}>
            <h2 className="text-base font-bold text-amber-400 pb-2 border-b border-[#1c4237] flex items-center gap-2">
              <span>🔍 ۶. تنظیمات سئو و متاتگ‌ها (SEO Meta & OpenGraph)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">
                  {isFormEn ? "SEO Meta Title" : "عنوان متاسئو (Meta Title)"}
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder={isFormEn ? "50-60 characters title for Google snippet..." : "عنوان ۵۰ الی ۶۰ کاراکتری برای نتایج گوگل..."}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">
                  {isFormEn ? "Keywords (comma separated)" : "کلمات کلیدی (با ویرگول جدا کنید)"}
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder={isFormEn ? "SEO, web design, digital marketing" : "سئو ۲۰۲۶, آموزش سئو, طراحی سایت, دیجیتال مارکتینگ"}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-mint"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                {isFormEn ? "SEO Meta Description" : "توضیحات متاسئو (Meta Description)"}
              </label>
              <textarea
                rows={3}
                value={formData.metaDesc}
                onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                placeholder={isFormEn ? "150-160 characters description for search snippet..." : "توضیحات ۱۵۰ الی ۱۶۰ کاراکتری جهت نمایش زیر لینک گوگل..."}
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl p-4 focus:outline-none focus:border-mint"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">
                  آدرس کانونیکال (Canonical URL - اختیاری)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  placeholder="https://onsupp.ir/blog/article-slug"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none font-mono focus:border-mint"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">
                  تصویر شبکه‌های اجتماعی (OG Image URL)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.ogImage}
                  onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none font-mono focus:border-mint"
                />
              </div>
            </div>
          </div>

          {/* Form Actions with Distinct Publishing Buttons */}
          <div className="pt-6 border-t border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                formData.published
                  ? "bg-mint/10 text-mint border-mint/20"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}>
                {formData.published ? "وضعیت فعلی: منتشرشده (Public)" : "وضعیت فعلی: پیش‌نویس (Draft)"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="px-5 py-3 rounded-lg bg-raised text-mint font-bold text-xs hover:text-white"
              >
                انصراف
              </button>

              {/* Button 1: Save as Draft */}
              <button
                type="button"
                id="btn-save-draft"
                onClick={() => handleSaveWithStatus(false)}
                className="px-5 py-3 rounded-lg bg-[#1c3a30] text-amber-300 font-bold text-xs border border-[#2c594a] hover:bg-[#254d3f] transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>ذخیره به عنوان پیش‌نویس</span>
              </button>

              {/* Button 2: Publish / Update Button */}
              {editingId && formData.published ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveWithStatus(false)}
                    className="px-5 py-3 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all flex items-center gap-2"
                  >
                    <span>تبدیل به پیش‌نویس</span>
                  </button>

                  <button
                    type="button"
                    id="btn-save-article"
                    onClick={() => handleSaveWithStatus(true)}
                    className="px-6 py-3.5 rounded-lg bg-lime text-ink shadow-[0_0_20px_rgba(183,255,0,0.3)] font-black text-xs border border-mint shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>بروزرسانی تغییرات مقاله</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  id="btn-save-article"
                  onClick={() => handleSaveWithStatus(true)}
                  className="px-6 py-3.5 rounded-lg bg-lime text-ink shadow-[0_0_20px_rgba(183,255,0,0.3)] font-black text-xs border border-mint shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>انتشار مقاله</span>
                </button>
              )}
            </div>
          </div>

          <MediaPickerModal
            open={mediaPickerOpen}
            onClose={handleCloseMediaPicker}
            onSelect={handleMediaSelect}
          />
        </form>
      </div>
    );
  }

  // =========================================================================
  // LIST VIEW
  // =========================================================================
  return (
    <div className="space-y-8 w-full" dir="rtl">
      {/* Banner */}
      <div className="p-8 rounded-xl bg-gradient-to-r from-panel via-panel to-background border border-foreground/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-raised/50 border border-primary/20 text-mint text-xs font-bold">
            وبلاگ و اخبار سازمان
          </div>
          <h1 className="text-3xl font-black text-white">مدیریت مقالات و اخبار</h1>
          <p className="text-sm text-mint">
            مدیریت مستقل مقالات فارسی و انگلیسی، پیوند اختیاری ترجمه‌ها، پرسش و پاسخ‌ها (FAQ) و انتشار.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-create-en-article"
            onClick={() => handleOpenForm(undefined, "en")}
            className="px-4 py-3 rounded-lg bg-blue-600/20 text-blue-300 font-bold text-xs border border-blue-500/30 hover:bg-blue-600/30 transition-all flex items-center gap-2"
          >
            <span>+ مقاله انگلیسی (EN)</span>
          </button>
          <button
            id="btn-create-fa-article"
            onClick={() => handleOpenForm(undefined, "fa")}
            className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-white font-bold text-sm border border-primary/40 hover:scale-105 shadow-lg transition-all"
          >
            + نوشتن مقاله فارسی (FA)
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            activeFilter === "all"
              ? "bg-mint text-ink border-mint shadow-sm"
              : "bg-panel text-foreground/70 border-foreground/10 hover:text-white"
          }`}
        >
          همه مقالات ({articles.length})
        </button>

        <button
          onClick={() => setActiveFilter("fa")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            activeFilter === "fa"
              ? "bg-emerald-500 text-ink border-emerald-400 font-black shadow-sm"
              : "bg-panel text-foreground/70 border-foreground/10 hover:text-white"
          }`}
        >
          <span>🇮🇷 فقط فارسی</span>
          <span className="opacity-80">({articles.filter((a) => a.language !== "en").length})</span>
        </button>

        <button
          onClick={() => setActiveFilter("en")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            activeFilter === "en"
              ? "bg-blue-500 text-white border-blue-400 font-black shadow-sm"
              : "bg-panel text-foreground/70 border-foreground/10 hover:text-white"
          }`}
        >
          <span>🇬🇧 فقط انگلیسی</span>
          <span className="opacity-80">({articles.filter((a) => a.language === "en").length})</span>
        </button>

        <button
          onClick={() => setActiveFilter("published")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            activeFilter === "published"
              ? "bg-raised text-mint border-mint/40"
              : "bg-panel text-foreground/70 border-foreground/10 hover:text-white"
          }`}
        >
          منتشرشده ({articles.filter((a) => a.published).length})
        </button>

        <button
          onClick={() => setActiveFilter("draft")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            activeFilter === "draft"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-panel text-foreground/70 border-foreground/10 hover:text-white"
          }`}
        >
          پیش‌نویس ({articles.filter((a) => !a.published).length})
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-16 text-mint">در حال دریافت مقالات...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-panel rounded-xl border border-foreground/10 text-mint">
          هیچ مقاله‌ای در این دسته‌بندی یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const isEnglish = art.language === "en";
            const displayTitle = isEnglish ? (art.titleEn || art.titleFa) : (art.titleFa || art.titleEn);
            const displayExcerpt = isEnglish ? (art.excerptEn || art.excerptFa) : (art.excerptFa || art.excerptEn);
            const displayCategory = isEnglish ? (art.categoryEn || "SEO") : (art.categoryFa || "سئو");

            return (
              <div
                key={art.id}
                className={`bg-panel border rounded-xl overflow-hidden flex flex-col justify-between space-y-4 shadow-md transition-all ${
                  art.published ? "border-foreground/10" : "border-amber-500/40 bg-[#121a15]"
                }`}
              >
                <div className="space-y-4">
                  <div className="h-48 w-full overflow-hidden bg-raised relative">
                    <img
                      src={art.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"}
                      alt={displayTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isEnglish ? "bg-blue-600/90 text-white border-blue-400" : "bg-emerald-700/90 text-white border-emerald-400"}`}>
                        {isEnglish ? "🇬🇧 EN" : "🇮🇷 FA"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/70 text-mint text-[10px] font-bold border border-white/10">
                        {displayCategory}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        art.published
                          ? "bg-mint/10 text-white border-emerald-400"
                          : "bg-amber-500/90 text-black border-amber-300"
                      }`}>
                        {art.published ? "منتشرشده" : "پیش‌نویس"}
                      </span>
                    </div>

                    {/* FAQ & Translation Indicators */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      {art.relatedTranslation && (
                        <span
                          className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-bold text-mint border border-mint/30 flex items-center gap-1"
                          title={`ترجمه متصل: ${art.relatedTranslation.slug}`}
                        >
                          <span>🌐 ترجمه:</span>
                          <span className="font-mono">{art.relatedTranslation.language.toUpperCase()}</span>
                        </span>
                      )}
                      {art.faqs && art.faqs.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/80 text-black text-[10px] font-bold">
                          {art.faqs.length} FAQ
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-5 space-y-2">
                    <h3 className="font-bold text-white text-base line-clamp-2 leading-7">
                      {displayTitle}
                    </h3>
                    <p className="text-xs text-mint line-clamp-2 leading-5">
                      {displayExcerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-foreground/10 flex items-center justify-between">
                  <button
                    onClick={() => handleTogglePublishStatus(art)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      art.published
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                        : "bg-mint/10 text-mint border-mint/20 hover:scale-105/10"
                    }`}
                    title={art.published ? "تبدیل به پیش‌نویس" : "منتشر کردن مقاله"}
                  >
                    {art.published ? "پیش‌نویس کردن" : "منتشر کردن"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenForm(art)}
                      className="px-3 py-1.5 rounded-xl bg-raised border border-primary/20 text-mint text-xs font-bold hover:bg-[#1f4236]"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                      title="حذف مقاله"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Media Picker Modal */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={handleCloseMediaPicker}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
