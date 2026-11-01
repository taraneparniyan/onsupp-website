import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Get all categories with their nested plans (Public)
router.get("/categories", async (_req, res) => {
  try {
    const categories = await prisma.pricingCategory.findMany({
      orderBy: { position: "asc" },
      include: {
        plans: {
          orderBy: { position: "asc" },
        },
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pricing categories" });
  }
});

// Create category (Admin only)
router.post("/categories", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { titleFa, titleEn, slug, position } = req.body;
    const cat = await prisma.pricingCategory.create({
      data: {
        titleFa: titleFa || "",
        titleEn: titleEn || "",
        slug: slug || `cat-${Date.now()}`,
        position: typeof position === "number" ? position : 0,
      },
    });
    res.status(201).json(cat);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Update category (Admin only)
router.put("/categories/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { titleFa, titleEn, slug, position } = req.body;
    const cat = await prisma.pricingCategory.update({
      where: { id },
      data: { titleFa, titleEn, slug, position },
    });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Delete category (cascade deletes plans) (Admin only)
router.delete("/categories/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await prisma.pricingCategory.delete({ where: { id } });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Create plan inside category (Admin only)
router.post("/plans", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      categoryId,
      nameFa,
      nameEn,
      badgeFa,
      badgeEn,
      priceType,
      priceFa,
      priceEn,
      discountPriceFa,
      discountPriceEn,
      periodFa,
      periodEn,
      descriptionFa,
      descriptionEn,
      featuresFa,
      featuresEn,
      popular,
      ctaFa,
      ctaEn,
      ctaLink,
      position,
    } = req.body;

    const plan = await prisma.pricingPlan.create({
      data: {
        categoryId: parseInt(categoryId, 10),
        nameFa: nameFa || "",
        nameEn: nameEn || "",
        badgeFa: badgeFa || "",
        badgeEn: badgeEn || "",
        priceType: priceType || "numeric",
        priceFa: priceFa || "",
        priceEn: priceEn || "",
        discountPriceFa: discountPriceFa || "",
        discountPriceEn: discountPriceEn || "",
        periodFa: periodFa || "",
        periodEn: periodEn || "",
        descriptionFa: descriptionFa || "",
        descriptionEn: descriptionEn || "",
        featuresFa: Array.isArray(featuresFa) ? featuresFa : [],
        featuresEn: Array.isArray(featuresEn) ? featuresEn : [],
        popular: Boolean(popular),
        ctaFa: ctaFa || "",
        ctaEn: ctaEn || "",
        ctaLink: ctaLink || "#contact",
        position: typeof position === "number" ? position : 0,
      },
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: "Failed to create plan" });
  }
});

// Update plan (Admin only)
router.put("/plans/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const {
      categoryId,
      nameFa,
      nameEn,
      badgeFa,
      badgeEn,
      priceType,
      priceFa,
      priceEn,
      discountPriceFa,
      discountPriceEn,
      periodFa,
      periodEn,
      descriptionFa,
      descriptionEn,
      featuresFa,
      featuresEn,
      popular,
      ctaFa,
      ctaEn,
      ctaLink,
      position,
    } = req.body;

    const plan = await prisma.pricingPlan.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
        ...(nameFa !== undefined && { nameFa }),
        ...(nameEn !== undefined && { nameEn }),
        ...(badgeFa !== undefined && { badgeFa }),
        ...(badgeEn !== undefined && { badgeEn }),
        ...(priceType !== undefined && { priceType }),
        ...(priceFa !== undefined && { priceFa }),
        ...(priceEn !== undefined && { priceEn }),
        ...(discountPriceFa !== undefined && { discountPriceFa }),
        ...(discountPriceEn !== undefined && { discountPriceEn }),
        ...(periodFa !== undefined && { periodFa }),
        ...(periodEn !== undefined && { periodEn }),
        ...(descriptionFa !== undefined && { descriptionFa }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(Array.isArray(featuresFa) && { featuresFa }),
        ...(Array.isArray(featuresEn) && { featuresEn }),
        ...(popular !== undefined && { popular: Boolean(popular) }),
        ...(ctaFa !== undefined && { ctaFa }),
        ...(ctaEn !== undefined && { ctaEn }),
        ...(ctaLink !== undefined && { ctaLink }),
        ...(position !== undefined && { position: Number(position) }),
      },
    });
    res.json(plan);
  } catch (error) {
    console.error("[Pricing Update Error]", error);
    res.status(500).json({ error: "Failed to update plan" });
  }
});


// Delete plan (Admin only)
router.delete("/plans/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await prisma.pricingPlan.delete({ where: { id } });
    res.json({ message: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

export default router;
