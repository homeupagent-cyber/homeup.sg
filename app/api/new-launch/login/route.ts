import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  createAccessCookieValue,
  NEW_LAUNCH_COOKIE_MAX_AGE_SECONDS,
  NEW_LAUNCH_COOKIE_NAME,
} from "@/lib/new-launch/cookie";
import {
  checkNewLaunchLoginRateLimit,
  hashNewLaunchIp,
  recordNewLaunchLoginAttempt,
} from "@/lib/new-launch/rate-limit";
import { getClientIp } from "@/lib/intake/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// Constant-time comparison. Both inputs are hashed to a fixed 32-byte digest first so
// timingSafeEqual never throws on a length mismatch and length itself leaks nothing.
function codeMatches(submitted: string, expected: string): boolean {
  const a = createHash("sha256").update(submitted).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const accessCode = process.env.NEW_LAUNCH_ACCESS_CODE;
  if (!accessCode) {
    return NextResponse.json({ error: "Login is not set up yet." }, { status: 500 });
  }

  let body: { mobileNumber?: string; accessCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "That didn't come through. Please try again." }, { status: 400 });
  }

  const mobileNumber = (body.mobileNumber ?? "").trim();
  const submittedCode = (body.accessCode ?? "").trim();

  if (!mobileNumber || !submittedCode) {
    return NextResponse.json(
      { error: "Enter your mobile number and access code." },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);
  const ipHash = ip ? hashNewLaunchIp(ip) : null;

  let supabase: ReturnType<typeof createServiceClient> | null = null;
  try {
    supabase = createServiceClient();
  } catch (error) {
    console.error("[new-launch] Supabase service client unavailable:", error);
  }

  if (supabase) {
    const rateLimit = await checkNewLaunchLoginRateLimit(supabase, ipHash);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason }, { status: 429 });
    }
    await recordNewLaunchLoginAttempt(supabase, ipHash);
  }

  if (!codeMatches(submittedCode, accessCode)) {
    return NextResponse.json(
      { error: "That code didn't work. Please check and try again." },
      { status: 401 },
    );
  }

  if (supabase) {
    const { error } = await supabase.from("new_launch_access_log").insert({
      mobile_number: mobileNumber,
      user_agent: request.headers.get("user-agent"),
      ip_hash: ipHash,
    });
    if (error) console.error("[new-launch] failed to log access:", error.message);
  }

  const cookieValue = await createAccessCookieValue();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(NEW_LAUNCH_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: NEW_LAUNCH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
