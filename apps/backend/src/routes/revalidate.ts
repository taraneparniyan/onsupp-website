import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { triggerRevalidation, getRevalidateSecret } from '../services/revalidateService.js';

const router = Router();

const revalidateSchema = z.object({
  tag: z.string().optional(),
  tags: z.array(z.string()).optional(),
  path: z.string().optional(),
  paths: z.array(z.string()).optional(),
  secret: z.string().optional(),
});

// POST /api/v1/revalidate  (internal server-to-server or admin cache purge)
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const secretHeader = req.header('x-revalidate-secret');
  const configuredSecret = getRevalidateSecret();

  const isSecretMatch =
    (secretHeader && secretHeader === configuredSecret) ||
    (req.body && req.body.secret && req.body.secret === configuredSecret);

  const hasAuthorizedRole =
    req.user && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_SEO_MANAGER'].includes(req.user.role);

  if (!isSecretMatch && !hasAuthorizedRole) {
    if (!req.user && !isSecretMatch) {
      return res.status(401).json({ error: 'احراز هویت الزامی است (توکن معتبر یا کلید محرمانه)' });
    }
    return res.status(403).json({ error: 'دسترسی مجاز برای ابطال حافظه پنهان وجود ندارد' });
  }

  const parsed = revalidateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'ساختار درخواست نامعتبر است',
      details: parsed.error.issues,
    });
  }

  const tags: string[] = [];
  if (parsed.data.tag) tags.push(parsed.data.tag);
  if (parsed.data.tags) tags.push(...parsed.data.tags);

  const paths: string[] = [];
  if (parsed.data.path) paths.push(parsed.data.path);
  if (parsed.data.paths) paths.push(...parsed.data.paths);

  const result = await triggerRevalidation({ tags, paths });

  return res.json({
    success: result.success,
    tags: result.tags,
    paths: result.paths,
    forwarded: result.forwarded,
    message: result.message,
    timestamp: new Date().toISOString(),
  });
});

export default router;
