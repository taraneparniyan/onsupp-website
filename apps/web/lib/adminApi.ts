/**
 * Admin API Helper
 *
 * All admin requests are routed through the Next.js same-origin reverse proxy (rewrites),
 * ensuring that:
 * 1. The httpOnly session cookie is automatically and securely transmitted by the browser.
 * 2. No backend secret keys (JWT_SECRET) are ever exposed in client code.
 * 3. Cross-origin credential and port-mismatch issues are eliminated.
 * 4. Automatic session handling: redirects to /admin/login on 401 Unauthorized.
 */

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export interface AdminFetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

export async function adminFetch(endpoint: string, options: AdminFetchOptions = {}): Promise<Response> {
  const url = endpoint.startsWith("http") ? endpoint : `${BACKEND_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Ensure cookie inclusion across all supported browsers
  });

  if (response.status === 401 && typeof window !== "undefined") {
    const pathname = window.location.pathname;
    const isLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
    const isAuthEndpoint = endpoint.includes("/auth/login");

    if (!options.skipAuthRedirect && !isLoginPage && !isAuthEndpoint) {
      const isMutating = options.method && !["GET", "HEAD"].includes(options.method.toUpperCase());
      if (isMutating) {
        // Form mutation (POST/PUT/PATCH/DELETE):
        // Do not silently discard unsaved form inputs by immediately redirecting.
        if (typeof window.alert === "function") {
          window.alert("نشست کاربری شما منقضی شده است. اطلاعات فرم برای جلوگیری از پاک شدن حفظ گردید. لطفاً در تب دیگری مجدداً وارد شوید یا تغییرات را ذخیره فرمایید.");
        }
      } else {
        // Read-only query: safely redirect to login with notification flag
        window.location.href = "/admin/login?expired=1";
      }
    }
  }

  return response;
}
