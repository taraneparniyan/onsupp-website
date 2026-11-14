"use client";

import React, { useState } from "react";
import {
  SOCIAL_ICON_LIBRARY,
  SocialNetworkIcon,
  validateSocialUrl,
  type SocialLinkItem,
} from "@/lib/socialIcons";

interface SocialLinksManagerProps {
  items: SocialLinkItem[];
  onPersist: (nextItems: SocialLinkItem[], successMessage: string) => Promise<boolean>;
  busy?: boolean;
}

const toFaDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

export default function SocialLinksManager({
  items,
  onPersist,
  busy = false,
}: SocialLinksManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("instagram");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localSaving, setLocalSaving] = useState(false);

  const isWorking = busy || localSaving;

  const openAddForm = () => {
    setEditingId(null);
    setName("");
    setUrl("");
    setIcon("instagram");
    setIsActive(true);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (item: SocialLinkItem) => {
    setEditingId(item.id);
    setName(item.name);
    setUrl(item.url);
    setIcon(item.icon || "link");
    setIsActive(item.isActive !== false);
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmitForm = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setFormError("لطفاً نام شبکه اجتماعی را وارد کنید.");
      return;
    }
    if (cleanName.length > 100) {
      setFormError("نام شبکه اجتماعی نباید بیشتر از ۱۰۰ کاراکتر باشد.");
      return;
    }

    const urlCheck = validateSocialUrl(url);
    if (!urlCheck.valid || !urlCheck.normalized) {
      setFormError(urlCheck.errorFa || "آدرس لینک واردشده معتبر نیست.");
      return;
    }

    setFormError(null);
    setLocalSaving(true);
    try {
      let nextItems: SocialLinkItem[];
      if (editingId) {
        nextItems = items.map((item, idx) =>
          item.id === editingId
            ? {
                ...item,
                name: cleanName,
                url: urlCheck.normalized!,
                icon,
                isActive,
                order: idx,
              }
            : { ...item, order: idx }
        );
      } else {
        const newItem: SocialLinkItem = {
          id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: cleanName,
          url: urlCheck.normalized,
          icon,
          isActive,
          order: items.length,
        };
        nextItems = [...items, newItem].map((item, idx) => ({ ...item, order: idx }));
      }

      const ok = await onPersist(
        nextItems,
        editingId
          ? `شبکه اجتماعی «${cleanName}» با موفقیت ویرایش و ذخیره شد`
          : `شبکه اجتماعی «${cleanName}» با موفقیت اضافه و ذخیره شد`
      );
      if (ok) {
        closeForm();
      }
    } finally {
      setLocalSaving(false);
    }
  };

  const handleToggleActive = async (target: SocialLinkItem) => {
    setLocalSaving(true);
    try {
      const nextStatus = !target.isActive;
      const nextItems = items.map((item, idx) =>
        item.id === target.id ? { ...item, isActive: nextStatus, order: idx } : { ...item, order: idx }
      );
      await onPersist(
        nextItems,
        nextStatus
          ? `نمایش «${target.name}» در فوتر سایت فعال شد`
          : `نمایش «${target.name}» در فوتر سایت غیرفعال شد`
      );
    } finally {
      setLocalSaving(false);
    }
  };

  const handleDelete = async (target: SocialLinkItem) => {
    setLocalSaving(true);
    try {
      const nextItems = items
        .filter((item) => item.id !== target.id)
        .map((item, idx) => ({ ...item, order: idx }));
      const ok = await onPersist(nextItems, `شبکه اجتماعی «${target.name}» با موفقیت حذف شد`);
      if (ok) {
        setConfirmDeleteId(null);
        if (editingId === target.id) closeForm();
      }
    } finally {
      setLocalSaving(false);
    }
  };

  const handleMove = async (fromIdx: number, dir: -1 | 1) => {
    const toIdx = fromIdx + dir;
    if (toIdx < 0 || toIdx >= items.length) return;
    const cloned = [...items];
    const [moved] = cloned.splice(fromIdx, 1);
    cloned.splice(toIdx, 0, moved);
    const reordered = cloned.map((item, idx) => ({ ...item, order: idx }));
    setLocalSaving(true);
    try {
      await onPersist(reordered, "ترتیب نمایش شبکه‌های اجتماعی با موفقیت ذخیره شد");
    } finally {
      setLocalSaving(false);
    }
  };

  const handleDrop = async (dropIdx: number) => {
    setDragOverIndex(null);
    if (dragIndex === null || dragIndex === dropIdx) {
      setDragIndex(null);
      return;
    }
    const cloned = [...items];
    const [moved] = cloned.splice(dragIndex, 1);
    cloned.splice(dropIdx, 0, moved);
    setDragIndex(null);
    const reordered = cloned.map((item, idx) => ({ ...item, order: idx }));
    setLocalSaving(true);
    try {
      await onPersist(reordered, "ترتیب جدید شبکه‌های اجتماعی با موفقیت ذخیره شد");
    } finally {
      setLocalSaving(false);
    }
  };

  return (
    <div className="space-y-6 bg-panel border border-border p-6 rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            مدیریت شبکه‌های اجتماعی رسمی سایت
          </h2>
          <p className="text-xs text-muted mt-1">
            امکان افزودن، ویرایش، حذف، فعال/غیرفعال‌سازی و مرتب‌سازی نامحدود شبکه‌های اجتماعی. موارد فعال به همین ترتیب در فوتر سایت نمایش داده می‌شوند.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          disabled={isWorking}
          data-testid="add-social-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime text-ink font-bold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
        >
          <span>+ افزودن شبکه اجتماعی</span>
        </button>
      </div>

      {/* Add / Edit Panel */}
      {formOpen && (
        <div
          className="rounded-2xl border border-primary/40 bg-raised/70 p-5 space-y-5"
          data-testid="social-form-panel"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              {editingId ? "ویرایش شبکه اجتماعی" : "افزودن شبکه اجتماعی جدید"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="text-xs text-muted hover:text-foreground cursor-pointer"
            >
              بستن ✕
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              data-testid="social-form-error"
              className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-medium"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">نام شبکه اجتماعی</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError(null);
                }}
                data-testid="social-name-input"
                placeholder="مثال: لینکدین رسمی آن‌ساپ"
                className="w-full bg-panel border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">آدرس لینک (URL)</label>
              <input
                type="url"
                dir="ltr"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (formError) setFormError(null);
                }}
                data-testid="social-url-input"
                placeholder="https://linkedin.com/company/onsupp"
                className="w-full bg-panel border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Icon Library Picker */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                انتخاب آیکون اختصاصی از کتابخانه آیکون‌ها
              </label>
              <span className="text-[11px] text-muted">
                آیکون انتخاب‌شده:{" "}
                <strong className="text-foreground">
                  {SOCIAL_ICON_LIBRARY.find((i) => i.key === icon)?.labelFa || icon}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {SOCIAL_ICON_LIBRARY.map((ic) => {
                const selected = icon === ic.key;
                return (
                  <button
                    key={ic.key}
                    type="button"
                    onClick={() => setIcon(ic.key)}
                    data-testid={`social-icon-option-${ic.key}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      selected
                        ? "border-primary bg-lime/25 text-foreground font-bold ring-1 ring-primary"
                        : "border-border bg-panel text-muted hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    <SocialNetworkIcon icon={ic.key} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{ic.labelFa}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Toggle + Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                data-testid="social-active-checkbox"
                className="h-4 w-4 rounded border-border accent-lime cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                فعال و قابل نمایش در فوتر سایت
              </span>
            </label>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeForm}
                disabled={isWorking}
                className="px-4 py-2 rounded-xl border border-border bg-panel text-xs font-medium text-muted hover:text-foreground cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSubmitForm}
                disabled={isWorking}
                data-testid="social-submit-btn"
                className="px-5 py-2 rounded-xl bg-lime text-ink text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {localSaving
                  ? "در حال ذخیره..."
                  : editingId
                  ? "ذخیره ویرایش"
                  : "افزودن و ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of Social Links */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-raised/40 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">هنوز هیچ شبکه اجتماعی ثبت نشده است</p>
          <p className="text-xs text-muted">
            برای افزودن اولین شبکه اجتماعی روی دکمه «+ افزودن شبکه اجتماعی» کلیک کنید.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="social-links-list">
          {items.map((item, idx) => {
            const isConfirmingDelete = confirmDeleteId === item.id;
            const isDropTarget = dragOverIndex === idx && dragIndex !== idx;

            return (
              <div
                key={item.id}
                draggable={!isWorking}
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverIndex !== idx) setDragOverIndex(idx);
                }}
                onDragLeave={() => {
                  if (dragOverIndex === idx) setDragOverIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(idx);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                data-testid={`social-row-${idx}`}
                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                  isDropTarget
                    ? "border-primary bg-lime/10"
                    : item.isActive
                    ? "border-border bg-raised/60"
                    : "border-border/70 bg-raised/30 opacity-75"
                }`}
              >
                {/* Right side in RTL: Drag handle + Order + Icon + Name & URL */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    title="برای تغییر ترتیب بکشید و رها کنید"
                    className="flex items-center gap-1.5 text-muted cursor-grab active:cursor-grabbing shrink-0 select-none"
                  >
                    <span className="text-base leading-none tracking-tighter">⋮⋮</span>
                    <span className="w-6 h-6 rounded-lg bg-panel border border-border text-[11px] font-bold text-foreground flex items-center justify-center">
                      {toFaDigits(idx + 1)}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-panel border border-border text-foreground flex items-center justify-center shrink-0">
                    <SocialNetworkIcon icon={item.icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-panel border border-border text-muted">
                        {SOCIAL_ICON_LIBRARY.find((ic) => ic.key === item.icon)?.labelFa || item.icon}
                      </span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="block text-xs font-mono text-muted hover:text-foreground truncate"
                    >
                      {item.url}
                    </a>
                  </div>
                </div>

                {/* Left side in RTL: Reorder arrows, Active Toggle, Edit, Delete */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Reorder Up/Down */}
                  <div className="flex items-center rounded-xl border border-border bg-panel overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0 || isWorking}
                      data-testid={`social-move-up-${idx}`}
                      title="انتقال به بالا"
                      aria-label={`انتقال ${item.name} به بالا`}
                      className="px-2.5 py-1.5 text-xs text-foreground hover:bg-raised disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      ▲
                    </button>
                    <span className="w-px h-4 bg-border" />
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === items.length - 1 || isWorking}
                      data-testid={`social-move-down-${idx}`}
                      title="انتقال به پایین"
                      aria-label={`انتقال ${item.name} به پایین`}
                      className="px-2.5 py-1.5 text-xs text-foreground hover:bg-raised disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Active/Inactive Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    disabled={isWorking}
                    data-testid={`social-toggle-${idx}`}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                      item.isActive
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                        : "bg-panel border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {item.isActive ? "فعال در سایت" : "غیرفعال"}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    disabled={isWorking}
                    data-testid={`social-edit-${idx}`}
                    className="px-3 py-1.5 rounded-xl border border-border bg-panel text-xs font-medium text-foreground hover:border-primary/50 cursor-pointer disabled:opacity-50"
                  >
                    ویرایش
                  </button>

                  {/* Delete */}
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={isWorking}
                        data-testid={`social-confirm-delete-${idx}`}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                      >
                        تأیید حذف
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isWorking}
                        className="px-2.5 py-1.5 rounded-xl border border-border bg-panel text-xs text-muted hover:text-foreground cursor-pointer"
                      >
                        لغو
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      disabled={isWorking}
                      data-testid={`social-delete-${idx}`}
                      className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 cursor-pointer disabled:opacity-50"
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
