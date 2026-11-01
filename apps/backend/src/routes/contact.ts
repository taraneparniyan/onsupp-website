import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  authenticate,
  requireAdmin,
  requireSupport,
  AuthenticatedRequest,
} from "../middleware/auth.js";

const router = Router();
export const prisma = new PrismaClient();

// Get contact section content (Public)
router.get("/content", async (_req, res) => {
  try {
    let content = await prisma.contactContent.findUnique({ where: { id: 1 } });
    if (!content) {
      content = await prisma.contactContent.create({
        data: { id: 1 },
      });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contact content" });
  }
});

// Update contact section content (Admin only)
router.put("/content", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    const updated = await prisma.contactContent.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact content" });
  }
});

// Get all submissions (Support, Content Admin & Super Admin)
router.get("/submissions", authenticate, requireSupport, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contact submissions" });
  }
});

// Create new submission (Public API)
router.post("/submissions", async (req, res) => {
  try {
    const { name, phone, email, service, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        phone,
        email: email || null,
        service: service || "seo",
        message: message || null,
      },
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to record contact submission" });
  }
});

// Mark submission as read/unread (Support, Admin & Super Admin)
router.put("/submissions/:id/read", authenticate, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { read } = req.body;
    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: { read: Boolean(read) },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update submission status" });
  }
});

// Delete submission (Support, Admin & Super Admin)
router.delete("/submissions/:id", authenticate, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await prisma.contactSubmission.delete({ where: { id } });
    res.json({ message: "Submission deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

export default router;
