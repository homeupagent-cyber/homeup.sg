import type { GlsSupplyBar } from "@/lib/new-launch/types";

export function GlsSupplyChart({ data, average }: { data: GlsSupplyBar[]; average: number }) {
  const width = 420;
  const height = 220;
  const paddingX = 40;
  const paddingBottom = 30;
  const paddingTop = 24;
  const chartHeight = height - paddingBottom - paddingTop;
  const maxVal = Math.max(...data.map((d) => d.units), average) * 1.15;
  const barWidth = (width - paddingX * 2) / data.length;
  const scaleY = (v: number) => paddingTop + chartHeight - (v / maxVal) * chartHeight;
  const avgY = scaleY(average);

  const label = `${data.map((d) => `${d.label} ${d.units.toLocaleString()} units`).join(", ")}; 10-year average ${average.toLocaleString()} units`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`GLS Confirmed List supply: ${label}`} className="h-auto w-full">
      <line x1={paddingX} y1={avgY} x2={width - paddingX} y2={avgY} stroke="#1F3A5F" strokeDasharray="4 3" />
      <text x={width - paddingX} y={avgY - 6} textAnchor="end" fontSize="10" fill="#1F3A5F">
        10-yr avg {average.toLocaleString()}
      </text>
      {data.map((d, i) => {
        const x = paddingX + i * barWidth + barWidth * 0.25;
        const w = barWidth * 0.5;
        const y = scaleY(d.units);
        const h = paddingTop + chartHeight - y;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={w} height={h} fill="#1F3A5F" rx={2} />
            <text
              x={x + w / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="11"
              fill="#16181B"
              fontFamily="var(--font-nl-mono)"
            >
              {d.units.toLocaleString()}
            </text>
            <text x={x + w / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#585C63">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
