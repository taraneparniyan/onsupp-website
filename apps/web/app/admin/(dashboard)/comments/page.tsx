"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type CommentItem = {
  id: number;
  articleId: number;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  reply: string | null;
  createdAt: string;
  article?: {
    id: number;
    titleFa: string;
    titleEn: string;
    slug: string;
  };
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadComments = () => {
    setLoading(true);
    adminFetch("/api/v1/comments", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      })
      .catch((err) => console.error("Failed to load comments:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleToggleApprove = async (id: number) => {
    try {
      const res = await adminFetch(`/api/v1/comments/${id}/toggle-approve`, {
        method: "PUT",
      });
      if (res.ok) {
        loadComments();
      }
    } catch (err) {
      console.error(err);
      alert("خطا در تغییر وضعیت تایید دیدگاه");
    }
  };

  const handleSendReply = async (id: number) => {
    if (!replyText.trim()) return;
    try {
      const res = await adminFetch(`/api/v1/comments/${id}/reply`, {
        method: "PUT",
        body: JSON.stringify({ reply: replyText }),
      });
      if (res.ok) {
        alert("پاسخ شما با موفقیت ثبت شد و دیدگاه تایید گردید.");
        setReplyingId(null);
        setReplyText("");
        loadComments();
      }
    } catch (err) {
      console.error(err);
      alert("خطا در ارسال پاسخ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این دیدگاه اطمینان دارید؟")) return;
    try {
      const res = await adminFetch(`/api/v1/comments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadComments();
      }
    } catch (err) {
      console.error(err);
      alert("خطا در حذف دیدگاه");
    }
  };

  const filteredComments = comments.filter((item) => {
    if (activeTab === "pending") return !item.approved;
    if (activeTab === "approved") return item.approved;
    return true;
  });

  return (
    <div className="space-y-8 w-full" dir="rtl">
      {/* Top Banner */}
      <div className="p-8 rounded-xl bg-gradient-to-r from-panel via-panel to-background border border-foreground/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-raised/50 border border-primary/20 text-mint text-xs font-bold">
            مدیریت تعاملات کاربران
          </div>
          <h1 className="text-3xl font-black text-white">مدیریت دیدگاه‌ها و نظرات مقالات</h1>
          <p className="text-sm text-mint">
            تایید یا رد دیدگاه‌های جدید کاربران و پاسخ‌دهی مستقیم (Reply) از طرف ادمین.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 bg-raised p-1.5 rounded-lg border border-foreground/10">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all" ? "bg-emerald-500 text-black shadow-md" : "text-mint hover:text-white"
            }`}
          >
            همه ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pending" ? "bg-amber-500 text-black shadow-md" : "text-mint hover:text-white"
            }`}
          >
            در انتظار تایید ({comments.filter((c) => !c.approved).length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "approved" ? "bg-mint/10 text-mint shadow-md" : "text-mint hover:text-white"
            }`}
          >
            تاییدشده ({comments.filter((c) => c.approved).length})
          </button>
        </div>
      </div>

      {/* Comment List Cards */}
      {loading ? (
        <div className="text-center py-16 text-mint">در حال دریافت دیدگاه‌ها...</div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-16 bg-panel rounded-xl border border-foreground/10 text-mint">
          هیچ دیدگاهی در این بخش یافت نشد.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredComments.map((item) => (
            <div
              key={item.id}
              className={`bg-panel border rounded-xl p-6 sm:p-8 space-y-6 shadow-md transition-all ${
                item.approved ? "border-foreground/10" : "border-amber-500/40 bg-[#141b16]"
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-foreground/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#173027] border border-[#275243] text-mint font-black flex items-center justify-center text-sm shadow-md">
                    {item.name ? item.name.charAt(0) : "ک"}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <span className="text-xs text-mint font-mono">{item.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.article && (
                    <a
                      href={`/blog/${item.article.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-xl bg-raised border border-foreground/10 text-[11px] font-bold text-mint hover:underline"
                    >
                      مقاله: {item.article.titleFa}
                    </a>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      item.approved
                        ? "bg-mint/10 text-mint border-mint/20"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {item.approved ? "تاییدشده (نمایش روی سایت)" : "در انتظار تایید ادمین"}
                  </span>
                  <span className="text-xs text-mint/60">
                    {new Date(item.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>

              {/* User Comment Content */}
              <div className="p-4 rounded-lg bg-raised border border-foreground/10 text-sm text-white/90 leading-7">
                {item.content}
              </div>

              {/* Existing Admin Reply */}
              {item.reply && (
                <div className="p-4 rounded-lg bg-[#18332a] border border-[#2c5b4b] space-y-2 mr-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-mint">
                    <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>پاسخ ثبت‌شده توسط مدیریت:</span>
                  </div>
                  <p className="text-xs text-white/90 leading-6">{item.reply}</p>
                </div>
              )}

              {/* Reply Input Box (If replying) */}
              {replyingId === item.id && (
                <div className="p-4 rounded-lg bg-background border border-[#1b3d33] space-y-4 mr-6">
                  <h4 className="text-xs font-bold text-mint">ثبت پاسخ مدیریت به این دیدگاه:</h4>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="متن پاسخ خود را اینجا بنویسید..."
                    className="w-full bg-raised border border-foreground/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setReplyingId(null);
                        setReplyText("");
                      }}
                      className="px-4 py-2 rounded-xl bg-raised text-mint text-xs font-bold"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={() => handleSendReply(item.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400"
                    >
                      ارسال پاسخ و تایید
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleApprove(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      item.approved
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                        : "bg-mint/10 text-mint border-mint/20 hover:scale-105/10"
                    }`}
                  >
                    {item.approved ? "عدم تایید (مخفی کردن)" : "تایید و انتشار روی سایت"}
                  </button>

                  <button
                    onClick={() => {
                      setReplyingId(item.id);
                      setReplyText(item.reply || "");
                    }}
                    className="px-4 py-2 rounded-xl bg-raised/50 border border-primary/20 text-mint hover:text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>{item.reply ? "ویرایش پاسخ" : "پاسخ به دیدگاه (Reply)"}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  title="حذف دیدگاه"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
