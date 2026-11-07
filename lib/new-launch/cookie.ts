// Signs and verifies the nl_access cookie with Web Crypto (crypto.subtle), not Node's
// crypto module — this file is imported from middleware.ts, which runs on the Edge
// runtime on Next 14 and has no Node crypto. Web Crypto works in both Edge and Node.

export const NEW_LAUNCH_COOKIE_NAME = "nl_access";
export const NEW_LAUNCH_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

type CookiePayload = {
  iat: number;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.NEW_LAUNCH_COOKIE_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("NEW_LAUNCH_COOKIE_SECRET must be set (min 16 characters)");
  }
  return secret;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  arr.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const bin = atob(padded + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function createAccessCookieValue(): Promise<string> {
  const secret = getSecret();
  const iat = Date.now();
  const payload: CookiePayload = { iat, exp: iat + NEW_LAUNCH_COOKIE_MAX_AGE_SECONDS * 1000 };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function verifyAccessCookieValue(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;

  const secret = process.env.NEW_LAUNCH_COOKIE_SECRET;
  if (!secret || secret.length < 16) return false;

  const [payloadB64, signatureB64] = value.split(".");
  if (!payloadB64 || !signatureB64) return false;

  try {
    const key = await hmacKey(secret);
    const signatureBytes = fromBase64Url(signatureB64) as BufferSource;
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(payloadB64),
    );
    if (!valid) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadB64)),
    ) as CookiePayload;
    if (!payload.exp || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}
