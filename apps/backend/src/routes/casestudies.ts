import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Get all case studies sorted by position (Public)
router.get("/", async (_req, res) => {
  try {
    const items = await prisma.caseStudy.findMany({
      orderBy: { position: "asc" },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch case studies" });
  }
});

// Create a new case study (Admin only)
router.post("/", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { titleFa, titleEn, categoryFa, categoryEn, projectType, descriptionFa, descriptionEn, liveUrl, position } = req.body;
    const item = await prisma.caseStudy.create({
      data: {
        titleFa: titleFa || "",
        titleEn: titleEn || "",
        categoryFa: categoryFa || "",
        categoryEn: categoryEn || "",
        projectType: projectType || "website",
        descriptionFa: descriptionFa || "",
        descriptionEn: descriptionEn || "",
        liveUrl: liveUrl || "#",
        position: typeof position === "number" ? position : 0,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to create case study" });
  }
});

// Update an existing case study (Admin only)
router.put("/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { titleFa, titleEn, categoryFa, categoryEn, projectType, descriptionFa, descriptionEn, liveUrl, position } = req.body;
    const item = await prisma.caseStudy.update({
      where: { id },
      data: {
        titleFa,
        titleEn,
        categoryFa,
        categoryEn,
        projectType,
        descriptionFa,
        descriptionEn,
        liveUrl,
        position,
      },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update case study" });
  }
});

// Delete a case study (Admin only)
router.delete("/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await prisma.caseStudy.delete({ where: { id } });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete case study" });
  }
});

export default router;
