import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

// Password-gated, per-client content — never statically generated, never cached shared,
// never indexed. next.config.mjs already sends Cache-Control: private, no-store on every
// path; force-dynamic here additionally stops Next from attempting to prerender any of
// these pages at build time or cache their rendered output.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// Numbers in monospace, same choice and same font the admin area already uses
// (see app/(admin)/admin/layout.tsx) for data-heavy screens.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-nl-mono",
  display: "swap",
  preload: false,
});

export default function NewLaunchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={jetbrainsMono.variable}
      style={
        {
          fontFamily: "var(--font-jakarta), system-ui, sans-serif",
          // Headings/body reuse the site's own Plus Jakarta Sans (already loaded and set
          // as --font-jakarta on <html> by the root layout) rather than loading separate
          // heading/body fonts — components still reference --font-nl-heading/-body, so
          // alias them here instead of touching every component that uses those names.
          "--font-nl-heading": "var(--font-jakarta)",
          "--font-nl-body": "var(--font-jakarta)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
