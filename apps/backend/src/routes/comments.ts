import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  authenticate,
  requireCommentModerator,
  requireContentManager,
  AuthenticatedRequest,
} from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

const canModerateComments = (role?: string) =>
  Boolean(role && ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER", "SUPPORT"].includes(role));

// GET /api/v1/comments - Get comments (public: only approved without private emails; moderators: all comments with email)
router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isModerator = canModerateComments(req.user?.role);
    const articleId = req.query.articleId ? parseInt(req.query.articleId as string, 10) : undefined;
    const articleSlug = req.query.articleSlug ? String(req.query.articleSlug) : undefined;

    const where: any = {};
    if (!isModerator) {
      where.approved = true;
    }

    if (articleId) {
      where.articleId = articleId;
    } else if (articleSlug) {
      const art = await prisma.article.findUnique({ where: { slug: articleSlug } });
      if (art) {
        where.articleId = art.id;
      }
    }

    const comments = await prisma.comment.findMany({
      where,
      select: {
        id: true,
        articleId: true,
        name: true,
        email: isModerator, // Only reveal email to authenticated moderators!
        content: true,
        approved: true,
        reply: true,
        createdAt: true,
        article: {
          select: {
            id: true,
            titleFa: true,
            titleEn: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/v1/comments - Submit a new comment for an article
router.post("/", async (req, res) => {
  try {
    const { articleId, articleSlug, name, email, content } = req.body;

    if (!name || !email || !content) {
      return res.status(400).json({ error: "نام، ایمیل و متن دیدگاه الزامی است." });
    }

    let targetArticleId = articleId;
    if (!targetArticleId && articleSlug) {
      const art = await prisma.article.findUnique({ where: { slug: articleSlug } });
      if (art) targetArticleId = art.id;
    }

    if (!targetArticleId) {
      return res.status(400).json({ error: "مقاله مورد نظر یافت نشد." });
    }

    const newComment = await prisma.comment.create({
      data: {
        articleId: targetArticleId,
        name,
        email,
        content,
        approved: false, // Default pending approval by Admin
      },
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "خطا در ثبت دیدگاه" });
  }
});

// PUT /api/v1/comments/:id/toggle-approve - Approve / Reject comment (Moderators)
router.put("/:id/toggle-approve", authenticate, requireCommentModerator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const updated = await prisma.comment.update({
      where: { id },
      data: { approved: !comment.approved },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error toggling comment approval:", error);
    res.status(500).json({ error: "Failed to update comment status" });
  }
});

// PUT /api/v1/comments/:id/reply - Reply to comment / Update reply (Moderators)
router.put("/:id/reply", authenticate, requireCommentModerator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { reply } = req.body;

    const updated = await prisma.comment.update({
      where: { id },
      data: {
        reply,
        approved: true, // Automatically approve when moderator replies
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ error: "Failed to reply to comment" });
  }
});

// DELETE /api/v1/comments/:id - Delete comment (Content Manager & Admin)
router.delete("/:id", authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await prisma.comment.delete({ where: { id } });
    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
