import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export interface VerifiedUserPayload {
  id: number;
  email: string;
  role: string;
}

export const VALID_PANEL_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR",
  "EMPLOYEE",
  "CONTENT_SEO_MANAGER",
  "SUPPORT",
  "PROJECT_MANAGER",
  "USER",
];

/**
 * Cryptographically verifies that the provided token is a valid, unexpired,
 * correctly signed HS256 JWT issued for an authorized panel user.
 */
export async function verifyToken(token: string | undefined): Promise<VerifiedUserPayload | null> {
  if (!token || typeof token !== "string" || token.trim() === "") {
    return null;
  }

  const secretStr = process.env.JWT_SECRET;
  if (!secretStr || secretStr.trim().length < 32) {
    console.error("[middleware] Authentication halted: JWT_SECRET environment variable is missing or less than 32 characters.");
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(secretStr.trim());
    const { payload } = await jwtVerify(token.trim(), secretKey, {
      algorithms: ["HS256"],
    });

    const role = String(payload.role || "");
    if (!VALID_PANEL_ROLES.includes(role)) {
      return null;
    }

    if (typeof payload.id !== "number") {
      return null;
    }

    if (!payload.email || typeof payload.email !== "string") {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      role,
    };
  } catch {
    return null;
  }
}

// Backward-compatible helper
export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  const verified = await verifyToken(token);
  return Boolean(verified);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;
    const verifiedUser = await verifyToken(token);

    if (pathname === "/admin/login") {
      if (verifiedUser) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!verifiedUser) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      const response = NextResponse.redirect(url);
      if (token) {
        response.cookies.delete("token");
      }
      return response;
    }

    const role = verifiedUser.role;

    // Granular Route Guards (SUPER_ADMIN has universal access)
    if (role !== "SUPER_ADMIN") {
      // 1. Users management (/admin/users): only SUPER_ADMIN & HR
      if (pathname.startsWith("/admin/users") && role !== "HR") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 2. Articles (/admin/articles): SUPER_ADMIN, ADMIN, CONTENT_SEO_MANAGER
      if (
        pathname.startsWith("/admin/articles") &&
        !["ADMIN", "CONTENT_SEO_MANAGER"].includes(role)
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 3. Comments (/admin/comments): SUPER_ADMIN, ADMIN, CONTENT_SEO_MANAGER, SUPPORT
      if (
        pathname.startsWith("/admin/comments") &&
        !["ADMIN", "CONTENT_SEO_MANAGER", "SUPPORT"].includes(role)
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 4. Contact messages (/admin/contact): SUPER_ADMIN, ADMIN, SUPPORT
      if (
        pathname.startsWith("/admin/contact") &&
        !["ADMIN", "SUPPORT"].includes(role)
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 5. Media (/admin/media): SUPER_ADMIN, ADMIN, CONTENT_SEO_MANAGER
      if (
        pathname.startsWith("/admin/media") &&
        !["ADMIN", "CONTENT_SEO_MANAGER"].includes(role)
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 6. Testimonials (/admin/testimonials): SUPER_ADMIN, ADMIN, CONTENT_SEO_MANAGER
      if (
        pathname.startsWith("/admin/testimonials") &&
        !["ADMIN", "CONTENT_SEO_MANAGER"].includes(role)
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 7. Content sections & CMS config: ADMIN & SUPER_ADMIN only
      const adminOnlyPaths = [
        "/admin/hero",
        "/admin/services",
        "/admin/stats",
        "/admin/about",
        "/admin/about-page",
        "/admin/casestudies",
        "/admin/pricing",
        "/admin/site-settings",
        "/admin/client-partners",
        "/admin/client-logos",
        "/admin/home-sections",
      ];
      if (
        adminOnlyPaths.some((p) => pathname.startsWith(p)) &&
        role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 8. Team members (/admin/team-members): SUPER_ADMIN, ADMIN, HR
      if (
        pathname.startsWith("/admin/team-members") &&
        !["ADMIN", "HR"].includes(role)
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 9. Page SEO (/admin/page-seo): SUPER_ADMIN, ADMIN, CONTENT_SEO_MANAGER
      if (
        pathname.startsWith("/admin/page-seo") &&
        !["ADMIN", "CONTENT_SEO_MANAGER"].includes(role)
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
