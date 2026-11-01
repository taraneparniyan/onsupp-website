/**
 * Unified, Native Smooth-Scrolling Engine for OnSupp
 * - Provides natural, instantaneous, 60fps/120fps hardware-accelerated scrolling
 *   matching the admin dashboard feel across the entire website.
 * - Zero scroll-hijacking, zero artificial wheel latency, zero animation lag.
 * - Native keyboard navigation (Space, PageUp, PageDown, Arrows, Home, End).
 * - Full native touch gesture fidelity and momentum scrolling on mobile and tablet.
 * - Controlled programmatic smooth scrolling with exact header clearance (`scrollToY`, `scrollToSection`, `scrollToTop`).
 * - Seamless deep link / anchor support without App Router hash jumping.
 * - Strictly respects `prefers-reduced-motion: reduce`.
 */

export function isReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getHeaderOffset(extraGap = 20): number {
  if (typeof document === "undefined") return 84;
  const header = document.querySelector("header");
  const headerHeight = header ? header.getBoundingClientRect().height : 64;
  return Math.round(headerHeight + extraGap);
}

/**
 * Initializes the unified smooth-scrolling engine.
 * Ensures html has scroll-behavior: smooth (unless reduced-motion is requested).
 */
export function initLenis(): null {
  if (typeof document !== "undefined") {
    const html = document.documentElement;
    if (isReducedMotion()) {
      html.style.scrollBehavior = "auto";
    } else {
      html.style.scrollBehavior = "smooth";
    }
  }
  return null;
}

export function destroyLenis(): void {
  // Graceful no-op for backward compatibility
}

export function getLenis(): null {
  // Graceful no-op for backward compatibility
  return null;
}

/**
 * Locks or unlocks page scrolling (used by mobile drawer/modals).
 */
export function setScrollLocked(locked: boolean): void {
  if (typeof document === "undefined") return;
  if (locked) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

/**
 * Updates the browser URL hash without triggering Next.js 16 App Router's
 * patched `history.pushState` -> `ACTION_RESTORE` -> instant `scrollIntoView()`.
 */
function pushHashWithoutRouterJump(urlWithHash: string): void {
  if (typeof window === "undefined") return;
  try {
    const currentState =
      typeof window.history.state === "object" && window.history.state !== null
        ? window.history.state
        : {};
    window.history.pushState(
      { ...currentState, __NA: true, _N: true },
      "",
      urlWithHash
    );
  } catch {
    // Ignore history state errors in restricted environments
  }
}

/**
 * Smoothly scrolls the window vertically to `targetY`.
 */
export function scrollToY(
  targetY: number,
  options?: { immediate?: boolean; onComplete?: () => void }
): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Ensure mobile menu scroll lock doesn't block programmatic scrolling
  if (document.body.style.overflow === "hidden") {
    setScrollLocked(false);
  }

  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const destinationY = Math.max(0, Math.min(targetY, maxScroll));
  const startY = window.scrollY;
  const delta = destinationY - startY;

  if (Math.abs(delta) < 2) {
    options?.onComplete?.();
    return;
  }

  const behavior: ScrollBehavior =
    options?.immediate || isReducedMotion() ? ("instant" as ScrollBehavior) : "smooth";

  window.scrollTo({
    top: destinationY,
    behavior,
  });

  if (options?.onComplete) {
    let isDone = false;
    const checkDone = () => {
      if (!isDone) {
        isDone = true;
        window.removeEventListener("scrollend", checkDone);
        options.onComplete?.();
      }
    };

    if ("onscrollend" in window) {
      window.addEventListener("scrollend", checkDone, { once: true });
    }
    const timeoutMs =
      behavior === "smooth"
        ? Math.min(600, Math.max(250, Math.abs(delta) * 0.3))
        : 50;
    setTimeout(checkDone, timeoutMs);
  }
}

/**
 * Resolves a target element by ID or `#hash` / `/#hash` and smoothly scrolls to it,
 * keeping its heading clearly visible below the fixed header.
 */
export function scrollToSection(
  idOrHref: string,
  options?: { updateHash?: boolean; extraGap?: number }
): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const hashIndex = idOrHref.indexOf("#");
  const rawId =
    hashIndex >= 0 ? idOrHref.slice(hashIndex + 1) : idOrHref.trim();

  if (!rawId) return false;

  let resolvedId = rawId;
  let targetEl = document.getElementById(resolvedId);

  // Fallback for `#pricing` menu/footer links when no dedicated `#pricing` section exists
  if (!targetEl && rawId === "pricing") {
    resolvedId = "contact";
    targetEl = document.getElementById("contact");
  }

  if (!targetEl) return false;

  // Release any mobile drawer body lock before measuring & scrolling
  if (document.body.style.overflow === "hidden") {
    setScrollLocked(false);
  }

  const offset = getHeaderOffset(options?.extraGap ?? 20);
  const rect = targetEl.getBoundingClientRect();
  const targetY = rect.top + window.scrollY - offset;

  if (options?.updateHash !== false) {
    pushHashWithoutRouterJump(`#${resolvedId}`);
  }

  scrollToY(targetY);
  return true;
}

/**
 * Smoothly scrolls back to the top of the current page.
 */
export function scrollToTop(options?: { clearHash?: boolean }): void {
  if (typeof window === "undefined") return;
  if (options?.clearHash && window.location.hash) {
    pushHashWithoutRouterJump(
      window.location.pathname + window.location.search
    );
  }
  scrollToY(0);
}
