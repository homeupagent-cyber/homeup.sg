"use client";

import { CrashFallback } from "@/components/ui/CrashFallback";

// Catches a crash in any page under the root layout, so the layout (fonts,
// WhatsApp button, analytics) stays and only the page body is swapped.
export default function RootError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <CrashFallback {...props} />;
}
