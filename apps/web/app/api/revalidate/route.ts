import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath, updateTag } from "next/cache";

const EXPECTED_SECRET =
  process.env.REVALIDATE_SECRET || process.env.INTERNAL_API_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!EXPECTED_SECRET) {
      console.error("[revalidate] Server configuration error: REVALIDATE_SECRET is not configured");
      return NextResponse.json(
        { error: "Server misconfiguration: missing revalidation secret" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const secretHeader = req.headers.get("x-revalidate-secret");
    const { searchParams } = new URL(req.url);

    let bodySecret = "";
    let tags: string[] = [];
    let paths: string[] = [];

    try {
      const body = await req.json();
      if (body) {
        bodySecret = body.secret || "";
        if (typeof body.tag === "string") tags.push(body.tag);
        if (Array.isArray(body.tags)) tags.push(...body.tags);
        if (typeof body.path === "string") paths.push(body.path);
        if (Array.isArray(body.paths)) paths.push(...body.paths);
      }
    } catch {
      // Body may be empty if non-JSON payload was sent
    }

    // Extract Bearer token if present
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : null;

    // Secure credential extraction: only allow trusted headers or secure POST body.
    // Query parameter secrets (?secret=...) are disallowed to prevent credential exposure in access logs/history.
    const providedSecret = secretHeader || bearerToken || bodySecret;

    if (!providedSecret || providedSecret !== EXPECTED_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid revalidation secret" },
        { status: 401 }
      );
    }

    const tagParam = searchParams.get("tag");
    if (tagParam) tags.push(tagParam);

    const pathParam = searchParams.get("path");
    if (pathParam) paths.push(pathParam);

    const uniqueTags = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
    const uniquePaths = Array.from(new Set(paths.map((p) => p.trim()).filter(Boolean)));

    // Revalidate tags (Next.js 16 supports revalidateTag with profile 'max' for instant eviction)
    for (const tag of uniqueTags) {
      try {
        revalidateTag(tag, "max");
      } catch {
        // Fallback for Next.js environments where second argument is optional
        try {
          (revalidateTag as any)(tag);
        } catch (tagErr) {
          console.warn(`[revalidate] Failed to purge tag "${tag}":`, tagErr);
        }
      }

      // Also trigger updateTag when supported in Server Action / route context
      try {
        if (typeof updateTag === "function") {
          updateTag(tag);
        }
      } catch {
        /* no-op */
      }
    }

    // Revalidate paths
    for (const p of uniquePaths) {
      try {
        revalidatePath(p);
      } catch (pathErr) {
        console.warn(`[revalidate] Failed to purge path "${p}":`, pathErr);
      }
    }

    return NextResponse.json({
      revalidated: true,
      tags: uniqueTags,
      paths: uniquePaths,
      timestamp: new Date().toISOString(),
      now: Date.now(),
    });
  } catch (error: any) {
    console.error("[revalidate] Error during cache invalidation:", error);
    return NextResponse.json(
      { error: "Failed to revalidate", message: error?.message },
      { status: 500 }
    );
  }
}
