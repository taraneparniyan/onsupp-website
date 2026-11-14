"use client";

import React from "react";
import Image from "next/image";
import { PortfolioAttributeValue, PortfolioCategory } from "@/lib/case-studies";

interface DynamicAttributesShowcaseProps {
  attributeValues?: PortfolioAttributeValue[];
  category?: PortfolioCategory | null;
  isRtl?: boolean;
  fallbackMetrics?: Array<{ value: string; label: string }>;
}

export default function DynamicAttributesShowcase({
  attributeValues = [],
  category,
  isRtl = true,
  fallbackMetrics = [],
}: DynamicAttributesShowcaseProps) {
  // Filter active attributes that should be visible on frontend
  const visibleAttributes = attributeValues.filter((av) => {
    // If attribute template exists and is hidden, skip
    if (av.attribute && av.attribute.showInFrontend === false) return false;
    // Skip completely empty values
    if (!av.valueText && av.valueNumber === null && !av.valueJson) return false;
    return true;
  });

  // Group attributes by type for specialized semantic rendering
  const metricsAttributes = visibleAttributes.filter(
    (a) => a.type === "NUMBER" || a.type === "PERCENTAGE"
  );

  const beforeAfterAttributes = visibleAttributes.filter(
    (a) => a.type === "BEFORE_AFTER"
  );

  const specAttributes = visibleAttributes.filter(
    (a) => a.type === "TEXT" || a.type === "TEXTAREA" || a.type === "SELECT" || a.type === "MULTI_SELECT" || a.type === "BOOLEAN"
  );

  const linkAttributes = visibleAttributes.filter((a) => a.type === "LINK");
  const imageAttributes = visibleAttributes.filter((a) => a.type === "IMAGE");

  // If no dynamic attributes, fallback to legacy metrics
  if (visibleAttributes.length === 0) {
    if (fallbackMetrics.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-20">
        {fallbackMetrics.map((m, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center flex flex-col items-center justify-center hover:border-mint/30 transition-colors"
          >
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-foreground mb-2">
              {m.value}
            </span>
            <span className="text-xs sm:text-sm text-foreground/60 font-medium">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 sm:space-y-14 mb-16 sm:mb-24">
      {/* ── 1. NUMERICAL & KPI METRICS STRIP ── */}
      {metricsAttributes.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="h-2 w-2 rounded-full bg-mint" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-foreground/60">
              {isRtl ? "شاخص‌های کلیدی عملکرد و نتایج" : "Key Performance Indicators"}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {metricsAttributes.map((attr, idx) => {
              const title = isRtl
                ? attr.attribute?.titleFa || attr.attributeKey
                : attr.attribute?.titleEn || attr.attributeKey;
              const unit = attr.attribute?.unit || "";

              let displayVal = attr.valueText || "";
              if (!displayVal && attr.valueNumber !== null) {
                displayVal = String(attr.valueNumber);
              }

              return (
                <div
                  key={idx}
                  className="relative p-6 sm:p-7 rounded-2xl bg-panel border border-foreground/10 flex flex-col justify-between hover:border-mint/30 transition-all group overflow-hidden"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-foreground group-hover:text-mint transition-colors">
                      {displayVal}
                    </span>
                    {unit && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-mint/10 text-mint">
                        {unit}
                      </span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-foreground/70 font-medium leading-relaxed">
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. BEFORE / AFTER BENCHMARK COMPARISON ── */}
      {beforeAfterAttributes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#E07A8B]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-foreground/60">
              {isRtl ? "ارزیابی مقایسه‌ای نتایج (قبل و بعد)" : "Before vs. After Benchmark"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {beforeAfterAttributes.map((attr, idx) => {
              const title = isRtl
                ? attr.attribute?.titleFa || attr.attributeKey
                : attr.attribute?.titleEn || attr.attributeKey;

              const payload =
                attr.valueJson && typeof attr.valueJson === "object"
                  ? attr.valueJson
                  : { before: "-", after: attr.valueText || "-" };

              return (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl bg-raised border border-foreground/10 space-y-5"
                >
                  <h4 className="text-base sm:text-lg font-bold text-foreground">
                    {title}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Before State */}
                    <div className="p-4 rounded-xl bg-background/60 border border-foreground/5 space-y-2">
                      <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span>{isRtl ? "وضعیت اولیه (قبل)" : "Initial (Before)"}</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-foreground/80">
                        {payload.before || "—"}
                      </div>
                    </div>

                    {/* After State */}
                    <div className="p-4 rounded-xl bg-mint/5 border border-mint/20 space-y-2">
                      <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-mint flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                        <span>{isRtl ? "نتیجه نهایی (بعد)" : "Optimized (After)"}</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-mint">
                        {payload.after || "—"}
                      </div>
                    </div>
                  </div>

                  {payload.note && (
                    <p className="text-xs text-foreground/60 leading-relaxed italic">
                      {payload.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. SPECIFICATIONS & CUSTOM CATEGORY ATTRIBUTES ── */}
      {specAttributes.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="h-2 w-2 rounded-full bg-[#8AB3A0]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-foreground/60">
              {isRtl ? "مشخصات فنی و ویژگی‌های اختصاصی پروژه" : "Technical & Category Specifications"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {specAttributes.map((attr, idx) => {
              const title = isRtl
                ? attr.attribute?.titleFa || attr.attributeKey
                : attr.attribute?.titleEn || attr.attributeKey;
              const val = attr.valueText || "";

              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-panel border border-foreground/10 space-y-2"
                >
                  <span className="text-xs font-mono font-medium text-foreground/50 uppercase tracking-wide block">
                    {title}
                  </span>
                  {attr.type === "BOOLEAN" ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          val === "true" || attr.valueJson?.value === true
                            ? "bg-mint/15 text-mint border border-mint/30"
                            : "bg-foreground/5 text-foreground/40 border border-foreground/10"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            val === "true" || attr.valueJson?.value === true ? "bg-mint" : "bg-foreground/40"
                          }`}
                        />
                        <span>{val === "true" || attr.valueJson?.value === true ? (isRtl ? "بله / فعال" : "Yes / Active") : (isRtl ? "خیر / غیرفعال" : "No / Inactive")}</span>
                      </span>
                    </div>
                  ) : attr.type === "MULTI_SELECT" ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(Array.isArray(attr.valueJson?.values)
                        ? attr.valueJson.values
                        : val.split(/[,،]+/).map((s: string) => s.trim())
                      ).map((item: string, iIdx: number) => (
                        <span
                          key={iIdx}
                          className="px-2.5 py-1 rounded-lg bg-raised border border-foreground/10 text-xs font-medium text-foreground/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base font-medium text-foreground leading-relaxed whitespace-pre-line">
                      {val}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. ATTACHED MEDIA & EXTERNAL VERIFICATIONS ── */}
      {(imageAttributes.length > 0 || linkAttributes.length > 0) && (
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-foreground/10">
          {linkAttributes.map((attr, idx) => {
            const title = isRtl
              ? attr.attribute?.titleFa || "مشاهده مستندات"
              : attr.attribute?.titleEn || "View Link";
            const url =
              attr.valueJson?.url || attr.valueText || "#";

            return (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-raised border border-foreground/15 text-xs sm:text-sm font-medium text-foreground hover:border-mint hover:text-mint transition-all"
              >
                <span>{title}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            );
          })}

          {imageAttributes.map((attr, idx) => {
            const title = isRtl
              ? attr.attribute?.titleFa || "تصویر ضمیمه"
              : attr.attribute?.titleEn || "Attachment";
            const src = attr.valueText || "";
            if (!src) return null;

            return (
              <div
                key={idx}
                className="relative w-40 h-24 rounded-xl overflow-hidden border border-foreground/10 bg-background"
                title={title}
              >
                <Image src={src} alt={title} fill className="object-cover" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
