"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem } from "@/lib/motion";

export type Testimonial = {
  id: number | string;
  quoteFa: string;
  quoteEn: string;
  authorFa: string;
  authorEn: string;
  roleFa: string;
  roleEn: string;
  companyFa?: string;
  companyEn?: string;
  serviceTagFa?: string;
  serviceTagEn?: string;
  highlightFa?: string;
  highlightEn?: string;
  avatarUrl?: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Sample testimonials rendered strictly in development mode (`NODE_ENV === "development"`)
 * when no real customer testimonials are returned from the backend API.
 * Never rendered as real reviews in production builds.
 */
const DEV_PREVIEW_TESTIMONIALS: Testimonial[] = [
  {
    id: "dev-sample-1",
    quoteFa:
      "بازطراحی معماری فنی و استراتژی سئوی سایت ما با همراهی تیم آن‌ساپ باعث شد سرعت بارگذاری صفحات به شکل محسوسی بهبود پیدا کند و ورودی ارگانیک هدفمند در کمتر از چهار ماه رشد پایداری را تجربه کند.",
    quoteEn:
      "Redesigning our technical architecture and SEO strategy with the OnSupp team significantly improved page speed and delivered sustainable organic traffic growth within four months.",
    authorFa: "نمونه دیدگاه ۱ (پیش‌نمایش)",
    authorEn: "Sample Review 1 (Preview)",
    roleFa: "مدیر ارشد محصول",
    roleEn: "VP of Product",
    companyFa: "پلتفرم خدمات مالی",
    companyEn: "Fintech Platform",
    serviceTagFa: "سئو و مهندسی وب",
    serviceTagEn: "SEO & Web Engineering",
    highlightFa: "رشد مستمر ترافیک ارگانیک",
    highlightEn: "Consistent Organic Growth",
  },
  {
    id: "dev-sample-2",
    quoteFa:
      "آنچه همکاری با آن‌ساپ را متمایز می‌کند، نگاه داده‌محور در کنار درک عمیق از هویت بصری برند است. خروجی نهایی رابط کاربری دقیقاً هم‌راستا با استانداردهای سازمانی ما و نیاز واقعی کاربران شکل گرفت.",
    quoteEn:
      "What sets OnSupp apart is their data-driven mindset paired with a deep understanding of brand identity. The final UI aligned seamlessly with our enterprise standards and user needs.",
    authorFa: "نمونه دیدگاه ۲ (پیش‌نمایش)",
    authorEn: "Sample Review 2 (Preview)",
    roleFa: "مدیر بازاریابی و برند",
    roleEn: "Brand & Marketing Director",
    companyFa: "مجموعه تجارت الکترونیک",
    companyEn: "E-Commerce Group",
    serviceTagFa: "طراحی محصول و برندینگ",
    serviceTagEn: "Product Design & Branding",
    highlightFa: "ارتقای نرخ تعامل کاربران",
    highlightEn: "Higher User Engagement",
  },
  {
    id: "dev-sample-3",
    quoteFa:
      "گزارش‌دهی شفاف، زمان‌بندی دقیق در تحویل اسپرینت‌ها و پشتیبانی فنی مستمر باعث شد فرآیند توسعه سامانه اختصاصی ما بدون چالش پیش برود و تیم داخلی ما با اطمینان کامل محصول را مقیاس دهد.",
    quoteEn:
      "Transparent reporting, punctual sprint deliveries, and continuous technical support allowed our custom platform development to proceed smoothly and scale with confidence.",
    authorFa: "نمونه دیدگاه ۳ (پیش‌نمایش)",
    authorEn: "Sample Review 3 (Preview)",
    roleFa: "هم‌بنیان‌گذار و مدیر فنی",
    roleEn: "Co-Founder & CTO",
    companyFa: "استارتاپ فناوری سلامت",
    companyEn: "HealthTech Startup",
    serviceTagFa: "توسعه نرم‌افزار اختصاصی",
    serviceTagEn: "Custom Software Dev",
    highlightFa: "پایداری و مقیاس‌پذیری بالا",
    highlightEn: "High System Scalability",
  },
];

function getInitials(name: string): string {
  const cleaned = name.replace(/\(.*?\)/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "O";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function TestimonialCard({
  item,
  isRtl,
}: {
  item: Testimonial;
  isRtl: boolean;
}) {
  const quote = isRtl ? item.quoteFa : item.quoteEn;
  const author = isRtl ? item.authorFa : item.authorEn;
  const role = isRtl ? item.roleFa : item.roleEn;
  const company = isRtl ? item.companyFa : item.companyEn;
  const serviceTag = isRtl ? item.serviceTagFa : item.serviceTagEn;
  const highlight = isRtl ? item.highlightFa : item.highlightEn;

  return (
    <article className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-[#191d1f] to-[#131618] p-6 sm:p-7 lg:p-8 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.6)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-mint/30 hover:shadow-[0_28px_60px_-15px_rgba(0,0,0,0.75)]">
      {/* Subtle Top Inner Highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        aria-hidden="true"
      />

      {/* Soft Corner Glow on Hover */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-mint/[0.04] blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* ── Top Row: Service Tag Pill & Editorial Quote Mark ── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          {serviceTag ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-semibold text-mint">
              <span className="h-1.5 w-1.5 rounded-full bg-mint/80" />
              <span>{serviceTag}</span>
            </span>
          ) : (
            <span />
          )}

          {/* Subtle Editorial Quote Icon */}
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-mint/45 transition-colors duration-300 group-hover:border-mint/25 group-hover:text-mint"
            aria-hidden="true"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </span>
        </div>

        {/* ── Quote Text ── */}
        <blockquote className="text-sm sm:text-[15px] lg:text-base leading-7 sm:leading-8 text-foreground/85 font-normal">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>

      {/* ── Bottom Section: Outcome Pill + Client Profile ── */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-white/[0.07]">
        {highlight && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-primary/20 border border-primary/35 px-2.5 py-1 text-[11px] font-medium text-mint/90">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-mint"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{highlight}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {item.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  item.avatarUrl.startsWith("http")
                    ? item.avatarUrl
                    : `${BACKEND_URL}${item.avatarUrl}`
                }
                alt={author}
                className="h-11 w-11 shrink-0 rounded-full object-cover border border-mint/25"
              />
            ) : (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mint/25 bg-[#1f2928] text-xs font-bold text-mint shadow-inner"
                aria-hidden="true"
              >
                {getInitials(author)}
              </div>
            )}

            <div className="min-w-0">
              <div className="truncate text-sm sm:text-[15px] font-bold text-white transition-colors duration-300 group-hover:text-mint">
                {author}
              </div>
              <div className="truncate text-xs text-foreground/55 mt-0.5">
                {role}
                {company ? (
                  <>
                    <span className="mx-1.5 text-white/25">•</span>
                    <span className="text-foreground/70">{company}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Subtle Verified Partnership Indicator */}
          <div
            className="hidden sm:flex items-center gap-0.5 text-mint/80 shrink-0"
            aria-label={isRtl ? "همکاری تأییدشده" : "Verified partnership"}
          >
            {[0, 1, 2, 3, 4].map((star) => (
              <svg
                key={star}
                className="h-3.5 w-3.5 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

interface TestimonialsProps {
  initialTestimonials?: Testimonial[];
}

export default function Testimonials({
  initialTestimonials,
}: TestimonialsProps) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      return initialTestimonials;
    }
    return IS_DEV ? DEV_PREVIEW_TESTIMONIALS : [];
  });
  const [isUsingDevPreview, setIsUsingDevPreview] = useState<boolean>(
    () => !(initialTestimonials && initialTestimonials.length > 0) && IS_DEV
  );
  const [loading, setLoading] = useState<boolean>(
    !IS_DEV && !(initialTestimonials && initialTestimonials.length > 0)
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      setTestimonials(initialTestimonials);
      setIsUsingDevPreview(false);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/v1/testimonials`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
          setIsUsingDevPreview(false);
        } else if (IS_DEV) {
          setTestimonials(DEV_PREVIEW_TESTIMONIALS);
          setIsUsingDevPreview(true);
        } else {
          setTestimonials([]);
          setIsUsingDevPreview(false);
        }
      })
      .catch(() => {
        if (IS_DEV) {
          setTestimonials(DEV_PREVIEW_TESTIMONIALS);
          setIsUsingDevPreview(true);
        } else {
          setTestimonials([]);
          setIsUsingDevPreview(false);
        }
      })
      .finally(() => setLoading(false));
  }, [initialTestimonials]);

  // In production, if there are no verified testimonials and loading has finished, do not show fabricated data
  if (!loading && testimonials.length === 0 && !IS_DEV) {
    return null;
  }

  return (
    <section
      id="testimonials"
      className="w-full relative overflow-hidden bg-background"
    >
      <div dir={isRtl ? "rtl" : "ltr"} className="w-full">
        <div className="w-full px-2 sm:px-[10px] py-14 sm:py-20 lg:py-24 relative overflow-hidden">
          {/* Subtle Ambient Glows aligned with OnSupp visual identity */}
          <div className="absolute -top-36 -left-36 w-96 h-96 bg-primary/10 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute -bottom-36 -right-36 w-[460px] h-[460px] bg-mint/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16">
            <ScrollReveal>
              {/* ── Section Header ───────────────────────────────────────── */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-14">
                <div className="max-w-3xl">
                  <div className="inline-flex flex-wrap items-center gap-3 text-sm font-bold tracking-widest text-mint uppercase">
                    <span className="h-px w-10 bg-mint/50" />
                    <span>
                      {isRtl ? "تجربه همکاری با آن‌ساپ" : "CLIENT TESTIMONIALS"}
                    </span>
                    {isUsingDevPreview && IS_DEV && (
                      <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 text-[11px] font-medium text-mint normal-case tracking-normal">
                        {isRtl
                          ? "پیش‌نمایش محیط توسعه (نمونه)"
                          : "Dev Preview (Sample Data)"}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 sm:mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.2] tracking-tight text-foreground drop-shadow-md">
                    {isRtl ? (
                      <>
                        دیدگاه <span className="text-mint">مشتریان ما</span>
                      </>
                    ) : (
                      <>
                        What Our <span className="text-mint">Clients Say</span>
                      </>
                    )}
                  </h2>

                  <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-foreground/65 leading-relaxed sm:leading-8 max-w-2xl">
                    {isRtl
                      ? "روایت مدیران و کسب‌وکارهایی که مسیر رشد دیجیتال، طراحی محصول و توسعه زیرساخت خود را به تیم آن‌ساپ سپرده‌اند."
                      : "Perspectives from leaders and organizations who partnered with OnSupp for digital growth, product design, and engineering."}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* ── Testimonials Content ─────────────────────────────────── */}
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 w-full">
                {[0, 1, 2].map((skeleton) => (
                  <div
                    key={skeleton}
                    className={`${
                      skeleton > 0 ? "hidden lg:flex" : "flex"
                    } h-[280px] w-full flex-col justify-between rounded-[24px] border border-white/[0.07] bg-[#15181a] p-7 animate-pulse`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-28 rounded-full bg-white/[0.06]" />
                      <div className="h-9 w-9 rounded-full bg-white/[0.06]" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-4 w-full rounded bg-white/[0.06]" />
                      <div className="h-4 w-11/12 rounded bg-white/[0.06]" />
                      <div className="h-4 w-3/4 rounded bg-white/[0.05]" />
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                      <div className="h-11 w-11 rounded-full bg-white/[0.07]" />
                      <div className="space-y-2">
                        <div className="h-3.5 w-28 rounded bg-white/[0.07]" />
                        <div className="h-3 w-20 rounded bg-white/[0.05]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* ── Desktop 3-Column Grid (lg+) ── */}
                <ScrollReveal>
                  <motion.div
                    variants={prefersReducedMotion ? undefined : staggerContainer}
                    initial={prefersReducedMotion ? false : "hidden"}
                    whileInView={prefersReducedMotion ? undefined : "visible"}
                    viewport={{ once: true, margin: "-40px" }}
                    className="hidden lg:grid lg:grid-cols-3 gap-6 xl:gap-8 w-full items-stretch"
                  >
                    {testimonials.slice(0, 3).map((item) => (
                      <motion.div
                        key={item.id}
                        variants={prefersReducedMotion ? undefined : staggerItem}
                        className="h-full"
                      >
                        <TestimonialCard item={item} isRtl={isRtl} />
                      </motion.div>
                    ))}
                  </motion.div>
                </ScrollReveal>

                {/* ── Mobile & Tablet Swiper Slider (< 1024px) ── */}
                <div className="block lg:hidden">
                  <Swiper
                    key={isRtl ? "testimonials-swiper-rtl" : "testimonials-swiper-ltr"}
                    dir={isRtl ? "rtl" : "ltr"}
                    slidesPerView={1}
                    spaceBetween={16}
                    speed={prefersReducedMotion ? 0 : 450}
                    touchStartPreventDefault={false}
                    passiveListeners={true}
                    breakpoints={{
                      768: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                      },
                    }}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    onSlideChange={(swiper) => {
                      setActiveSlide(swiper.activeIndex);
                    }}
                    className="w-full"
                  >
                    {testimonials.map((item) => (
                      <SwiperSlide key={item.id} className="!h-auto flex">
                        <div className="w-full">
                          <TestimonialCard item={item} isRtl={isRtl} />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Mobile Swiper Controls */}
                  {testimonials.length > 1 && (
                    <div className="mt-6 w-full flex items-center justify-between gap-4">
                      {/* Pagination Dots */}
                      <div className="flex items-center gap-2">
                        {testimonials.map((item, idx) => {
                          const isActive = idx === activeSlide;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => swiperRef.current?.slideTo(idx)}
                              aria-label={
                                isRtl
                                  ? `رفتن به دیدگاه ${idx + 1}`
                                  : `Go to testimonial ${idx + 1}`
                              }
                              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                isActive
                                  ? "w-7 bg-mint"
                                  : "w-2 bg-white/20 hover:bg-white/40"
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Prev / Next Buttons */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => swiperRef.current?.slidePrev()}
                          disabled={activeSlide === 0}
                          aria-label={isRtl ? "دیدگاه قبلی" : "Previous testimonial"}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#141719] text-foreground transition-all hover:border-mint/40 hover:text-mint disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                        >
                          <svg
                            className={`h-4 w-4 ${isRtl ? "" : "rotate-180"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => swiperRef.current?.slideNext()}
                          disabled={activeSlide >= testimonials.length - 1}
                          aria-label={isRtl ? "دیدگاه بعدی" : "Next testimonial"}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#141719] text-foreground transition-all hover:border-mint/40 hover:text-mint disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                        >
                          <svg
                            className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
