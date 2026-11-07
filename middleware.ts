import { type NextRequest, NextResponse } from "next/server";
import { HOMEPAGE_LINK_HEADER } from "@/lib/agent-discovery/constants";
import {
  getMarkdownForPath,
  markdownResponse,
  wantsMarkdown,
} from "@/lib/agent-discovery/markdown-negotiation";
import { updateSession } from "@/lib/supabase/middleware";
import { NEW_LAUNCH_COOKIE_NAME, verifyAccessCookieValue } from "@/lib/new-launch/cookie";

function shouldSkipMarkdown(pathname: string): boolean {
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/.well-known")) return true;
  if (pathname.startsWith("/images/")) return true;
  if (pathname === "/auth.md") return true;
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|woff2|txt|json|xml)$/i.test(pathname)) return true;
  return false;
}

// The dashboard subdomain (dashboard.homeup.sg) serves the static PropMeta SPA from
// /public/dashboard.html; its data comes from /api/dashboard/*. Everything else on that host
// (api, next internals, files with an extension) passes straight through to the same project.
function isDashboardHost(request: NextRequest): boolean {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  return host === "dashboard.homeup.sg" || host.startsWith("dashboard.localhost");
}

function isRentHost(request: NextRequest): boolean {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  return host === "rent.homeup.sg" || host.startsWith("rent.localhost");
}

function redirectLegacyHostToApex(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = "homeup.sg";
  return NextResponse.redirect(url, 301);
}

function isLegacyMarketingHost(host: string): boolean {
  return host === "www.homeup.sg" || host === "lp.homeup.sg";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();

  // Strip legacy chunk-recovery ?_cb= param — it never busted script cache and
  // left users on ugly broken URLs after clearing storage.
  if (request.nextUrl.searchParams.has("_cb")) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("_cb");
    return NextResponse.redirect(url, 302);
  }

  if (isLegacyMarketingHost(host)) {
    return redirectLegacyHostToApex(request);
  }

  if (isDashboardHost(request)) {
    if (pathname.startsWith("/api") || pathname.startsWith("/_next") || /\.[a-z0-9]+$/i.test(pathname)) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard.html";
    return NextResponse.rewrite(url);
  }

  if (isRentHost(request)) {
    if (pathname.startsWith("/api") || pathname.startsWith("/_next") || /\.[a-z0-9]+$/i.test(pathname)) {
      return NextResponse.next();
    }
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/list";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // New Launch Desk gate — placed before the markdown-for-agents step below so an AI
  // agent can never get a markdown copy of any /new-launch page without the cookie.
  if (pathname.startsWith("/api/new-launch")) {
    if (pathname === "/api/new-launch/login" || pathname === "/api/new-launch/logout") {
      return NextResponse.next();
    }
    const hasAccess = await verifyAccessCookieValue(request.cookies.get(NEW_LAUNCH_COOKIE_NAME)?.value);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/new-launch")) {
    if (pathname.startsWith("/new-launch/login")) {
      return NextResponse.next();
    }
    const hasAccess = await verifyAccessCookieValue(request.cookies.get(NEW_LAUNCH_COOKIE_NAME)?.value);
    if (!hasAccess) {
      return NextResponse.redirect(new URL("/new-launch/login", request.url));
    }
    return NextResponse.next();
  }

  if (!shouldSkipMarkdown(pathname) && wantsMarkdown(request)) {
    const markdown = await getMarkdownForPath(pathname);
    if (markdown) return markdownResponse(markdown);
  }

  if (pathname === "/") {
    const response = NextResponse.next();
    response.headers.set("Link", HOMEPAGE_LINK_HEADER);
    return response;
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (pathname.startsWith("/admin/login")) {
    if (user) {
      return NextResponse.redirect(new URL("/admin/listings", request.url));
    }
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin/listings" && request.nextUrl.searchParams.get("tab") === "agent-videos") {
    return NextResponse.redirect(new URL("/admin/agent-profiles", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
