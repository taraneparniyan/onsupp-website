import { Router, Request, Response } from "express";
import { PrismaClient, ContentStatus } from "@prisma/client";
import { authenticate, requireAdmin, AuthenticatedRequest } from "../middleware/auth.js";
import { logAudit } from "../services/auditService.js";
import { triggerRevalidation } from "../services/revalidationService.js";

const router = Router();

function revalidateCaseStudy(slug?: string) {
  triggerRevalidation({ path: "/case-studies" }).catch(() => {});
  triggerRevalidation({ path: "/portfolio" }).catch(() => {});
  triggerRevalidation({ path: "/" }).catch(() => {});
  triggerRevalidation({ tag: "case-studies" }).catch(() => {});
  triggerRevalidation({ tag: "casestudies" }).catch(() => {});
  if (slug) {
    triggerRevalidation({ path: `/case-studies/${slug}` }).catch(() => {});
    triggerRevalidation({ path: `/portfolio/${slug}` }).catch(() => {});
    triggerRevalidation({ tag: `casestudy-${slug}` }).catch(() => {});
  }
}
const prisma = new PrismaClient();

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return val ? parseInt(val, 10) : NaN;
}

// Get all published case studies (Public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await prisma.caseStudy.findMany({
      where: {
        published: true,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { position: "asc" },
    });
    res.json(items);
  } catch (error) {
    console.error("[casestudies] fetch error:", error);
    res.status(500).json({ error: "خطا در دریافت لیست نمونه‌کارها" });
  }
});

// Get all case studies including drafts (Admin only)
router.get("/admin", authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.caseStudy.findMany({
      orderBy: { position: "asc" },
    });
    res.json(items);
  } catch (error) {
    console.error("[casestudies] admin fetch error:", error);
    res.status(500).json({ error: "خطا در دریافت لیست کامل نمونه‌کارها" });
  }
});

// Explicit route to fetch by slug (Public checks published, Admin can view drafts)
router.get("/by-slug/:slug", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    if (!slug) {
      return res.status(400).json({ error: "نامک (slug) نامعتبر است" });
    }

    const item = await prisma.caseStudy.findFirst({
      where: { slug: slug.trim() },
    });

    if (!item) {
      return res.status(404).json({ error: "نمونه‌کار مورد نظر یافت نشد" });
    }

    const isAdmin = req.user && ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    if (!isAdmin && (!item.published || item.status !== ContentStatus.PUBLISHED)) {
      return res.status(404).json({ error: "نمونه‌کار مورد نظر یافت نشد یا در دسترس نیست" });
    }

    res.json(item);
  } catch (error) {
    console.error("[casestudies] by-slug fetch error:", error);
    res.status(500).json({ error: "خطا در دریافت جزئیات نمونه‌کار" });
  }
});

// Get a single case study by slug or ID (Public or Admin)
router.get("/:slugOrId", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const raw = Array.isArray(req.params.slugOrId) ? req.params.slugOrId[0] : req.params.slugOrId;
    const numericId = parseInt(raw, 10);

    let item = null;
    if (!Number.isNaN(numericId)) {
      item = await prisma.caseStudy.findUnique({ where: { id: numericId } });
    }

    if (!item) {
      item = await prisma.caseStudy.findFirst({
        where: { slug: raw },
      });
    }

    if (!item) {
      return res.status(404).json({ error: "نمونه‌کار مورد نظر یافت نشد" });
    }

    const isAdmin = req.user && ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    if (!isAdmin && (!item.published || item.status !== ContentStatus.PUBLISHED)) {
      return res.status(404).json({ error: "نمونه‌کار مورد نظر یافت نشد یا در دسترس نیست" });
    }

    res.json(item);
  } catch (error) {
    console.error("[casestudies] single fetch error:", error);
    res.status(500).json({ error: "خطا در دریافت جزئیات نمونه‌کار" });
  }
});

// Create a new case study (Admin only)
router.post("/", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      slug,
      client = "",
      clientEn = "",
      titleFa = "",
      titleEn = "",
      taglineFa = "",
      taglineEn = "",
      categoryFa = "",
      categoryEn = "",
      projectType = "website",
      descriptionFa = "",
      descriptionEn = "",
      imageUrl = null,
      secondaryImage = null,
      gallery = [],
      servicesFa = [],
      servicesEn = [],
      challengeFa = "",
      challengeEn = "",
      solutionFa = "",
      solutionEn = "",
      deliverablesFa = [],
      deliverablesEn = [],
      metricsFa = [],
      metricsEn = [],
      colorGradient = "from-[#1a1315] via-[#241a1e] to-[#100b0d]",
      accentColor = "#8BB3A4",
      glowColor = "rgba(139, 179, 164, 0.2)",
      previewType = "web",
      liveUrl = "#",
      metaTitleFa = "",
      metaTitleEn = "",
      metaDescFa = "",
      metaDescEn = "",
      keywordsFa = "",
      keywordsEn = "",
      canonicalUrl = "",
      ogImage = "",
      featured = true,
      published = true,
      status = "PUBLISHED",
      position,
      year = "۱۴۰۳",
    } = req.body;

    const count = await prisma.caseStudy.count();
    const finalPosition = typeof position === "number" ? position : count;
    const finalSlug = slug?.trim() || titleEn?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || `project-${Date.now()}`;

    const item = await prisma.caseStudy.create({
      data: {
        slug: finalSlug,
        client,
        clientEn,
        titleFa,
        titleEn,
        taglineFa,
        taglineEn,
        categoryFa,
        categoryEn,
        projectType,
        descriptionFa,
        descriptionEn,
        imageUrl,
        secondaryImage,
        gallery: Array.isArray(gallery) ? gallery : [],
        servicesFa: Array.isArray(servicesFa) ? servicesFa : [],
        servicesEn: Array.isArray(servicesEn) ? servicesEn : [],
        challengeFa,
        challengeEn,
        solutionFa,
        solutionEn,
        deliverablesFa: Array.isArray(deliverablesFa) ? deliverablesFa : [],
        deliverablesEn: Array.isArray(deliverablesEn) ? deliverablesEn : [],
        metricsFa,
        metricsEn,
        colorGradient,
        accentColor,
        glowColor,
        previewType,
        liveUrl,
        metaTitleFa,
        metaTitleEn,
        metaDescFa,
        metaDescEn,
        keywordsFa,
        keywordsEn,
        canonicalUrl,
        ogImage,
        featured: Boolean(featured),
        published: Boolean(published),
        status: status in ContentStatus ? (status as ContentStatus) : ContentStatus.PUBLISHED,
        position: finalPosition,
        year,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: "CREATE_CASE_STUDY",
      targetId: item.id,
      details: `Created case study: ${item.titleFa} (${item.slug})`,
      ipAddress: req.ip,
    });

    revalidateCaseStudy(item.slug);

    res.status(201).json(item);
  } catch (error) {
    console.error("[casestudies] create error:", error);
    res.status(500).json({ error: "خطا در ثبت نمونه‌کار جدید" });
  }
});

// Update an existing case study (Admin only)
router.put("/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "شناسه نامعتبر است" });
    }

    const {
      slug,
      client,
      clientEn,
      titleFa,
      titleEn,
      taglineFa,
      taglineEn,
      categoryFa,
      categoryEn,
      projectType,
      descriptionFa,
      descriptionEn,
      imageUrl,
      secondaryImage,
      gallery,
      servicesFa,
      servicesEn,
      challengeFa,
      challengeEn,
      solutionFa,
      solutionEn,
      deliverablesFa,
      deliverablesEn,
      metricsFa,
      metricsEn,
      colorGradient,
      accentColor,
      glowColor,
      previewType,
      liveUrl,
      metaTitleFa,
      metaTitleEn,
      metaDescFa,
      metaDescEn,
      keywordsFa,
      keywordsEn,
      canonicalUrl,
      ogImage,
      featured,
      published,
      status,
      position,
      year,
    } = req.body;

    const data: Record<string, any> = {};
    if (slug !== undefined) data.slug = String(slug).trim();
    if (client !== undefined) data.client = client;
    if (clientEn !== undefined) data.clientEn = clientEn;
    if (titleFa !== undefined) data.titleFa = titleFa;
    if (titleEn !== undefined) data.titleEn = titleEn;
    if (taglineFa !== undefined) data.taglineFa = taglineFa;
    if (taglineEn !== undefined) data.taglineEn = taglineEn;
    if (categoryFa !== undefined) data.categoryFa = categoryFa;
    if (categoryEn !== undefined) data.categoryEn = categoryEn;
    if (projectType !== undefined) data.projectType = projectType;
    if (descriptionFa !== undefined) data.descriptionFa = descriptionFa;
    if (descriptionEn !== undefined) data.descriptionEn = descriptionEn;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (secondaryImage !== undefined) data.secondaryImage = secondaryImage;
    if (gallery !== undefined) data.gallery = Array.isArray(gallery) ? gallery : [];
    if (servicesFa !== undefined) data.servicesFa = Array.isArray(servicesFa) ? servicesFa : [];
    if (servicesEn !== undefined) data.servicesEn = Array.isArray(servicesEn) ? servicesEn : [];
    if (challengeFa !== undefined) data.challengeFa = challengeFa;
    if (challengeEn !== undefined) data.challengeEn = challengeEn;
    if (solutionFa !== undefined) data.solutionFa = solutionFa;
    if (solutionEn !== undefined) data.solutionEn = solutionEn;
    if (deliverablesFa !== undefined) data.deliverablesFa = Array.isArray(deliverablesFa) ? deliverablesFa : [];
    if (deliverablesEn !== undefined) data.deliverablesEn = Array.isArray(deliverablesEn) ? deliverablesEn : [];
    if (metricsFa !== undefined) data.metricsFa = metricsFa;
    if (metricsEn !== undefined) data.metricsEn = metricsEn;
    if (colorGradient !== undefined) data.colorGradient = colorGradient;
    if (accentColor !== undefined) data.accentColor = accentColor;
    if (glowColor !== undefined) data.glowColor = glowColor;
    if (previewType !== undefined) data.previewType = previewType;
    if (liveUrl !== undefined) data.liveUrl = liveUrl;
    if (metaTitleFa !== undefined) data.metaTitleFa = metaTitleFa;
    if (metaTitleEn !== undefined) data.metaTitleEn = metaTitleEn;
    if (metaDescFa !== undefined) data.metaDescFa = metaDescFa;
    if (metaDescEn !== undefined) data.metaDescEn = metaDescEn;
    if (keywordsFa !== undefined) data.keywordsFa = keywordsFa;
    if (keywordsEn !== undefined) data.keywordsEn = keywordsEn;
    if (canonicalUrl !== undefined) data.canonicalUrl = canonicalUrl;
    if (ogImage !== undefined) data.ogImage = ogImage;
    if (featured !== undefined) data.featured = Boolean(featured);
    if (published !== undefined) data.published = Boolean(published);
    if (status !== undefined && status in ContentStatus) data.status = status as ContentStatus;
    if (position !== undefined) data.position = Number(position);
    if (year !== undefined) data.year = year;

    const item = await prisma.caseStudy.update({
      where: { id },
      data,
    });

    await logAudit({
      userId: req.user?.id,
      action: "UPDATE_CASE_STUDY",
      targetId: id,
      details: `Updated case study: ${item.titleFa}`,
      ipAddress: req.ip,
    });

    revalidateCaseStudy(item.slug);

    res.json(item);
  } catch (error) {
    console.error("[casestudies] update error:", error);
    res.status(500).json({ error: "خطا در به‌روزرسانی نمونه‌کار" });
  }
});

// Delete a case study (Admin only)
router.delete("/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "شناسه نامعتبر است" });
    }

    const item = await prisma.caseStudy.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: "DELETE_CASE_STUDY",
      targetId: id,
      details: `Deleted case study: ${item.titleFa}`,
      ipAddress: req.ip,
    });

    revalidateCaseStudy(item.slug);

    res.json({ message: "نمونه‌کار با موفقیت حذف گردید" });
  } catch (error) {
    console.error("[casestudies] delete error:", error);
    res.status(500).json({ error: "خطا در حذف نمونه‌کار" });
  }
});

export default router;
