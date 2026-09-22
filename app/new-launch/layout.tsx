import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

// Password-gated, per-client content — never statically generated, never cached shared,
// never indexed. next.config.mjs already sends Cache-Control: private, no-store on every
// path; force-dynamic here additionally stops Next from attempting to prerender any of
// these pages at build time or cache their rendered output.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-nl-heading",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-nl-body",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-nl-mono",
  display: "swap",
});

export default function NewLaunchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}
      style={{ fontFamily: "var(--font-nl-body), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
