/**
 * Service account login for the private HomeUP listings sheet.
 *
 * Env var (server-only, never NEXT_PUBLIC):
 *   LISTINGS_SHEET_SERVICE_ACCOUNT_B64  Google JSON key, base64-encoded onto one line.
 *                                       Raw one-line JSON is also accepted.
 *
 * Unset → returns null and the sheet is fetched without a login, as before.
 * Same JWT / node:crypto pattern as lib/ga4/server.ts, kept inside lib/listings
 * so the sync kit build (scripts/build-listings-sync-kit.py) copies it.
 * NEVER log the env value or private_key.
 */
import { createPrivateKey, sign } from "node:crypto";

export const LISTINGS_SHEET_CREDENTIAL_ENV = "LISTINGS_SHEET_SERVICE_ACCOUNT_B64";

const SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

let tokenCache: { token: string; expiresAt: number; email: string } | null = null;

function b64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function parseServiceAccount(raw: string): ServiceAccount {
  let text = raw.trim();
  if (
    (text.startsWith("'") && text.endsWith("'")) ||
    (text.startsWith('"') && text.endsWith('"') && !text.startsWith('"{'))
  ) {
    text = text.slice(1, -1).trim();
  }

  const json = text.startsWith("{") || text.startsWith('"')
    ? text
    : Buffer.from(text, "base64").toString("utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
  } catch {
    throw new Error(
      `${LISTINGS_SHEET_CREDENTIAL_ENV} is not a valid service account key. ` +
        "Paste the base64 of the whole JSON key file on one line.",
    );
  }

  const sa = parsed as Partial<ServiceAccount>;
  if (!sa.client_email || !sa.private_key) {
    throw new Error(`${LISTINGS_SHEET_CREDENTIAL_ENV} is missing client_email or private_key.`);
  }
  return {
    client_email: sa.client_email,
    private_key: sa.private_key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n"),
  };
}

/** Service account email, or null when the credential is not set. Safe to show (not a secret). */
export function listingsSheetServiceAccountEmail(): string | null {
  const raw = process.env[LISTINGS_SHEET_CREDENTIAL_ENV];
  if (!raw?.trim()) return null;
  return parseServiceAccount(raw).client_email;
}

/** Read-only Google access token for the sheet, or null when the credential is not set. */
export async function getListingsSheetAccessToken(): Promise<string | null> {
  const raw = process.env[LISTINGS_SHEET_CREDENTIAL_ENV];
  if (!raw?.trim()) return null;

  const sa = parseServiceAccount(raw);
  if (tokenCache && tokenCache.email === sa.client_email && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now }),
  );
  const signingInput = `${header}.${payload}`;

  let jwt: string;
  try {
    const sig = sign("RSA-SHA256", Buffer.from(signingInput), createPrivateKey(sa.private_key));
    jwt = `${signingInput}.${b64url(sig)}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Listings sheet login failed: could not read the private key (${msg}).`);
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!data.access_token) {
    throw new Error(
      `Listings sheet login failed (${res.status}): ${data.error_description ?? data.error ?? "no token returned"}.`,
    );
  }

  const ttlSeconds = data.expires_in ?? 3600;
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(ttlSeconds - 600, 60) * 1000,
    email: sa.client_email,
  };
  return data.access_token;
}
