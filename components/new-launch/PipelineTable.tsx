import Link from "next/link";
import { VerdictBadge } from "./VerdictBadge";
import type { PipelineRow } from "@/lib/new-launch/types";

export function PipelineTable({ rows }: { rows: PipelineRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#DEDAD1" }}>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "#DEDAD1", color: "#585C63" }}>
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
            <tr key={row.project} className="border-b last:border-0" style={{ borderColor: "#DEDAD1" }}>
              <td className="px-4 py-3 font-medium" style={{ color: "#16181B" }}>
                {row.slug ? (
                  <Link href={`/new-launch/${row.slug}`} className="hover:underline">
                    {row.project}
                  </Link>
                ) : (
                  row.project
                )}
              </td>
              <td className="px-4 py-3" style={{ color: "#3E4248" }}>{row.segment}</td>
              <td className="px-4 py-3" style={{ color: "#3E4248", fontFamily: "var(--font-nl-mono)" }}>
                {row.units}
              </td>
              <td className="px-4 py-3" style={{ color: "#3E4248" }}>{row.expected}</td>
              <td className="px-4 py-3" style={{ color: "#3E4248" }}>{row.catalyst}</td>
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
