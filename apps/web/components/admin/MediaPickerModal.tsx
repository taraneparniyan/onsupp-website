"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { adminFetch } from "@/lib/adminApi";

export type MediaItem = {
  id: number;
  url: string;
  alt: string;
  filename: string;
  createdAt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
};

const MAX_BATCH_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function MediaPickerModal({ open, onClose, onSelect }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/v1/media", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      setError("خطا در دریافت لیست رسانه‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadMedia();
      setTab("library");
      setError(null);
    }
  }, [open, loadMedia]);

  if (!open) return null;

  const handleUploadFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0 || uploading) return;
    setError(null);

    const files = Array.from(filesList);

    if (files.length > MAX_BATCH_FILES) {
      setError(`تعداد تصاویر (${files.length}) بیش از سقف مجاز (۱۰ تصویر) است.`);
      return;
    }

    let totalSize = 0;
    for (const f of files) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(f.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`فرمت فایل "${f.name}" مجاز نیست. تنها فرمت‌های تصویری مجازند.`);
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(`حجم تصویر "${f.name}" بیش از سقف مجاز ۵ مگابایت است.`);
        return;
      }
      totalSize += f.size;
    }

    if (totalSize > MAX_BATCH_SIZE) {
      setError("مجموع حجم تصاویر انتخابی بیش از سقف ۵۰ مگابایت است.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      const alts: string[] = [];

      files.forEach((f) => {
        formData.append("files", f);
        const cleanName = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
        alts.push(cleanName || "تصویر مقاله");
      });
      formData.append("alts", JSON.stringify(alts));

      const res = await adminFetch("/api/v1/media/batch-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok && res.status !== 207) {
        setError(data.error || "خطا در آپلود تصاویر");
        return;
      }

      await loadMedia();
      setTab("library");

      // If exactly 1 file was uploaded, auto-select it for convenient insertion
      if (data.results && data.results.length === 1 && data.results[0].success && data.results[0].item) {
        onSelect(data.results[0].item);
        onClose();
      }
    } catch {
      setError("خطا در برقراری ارتباط با سرور هنگام آپلود");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-panel border border-foreground/15 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10 bg-raised/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-panel text-mint border border-foreground/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">کتابخانه و درج رسانه</h2>
              <p className="text-xs text-foreground/50">انتخاب تصویر برای درج در محتوای مقاله</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-foreground/50 hover:text-foreground hover:bg-raised transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-raised/30 border-b border-foreground/5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === "library"
                  ? "bg-mint/20 text-mint border border-mint/30 shadow-sm"
                  : "text-foreground/60 hover:text-foreground hover:bg-raised"
              }`}
            >
              کتابخانه رسانه‌ها ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === "upload"
                  ? "bg-mint/20 text-mint border border-mint/30 shadow-sm"
                  : "text-foreground/60 hover:text-foreground hover:bg-raised"
              }`}
            >
              + آپلود تصاویر جدید (تا ۱۰ فایل)
            </button>
          </div>

          {tab === "library" && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در تصاویر..."
              className="w-48 h-8 px-3 text-xs rounded-xl bg-panel border border-foreground/10 text-foreground placeholder:text-foreground/40 focus:border-mint focus:outline-none"
            />
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-rose-400">✕</button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "library" ? (
            loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-pulse">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-raised border border-foreground/10" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-xs text-foreground/50">تصویری یافت نشد.</p>
                <button
                  type="button"
                  onClick={() => setTab("upload")}
                  className="text-xs font-bold text-mint hover:underline"
                >
                  برای آپلود تصویر کلیک کنید
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-foreground/10 bg-black/40 hover:border-mint hover:scale-[1.02] active:scale-95 transition-all duration-200 text-right focus:outline-none focus:ring-2 focus:ring-mint"
                  >
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[11px] font-semibold text-white truncate">{item.alt || item.filename}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            /* Upload Tab */
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  uploading
                    ? "opacity-60 pointer-events-none border-foreground/10 bg-raised/30"
                    : "border-foreground/15 hover:border-mint/50 bg-raised/40 hover:bg-raised/70"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleUploadFiles(e.target.files)}
                  disabled={uploading}
                />

                <div className="w-14 h-14 rounded-2xl bg-panel border border-foreground/10 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>

                <p className="text-sm font-bold text-foreground">
                  {uploading ? "در حال آپلود و پردازش..." : "انتخاب یا کشیدن تصاویر به اینجا (حداکثر ۱۰ تصویر)"}
                </p>
                <p className="mt-1 text-xs text-foreground/50">
                  سقف حجم هر فایل: ۵ مگابایت | فرمت‌ها: JPG, PNG, WEBP, GIF
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-foreground/10 bg-raised/40 flex items-center justify-between text-xs text-foreground/50">
          <span>کتابخانه تصاویر وب‌سایت آن‌ساپ</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-panel border border-foreground/10 text-foreground hover:bg-raised transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
