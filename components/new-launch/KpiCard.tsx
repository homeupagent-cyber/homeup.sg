import { NlCard } from "./NlCard";
import type { MacroFigure } from "@/lib/new-launch/types";

export function KpiCard({ figure }: { figure: MacroFigure }) {
  const isPlaceholder = figure.value.startsWith("[");
  return (
    <NlCard>
      <p className="text-sm" style={{ color: "#6b5f52" }}>{figure.label}</p>
      <p
        className={isPlaceholder ? "mt-2 text-base" : "mt-2 text-3xl"}
        style={{ fontFamily: "var(--font-nl-mono)", color: isPlaceholder ? "#6b5f52" : "#1e1812" }}
      >
        {figure.value}
      </p>
      <p className="mt-3 text-xs" style={{ color: "#6b5f52" }}>
        {figure.source} · {figure.asOf}
      </p>
    </NlCard>
  );
}
