/**
 * Cache Invalidation Service for OnSupp Next.js Frontend
 * Triggers on-demand Incremental Static Regeneration (ISR) / tag revalidation
 * via secure token-authenticated POST to Next.js /api/revalidate.
 */

export interface RevalidationOptions {
  path?: string;
  tag?: string;
}

export async function triggerRevalidation(options: RevalidationOptions = {}): Promise<boolean> {
  const webUrl = process.env.FRONTEND_URL || 'http://localhost:3004';
  const secret = process.env.REVALIDATION_SECRET || 'onsupp_revalidate_secret_key_2026';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s safe timeout

    const res = await fetch(`${webUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(options),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return true;
    } else {
      console.warn(`[revalidation] Frontend returned HTTP ${res.status} for revalidation request`);
      return false;
    }
  } catch (err: any) {
    // Non-blocking fallback: In development or during offline build tasks,
    // the frontend server might not be running. We log quietly and proceed.
    return false;
  }
}
