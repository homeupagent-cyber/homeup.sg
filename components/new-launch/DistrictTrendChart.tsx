import { NlCard } from "./NlCard";

// Empty state only in Phase 1 — the 4Q vs 8Q moving-average series comes from the
// nightly URA pull in Phase 2 (see docs/new-launch-desk-brief.md section 9).
export function DistrictTrendChart() {
  return (
    <NlCard>
      <p className="mb-2 font-medium" style={{ color: "#1e1812" }}>District price trend</p>
      <div
        className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm"
        style={{ borderColor: "#e8e3db", color: "#6b5f52" }}
        role="img"
        aria-label="District price trend chart, not yet available"
      >
        [4-quarter vs 8-quarter moving average — available once Phase 2 URA data is connected]
      </div>
    </NlCard>
  );
}
