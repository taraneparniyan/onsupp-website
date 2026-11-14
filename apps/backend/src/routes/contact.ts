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

// Simple in-memory rate-limiting / anti-spam map by IP & phone
const recentSubmissions = new Map<string, number>();

// Create new submission (Public API with validation & anti-spam)
router.post("/submissions", async (req, res) => {
  try {
    const { name, phone, email, subject, service, message, website_hp } = req.body;

    // Honeypot anti-spam check
    if (website_hp && String(website_hp).trim().length > 0) {
      return res.status(201).json({ status: "ignored" });
    }

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanSubject = typeof subject === "string" ? subject.trim() : "";
    const cleanService = typeof service === "string" && service.trim() ? service.trim() : "seo";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({
        error: "لطفاً نام و نام خانوادگی معتبر وارد کنید.",
        errorEn: "Please enter a valid full name.",
      });
    }

    // Normalize Persian/Arabic digits for validation
    const normalizedDigits = cleanPhone
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/\D/g, "");

    if (normalizedDigits.length < 10 || normalizedDigits.length > 15) {
      return res.status(400).json({
        error: "شماره تماس وارد شده معتبر نیست.",
        errorEn: "Please enter a valid phone number.",
      });
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        error: "فرمت آدرس ایمیل وارد شده صحیح نیست.",
        errorEn: "Invalid email address format.",
      });
    }

    // Duplicate / spam submission guard (within 45 seconds for same phone + subject + message)
    const dedupeKey = `${normalizedDigits}:${cleanSubject}:${cleanService}`;
    const lastTime = recentSubmissions.get(dedupeKey) || 0;
    const now = Date.now();
    if (now - lastTime < 45_000) {
      return res.status(429).json({
        error: "درخواست شما به‌تازگی ثبت شده است. لطفاً چند لحظه صبر کنید.",
        errorEn: "Your request was recently submitted. Please wait a moment before trying again.",
      });
    }
    recentSubmissions.set(dedupeKey, now);

    const submission = await prisma.contactSubmission.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail || null,
        subject: cleanSubject || null,
        service: cleanService,
        message: cleanMessage || null,
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
