import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return val ? parseInt(val, 10) : NaN;
}

// Get all case studies sorted by position (Public)
router.get("/", async (_req, res) => {
  try {
    const items = await prisma.caseStudy.findMany({
      orderBy: { position: "asc" },
    });
    res.json(items);
  } catch (error) {
    console.error("[casestudies] fetch error:", error);
    res.status(500).json({ error: "خطا در دریافت لیست نمونه‌کارها" });
  }
});

// Get a single case study by slug or ID (Public)
router.get("/:slugOrId", async (req, res) => {
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
      liveUrl,
      featured,
      position,
      year,
    } = req.body;

    const count = await prisma.caseStudy.count();
    const finalPosition = typeof position === "number" ? position : count;
    const finalSlug = slug?.trim() || titleEn?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || `project-${Date.now()}`;

    const item = await prisma.caseStudy.create({
      data: {
        slug: finalSlug,
        client: client || "",
        clientEn: clientEn || "",
        titleFa: titleFa || "",
        titleEn: titleEn || "",
        taglineFa: taglineFa || "",
        taglineEn: taglineEn || "",
        categoryFa: categoryFa || "",
        categoryEn: categoryEn || "",
        projectType: projectType || "website",
        descriptionFa: descriptionFa || "",
        descriptionEn: descriptionEn || "",
        imageUrl: imageUrl || null,
        secondaryImage: secondaryImage || null,
        liveUrl: liveUrl || "#",
        featured: featured !== undefined ? Boolean(featured) : true,
        position: finalPosition,
        year: year || "۲۰۲۵",
      },
    });
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
      liveUrl,
      featured,
      position,
      year,
    } = req.body;

    const item = await prisma.caseStudy.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug: String(slug).trim() }),
        ...(client !== undefined && { client }),
        ...(clientEn !== undefined && { clientEn }),
        ...(titleFa !== undefined && { titleFa }),
        ...(titleEn !== undefined && { titleEn }),
        ...(taglineFa !== undefined && { taglineFa }),
        ...(taglineEn !== undefined && { taglineEn }),
        ...(categoryFa !== undefined && { categoryFa }),
        ...(categoryEn !== undefined && { categoryEn }),
        ...(projectType !== undefined && { projectType }),
        ...(descriptionFa !== undefined && { descriptionFa }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(secondaryImage !== undefined && { secondaryImage }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(position !== undefined && { position: Number(position) }),
        ...(year !== undefined && { year }),
      },
    });
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

    await prisma.caseStudy.delete({ where: { id } });
    res.json({ message: "نمونه‌کار با موفقیت حذف گردید" });
  } catch (error) {
    console.error("[casestudies] delete error:", error);
    res.status(500).json({ error: "خطا در حذف نمونه‌کار" });
  }
});

export default router;
