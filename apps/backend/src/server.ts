import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as path from 'path';
import * as fs from 'fs';
import { getJwtSecret } from './config/jwt.js';

// Enforce JWT secret validity and strength at server startup
const isTestRunner = process.env.NODE_ENV === 'test' || process.argv.some((a) => a.includes('test'));
if (!isTestRunner) {
  getJwtSecret();
}

import authRoutes from './routes/auth.js';
import mediaRoutes from './routes/media.js';
import heroRoutes from './routes/hero.js';
import servicesRoutes from './routes/services.js';
import statsRoutes from './routes/stats.js';
import aboutRoutes from './routes/about.js';
import caseStudiesRoutes from './routes/casestudies.js';
import portfolioCategoriesRoutes from './routes/portfolioCategories.js';
import pricingRoutes from './routes/pricing.js';
import contactRoutes from './routes/contact.js';
import articlesRoutes from './routes/articles.js';
import usersRoutes from './routes/users.js';
import commentsRoutes from './routes/comments.js';
import dashboardRoutes from './routes/dashboard.js';
import testimonialsRoutes from './routes/testimonials.js';
import settingsRoutes from './routes/settings.js';
import clientsRoutes from './routes/clients.js';
import clientLogosRoutes from './routes/client-logos.js';
import teamRoutes from './routes/team.js';
import sectionsRoutes from './routes/sections.js';
import revalidateRoutes from './routes/revalidate.js';

const app = express();
const PORT = process.env.PORT || 3002;
const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Development origins (localhost frontend ports)
export const devOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://localhost:3004',
  'http://127.0.0.1:3004',
];

// Dynamically determine allowed origins based on environment
export const getAllowedOrigins = (): string[] => {
  const isProd = process.env.NODE_ENV === 'production';
  const envOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
  ].filter(Boolean) as string[];

  if (isProd) {
    // In production, strictly allow only explicitly configured origins.
    // If no origins are configured, return empty array to block untrusted cross-origin requests.
    return Array.from(new Set(envOrigins));
  }

  // In development, allow localhost dev ports and any explicitly configured origins
  return Array.from(new Set([...devOrigins, ...envOrigins]));
};

export const allowedOrigins: string[] = getAllowedOrigins();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Policy for requests without an Origin header:
      // Same-origin, SSR (Server-Side Rendering), server-to-server calls, curl, and health checks do not send an Origin header.
      // These are not browser cross-origin requests, so they are allowed through.
      if (!origin) {
        return callback(null, true);
      }

      const trustedOrigins = getAllowedOrigins();

      // Allow only explicitly trusted origins in both development and production
      if (trustedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Disallow untrusted origins by omitting Access-Control-Allow-Origin header
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication & Users
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);

// CMS Content Management & Site Foundation
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/sections', sectionsRoutes);
app.use('/api/v1/hero', heroRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/about', aboutRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/client-logos', clientLogosRoutes);
app.use('/api/v1/casestudies', caseStudiesRoutes);
app.use('/api/v1/portfolio/categories', portfolioCategoriesRoutes);
app.use('/api/v1/testimonials', testimonialsRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/articles', articlesRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Cache Revalidation
app.use('/api/v1/revalidate', revalidateRoutes);

export { app };
export default app;

if (process.env.NODE_ENV !== 'test' && !process.argv.some((a) => a.includes('test'))) {
  app.listen(PORT, () => {
    console.log(`[backend] Server running on port ${PORT}`);
    console.log(`[backend] Uploads dir: ${uploadDir}`);
  });
}
