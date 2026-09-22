import { formatPsf } from "@/lib/new-launch/format";
import type { PricingBars } from "@/lib/new-launch/types";

type Row = { label: string; value: number | null; rangeHigh?: number | null; dashed?: boolean };

export function PricePositioningChart({ pricing }: { pricing: PricingBars }) {
  const rows: Row[] = [
    { label: "Resale, 10+ years", value: pricing.resale10yrPsf },
    { label: "Resale, 5 to 10 years", value: pricing.resale5to10yrPsf },
    { label: "Launches, last 3 years", value: pricing.recentLaunchPsf },
    { label: "This project", value: pricing.thisProjectPsfLow, rangeHigh: pricing.thisProjectPsfHigh },
    { label: "Developer breakeven", value: pricing.breakevenPsf, dashed: true },
  ];

  const knownValues = rows
    .flatMap((r) => [r.value, r.rangeHigh])
    .filter((v): v is number => v != null);
  const maxVal = knownValues.length > 0 ? Math.max(...knownValues) * 1.15 : 3000;

  const width = 480;
  const rowHeight = 38;
  const barHeight = 18;
  const height = rows.length * rowHeight + 8;
  const chartLeft = 170;
  const chartRight = width - 10;
  const scaleX = (v: number) => chartLeft + (v / maxVal) * (chartRight - chartLeft);

  const label = rows
    .map((r) => `${r.label} ${r.value == null ? "unknown" : formatPsf(r.value)}`)
    .join("; ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Price positioning by psf: ${label}`}
      className="h-auto w-full"
    >
      {rows.map((row, i) => {
        const y = i * rowHeight + 6;
        return (
          <g key={row.label}>
            <text x={0} y={y + barHeight / 2 + 4} fontSize="11" fill="#3E4248">
              {row.label}
            </text>
            {row.value == null ? (
              <rect
                x={chartLeft}
                y={y}
                width={chartRight - chartLeft}
                height={barHeight}
                fill="none"
                stroke="#DEDAD1"
                strokeDasharray="4 3"
                rx={3}
              />
            ) : row.dashed ? (
              <rect
                x={chartLeft}
                y={y}
                width={Math.max(scaleX(row.value) - chartLeft, 1)}
                height={barHeight}
                fill="none"
                stroke="#1F3A5F"
                strokeDasharray="4 3"
                rx={3}
              />
            ) : row.rangeHigh != null ? (
              <rect
                x={scaleX(row.value)}
                y={y}
                width={Math.max(scaleX(row.rangeHigh) - scaleX(row.value), 2)}
                height={barHeight}
                fill="#1E5B45"
                rx={3}
              />
            ) : (
              <rect
                x={chartLeft}
                y={y}
                width={Math.max(scaleX(row.value) - chartLeft, 1)}
                height={barHeight}
                fill="#1F3A5F"
                rx={3}
              />
            )}
            <text
              x={(row.value == null ? chartLeft : scaleX(row.rangeHigh ?? row.value)) + 6}
              y={y + barHeight / 2 + 4}
              fontSize="11"
              fontFamily="var(--font-nl-mono)"
              fill="#16181B"
            >
              {row.value == null
                ? formatPsf(null)
                : row.rangeHigh != null
                  ? `S$${row.value.toLocaleString("en-SG")}–${row.rangeHigh.toLocaleString("en-SG")}`
                  : formatPsf(row.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function pricePremium(a: number | null, b: number | null): number | null {
  if (a == null || b == null || b === 0) return null;
  return ((a - b) / b) * 100;
}
