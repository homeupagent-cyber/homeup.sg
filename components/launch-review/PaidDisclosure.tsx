import { HOW_HOMEUP_IS_PAID } from "./copy";

export function PaidDisclosure({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-labelledby="how-homeup-is-paid"
      className={`rounded-2xl border border-neutral-300 bg-neutral-50 p-5 ${className}`}
    >
      <h3 id="how-homeup-is-paid" className="text-sm font-bold text-neutral-900">
        How HomeUP is paid
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">{HOW_HOMEUP_IS_PAID}</p>
    </aside>
  );
}
