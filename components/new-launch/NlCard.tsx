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
      style={{ borderColor: "#DEDAD1" }}
    >
      {children}
    </div>
  );
}
