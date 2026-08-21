import { fetchOEmbedThumbnail } from "@/lib/playbook/oembed";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")?.trim();
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const thumbnail_url = await fetchOEmbedThumbnail(url);
  // s-maxage kept under the ~2-day TikTok signature window; no stale-while-revalidate,
  // so an expired cache entry is never served in place of a synchronous refresh.
  // Note: next.config.mjs currently applies a sitewide no-store policy that overrides
  // this at the CDN/edge layer — see PR for detail. Kept correct here regardless.
  return NextResponse.json(
    { thumbnail_url },
    { headers: { "Cache-Control": "public, s-maxage=43200" } },
  );
}
