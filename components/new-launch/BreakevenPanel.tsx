import { NlCard } from "./NlCard";
import { formatOrPlaceholder, formatPsf } from "@/lib/new-launch/format";
import type { DeveloperBreakeven } from "@/lib/new-launch/types";

export function BreakevenPanel({ breakeven }: { breakeven: DeveloperBreakeven }) {
  const rows: Array<[string, string]> = [
    ["Land psf ppr", formatPsf(breakeven.landPsfPpr)],
    ["Construction", formatPsf(breakeven.construction)],
    ["Finance and fees", formatPsf(breakeven.financeAndFees)],
    ["Breakeven", formatPsf(breakeven.breakeven)],
    ["Average launch psf", formatPsf(breakeven.avgLaunchPsf)],
    ["ABSD deadline", formatOrPlaceholder(breakeven.absdDeadline, "[ABSD deadline]")],
  ];

  return (
    <NlCard>
      <p className="mb-4 font-medium" style={{ color: "#1e1812" }}>Developer breakeven</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt style={{ color: "#6b5f52" }}>{label}</dt>
            <dd style={{ fontFamily: "var(--font-nl-mono)", color: "#1e1812" }}>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs" style={{ color: "#6b5f52" }}>
        Thin margins near an ABSD deadline often mean the developer has more room to move on
        price, especially on remaining stock later in the sales window.
      </p>
    </NlCard>
  );
}
