"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { BACKEND_URL } from "@/config/api";

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



export const CANONICAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "canonical-1",
    quoteFa:
      "بازطراحی معماری فنی و استراتژی سئوی سایت ما با همراهی تیم آن‌ساپ باعث شد سرعت بارگذاری صفحات به شکل محسوسی بهبود پیدا کند و ورودی ارگانیک هدفمند در کمتر از چهار ماه رشد پایداری را تجربه کند.",
    quoteEn:
      "Redesigning our technical architecture and SEO strategy with the OnSupp team significantly improved page speed and delivered sustainable organic traffic growth within four months.",
    authorFa: "مهندس علیرضا رضایی",
    authorEn: "Alireza Rezaei",
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
    id: "canonical-2",
    quoteFa:
      "آنچه همکاری با آن‌ساپ را متمایز می‌کند، نگاه داده‌محور در کنار درک عمیق از هویت بصری برند است. خروجی نهایی رابط کاربری دقیقاً هم‌راستا با استانداردهای سازمانی ما و نیاز واقعی کاربران شکل گرفت.",
    quoteEn:
      "What sets OnSupp apart is their data-driven mindset paired with a deep understanding of brand identity. The final UI aligned seamlessly with our enterprise standards and user needs.",
    authorFa: "دکتر سارا احمدی",
    authorEn: "Dr. Sara Ahmadi",
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
    id: "canonical-3",
    quoteFa:
      "گزارش‌دهی شفاف، زمان‌بندی دقیق در تحویل اسپرینت‌ها و پشتیبانی فنی مستمر باعث شد فرآیند توسعه سامانه اختصاصی ما بدون چالش پیش برود و تیم داخلی ما با اطمینان کامل محصول را مقیاس دهد.",
    quoteEn:
      "Transparent reporting, punctual sprint deliveries, and continuous technical support allowed our custom platform development to proceed smoothly and scale with confidence.",
    authorFa: "مهندس پویا شمس",
    authorEn: "Pouya Shams",
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
    <article className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[24px] border border-white/10 bg-[#262625] hover:bg-[#2B2B2A] p-6 sm:p-7 lg:p-8 shadow-[0_14px_36px_-10px_rgba(0,0,0,0.5)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#8BB3A4]/40 hover:shadow-[0_22px_45px_-12px_rgba(0,0,0,0.7)]">
      {/* Subtle Top Inner Highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
        aria-hidden="true"
      />

      {/* Soft Corner Glow on Hover */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[#8BB3A4]/[0.06] blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* ── Top Row: Service Tag Pill & Editorial Quote Mark ── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          {serviceTag ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#8BB3A4]/25 bg-[#8BB3A4]/10 px-3.5 py-1 text-xs font-semibold text-[#8BB3A4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8BB3A4]" />
              <span>{serviceTag}</span>
            </span>
          ) : (
            <span />
          )}

          {/* Subtle Editorial Quote Icon */}
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#8BB3A4] transition-colors duration-300 group-hover:border-[#8BB3A4]/40"
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
        <blockquote className="text-sm sm:text-[15px] lg:text-base leading-7 sm:leading-8 text-white/90 font-normal">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>

      {/* ── Bottom Section: Outcome Pill + Client Profile ── */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-white/10">
        {highlight && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-[#8BB3A4]/15 border border-[#8BB3A4]/30 px-2.5 py-1 text-[11px] font-medium text-[#8BB3A4]">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-[#8BB3A4]"
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
                className="h-11 w-11 shrink-0 rounded-full object-cover border border-[#8BB3A4]/35"
              />
            ) : (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#8BB3A4]/35 bg-[#8BB3A4]/15 text-xs font-bold text-[#8BB3A4] shadow-sm"
                aria-hidden="true"
              >
                {getInitials(author)}
              </div>
            )}

            <div className="min-w-0">
              <div className="truncate text-sm sm:text-[15px] font-bold text-white transition-colors duration-300 group-hover:text-[#8BB3A4]">
                {author}
              </div>
              <div className="truncate text-xs text-white/60 mt-0.5">
                {role}
                {company ? (
                  <>
                    <span className="mx-1.5 text-white/30">•</span>
                    <span className="text-white/80">{company}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Subtle Verified Partnership Indicator */}
          <div
            className="hidden sm:flex items-center gap-0.5 text-[#8BB3A4] shrink-0"
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
    return CANONICAL_TESTIMONIALS;
  });
  const [isUsingCanonical, setIsUsingCanonical] = useState<boolean>(
    () => !(initialTestimonials && initialTestimonials.length > 0)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      setTestimonials(initialTestimonials);
      setIsUsingCanonical(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadTestimonials() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/v1/testimonials`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Filter valid active testimonials
          const activeOnly = data.filter(
            (item: any) =>
              item.isActive !== false &&
              (item.quoteFa?.trim() || item.quoteEn?.trim()) &&
              (item.authorFa?.trim() || item.authorEn?.trim())
          );

          if (activeOnly.length > 0) {
            setTestimonials(activeOnly);
            setIsUsingCanonical(false);
            return;
          }
        }
        // Fall back gracefully to canonical testimonials
        setTestimonials(CANONICAL_TESTIMONIALS);
        setIsUsingCanonical(true);
      } catch {
        // Fall back gracefully to canonical testimonials on error/offline
        setTestimonials(CANONICAL_TESTIMONIALS);
        setIsUsingCanonical(true);
      } finally {
        setLoading(false);
      }
    }

    loadTestimonials();

    return () => {
      controller.abort();
    };
  }, [initialTestimonials]);

  return (
    <section
      id="testimonials"
      className="section-viewport w-full relative overflow-hidden bg-[#1F1F1E] text-white border-y border-white/10 transition-colors duration-500"
      style={{ backgroundColor: "#1F1F1E" }}
    >
      <div dir={isRtl ? "rtl" : "ltr"} className="w-full">
        <div className="w-full px-2 sm:px-[10px] py-14 sm:py-20 lg:py-24 relative overflow-hidden">
          {/* Subtle, restrained ambient neutral glow */}
          <div className="absolute -top-36 -left-36 w-96 h-96 bg-[#8BB3A4]/[0.04] rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute -bottom-36 -right-36 w-[460px] h-[460px] bg-black/30 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16">
            <ScrollReveal>
              {/* ── Section Header ───────────────────────────────────────── */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-14">
                <div className="max-w-3xl">
                  {/* Category Eyebrow - Matching About Us Section Pattern */}
                  <div className="inline-flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#8BB3A4] uppercase">
                    <span className="h-px w-10 bg-[#8BB3A4]/50" />
                    <span>
                      {isRtl ? "تجربه همکاری با آن‌ساپ" : "CLIENT TESTIMONIALS"}
                    </span>
                    {isUsingCanonical && process.env.NODE_ENV === "development" && (
                      <span className="border-s border-[#8BB3A4]/35 ps-2 text-[10px] font-medium text-[#8BB3A4]/80 normal-case tracking-normal">
                        {isRtl
                          ? "پیش‌نمایش محیط توسعه"
                          : "Dev Preview"}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 sm:mt-5 font-display text-3xl sm:text-4xl lg:text-5xl lg:whitespace-nowrap font-bold leading-[1.2] tracking-tight text-white">
                    {isRtl ? (
                      <>
                        دیدگاه <span className="text-[#8BB3A4]">مشتریان ما</span>
                      </>
                    ) : (
                      <>
                        What Our <span className="text-[#8BB3A4]">Clients Say</span>
                      </>
                    )}
                  </h2>

                  <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-white/70 leading-relaxed sm:leading-8 max-w-2xl">
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
                    } h-[280px] w-full flex-col justify-between rounded-[24px] border border-white/10 bg-[#262625] p-7 animate-pulse`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-28 rounded-full bg-white/[0.08]" />
                      <div className="h-9 w-9 rounded-full bg-white/[0.08]" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-4 w-full rounded bg-white/[0.08]" />
                      <div className="h-4 w-11/12 rounded bg-white/[0.08]" />
                      <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <div className="h-11 w-11 rounded-full bg-white/[0.08]" />
                      <div className="space-y-2">
                        <div className="h-3.5 w-28 rounded bg-white/[0.08]" />
                        <div className="h-3 w-20 rounded bg-white/[0.06]" />
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
                                  ? "w-7 bg-[#8BB3A4]"
                                  : "w-2 bg-white/25 hover:bg-white/45"
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
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-all hover:border-[#8BB3A4]/50 hover:text-[#8BB3A4] disabled:opacity-35 disabled:pointer-events-none cursor-pointer shadow-sm"
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
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-all hover:border-[#8BB3A4]/50 hover:text-[#8BB3A4] disabled:opacity-35 disabled:pointer-events-none cursor-pointer shadow-sm"
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
