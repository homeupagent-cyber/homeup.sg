"use client";

import { useEffect } from "react";
import { whatsAppUrlFor } from "@/lib/whatsapp";

/**
 * Branded fallback shown when a page throws in the browser.
 *
 * Without this, Next.js swaps the whole page for its default line
 * "Application error: a client-side exception has occurred", which is what
 * visitors (and Google's renderer) end up seeing and saving.
 *
 * On first crash for a path it retries the render once on its own, because
 * most crashes we have seen were one-off (a script that loaded late, a deploy
 * landing mid-visit). If the retry fails too, the fallback stays up.
 */

const RETRY_KEY_PREFIX = "homeup-crash-retry:";
const RETRY_COOLDOWN_MS = 30_000;

function shouldAutoRetry(): boolean {
  try {
    const key = RETRY_KEY_PREFIX + window.location.pathname;
    const last = Number(window.sessionStorage.getItem(key) || 0);
    if (Date.now() - last < RETRY_COOLDOWN_MS) return false;
    window.sessionStorage.setItem(key, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

const SECTION_LINKS = [
  { href: "/sell", label: "Sell with HomeUP" },
  { href: "/buy", label: "Buy with HomeUP" },
  { href: "/listings", label: "Our listings" },
  { href: "/agents", label: "Our agents" },
];

export function CrashFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HomeUP] page crashed", error);
    if (!shouldAutoRetry()) return;
    const timer = window.setTimeout(reset, 300);
    return () => window.clearTimeout(timer);
  }, [error, reset]);

  return (
    <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">HomeUP</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
        This page hit a snag
      </h1>
      <p className="mt-4 max-w-xl text-base text-neutral-600">
        Sorry, something went wrong while loading this page. Please try again, or message us on
        WhatsApp and we will help you straight away.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Try again
        </button>
        <a
          href={whatsAppUrlFor("float")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          WhatsApp Us
        </a>
        {/* Plain <a> on purpose: a full page load is the cleanest recovery. */}
        <a
          href="/"
          className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Go to homepage
        </a>
      </div>

      <p className="mt-12 max-w-xl text-sm text-neutral-500">
        HomeUP: fixed-fee property agents in Singapore. Sell your HDB from $1,999 or your condo
        from $4,999, with every sale handled by CEA-licensed agents.
      </p>
      <nav aria-label="HomeUP sections" className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {SECTION_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </main>
  );
}
