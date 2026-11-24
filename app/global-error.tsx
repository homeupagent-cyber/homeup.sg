"use client";

import { CrashFallback } from "@/components/ui/CrashFallback";
import "./globals.css";

// Last resort: catches a crash in the root layout itself, which app/error.tsx
// cannot. It replaces the layout, so it brings its own <html> and <body>.
export default function GlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>HomeUP | Fixed-Fee Property Agents Singapore</title>
      </head>
      <body>
        <CrashFallback {...props} />
      </body>
    </html>
  );
}
