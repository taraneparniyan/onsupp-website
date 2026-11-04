import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * On-demand ISR revalidation endpoint for Next.js App Router.
 * Protected by secret token shared between backend and web frontend.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.REVALIDATION_SECRET || 'onsupp_revalidate_secret_key_2026';

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : request.nextUrl.searchParams.get('secret');

    if (!token || token !== secret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid revalidation secret token' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { path, tag } = body;

    if (tag && typeof tag === 'string') {
      try {
        (revalidateTag as any)(tag);
      } catch {
        try {
          (revalidateTag as any)(tag, 'default');
        } catch {
          // Ignore
        }
      }
    }

    if (path && typeof path === 'string') {
      // Revalidate specific path
      revalidatePath(path);
    }

    // If neither path nor tag specified, revalidate root layout
    if (!tag && !path) {
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      path: path || null,
      tag: tag || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Revalidation execution error', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
