import React from "react";

export interface SocialLinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  order: number;
}

export interface SocialIconDef {
  key: string;
  labelFa: string;
  labelEn: string;
}

export const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: "social-instagram",
    name: "اینستاگرام آن‌ساپ",
    url: "https://instagram.com/onsupp.ir",
    icon: "instagram",
    isActive: true,
    order: 0,
  },
  {
    id: "social-telegram-media",
    name: "کانال تلگرام شبکه‌های اجتماعی آن‌ساپ",
    url: "https://t.me/onsupp_socialmedia",
    icon: "telegram",
    isActive: true,
    order: 1,
  },
  {
    id: "social-telegram-web",
    name: "پشتیبانی وب‌سایت در تلگرام",
    url: "https://t.me/onsupp_web",
    icon: "link",
    isActive: true,
    order: 2,
  },
];

export const SOCIAL_ICON_LIBRARY: SocialIconDef[] = [
  { key: "instagram", labelFa: "اینستاگرام", labelEn: "Instagram" },
  { key: "telegram", labelFa: "تلگرام", labelEn: "Telegram" },
  { key: "whatsapp", labelFa: "واتساپ", labelEn: "WhatsApp" },
  { key: "linkedin", labelFa: "لینکدین", labelEn: "LinkedIn" },
  { key: "youtube", labelFa: "یوتیوب", labelEn: "YouTube" },
  { key: "x", labelFa: "ایکس (توییتر)", labelEn: "X / Twitter" },
  { key: "aparat", labelFa: "آپارات", labelEn: "Aparat" },
  { key: "eitaa", labelFa: "ایتا", labelEn: "Eitaa" },
  { key: "bale", labelFa: "بله", labelEn: "Bale" },
  { key: "rubika", labelFa: "روبیکا", labelEn: "Rubika" },
  { key: "facebook", labelFa: "فیسبوک", labelEn: "Facebook" },
  { key: "tiktok", labelFa: "تیک‌تاک", labelEn: "TikTok" },
  { key: "github", labelFa: "گیت‌هاب", labelEn: "GitHub" },
  { key: "dribbble", labelFa: "دریبل", labelEn: "Dribbble" },
  { key: "behance", labelFa: "بیهنس", labelEn: "Behance" },
  { key: "pinterest", labelFa: "پینترست", labelEn: "Pinterest" },
  { key: "globe", labelFa: "وب‌سایت", labelEn: "Website" },
  { key: "link", labelFa: "لینک مستقیم", labelEn: "Direct Link" },
  { key: "message", labelFa: "پشتیبانی آنلاین", labelEn: "Live Chat" },
  { key: "podcast", labelFa: "پادکست / رسانه", labelEn: "Podcast" },
];

export function validateSocialUrl(rawUrl: string): {
  valid: boolean;
  normalized?: string;
  errorFa?: string;
} {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) {
    return { valid: false, errorFa: "آدرس لینک (URL) الزامی است." };
  }
  if (/\s/.test(trimmed) || trimmed.length > 500) {
    return { valid: false, errorFa: "آدرس لینک نباید شامل فاصله باشد و باید حداکثر ۵۰۰ کاراکتر باشد." };
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, errorFa: "آدرس لینک باید با http:// یا https:// شروع شود." };
    }
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { valid: false, errorFa: "دامنه واردشده در آدرس لینک معتبر نیست." };
    }
    return { valid: true, normalized: trimmed };
  } catch {
    return { valid: false, errorFa: "فرمت آدرس URL نامعتبر است (مثال: https://instagram.com/onsupp.ir)." };
  }
}

export function resolveActiveSocialLinks(settings?: {
  socialLinks?: SocialLinkItem[];
} | null): SocialLinkItem[] {
  if (settings && Array.isArray(settings.socialLinks)) {
    return [...settings.socialLinks]
      .filter((item) => item && item.isActive !== false && validateSocialUrl(item.url).valid)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  return DEFAULT_SOCIAL_LINKS;
}

export function SocialNetworkIcon({
  icon,
  className = "w-4 h-4",
}: {
  icon?: string;
  className?: string;
}) {
  const key = (icon || "link").toLowerCase();
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (key) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...common}>
          <path d="M21 4L3 11l6 2 2 6 3-4 5 4 2-15z" />
          <path d="M9 13l8-6" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M9.5 9.5c.3 1.5 1.8 3.2 3.5 3.8l1.2-.8 1.5.7c-.2 1-.9 1.6-1.8 1.6-2.5 0-5.4-2.8-5.4-5.4 0-.9.6-1.6 1.6-1.8l.7 1.5-.8 1.2z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <polygon points="10 9.5 15.5 12 10 14.5 10 9.5" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    case "aparat":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="8.2" r="1.4" />
          <circle cx="15.8" cy="12" r="1.4" />
          <circle cx="12" cy="15.8" r="1.4" />
          <circle cx="8.2" cy="12" r="1.4" />
        </svg>
      );
    case "eitaa":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 0 0-7.7 13.7L3.5 21l4.3-.8A9 9 0 1 0 12 3z" />
          <path d="M8.5 12.5c1.5 1.8 4.2 1.8 5.8.2.9-.9.8-2.3-.2-3-.9-.7-2.2-.5-2.8.4-.5.8-.3 1.9.5 2.4" />
        </svg>
      );
    case "bale":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H9l-5 4v-15.5z" />
          <path d="M8.5 9.5l2.5 2.5 4.5-4.5" />
        </svg>
      );
    case "rubika":
      return (
        <svg {...common}>
          <path d="M12 2.5l8 4.6v9.8l-8 4.6-8-4.6V7.1l8-4.6z" />
          <path d="M12 7.5l4 2.3v4.4L12 16.5l-4-2.3V9.8l4-2.3z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M15 8h-2a2 2 0 0 0-2 2v9M9 13h6" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5c.3 0 .7.1 1 .2V8.2A6.5 6.5 0 1 0 17 14.5V8.6a6.2 6.2 0 0 0 4 1.4V6.8A3.8 3.8 0 0 1 17.2 4H14z" />
        </svg>
      );
    case "github":
      return (
        <svg {...common}>
          <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
        </svg>
      );
    case "dribbble":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 3.8c4 5 6 10 7 16.4M3.2 10.5c6 .5 11-.8 15-4.3M5 18c3-4 8-6 15.5-4.5" />
        </svg>
      );
    case "behance":
      return (
        <svg {...common}>
          <path d="M3 7h5a2.5 2.5 0 0 1 0 5H3V7zM3 12h5.5a2.5 2.5 0 0 1 0 5H3v-5zM14 8h5M14 14h7a3.5 3.5 0 1 0-1 2.5" />
        </svg>
      );
    case "pinterest":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10.5 19l1.8-7.5M9.5 12.5a3 3 0 1 1 5.5 1.5c-.6 1.6-2.5 2-3.5 1" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h8M8 13h5" />
        </svg>
      );
    case "podcast":
      return (
        <svg {...common}>
          <circle cx="12" cy="11" r="2" />
          <path d="M12 13v7M8.5 14.5a5 5 0 1 1 7 0M5.5 17a8.5 8.5 0 1 1 13 0" />
        </svg>
      );
    case "link":
    default:
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
  }
}
