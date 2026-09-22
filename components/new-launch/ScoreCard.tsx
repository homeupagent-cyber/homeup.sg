import { NlCard } from "./NlCard";
import type { Criterion } from "@/lib/new-launch/types";

export function ScoreCard({ title, criteria }: { title: string; criteria: Criterion[] }) {
  return (
    <NlCard>
      <p className="mb-4 font-medium" style={{ color: "#16181B" }}>{title}</p>
      <div className="space-y-4">
        {criteria.map((c) => (
          <div key={c.name} className="border-t pt-3 first:border-0 first:pt-0" style={{ borderColor: "#DEDAD1" }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium" style={{ color: "#16181B" }}>{c.name}</p>
              <span
                className="shrink-0 text-sm"
                style={{ fontFamily: "var(--font-nl-mono)", color: "#16181B" }}
              >
                {c.score == null ? "[--]" : c.score}/10
              </span>
            </div>
            <p className="mt-1 text-xs" style={{ color: "#585C63" }}>{c.measure}</p>
            <p className="mt-1 text-xs" style={{ color: "#585C63" }}>{c.rule}</p>
            <p className="mt-1 text-sm" style={{ color: "#3E4248" }}>
              {c.result ?? "[Result pending]"}
            </p>
          </div>
        ))}
      </div>
    </NlCard>
  );
}
