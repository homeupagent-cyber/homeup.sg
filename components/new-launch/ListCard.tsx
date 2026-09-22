import { NlCard } from "./NlCard";

export function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <NlCard>
      <p className="mb-3 font-medium" style={{ color: "#1e1812" }}>{title}</p>
      <ul className="space-y-2 text-sm" style={{ color: "#4e4439" }}>
        {items.length === 0 ? (
          <li style={{ color: "#6b5f52" }}>[None recorded yet]</li>
        ) : (
          items.map((item, i) => <li key={i}>{item}</li>)
        )}
      </ul>
    </NlCard>
  );
}
