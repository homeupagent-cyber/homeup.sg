import { NlCard } from "./NlCard";
import { formatOrPlaceholder } from "@/lib/new-launch/format";
import type { VersusResale } from "@/lib/new-launch/types";

export function VersusTable({ versus }: { versus: VersusResale }) {
  return (
    <NlCard>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium" style={{ color: "#1e1812" }}>Same budget: new launch versus resale</p>
        <p className="text-xs" style={{ color: "#6b5f52" }}>
          Budget {formatOrPlaceholder(versus.budget != null ? `S$${versus.budget.toLocaleString("en-SG")}` : null)} ·{" "}
          {formatOrPlaceholder(versus.unitType, "[unit type]")} ·{" "}
          {formatOrPlaceholder(versus.holdingYears != null ? `${versus.holdingYears} yr hold` : null)}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#e8e3db", color: "#6b5f52" }}>
              <th className="py-2 pr-4 font-medium"> </th>
              <th className="py-2 pr-4 font-medium">New launch</th>
              <th className="py-2 pr-4 font-medium">Resale</th>
            </tr>
          </thead>
          <tbody>
            {versus.rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0" style={{ borderColor: "#e8e3db" }}>
                <td className="py-2 pr-4" style={{ color: "#6b5f52" }}>{row.label}</td>
                <td className="py-2 pr-4" style={{ color: "#1e1812" }}>
                  {formatOrPlaceholder(row.newLaunch)}
                </td>
                <td className="py-2 pr-4" style={{ color: "#1e1812" }}>
                  {formatOrPlaceholder(row.resale)}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-3 pr-4 font-medium" style={{ color: "#1e1812" }}>Better for you</td>
              <td colSpan={2} className="py-3 pr-4" style={{ color: "#1e1812" }}>
                {formatOrPlaceholder(versus.betterForYou.verdict, "[Pending advisor review]")}
                {versus.betterForYou.note ? ` — ${versus.betterForYou.note}` : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </NlCard>
  );
}
