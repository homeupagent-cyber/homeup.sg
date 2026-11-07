import Link from "next/link";
import { VerdictBadge } from "./VerdictBadge";
import type { PipelineRow } from "@/lib/new-launch/types";

export function PipelineTable({ rows }: { rows: PipelineRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#e8e3db" }}>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "#e8e3db", color: "#6b5f52" }}>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Segment</th>
            <th className="px-4 py-3 font-medium">Units</th>
            <th className="px-4 py-3 font-medium">Expected</th>
            <th className="px-4 py-3 font-medium">Main catalyst</th>
            <th className="px-4 py-3 font-medium">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.project} className="border-b last:border-0" style={{ borderColor: "#e8e3db" }}>
              <td className="px-4 py-3 font-medium" style={{ color: "#1e1812" }}>
                {row.slug ? (
                  <Link href={`/new-launch/${row.slug}`} className="hover:underline">
                    {row.project}
                  </Link>
                ) : (
                  row.project
                )}
              </td>
              <td className="px-4 py-3" style={{ color: "#4e4439" }}>{row.segment}</td>
              <td className="px-4 py-3" style={{ color: "#4e4439", fontFamily: "var(--font-nl-mono)" }}>
                {row.units}
              </td>
              <td className="px-4 py-3" style={{ color: "#4e4439" }}>{row.expected}</td>
              <td className="px-4 py-3" style={{ color: "#4e4439" }}>{row.catalyst}</td>
              <td className="px-4 py-3">
                <VerdictBadge verdict={row.verdict} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
