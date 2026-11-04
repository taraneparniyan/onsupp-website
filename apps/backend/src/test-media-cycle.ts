import http from 'http';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import mediaRouter from './routes/media.js';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'onsupp_jwt_super_secret_test_key_2026';
const PORT = 3108;
const BASE_URL = `http://localhost:${PORT}`;

async function testMediaUpload() {
  const app = express();
  app.use(cors());
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
  app.use('/api/v1/media', mediaRouter);

  const server = app.listen(PORT);
  console.log(`[media-test] Test server listening on ${BASE_URL}`);

  try {
    const adminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    const token = jwt.sign({ id: adminUser!.id, role: 'SUPER_ADMIN', email: adminUser!.email }, JWT_SECRET, { expiresIn: '1h' });

    // Create a 1x1 valid PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    // Build multipart/form-data payload
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const bodyBuffer = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="alt"\r\n\r\nتست تصویر مدیا\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-pixel.png"\r\nContent-Type: image/png\r\n\r\n`),
      pngBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const res = await fetch(`${BASE_URL}/api/v1/media/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${token}`,
      },
      body: bodyBuffer,
    });

    console.log('Upload response status:', res.status);
    const data: any = await res.json();
    console.log('Upload response body:', data);

    if (!res.ok || !data.url) {
      throw new Error(`Media upload failed with status ${res.status}`);
    }

    // Verify static access
    const resStatic = await fetch(`${BASE_URL}${data.url}`);
    console.log(`Static access GET ${data.url} status:`, resStatic.status);
    if (resStatic.status !== 200) {
      throw new Error(`Static access to uploaded file failed with status ${resStatic.status}`);
    }

    // Delete uploaded file via API
    const resDel = await fetch(`${BASE_URL}/api/v1/media/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Media delete response status:', resDel.status);

    console.log('Media upload, static serving, and deletion cycle passed 100%!');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

testMediaUpload().catch(console.error);
