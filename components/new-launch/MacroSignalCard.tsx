import { NlCard } from "./NlCard";
import { SignalDot } from "./SignalDot";
import type { MacroSignal } from "@/lib/new-launch/types";

export function MacroSignalCard({ signal }: { signal: MacroSignal }) {
  return (
    <NlCard>
      <div className="flex items-center gap-2">
        <SignalDot level={signal.level} />
        <p className="font-medium" style={{ color: "#16181B" }}>{signal.name}</p>
      </div>
      <p className="mt-2 text-sm" style={{ color: "#3E4248" }}>{signal.note}</p>
    </NlCard>
  );
}
