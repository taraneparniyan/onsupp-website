"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { adminFetch, BACKEND_URL } from "@/lib/adminApi";

type MediaItem = {
  id: number;
  url: string;
  alt: string;
  filename: string;
  createdAt: string;
};

type UploadingFile = {
  id: string;
  file: File;
  alt: string;
  previewUrl: string;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  errorMessage?: string;
  createdItem?: MediaItem;
};

const MAX_BATCH_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function toPersianDigits(n: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${toPersianDigits(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${toPersianDigits((bytes / 1024).toFixed(1))} کیلوبایت`;
  return `${toPersianDigits((bytes / (1024 * 1024)).toFixed(2))} مگابایت`;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/media", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("[media] Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [queue]);

  const validateFiles = (incomingFiles: File[]): { valid: File[]; error?: string } => {
    setGlobalError(null);

    if (incomingFiles.length === 0) {
      return { valid: [] };
    }

    const currentCount = queue.length;
    if (currentCount + incomingFiles.length > MAX_BATCH_FILES) {
      return {
        valid: [],
        error: `شما نمی‌توانید بیش از ۱۰ تصویر را در یک نوبت انتخاب کنید. (تعداد فعلی: ${toPersianDigits(currentCount)}، انتخاب‌شده: ${toPersianDigits(incomingFiles.length)})`,
      };
    }

    let cumulativeSize = queue.reduce((sum, item) => sum + item.file.size, 0);
    const valid: File[] = [];

    for (const f of incomingFiles) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(f.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
        return {
          valid: [],
          error: `فرمت فایل "${f.name}" مجاز نیست. تنها فرمت‌های jpg, jpeg, png, webp, gif پشتیبانی می‌شوند.`,
        };
      }

      if (f.size > MAX_FILE_SIZE) {
        return {
          valid: [],
          error: `حجم فایل "${f.name}" (${formatBytes(f.size)}) بیش از سقف مجاز ۵ مگابایت است.`,
        };
      }

      cumulativeSize += f.size;
      if (cumulativeSize > MAX_BATCH_SIZE) {
        return {
          valid: [],
          error: `مجموع حجم تصاویر انتخابی بیش از سقف ۵۰ مگابایت است.`,
        };
      }

      valid.push(f);
    }

    return { valid };
  };

  const handleFilesSelected = (filesList: FileList | null) => {
    if (!filesList || isUploading) return;
    const incoming = Array.from(filesList);
    const { valid, error } = validateFiles(incoming);

    if (error) {
      setGlobalError(error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const newEntries: UploadingFile[] = valid.map((f) => {
      const cleanName = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
      return {
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        alt: cleanName || "تصویر رسانه آن‌ساپ",
        previewUrl: URL.createObjectURL(f),
        status: "idle",
        progress: 0,
      };
    });

    setQueue((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFromQueue = (id: string) => {
    if (isUploading) return;
    setQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleAltChange = (id: string, newAlt: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, alt: newAlt } : item))
    );
  };

  const startBatchUpload = async () => {
    const pendingItems = queue.filter((item) => item.status !== "success");
    if (pendingItems.length === 0 || isUploading) return;

    setIsUploading(true);
    setGlobalError(null);
    setOverallProgress(0);

    const formData = new FormData();
    const alts: string[] = [];

    pendingItems.forEach((item) => {
      formData.append("files", item.file);
      alts.push(item.alt.trim() || item.file.name);
    });
    formData.append("alts", JSON.stringify(alts));

    // Mark as uploading
    setQueue((prev) =>
      prev.map((item) =>
        item.status !== "success" ? { ...item, status: "uploading", progress: 20 } : item
      )
    );

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BACKEND_URL}/api/v1/media/batch-upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setOverallProgress(percent);
        setQueue((prev) =>
          prev.map((item) =>
            item.status === "uploading" ? { ...item, progress: percent } : item
          )
        );
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      try {
        const responseData = JSON.parse(xhr.responseText || "{}");

        if (xhr.status === 401) {
          setGlobalError("نشست کاربری شما منقضی شده است. فایل‌ها برای جلوگیری از پاک شدن حفظ شدند. لطفاً در پنجره جدیدی مجدداً وارد شوید.");
          setQueue((prev) =>
            prev.map((item) =>
              item.status === "uploading" ? { ...item, status: "idle", progress: 0 } : item
            )
          );
          return;
        }

        if (xhr.status === 201 || xhr.status === 207) {
          const resultsMap = new Map<string, { success: boolean; item?: MediaItem; error?: string }>();
          if (Array.isArray(responseData.results)) {
            responseData.results.forEach((r: any) => {
              resultsMap.set(r.filename, r);
            });
          }

          // Update individual file states
          setQueue((prev) =>
            prev.map((item) => {
              const res = resultsMap.get(item.file.name);
              if (res?.success) {
                return { ...item, status: "success", progress: 100, createdItem: res.item };
              } else if (res && !res.success) {
                return { ...item, status: "error", errorMessage: res.error || "خطا در آپلود این فایل" };
              }
              return item;
            })
          );

          loadMedia();

          if (responseData.summary?.failed > 0) {
            setGlobalError(
              `آپلود گروهی پایان یافت: ${toPersianDigits(responseData.summary.succeeded)} موفق، ${toPersianDigits(responseData.summary.failed)} با خطا مواجه شد.`
            );
          } else {
            // All succeeded, clear queue after short delay
            setTimeout(() => {
              setQueue([]);
            }, 1500);
          }
        } else {
          setGlobalError(responseData.error || "آپلود تصاویر با خطا مواجه شد.");
          setQueue((prev) =>
            prev.map((item) =>
              item.status === "uploading" ? { ...item, status: "error", errorMessage: responseData.error } : item
            )
          );
        }
      } catch {
        setGlobalError("پاسخ دریافتی از سرور نامعتبر بود.");
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setGlobalError("خطای اتصال شبکه هنگام ارسال فایل‌ها به سرور.");
      setQueue((prev) =>
        prev.map((item) =>
          item.status === "uploading" ? { ...item, status: "error", errorMessage: "خطای ارتباط با سرور" } : item
        )
      );
    };

    xhr.send(formData);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این فایل رسانه از سرور مطمئن هستید؟")) return;
    try {
      const res = await adminFetch(`/api/v1/media/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "خطا در حذف تصویر");
      }
    } catch {
      alert("خطای ارتباط با سرور هنگام حذف");
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter(
    (item) =>
      item.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Page Title & M3 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-foreground/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-panel border border-foreground/10 text-mint shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <span>کتابخانه و مدیریت رسانه‌ها</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-foreground/60">
            آپلود گروهی و نگهداری تصاویر وب‌سایت آن‌ساپ (تا ۱۰ تصویر در هر بارگذاری)
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl bg-panel border border-foreground/10 text-xs font-semibold text-mint shadow-sm">
          <span>مجموع رسانه‌ها:</span>
          <span className="font-bold text-foreground text-sm font-sans">{toPersianDigits(items.length)}</span>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs sm:text-sm animate-fadeIn"
        >
          <svg className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 leading-relaxed">{globalError}</div>
          <button
            type="button"
            onClick={() => setGlobalError(null)}
            className="text-rose-400 hover:text-rose-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Section 1: M3 Drag & Drop Batch Upload Surface */}
      <section className="p-6 sm:p-8 rounded-3xl bg-panel border border-foreground/10 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>بارگذاری تصاویر جدید (حداکثر ۱۰ فایل همزمان)</span>
          </h2>
          <span className="text-xs text-foreground/50">
            حداکثر ۵ مگابایت برای هر فایل | سقف دسته: ۵۰ مگابایت
          </span>
        </div>

        {/* Dropzone Box */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            isUploading
              ? "opacity-60 pointer-events-none border-foreground/10 bg-raised/30"
              : "border-foreground/15 hover:border-mint/50 bg-raised/40 hover:bg-raised/70"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
            disabled={isUploading}
          />

          <div className="w-16 h-16 rounded-2xl bg-panel border border-foreground/10 flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-8 h-8 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="text-sm sm:text-base font-bold text-foreground">
            تصاویر را به اینجا بکشید یا برای انتخاب فایل کلیک کنید
          </p>
          <p className="mt-1 text-xs text-foreground/50">
            فرمت‌های مجاز: JPG, PNG, WEBP, GIF (حداکثر ۱۰ فایل در یک درخواست)
          </p>
        </div>

        {/* Staging Queue List */}
        {queue.length > 0 && (
          <div className="mt-6 space-y-4 pt-6 border-t border-foreground/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>فهرست فایل‌های آماده آپلود</span>
                <span className="px-2 py-0.5 rounded-full bg-mint/20 text-mint text-xs">
                  {toPersianDigits(queue.length)} فایل
                </span>
              </span>

              {!isUploading && (
                <button
                  type="button"
                  onClick={() => setQueue([])}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  انصراف و پاکسازی همه
                </button>
              )}
            </div>

            {/* Individual Files in Queue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    item.status === "success"
                      ? "bg-emerald-950/30 border-emerald-500/30"
                      : item.status === "error"
                      ? "bg-rose-950/30 border-rose-500/30"
                      : "bg-raised/70 border-foreground/10"
                  }`}
                >
                  {/* Thumbnail Preview */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/10">
                    <img
                      src={item.previewUrl}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Metadata and Alt input */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate max-w-[150px]" title={item.file.name}>
                        {item.file.name}
                      </span>
                      <span className="text-[11px] text-foreground/50 shrink-0 font-sans">
                        {formatBytes(item.file.size)}
                      </span>
                    </div>

                    {/* Alt Tag Field */}
                    <input
                      type="text"
                      value={item.alt}
                      onChange={(e) => handleAltChange(item.id, e.target.value)}
                      placeholder="متن جایگزین تصویر (Alt سئو)..."
                      disabled={isUploading || item.status === "success"}
                      className="w-full h-7 px-2 text-xs rounded-lg bg-panel border border-foreground/15 text-foreground placeholder:text-foreground/40 focus:border-mint focus:outline-none"
                    />

                    {/* Progress / Status feedback */}
                    {item.status === "uploading" && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                          <div
                            className="h-full bg-mint transition-all duration-200"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-mint font-sans">
                          {toPersianDigits(item.progress)}٪
                        </span>
                      </div>
                    )}

                    {item.status === "success" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        ✓ با موفقیت آپلود شد
                      </span>
                    )}

                    {item.status === "error" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium truncate" title={item.errorMessage}>
                        ✕ {item.errorMessage}
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  {!isUploading && item.status !== "success" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFromQueue(item.id)}
                      className="p-1.5 rounded-lg text-foreground/40 hover:text-rose-400 hover:bg-panel transition-colors"
                      title="حذف از صف"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Overall Progress & Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
              <div className="w-full sm:w-auto text-xs text-foreground/60">
                {isUploading ? (
                  <span className="flex items-center gap-2 text-mint">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
                    <span>در حال ارسال فایل‌ها به سرور... ({toPersianDigits(overallProgress)}٪)</span>
                  </span>
                ) : (
                  <span>
                    آماده ارسال: {toPersianDigits(queue.filter((q) => q.status !== "success").length)} تصویر
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={startBatchUpload}
                disabled={isUploading || queue.filter((q) => q.status !== "success").length === 0}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isUploading || queue.filter((q) => q.status !== "success").length === 0
                    ? "opacity-50 cursor-not-allowed bg-raised border border-foreground/10 text-foreground/40"
                    : "bg-lime text-ink hover:opacity-90 active:scale-95 shadow-[0_0_20px_rgba(178,248,0,0.25)]"
                }`}
              >
                {isUploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>در حال پردازش و آپلود...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>آپلود گروهی تصاویر</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Media Library Gallery */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>آرشیو رسانه‌های بارگذاری‌شده</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-panel border border-foreground/10 text-mint font-sans">
              {toPersianDigits(filteredItems.length)}
            </span>
          </h2>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام یا متن Alt..."
              className="w-full h-10 pr-9 pl-4 text-xs rounded-xl bg-panel border border-foreground/10 text-foreground placeholder:text-foreground/40 focus:border-mint focus:outline-none"
            />
            <svg
              className="w-4 h-4 text-foreground/40 absolute right-3 top-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-panel border border-foreground/10 flex flex-col p-3">
                <div className="w-full h-3/4 rounded-xl bg-raised/60" />
                <div className="h-3 w-2/3 rounded bg-raised/60 mt-3" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-panel border border-foreground/10 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-raised mx-auto flex items-center justify-center text-foreground/30">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground/70">
              {searchQuery ? "هیچ تصویری مطابق با جستجوی شما یافت نشد." : "هنوز هیچ تصویری در کتابخانه رسانه آپلود نشده است."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-mint hover:underline font-bold"
              >
                پاک کردن جستجو
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-panel border border-foreground/10 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:border-mint/30 transition-all duration-300"
              >
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-[4/3] w-full bg-black/40 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Hover Overlay with Copy Action */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item)}
                      className="px-3 py-1.5 rounded-xl bg-white text-ink text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{copiedId === item.id ? "کپی شد!" : "کپی لینک"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-xl bg-rose-600/80 text-white hover:bg-rose-600 transition-colors shadow-md"
                      title="حذف از سرور"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Caption / Alt info */}
                <div className="p-3 bg-panel/90 border-t border-foreground/5 space-y-1">
                  <p className="text-xs font-semibold text-foreground truncate" title={item.alt}>
                    {item.alt || item.filename}
                  </p>
                  <p className="text-[10px] text-foreground/40 font-sans truncate" title={item.url}>
                    {item.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
