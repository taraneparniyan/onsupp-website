// ─── About Page Content Model ───────────────────────────────────────────────
import { BACKEND_URL } from "@/config/api";
// Data layer for the /about page. Presentation components only consume the
// types below, so the static placeholder content can later be swapped for a
// CMS / backend response (`/api/v1/about-page`) without touching any UI code.
//
// Field naming follows the existing project convention (`xxxFa` / `xxxEn`),
// matching the Prisma-backed admin modules (pricing, about, services).
//
// IMPORTANT: Every person, name, biography and photo in this file is a
// TEMPORARY PLACEHOLDER. No real OnSupp employee is represented here.

export type SocialPlatform =
  | "linkedin"
  | "instagram"
  | "x"
  | "telegram"
  | "behance"
  | "dribbble"
  | "github"
  | "website"
  | "email";

export type SocialLink = {
  platform: SocialPlatform;
  /** Absolute URL, or `mailto:` for email. */
  url: string;
};

/**
 * Uploadable media slot. `src === null` renders a neutral, clearly-labelled
 * placeholder instead of an image. Relative paths (e.g. `/uploads/team/a.webp`)
 * are served through the Next.js rewrite to the backend.
 */
export type MediaAsset = {
  src: string | null;
  altFa: string;
  altEn: string;
  /** CSS object-position, e.g. "50% 30%" – lets editors keep faces in frame. */
  focalPoint?: string;
};

export type TeamMember = {
  id: string;
  /** Display order – ascending. Managed from the CMS. */
  position: number;
  isPublished: boolean;
  nameFa: string;
  nameEn: string;
  roleFa: string;
  roleEn: string;
  departmentFa: string;
  departmentEn: string;
  bioFa: string;
  bioEn: string;
  photo: MediaAsset;
  links: SocialLink[];
};

export type CeoProfile = {
  nameFa: string;
  nameEn: string;
  roleFa: string;
  roleEn: string;
  quoteFa: string;
  quoteEn: string;
  /** Paragraph list keeps rich formatting out of the presentation layer. */
  bioFa: string[];
  bioEn: string[];
  photo: MediaAsset;
  links: SocialLink[];
};

export type AboutValue = {
  id: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
};

export type AboutPageContent = {
  hero: {
    eyebrowFa: string;
    eyebrowEn: string;
    titleFa: string;
    titleEn: string;
    captionFa: string;
    captionEn: string;
    photo: MediaAsset;
  };
  intro: {
    eyebrowFa: string;
    eyebrowEn: string;
    titleFa: string;
    titleEn: string;
    leadFa: string;
    leadEn: string;
    approachFa: string;
    approachEn: string;
    values: AboutValue[];
  };
  ceo: CeoProfile;
  team: {
    eyebrowFa: string;
    eyebrowEn: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
    members: TeamMember[];
  };
};

// ─── Placeholder Content ────────────────────────────────────────────────────

const placeholderPhoto = (altFa: string, altEn: string): MediaAsset => ({
  src: null,
  altFa,
  altEn,
});

const PLACEHOLDER_BIO_FA =
  "متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی با معرفی کوتاه، حوزه تخصص و نقش این همکار در پروژه‌های آن‌ساپ جایگزین می‌شود.";
const PLACEHOLDER_BIO_EN =
  "Temporary biography. This text will be replaced with a short introduction, area of expertise and this member's role in OnSupp projects.";

const PLACEHOLDER_MEMBERS: Omit<
  TeamMember,
  "nameFa" | "nameEn" | "bioFa" | "bioEn" | "photo" | "isPublished" | "position"
>[] = [
  { id: "member-01", roleFa: "مدیر استراتژی", roleEn: "Strategy Lead", departmentFa: "استراتژی و رشد", departmentEn: "Strategy & Growth", links: [{ platform: "linkedin", url: "#" }] },
  { id: "member-02", roleFa: "مدیر هنری", roleEn: "Art Director", departmentFa: "برندینگ و هویت", departmentEn: "Branding & Identity", links: [{ platform: "behance", url: "#" }, { platform: "instagram", url: "#" }] },
  { id: "member-03", roleFa: "سرپرست توسعه نرم‌افزار", roleEn: "Engineering Lead", departmentFa: "توسعه نرم‌افزار", departmentEn: "Software Development", links: [{ platform: "github", url: "#" }, { platform: "linkedin", url: "#" }] },
  { id: "member-04", roleFa: "کارشناس ارشد سئو", roleEn: "Senior SEO Specialist", departmentFa: "دیجیتال مارکتینگ", departmentEn: "Digital Marketing", links: [{ platform: "linkedin", url: "#" }] },
  { id: "member-05", roleFa: "طراح تجربه کاربری", roleEn: "UX / UI Designer", departmentFa: "طراحی محصول", departmentEn: "Product Design", links: [{ platform: "dribbble", url: "#" }] },
  { id: "member-06", roleFa: "مدیر تولید محتوا", roleEn: "Content Lead", departmentFa: "محتوا و رسانه", departmentEn: "Content & Media", links: [{ platform: "instagram", url: "#" }, { platform: "telegram", url: "#" }] },
  { id: "member-07", roleFa: "مدیر پروژه", roleEn: "Project Manager", departmentFa: "مدیریت پروژه", departmentEn: "Project Management", links: [{ platform: "linkedin", url: "#" }] },
  { id: "member-08", roleFa: "تولیدکننده موشن و ویدیو", roleEn: "Motion & Video Producer", departmentFa: "استودیو", departmentEn: "Studio", links: [{ platform: "instagram", url: "#" }] },
];

const toFaDigits = (value: string) =>
  value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export const ABOUT_PAGE_PLACEHOLDER: AboutPageContent = {
  hero: {
    eyebrowFa: "درباره آن‌ساپ",
    eyebrowEn: "About OnSupp",
    titleFa: "آدم‌هایی که پشت هر پروژه ایستاده‌اند",
    titleEn: "The people behind every project",
    captionFa: "",
    captionEn: "",
    photo: placeholderPhoto("عکس گروهی تیم آن‌ساپ", "OnSupp team group photograph"),
  },
  intro: {
    eyebrowFa: "درباره ما",
    eyebrowEn: "About Us",
    titleFa: "یک تیم، از استراتژی تا اجرا",
    titleEn: "One team, from strategy to delivery",
    leadFa:
      "آن‌ساپ یک آژانس دیجیتال است که استراتژی، طراحی، فناوری و رسانه را زیر یک سقف کنار هم آورده است. ما با برندهایی کار می‌کنیم که می‌خواهند رشدشان روی پایه‌ای روشن و قابل‌اندازه‌گیری بنا شود.",
    leadEn:
      "OnSupp is a digital agency that brings strategy, design, technology and media together under one roof. We work with brands that want their growth built on a clear, measurable foundation.",
    approachFa:
      "رویکرد ما ساده است: پیش از ساختن، گوش می‌دهیم. هر پروژه با شناخت کسب‌وکار و مخاطب شروع می‌شود و تصمیم‌ها بر اساس داده گرفته می‌شوند، نه حدس. تیم‌های ما از ابتدا تا انتها کنار هم کار می‌کنند تا آنچه طراحی می‌شود، همان چیزی باشد که اجرا می‌شود.",
    approachEn:
      "Our approach is simple: we listen before we build. Every project starts with understanding the business and its audience, and decisions are made on data rather than assumption. Our teams work side by side from the first brief to launch, so what gets designed is exactly what gets delivered.",
    values: [
      {
        id: "clarity",
        titleFa: "شفافیت",
        titleEn: "Clarity",
        descriptionFa: "اهداف، زمان‌بندی و نتایج را از روز اول روشن و قابل پیگیری نگه می‌داریم.",
        descriptionEn: "Goals, timelines and results stay visible and trackable from day one.",
      },
      {
        id: "craft",
        titleFa: "دقت در اجرا",
        titleEn: "Craft",
        descriptionFa: "جزئیات را جدی می‌گیریم؛ از یک خط کد تا انتخاب یک کلمه.",
        descriptionEn: "We take details seriously — from a single line of code to the choice of a word.",
      },
      {
        id: "partnership",
        titleFa: "همراهی بلندمدت",
        titleEn: "Partnership",
        descriptionFa: "پروژه با تحویل تمام نمی‌شود؛ کنار برند می‌مانیم تا رشد ادامه پیدا کند.",
        descriptionEn: "Delivery isn't the finish line; we stay alongside the brand as it grows.",
      },
    ],
  },
  ceo: {
    nameFa: "نام مدیرعامل",
    nameEn: "CEO Name",
    roleFa: "بنیان‌گذار و مدیرعامل",
    roleEn: "Founder & CEO",
    quoteFa: "ما آن‌ساپ را ساختیم تا برندها مجبور نباشند بین خلاقیت و نتیجه یکی را انتخاب کنند.",
    quoteEn: "We built OnSupp so brands never have to choose between creativity and results.",
    bioFa: [
      "متن موقت بیوگرافی مدیرعامل. این بخش با معرفی مسیر حرفه‌ای، تجربه‌ها و نگاه شخصی ایشان به آینده آن‌ساپ جایگزین خواهد شد.",
      "پاراگراف دوم برای توضیح فلسفه مدیریتی، حوزه‌های تمرکز و نقش ایشان در شکل‌گیری فرهنگ تیم در نظر گرفته شده است.",
    ],
    bioEn: [
      "Temporary CEO biography. This section will be replaced with their professional journey, experience and personal outlook on OnSupp's future.",
      "The second paragraph is reserved for their leadership philosophy, areas of focus and role in shaping the team's culture.",
    ],
    photo: placeholderPhoto("پرتره مدیرعامل آن‌ساپ", "Portrait of the OnSupp CEO"),
    links: [
      { platform: "linkedin", url: "#" },
      { platform: "email", url: "mailto:info@onsupp.ir" },
    ],
  },
  team: {
    eyebrowFa: "تیم ما",
    eyebrowEn: "Our Team",
    titleFa: "تخصص‌های متفاوت، یک مسیر مشترک",
    titleEn: "Different disciplines, one shared direction",
    descriptionFa:
      "استراتژیست‌ها، طراحان، توسعه‌دهندگان و تولیدکنندگان محتوا؛ هر کدام با نگاه خودشان، کنار هم برای یک هدف.",
    descriptionEn:
      "Strategists, designers, engineers and content makers — each with their own perspective, working together toward one goal.",
    members: PLACEHOLDER_MEMBERS.map((m, i) => {
      const n = String(i + 1).padStart(2, "0");
      return {
        ...m,
        position: i,
        isPublished: true,
        nameFa: `عضو تیم ${toFaDigits(n)}`,
        nameEn: `Team Member ${n}`,
        bioFa: PLACEHOLDER_BIO_FA,
        bioEn: PLACEHOLDER_BIO_EN,
        photo: placeholderPhoto(`عکس پروفایل عضو تیم ${toFaDigits(n)}`, `Profile photo of team member ${n}`),
      };
    }),
  },
};

// ─── Data Access ────────────────────────────────────────────────────────────

/** Published members, ordered by `position` (CMS display order). */
export function getVisibleMembers(members: TeamMember[]): TeamMember[] {
  return members
    .filter((m) => m.isPublished)
    .sort((a, b) => a.position - b.position);
}

/**
 * Single entry point for the About page content.
 * Future CMS integration: fetch from the backend here, validate the payload,
 * and fall back to `ABOUT_PAGE_PLACEHOLDER` on failure. UI stays unchanged.
 */
export async function getAboutPageContent(): Promise<AboutPageContent> {
  let content = { ...ABOUT_PAGE_PLACEHOLDER };

  try {
    const [aboutRes, membersRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/v1/about-page`, {
        next: { tags: ["about-page"] },
      }).catch(() => null),
      fetch(`${BACKEND_URL}/api/v1/team-members`, {
        next: { tags: ["team-members"] },
      }).catch(() => null),
    ]);

    if (aboutRes && aboutRes.ok) {
      const data = await aboutRes.json();
      if (data && typeof data === "object") {
        content = {
          ...content,
          hero: {
            ...content.hero,
            eyebrowFa: data.heroEyebrowFa || content.hero.eyebrowFa,
            eyebrowEn: data.heroEyebrowEn || content.hero.eyebrowEn,
            titleFa: data.heroTitleFa || content.hero.titleFa,
            titleEn: data.heroTitleEn || content.hero.titleEn,
            captionFa: data.heroCaptionFa ?? content.hero.captionFa,
            captionEn: data.heroCaptionEn ?? content.hero.captionEn,
            photo: data.heroImageUrl
              ? {
                  src: data.heroImageUrl,
                  altFa: data.heroImageAltFa || content.hero.photo.altFa,
                  altEn: data.heroImageAltEn || content.hero.photo.altEn,
                  focalPoint: "50% 50%",
                }
              : content.hero.photo,
          },
          intro: {
            ...content.intro,
            eyebrowFa: data.introEyebrowFa || content.intro.eyebrowFa,
            eyebrowEn: data.introEyebrowEn || content.intro.eyebrowEn,
            titleFa: data.introTitleFa || content.intro.titleFa,
            titleEn: data.introTitleEn || content.intro.titleEn,
            leadFa: data.introLeadFa || content.intro.leadFa,
            leadEn: data.introLeadEn || content.intro.leadEn,
            approachFa: data.introApproachFa || content.intro.approachFa,
            approachEn: data.introApproachEn || content.intro.approachEn,
            values:
              Array.isArray(data.coreValues) && data.coreValues.length > 0
                ? data.coreValues
                : content.intro.values,
          },
          ceo: {
            ...content.ceo,
            nameFa: data.ceoNameFa || content.ceo.nameFa,
            nameEn: data.ceoNameEn || content.ceo.nameEn,
            roleFa: data.ceoRoleFa || content.ceo.roleFa,
            roleEn: data.ceoRoleEn || content.ceo.roleEn,
            quoteFa: data.ceoQuoteFa || content.ceo.quoteFa,
            quoteEn: data.ceoQuoteEn || content.ceo.quoteEn,
            bioFa:
              Array.isArray(data.ceoBioFa) && data.ceoBioFa.length > 0
                ? data.ceoBioFa
                : content.ceo.bioFa,
            bioEn:
              Array.isArray(data.ceoBioEn) && data.ceoBioEn.length > 0
                ? data.ceoBioEn
                : content.ceo.bioEn,
            photo: data.ceoPhotoUrl
              ? {
                  src: data.ceoPhotoUrl,
                  altFa: data.ceoNameFa || content.ceo.photo.altFa,
                  altEn: data.ceoNameEn || content.ceo.photo.altEn,
                  focalPoint: "50% 50%",
                }
              : content.ceo.photo,
            links:
              Array.isArray(data.ceoSocialLinks) && data.ceoSocialLinks.length > 0
                ? data.ceoSocialLinks
                : content.ceo.links,
          },
        };
      }
    }

    if (membersRes && membersRes.ok) {
      const membersData = await membersRes.json();
      if (Array.isArray(membersData) && membersData.length > 0) {
        const mappedMembers: TeamMember[] = membersData.map(
          (m: any, idx: number) => ({
            id: String(m.id || idx),
            position: typeof m.position === "number" ? m.position : idx,
            isPublished: m.isPublished !== false && m.status !== "DRAFT",
            nameFa: m.nameFa || "",
            nameEn: m.nameEn || "",
            roleFa: m.roleFa || "",
            roleEn: m.roleEn || "",
            departmentFa: m.departmentFa || "",
            departmentEn: m.departmentEn || "",
            bioFa: m.bioFa || "",
            bioEn: m.bioEn || "",
            photo: {
              src: m.photoUrl || null,
              altFa: m.photoAltFa || m.nameFa || "",
              altEn: m.photoAltEn || m.nameEn || "",
              focalPoint: m.focalPoint || "50% 50%",
            },
            links: Array.isArray(m.socialLinks) ? m.socialLinks : [],
          })
        );

        content.team = {
          ...content.team,
          members: mappedMembers,
        };
      }
    }
  } catch (error) {
    // Non-blocking fallback to placeholder content
  }

  return content;
}
