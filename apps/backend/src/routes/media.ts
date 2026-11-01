import { Router, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Resolve uploads next to the backend package root (works with tsx and node)
const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  },
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_BATCH_FILES = 10; // Max 10 images per batch
const MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50MB total batch size

const upload = multer({
  storage,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: MAX_BATCH_FILES,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'));
    }
  },
});

// POST /api/v1/media/upload (Super Admin, Admin, Content Manager - field: file, body: alt — required for SEO)
router.post(
  '/upload',
  authenticate,
  requireContentManager,
  (req: any, res: Response, next: any) => {
    // Early header check to reject oversized payloads before stream buffering
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > MAX_FILE_SIZE + 512 * 1024) {
      return res.status(413).json({
        error: 'حجم درخواست بیش از سقف مجاز است (حداکثر ۵ مگابایت).',
      });
    }

    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
          try { fs.unlinkSync(req.file.path); } catch {}
        }
        if (err.message === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            error: 'فرمت فایل مجاز نیست. تنها تصاویر با پسوند jpg, jpeg, png, webp, gif مجاز می‌باشند.',
          });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'حجم فایل بیش از حد مجاز است (حداکثر ۵ مگابایت).' });
        }
        return res.status(400).json({ error: 'خطا در آپلود فایل' });
      }
      next();
    });
  },
  async (req: any, res: Response) => {
    try {
      const alt = typeof req.body.alt === 'string' ? req.body.alt.trim() : '';
      if (!req.file) {
        return res.status(400).json({ error: 'فایل الزامی است' });
      }
      if (!alt) {
        // Remove orphaned file if alt missing
        if (req.file.path && fs.existsSync(req.file.path)) {
          try { fs.unlinkSync(req.file.path); } catch {}
        }
        return res.status(400).json({ error: 'متن جایگزین (Alt) برای سئو الزامی است' });
      }

      const media = await prisma.media.create({
        data: {
          filename: req.file.filename,
          url: `/uploads/${req.file.filename}`,
          alt,
        },
      });

      res.status(201).json(media);
    } catch (error) {
      console.error('[media] upload error:', error);
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      res.status(500).json({ error: 'آپلود رسانه ناموفق بود' });
    }
  },
);

// POST /api/v1/media/batch-upload (Super Admin, Admin, Content Manager)
// Supports uploading up to 10 images simultaneously with max 5MB/file and 50MB batch limit
router.post(
  '/batch-upload',
  authenticate,
  requireContentManager,
  (req: any, res: Response, next: any) => {
    // Early header check to reject oversized HTTP payloads before excessive memory/disk usage
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > MAX_BATCH_SIZE + 5 * 1024 * 1024) {
      return res.status(413).json({
        error: 'حجم کل بسته ارسالی بیش از سقف مجاز ۵۰ مگابایت است.',
      });
    }

    upload.array('files', MAX_BATCH_FILES)(req, res, (err: any) => {
      if (err) {
        // Immediate cleanup of any temporary files written before error occurred
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((f: any) => {
            if (f?.path && fs.existsSync(f.path)) {
              try { fs.unlinkSync(f.path); } catch {}
            }
          });
        }

        if (err.message === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            error: 'فرمت فایل مجاز نیست. تنها تصاویر با پسوند jpg, jpeg, png, webp, gif مجاز می‌باشند.',
          });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'حجم یکی از فایل‌ها بیش از سقف مجاز است (حداکثر ۵ مگابایت برای هر تصویر).',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'تعداد فایل‌ها بیش از سقف مجاز است (حداکثر ۱۰ تصویر در هر نوبت).',
          });
        }
        return res.status(400).json({ error: 'خطا در بارگذاری گروهی فایل‌ها' });
      }
      next();
    });
  },
  async (req: any, res: Response) => {
    try {
      const files: Express.Multer.File[] = req.files || [];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'حداقل یک فایل تصویر برای آپلود الزامی است.' });
      }

      if (files.length > MAX_BATCH_FILES) {
        // Clean up uploaded files if count exceeded
        files.forEach((f) => {
          if (f?.path && fs.existsSync(f.path)) {
            try { fs.unlinkSync(f.path); } catch {}
          }
        });
        return res.status(400).json({
          error: `تعداد فایل‌ها (${files.length}) بیش از سقف مجاز (${MAX_BATCH_FILES} تصویر) است.`,
        });
      }

      // Check cumulative batch size
      const totalBatchSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
      if (totalBatchSize > MAX_BATCH_SIZE) {
        files.forEach((f) => {
          if (f?.path && fs.existsSync(f.path)) {
            try { fs.unlinkSync(f.path); } catch {}
          }
        });
        const totalMb = (totalBatchSize / (1024 * 1024)).toFixed(1);
        return res.status(413).json({
          error: `مجموع حجم تصاویر (${totalMb} مگابایت) بیش از سقف مجاز ۵۰ مگابایت است.`,
        });
      }

      // Parse optional custom alts array if provided
      let customAlts: string[] = [];
      if (typeof req.body.alts === 'string') {
        try {
          customAlts = JSON.parse(req.body.alts);
        } catch {
          customAlts = [req.body.alts];
        }
      } else if (Array.isArray(req.body.alts)) {
        customAlts = req.body.alts;
      }

      const results = [];
      let succeededCount = 0;
      let failedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Alt derivation: user custom alt or clean original filename
          const cleanName = path.parse(file.originalname).name.replace(/[-_]+/g, ' ').trim();
          const altText = (customAlts[i] && String(customAlts[i]).trim()) || cleanName || 'تصویر رسانه آن‌ساپ';

          const created = await prisma.media.create({
            data: {
              filename: file.filename,
              url: `/uploads/${file.filename}`,
              alt: altText,
            },
          });

          results.push({
            filename: file.originalname,
            success: true,
            item: created,
          });
          succeededCount++;
        } catch (fileErr: any) {
          // Remove orphaned physical file on DB failure
          if (file?.path && fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch {}
          }
          results.push({
            filename: file.originalname,
            success: false,
            error: 'خطا در ثبت اطلاعات تصویر در پایگاه داده',
          });
          failedCount++;
        }
      }

      const status = failedCount === 0 ? 201 : succeededCount > 0 ? 207 : 400;
      return res.status(status).json({
        summary: {
          total: files.length,
          succeeded: succeededCount,
          failed: failedCount,
        },
        results,
      });
    } catch (error) {
      console.error('[media] batch-upload error:', error);
      res.status(500).json({ error: 'آپلود گروهی رسانه‌ها با خطا مواجه شد' });
    }
  },
);

// GET /api/v1/media (Public - list uploaded media)
router.get('/', async (_req, res) => {
  try {
    const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(media);
  } catch (error) {
    console.error('[media] list error:', error);
    res.status(500).json({ error: 'دریافت لیست رسانه ناموفق بود' });
  }
});

// DELETE /api/v1/media/:id (Super Admin, Admin, Content Manager)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'رسانه یافت نشد' });
    }

    const filePath = path.join(uploadDir, existing.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.media.delete({ where: { id } });
    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[media] delete error:', error);
    res.status(500).json({ error: 'حذف رسانه ناموفق بود' });
  }
});

export default router;
