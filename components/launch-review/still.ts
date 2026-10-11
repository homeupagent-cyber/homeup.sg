import { existsSync } from "node:fs";
import { join } from "node:path";

export const STILL_IMAGE_SIZE = { width: 1200, height: 630 };

/** Still of the 3D site study, written by scripts/launch-data/capture-site-still.mjs. Null if not captured yet. */
export function stillImageFor(slug: string): { src: string; width: number; height: number } | null {
  const src = `/launch-data/${slug}/site-study.jpg`;
  return existsSync(join(process.cwd(), "public", src)) ? { src, ...STILL_IMAGE_SIZE } : null;
}
