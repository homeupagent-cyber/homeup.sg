import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Same shape as lib/intake/rate-limit.ts checkIntakeRateLimit — a count query against a
// Supabase table within a time window — pointed at the new-launch login attempts table.
export const NEW_LAUNCH_LOGIN_RATE_LIMIT = {
  maxAttemptsPerWindow: 10,
  windowMinutes: 10,
} as const;

export type RateLimitResult = { allowed: true } | { allowed: false; reason: string };

export async function checkNewLaunchLoginRateLimit(
  supabase: SupabaseClient,
  ipHash: string | null,
): Promise<RateLimitResult> {
  if (!ipHash) return { allowed: true };

  const windowStart = new Date(
    Date.now() - NEW_LAUNCH_LOGIN_RATE_LIMIT.windowMinutes * 60 * 1000,
  ).toISOString();

  const { count, error } = await supabase
    .from("new_launch_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (error) {
    console.error("[new-launch] login rate limit check failed:", error.message);
    return { allowed: true };
  }

  if (count != null && count >= NEW_LAUNCH_LOGIN_RATE_LIMIT.maxAttemptsPerWindow) {
    return {
      allowed: false,
      reason: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  return { allowed: true };
}

export async function recordNewLaunchLoginAttempt(
  supabase: SupabaseClient,
  ipHash: string | null,
): Promise<void> {
  if (!ipHash) return;
  const { error } = await supabase.from("new_launch_login_attempts").insert({ ip_hash: ipHash });
  if (error) console.error("[new-launch] failed to record login attempt:", error.message);
}

export function hashNewLaunchIp(ip: string): string {
  const secret = process.env.NEW_LAUNCH_COOKIE_SECRET ?? "fallback";
  return createHash("sha256").update(`${secret}:ip:${ip}`).digest("hex");
}
