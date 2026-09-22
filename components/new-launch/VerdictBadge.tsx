import { VERDICT_BADGE } from "@/lib/new-launch/theme";
import type { Verdict } from "@/lib/new-launch/types";

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const style = VERDICT_BADGE[verdict];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}
