import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { triggerRevalidation } from '../services/revalidateService.js';

const router = Router();
const prisma = new PrismaClient();

export interface SocialLinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  order: number;
}

const SOCIAL_META_KIND = 'social_meta';
const SOCIAL_ITEM_KIND = 'social';

const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: 'social-instagram',
    name: 'اینستاگرام آن‌ساپ',
    url: 'https://instagram.com/onsupp.ir',
    icon: 'instagram',
    isActive: true,
    order: 0,
  },
  {
    id: 'social-telegram-media',
    name: 'کانال تلگرام شبکه‌های اجتماعی آن‌ساپ',
    url: 'https://t.me/onsupp_socialmedia',
    icon: 'telegram',
    isActive: true,
    order: 1,
  },
  {
    id: 'social-telegram-web',
    name: 'پشتیبانی وب‌سایت در تلگرام',
    url: 'https://t.me/onsupp_web',
    icon: 'link',
    isActive: true,
    order: 2,
  },
];

function isValidSocialUrl(raw: unknown): boolean {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 500 || /\s/.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (!parsed.hostname || !parsed.hostname.includes('.')) return false;
    return true;
  } catch {
    return false;
  }
}

function sanitizeAndValidateSocialLinks(input: unknown): {
  valid: boolean;
  items?: SocialLinkItem[];
  error?: string;
} {
  if (!Array.isArray(input)) {
    return { valid: false, error: 'فرمت لیست شبکه‌های اجتماعی نامعتبر است' };
  }

  const normalized: SocialLinkItem[] = [];
  for (let idx = 0; idx < input.length; idx++) {
    const raw = input[idx];
    if (!raw || typeof raw !== 'object') {
      return { valid: false, error: `آیتم شماره ${idx + 1} شبکه‌های اجتماعی نامعتبر است` };
    }

    const name = typeof (raw as any).name === 'string' ? (raw as any).name.trim() : '';
    if (!name || name.length > 100) {
      return {
        valid: false,
        error: `نام شبکه اجتماعی در ردیف ${idx + 1} الزامی است و نباید بیش از ۱۰۰ کاراکتر باشد`,
      };
    }

    const url = typeof (raw as any).url === 'string' ? (raw as any).url.trim() : '';
    if (!isValidSocialUrl(url)) {
      return {
        valid: false,
        error: `آدرس لینک (URL) برای «${name}» نامعتبر است. لطفاً آدرس معتبر با http:// یا https:// وارد کنید`,
      };
    }

    const rawIcon = typeof (raw as any).icon === 'string' ? (raw as any).icon.trim().toLowerCase() : 'link';
    const icon = /^[a-z0-9-]+$/.test(rawIcon) && rawIcon.length <= 40 ? rawIcon : 'link';

    const rawId = typeof (raw as any).id === 'string' ? (raw as any).id.trim() : '';
    const id = rawId && rawId.length <= 80 ? rawId : `social-${Date.now()}-${idx}`;

    const isActive = (raw as any).isActive === undefined ? true : Boolean((raw as any).isActive);

    normalized.push({
      id,
      name,
      url,
      icon,
      isActive,
      order: idx,
    });
  }

  return { valid: true, items: normalized };
}

function extractSocialLinks(contactChannels: unknown): SocialLinkItem[] {
  if (!Array.isArray(contactChannels)) {
    return DEFAULT_SOCIAL_LINKS;
  }

  const hasSocialMeta = contactChannels.some(
    (item: any) => item && typeof item === 'object' && item.kind === SOCIAL_META_KIND
  );
  const socialRows = contactChannels.filter(
    (item: any) => item && typeof item === 'object' && item.kind === SOCIAL_ITEM_KIND
  );

  if (!hasSocialMeta && socialRows.length === 0) {
    return DEFAULT_SOCIAL_LINKS;
  }

  return socialRows
    .map((item: any, idx: number) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `social-${idx}`,
      name: typeof item.name === 'string' ? item.name.trim() : '',
      url: typeof item.url === 'string' ? item.url.trim() : '',
      icon: typeof item.icon === 'string' && item.icon.trim() ? item.icon.trim() : 'link',
      isActive: item.isActive === undefined ? true : Boolean(item.isActive),
      order: typeof item.order === 'number' && Number.isFinite(item.order) ? item.order : idx,
    }))
    .filter((item) => item.name.length > 0 && isValidSocialUrl(item.url))
    .sort((a, b) => a.order - b.order)
    .map((item, idx) => ({ ...item, order: idx }));
}

function mergeSocialLinksIntoContactChannels(
  baseChannels: unknown,
  socialLinks: SocialLinkItem[]
): any[] {
  const preserved = Array.isArray(baseChannels)
    ? baseChannels.filter(
        (item: any) =>
          !(
            item &&
            typeof item === 'object' &&
            (item.kind === SOCIAL_ITEM_KIND || item.kind === SOCIAL_META_KIND)
          )
      )
    : [];

  return [
    ...preserved,
    { id: '__social_meta__', kind: SOCIAL_META_KIND, initialized: true },
    ...socialLinks.map((item, idx) => ({
      ...item,
      kind: SOCIAL_ITEM_KIND,
      order: idx,
    })),
  ];
}

const SETTINGS_FIELDS = [
  'siteNameFa',
  'siteNameEn',
  'siteTitleFa',
  'siteTitleEn',
  'siteDescFa',
  'siteDescEn',
  'defaultKeywordsFa',
  'defaultKeywordsEn',
  'metaTitleTemplate',
  'canonicalBaseUrl',
  'headerLogoUrl',
  'headerDarkLogoUrl',
  'footerLogoUrl',
  'ogImageUrl',
  'faviconUrl',
  'phone',
  'secondaryPhone',
  'phoneLabelFa',
  'phoneLabelEn',
  'email',
  'emailLabelFa',
  'emailLabelEn',
  'responseTimeFa',
  'responseTimeEn',
  'telegramHandle',
  'telegramUrl',
  'instagramUrl',
  'linkedinUrl',
  'contactChannels',
  'addressFa',
  'addressEn',
  'workingHoursFa',
  'workingHoursEn',
  'googleMapsUrl',
  'footerCopyrightFa',
  'footerCopyrightEn',
  'footerDescriptionFa',
  'footerDescriptionEn',
  'footerLinks',
  'headerNavJson',
] as const;

// GET /api/v1/settings (Public — site-wide settings & coordinates)
router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: 1 } });
    }
    res.json({
      ...settings,
      socialLinks: extractSocialLinks(settings.contactChannels),
    });
  } catch (error) {
    console.error('[settings] fetch error:', error);
    res.status(500).json({ error: 'دریافت تنظیمات وب‌سایت ناموفق بود' });
  }
});

// PUT /api/v1/settings (Admin — update site settings)
router.put('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const existing = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    const data: Record<string, any> = {};

    for (const field of SETTINGS_FIELDS) {
      if (field === 'contactChannels' && req.body.socialLinks !== undefined) {
        continue;
      }
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    if (req.body.socialLinks !== undefined) {
      const validation = sanitizeAndValidateSocialLinks(req.body.socialLinks);
      if (!validation.valid || !validation.items) {
        res.status(400).json({ error: validation.error || 'اطلاعات شبکه‌های اجتماعی نامعتبر است' });
        return;
      }
      const baseChannels = existing?.contactChannels ?? req.body.contactChannels ?? [];
      data.contactChannels = mergeSocialLinksIntoContactChannels(baseChannels, validation.items);
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_SITE_SETTINGS',
          targetId: 1,
          details: 'Updated global site settings and coordinates',
          ipAddress: req.ip || null,
        },
      });
    }

    try {
      await triggerRevalidation({
        tags: ['settings', 'navigation', 'footer'],
        paths: ['/'],
      });
    } catch (revErr) {
      console.warn('[settings] revalidation warning:', revErr);
    }

    res.json({
      ...settings,
      socialLinks: extractSocialLinks(settings.contactChannels),
    });
  } catch (error) {
    console.error('[settings] update error:', error);
    res.status(500).json({ error: 'ذخیره تنظیمات وب‌سایت ناموفق بود' });
  }
});

export default router;
