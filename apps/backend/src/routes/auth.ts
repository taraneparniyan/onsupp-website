import { Router, Response } from 'express';
import { authenticate, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { login, logout } from '../controllers/authController.js';
import { verify } from '../middleware/verify.js';

const router = Router();

router.post('/login', verify.login, login);
router.post('/logout', logout);
router.get('/me', authenticate, requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
