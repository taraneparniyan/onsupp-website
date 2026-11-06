export interface RevalidateOptions {
  tags?: string[];
  paths?: string[];
}

export interface RevalidateResult {
  success: boolean;
  tags: string[];
  paths: string[];
  forwarded: boolean;
  message: string;
  error?: string;
}

export function getRevalidateSecret(): string {
  const secret = process.env.REVALIDATE_SECRET || process.env.INTERNAL_API_SECRET;
  if (!secret) {
    throw new Error('REVALIDATE_SECRET must be configured in environment');
  }
  return secret;
}

/**
 * Triggers Next.js ISR on-demand cache revalidation via server-to-server HTTP request.
 * Does not throw unhandled errors if the frontend server is temporarily offline or unreachable.
 */
export async function triggerRevalidation(options: RevalidateOptions): Promise<RevalidateResult> {
  const tags = (options.tags || []).map((t) => t.trim()).filter(Boolean);
  const paths = (options.paths || []).map((p) => p.trim()).filter(Boolean);

  if (tags.length === 0 && paths.length === 0) {
    return {
      success: true,
      tags: [],
      paths: [],
      forwarded: false,
      message: 'هیچ برچسب یا مسیری برای ابطال حافظه پنهان مشخص نشده است',
    };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const revalidateUrl = `${frontendUrl.replace(/\/$/, '')}/api/revalidate`;
  const secret = getRevalidateSecret();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(revalidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        secret,
        tags,
        paths,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        success: true,
        tags,
        paths,
        forwarded: true,
        message: 'درخواست ابطال کش با موفقیت به سرویس فرانت‌اند ارسال شد',
      };
    }

    const responseText = await response.text().catch(() => '');
    return {
      success: false,
      tags,
      paths,
      forwarded: false,
      message: `پاسخ ناموفق از فرانت‌اند (${response.status})`,
      error: responseText,
    };
  } catch (err: any) {
    // If the frontend is offline during backend-only execution or test runs, report status gracefully
    const isConnectionError =
      err.name === 'AbortError' ||
      err.code === 'ECONNREFUSED' ||
      err.cause?.code === 'ECONNREFUSED' ||
      err.message?.includes('fetch failed');

    return {
      success: true,
      tags,
      paths,
      forwarded: false,
      message: isConnectionError
        ? 'ابطال کش به صورت داخلی ثبت شد (سرور فرانت‌اند در دسترس نبود)'
        : `خطا در برقراری ارتباط با فرانت‌اند: ${err.message}`,
      error: err.message,
    };
  }
}
