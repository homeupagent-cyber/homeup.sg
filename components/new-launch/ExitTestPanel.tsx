import { NlCard } from "./NlCard";
import { formatMoney, formatUnits, formatYears } from "@/lib/new-launch/format";
import type { ExitTest } from "@/lib/new-launch/types";

export function ExitTestPanel({ exitTest }: { exitTest: ExitTest }) {
  const rows: Array<[string, string]> = [
    ["Exit price, flat case", formatMoney(exitTest.exitPriceFlatCase)],
    ["Typical upgrader budget nearby", formatMoney(exitTest.upgraderBudget)],
    ["Competing supply completing near exit", formatUnits(exitTest.competingSupplyUnits)],
    ["Lease left at exit", formatYears(exitTest.leaseLeftAtExit)],
  ];

  return (
    <NlCard>
      <p className="mb-4 font-medium" style={{ color: "#16181B" }}>Exit test</p>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt style={{ color: "#585C63" }}>{label}</dt>
            <dd style={{ fontFamily: "var(--font-nl-mono)", color: "#16181B" }}>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs" style={{ color: "#585C63" }}>
        This checks whether there is likely to be a buyer for this unit, at a fair price, when you
        want to exit — not just whether the project is a good buy today.
      </p>
    </NlCard>
  );
}
