export function NlCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-[#FFFFFF] p-6 ${className}`}
      style={{ borderColor: "#e8e3db" }}
    >
      {children}
    </div>
  );
}
