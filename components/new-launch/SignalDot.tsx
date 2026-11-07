import { SIGNAL_DOT_COLOR } from "@/lib/new-launch/theme";
import type { SignalLevel } from "@/lib/new-launch/types";

export function SignalDot({ level }: { level: SignalLevel }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: SIGNAL_DOT_COLOR[level] }}
    />
  );
}
