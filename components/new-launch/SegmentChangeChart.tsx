import type { SegmentChange } from "@/lib/new-launch/types";

export function SegmentChangeChart({ data }: { data: SegmentChange[] }) {
  const width = 420;
  const height = 220;
  const paddingX = 16;
  const baselineY = height / 2;
  const barMaxHeight = 64;
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.changePercent)), 1);
  const barWidth = (width - paddingX * 2) / data.length;

  const label = data
    .map((d) => `${d.segment} ${d.changePercent > 0 ? "+" : ""}${d.changePercent}%`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Segment price change, quarter on quarter: ${label}`}
      className="h-auto w-full"
    >
      <line x1={paddingX} y1={baselineY} x2={width - paddingX} y2={baselineY} stroke="#DEDAD1" />
      {data.map((d, i) => {
        const barHeight = (Math.abs(d.changePercent) / maxAbs) * barMaxHeight;
        const x = paddingX + i * barWidth + barWidth * 0.2;
        const w = barWidth * 0.6;
        const positive = d.changePercent >= 0;
        const y = positive ? baselineY - barHeight : baselineY;
        const color = positive ? "#1E5B45" : "#9B3426";
        return (
          <g key={d.segment}>
            <rect x={x} y={y} width={w} height={Math.max(barHeight, 1)} fill={color} rx={2} />
            <text
              x={x + w / 2}
              y={positive ? y - 6 : y + barHeight + 14}
              textAnchor="middle"
              fontSize="11"
              fill="#16181B"
              fontFamily="var(--font-nl-mono)"
            >
              {positive ? "+" : ""}
              {d.changePercent}%
            </text>
            <text x={x + w / 2} y={height - 6} textAnchor="middle" fontSize="9" fill="#585C63">
              {d.segment}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
