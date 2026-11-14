"use client";

import React from "react";
import Image from "next/image";

export type AttributeType =
  | "TEXT"
  | "NUMBER"
  | "PERCENTAGE"
  | "IMAGE"
  | "LINK"
  | "BEFORE_AFTER"
  | "TEXTAREA"
  | "SELECT"
  | "MULTI_SELECT"
  | "BOOLEAN";

export interface PortfolioAttributeTemplate {
  id: number;
  categoryId: number;
  key: string;
  titleFa: string;
  titleEn: string;
  descriptionFa?: string;
  descriptionEn?: string;
  type: AttributeType;
  isRequired: boolean;
  unit?: string;
  showInFrontend: boolean;
  position: number;
  isActive: boolean;
  options?: any;
}

export interface PortfolioCategory {
  id: number;
  slug: string;
  titleFa: string;
  titleEn: string;
  color?: string;
  attributes?: PortfolioAttributeTemplate[];
}

export interface AttributeValueItem {
  id?: number;
  attributeId?: number | null;
  attributeKey: string;
  type: AttributeType;
  valueText?: string | null;
  valueNumber?: number | null;
  valueJson?: any;
}

interface DynamicAttributesFormProps {
  category: PortfolioCategory | null;
  attributeValues: AttributeValueItem[];
  onChange: (updatedValues: AttributeValueItem[]) => void;
  onOpenMediaPicker?: (targetKey: string, subField?: "before" | "after") => void;
}

export default function DynamicAttributesForm({
  category,
  attributeValues = [],
  onChange,
  onOpenMediaPicker,
}: DynamicAttributesFormProps) {
  const templates = category?.attributes?.filter((a) => a.isActive) || [];

  // Helper to get current value for a given attribute key
  const getValue = (key: string): AttributeValueItem | undefined => {
    return attributeValues.find((v) => v.attributeKey === key);
  };

  // Helper to update a single attribute's value
  const updateValue = (
    key: string,
    type: AttributeType,
    attributeId: number,
    partial: { valueText?: string | null; valueNumber?: number | null; valueJson?: any }
  ) => {
    const existingIndex = attributeValues.findIndex((v) => v.attributeKey === key);
    let nextList: AttributeValueItem[];

    if (existingIndex >= 0) {
      nextList = [...attributeValues];
      nextList[existingIndex] = {
        ...nextList[existingIndex],
        attributeKey: key,
        type,
        attributeId,
        ...partial,
      };
    } else {
      nextList = [
        ...attributeValues,
        {
          attributeKey: key,
          type,
          attributeId,
          ...partial,
        },
      ];
    }

    onChange(nextList);
  };

  if (!category) {
    return (
      <div className="p-8 text-center bg-panel border border-border rounded-2xl">
        <span className="inline-block p-3 rounded-xl bg-primary/15 text-primary mb-2">
          📁
        </span>
        <h4 className="text-sm font-semibold text-foreground mb-1">
          هنوز دسته‌بندی برای این پروژه انتخاب نشده است
        </h4>
        <p className="text-xs text-muted max-w-md mx-auto">
          لطفاً در تب «مشخصات کلی»، ابتدا دسته‌بندی پروژه (مانند طراحی وب، سئو، اینستاگرام، یا برندینگ) را انتخاب کنید تا فیلدهای اختصاصی آن بارگذاری شوند.
        </p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="p-8 text-center bg-panel border border-border rounded-2xl">
        <span className="inline-block p-3 rounded-xl bg-amber-500/15 text-amber-500 mb-2">
          ⚙️
        </span>
        <h4 className="text-sm font-semibold text-foreground mb-1">
          برای دسته‌بندی «{category.titleFa}» ویژگی اختصاصی تعریف نشده است
        </h4>
        <p className="text-xs text-muted max-w-md mx-auto">
          می‌توانید از تب «مدیریت دسته‌بندی‌ها و ویژگی‌ها» فیلدهای پویا (نظیر KPI، نمودار قبل/بعد، مشخصات فنی، و لینک‌ها) برای این دسته‌بندی تعریف کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color || "#38534A" }}
          />
          <h3 className="text-sm font-bold text-foreground">
            فیلدهای داینامیک دسته‌بندی: {category.titleFa}
          </h3>
          <span className="text-xs text-muted font-mono">
            ({templates.length} ویژگی فعال)
          </span>
        </div>
        <span className="text-xs text-muted">
          فیلدهای ستاره‌دار (*) الزامی هستند
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((attr) => {
          const valItem = getValue(attr.key);
          const isFullWidth =
            attr.type === "BEFORE_AFTER" ||
            attr.type === "TEXTAREA" ||
            attr.type === "IMAGE";

          return (
            <div
              key={attr.id}
              className={`space-y-2 p-4 rounded-2xl bg-raised border border-border transition-all hover:border-primary/40 ${
                isFullWidth ? "md:col-span-2" : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>{attr.titleFa}</span>
                  {attr.isRequired && <span className="text-burgundy">*</span>}
                  <span className="text-[10px] text-muted font-mono">
                    ({attr.key})
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-panel text-muted border border-border">
                    {attr.type}
                  </span>
                  {attr.showInFrontend && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono" title="نمایش در صفحه سایت">
                      سایت ✓
                    </span>
                  )}
                </div>
              </div>

              {attr.descriptionFa && (
                <p className="text-[11px] text-muted leading-relaxed">
                  {attr.descriptionFa}
                </p>
              )}

              {/* Input Renderers based on AttributeType */}

              {/* 1. TEXT */}
              {attr.type === "TEXT" && (
                <div className="relative">
                  <input
                    type="text"
                    required={attr.isRequired}
                    value={valItem?.valueText || ""}
                    onChange={(e) =>
                      updateValue(attr.key, "TEXT", attr.id, {
                        valueText: e.target.value,
                      })
                    }
                    placeholder={`ورود ${attr.titleFa}...`}
                    className="w-full bg-panel border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  {attr.unit && (
                    <span className="absolute left-3 top-2.5 text-xs text-muted font-mono pointer-events-none">
                      {attr.unit}
                    </span>
                  )}
                </div>
              )}

              {/* 2. NUMBER */}
              {attr.type === "NUMBER" && (
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required={attr.isRequired}
                    value={valItem?.valueNumber ?? ""}
                    onChange={(e) => {
                      const numVal = e.target.value === "" ? null : Number(e.target.value);
                      updateValue(attr.key, "NUMBER", attr.id, {
                        valueNumber: numVal,
                        valueText: e.target.value,
                      });
                    }}
                    placeholder="مثال: ۲۴۰۰"
                    className="w-full bg-panel border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                  {attr.unit && (
                    <span className="absolute left-3 top-2.5 text-xs text-mint font-semibold px-2 py-0.5 rounded bg-primary/15 border border-primary/25">
                      {attr.unit}
                    </span>
                  )}
                </div>
              )}

              {/* 3. PERCENTAGE */}
              {attr.type === "PERCENTAGE" && (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      required={attr.isRequired}
                      value={valItem?.valueNumber ?? ""}
                      onChange={(e) => {
                        const numVal = e.target.value === "" ? null : Number(e.target.value);
                        updateValue(attr.key, "PERCENTAGE", attr.id, {
                          valueNumber: numVal,
                          valueText: e.target.value ? `${e.target.value}٪` : "",
                        });
                      }}
                      placeholder="مثال: ۷۵"
                      className="w-full bg-panel border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary transition-colors"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                      ٪ {attr.unit || "درصد"}
                    </span>
                  </div>
                  {valItem?.valueNumber !== null && valItem?.valueNumber !== undefined && (
                    <div className="w-full h-1.5 bg-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(valItem.valueNumber, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 4. IMAGE */}
              {attr.type === "IMAGE" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={valItem?.valueText || ""}
                      onChange={(e) =>
                        updateValue(attr.key, "IMAGE", attr.id, {
                          valueText: e.target.value,
                        })
                      }
                      placeholder="/images/... یا https://..."
                      className="flex-1 bg-panel border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                    />
                    {onOpenMediaPicker && (
                      <button
                        type="button"
                        onClick={() => onOpenMediaPicker(attr.key)}
                        className="px-4 py-2.5 rounded-xl bg-primary/15 border border-primary/30 text-mint text-xs font-bold hover:bg-primary/25 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        انتخاب تصویر
                      </button>
                    )}
                  </div>

                  {valItem?.valueText && (
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-border bg-panel">
                      <Image
                        src={valItem.valueText}
                        alt={attr.titleFa}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 5. LINK */}
              {attr.type === "LINK" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted block mb-1">
                      آدرس اینترنتی (URL)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={valItem?.valueJson?.url || valItem?.valueText || ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        const label = valItem?.valueJson?.label || "";
                        updateValue(attr.key, "LINK", attr.id, {
                          valueText: url,
                          valueJson: { url, label },
                        });
                      }}
                      placeholder="https://..."
                      className="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted block mb-1">
                      عنوان لینک (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={valItem?.valueJson?.label || ""}
                      onChange={(e) => {
                        const label = e.target.value;
                        const url = valItem?.valueJson?.url || valItem?.valueText || "";
                        updateValue(attr.key, "LINK", attr.id, {
                          valueText: url,
                          valueJson: { url, label },
                        });
                      }}
                      placeholder="مشاهده نسخه زنده / دمو"
                      className="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* 6. BEFORE_AFTER */}
              {attr.type === "BEFORE_AFTER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-panel border border-border">
                  {/* Before Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        وضعیت قبل (Before)
                      </span>
                      {onOpenMediaPicker && (
                        <button
                          type="button"
                          onClick={() => onOpenMediaPicker(attr.key, "before")}
                          className="text-[11px] text-muted hover:text-foreground cursor-pointer"
                        >
                          انتخاب تصویر
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      value={valItem?.valueJson?.beforeImage || ""}
                      onChange={(e) => {
                        const curJson = valItem?.valueJson || {};
                        const nextJson = { ...curJson, beforeImage: e.target.value };
                        updateValue(attr.key, "BEFORE_AFTER", attr.id, {
                          valueJson: nextJson,
                          valueText: "مقایسه قبل و بعد",
                        });
                      }}
                      placeholder="لینک تصویر قبل..."
                      className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                    />
                    <textarea
                      rows={2}
                      value={valItem?.valueJson?.beforeText || ""}
                      onChange={(e) => {
                        const curJson = valItem?.valueJson || {};
                        const nextJson = { ...curJson, beforeText: e.target.value };
                        updateValue(attr.key, "BEFORE_AFTER", attr.id, {
                          valueJson: nextJson,
                          valueText: "مقایسه قبل و بعد",
                        });
                      }}
                      placeholder="توضیح چالش‌ها یا وضعیت اولیه..."
                      className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground resize-none"
                    />
                    {valItem?.valueJson?.beforeImage && (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border bg-raised">
                        <Image
                          src={valItem.valueJson.beforeImage}
                          alt="قبل"
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                    )}
                  </div>

                  {/* After Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        دستاورد بعد از اجرا (After)
                      </span>
                      {onOpenMediaPicker && (
                        <button
                          type="button"
                          onClick={() => onOpenMediaPicker(attr.key, "after")}
                          className="text-[11px] text-muted hover:text-foreground cursor-pointer"
                        >
                          انتخاب تصویر
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      value={valItem?.valueJson?.afterImage || ""}
                      onChange={(e) => {
                        const curJson = valItem?.valueJson || {};
                        const nextJson = { ...curJson, afterImage: e.target.value };
                        updateValue(attr.key, "BEFORE_AFTER", attr.id, {
                          valueJson: nextJson,
                          valueText: "مقایسه قبل و بعد",
                        });
                      }}
                      placeholder="لینک تصویر بعد..."
                      className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                    />
                    <textarea
                      rows={2}
                      value={valItem?.valueJson?.afterText || ""}
                      onChange={(e) => {
                        const curJson = valItem?.valueJson || {};
                        const nextJson = { ...curJson, afterText: e.target.value };
                        updateValue(attr.key, "BEFORE_AFTER", attr.id, {
                          valueJson: nextJson,
                          valueText: "مقایسه قبل و بعد",
                        });
                      }}
                      placeholder="دستاوردها، رشد شاخص‌ها یا هویت نهایی..."
                      className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground resize-none"
                    />
                    {valItem?.valueJson?.afterImage && (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border bg-raised">
                        <Image
                          src={valItem.valueJson.afterImage}
                          alt="بعد"
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 7. TEXTAREA */}
              {attr.type === "TEXTAREA" && (
                <textarea
                  rows={3}
                  required={attr.isRequired}
                  value={valItem?.valueText || ""}
                  onChange={(e) =>
                    updateValue(attr.key, "TEXTAREA", attr.id, {
                      valueText: e.target.value,
                    })
                  }
                  placeholder={`ورود جزئیات ${attr.titleFa}...`}
                  className="w-full bg-panel border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                />
              )}

              {/* 8. SELECT */}
              {attr.type === "SELECT" && (
                <div>
                  <select
                    required={attr.isRequired}
                    value={valItem?.valueText || ""}
                    onChange={(e) =>
                      updateValue(attr.key, "SELECT", attr.id, {
                        valueText: e.target.value,
                        valueJson: { value: e.target.value },
                      })
                    }
                    className="w-full bg-panel border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">-- انتخاب کنید --</option>
                    {(attr.options?.choices || attr.options?.items || []).map((choice: string, cIdx: number) => (
                      <option key={cIdx} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 9. MULTI_SELECT */}
              {attr.type === "MULTI_SELECT" && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(attr.options?.choices || attr.options?.items || []).map((choice: string, cIdx: number) => {
                      const curSelected = Array.isArray(valItem?.valueJson?.values)
                        ? valItem.valueJson.values
                        : valItem?.valueText
                        ? valItem.valueText.split("، ").map((s: string) => s.trim())
                        : [];
                      const isSelected = curSelected.includes(choice);

                      return (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? curSelected.filter((item: string) => item !== choice)
                              : [...curSelected, choice];
                            updateValue(attr.key, "MULTI_SELECT", attr.id, {
                              valueJson: { values: next },
                              valueText: next.join("، "),
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/20 text-mint border-primary/50 shadow-xs"
                              : "bg-panel text-foreground/70 border-border hover:border-primary/30"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                  {attr.isRequired && (
                    <input
                      type="hidden"
                      required
                      value={valItem?.valueText || ""}
                    />
                  )}
                </div>
              )}

              {/* 10. BOOLEAN */}
              {attr.type === "BOOLEAN" && (
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={valItem?.valueText === "true" || valItem?.valueJson?.value === true}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        updateValue(attr.key, "BOOLEAN", attr.id, {
                          valueText: checked ? "true" : "false",
                          valueJson: { value: checked },
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-panel border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    <span className="mr-3 text-xs font-medium text-foreground">
                      {valItem?.valueText === "true" || valItem?.valueJson?.value === true
                        ? "بله (فعال / دارد)"
                        : "خیر (غیرفعال / ندارد)"}
                    </span>
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
