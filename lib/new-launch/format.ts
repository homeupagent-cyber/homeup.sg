// Renders a bracketed placeholder for any missing value — never a blank, 0, NaN or "null".

export function formatPsf(value: number | null): string {
  return value == null ? "[S$ psf]" : `S$${value.toLocaleString("en-SG")} psf`;
}

export function formatMoney(value: number | null): string {
  return value == null ? "[S$ amount]" : `S$${value.toLocaleString("en-SG")}`;
}

export function formatPercent(value: number | null, digits = 1): string {
  return value == null ? "[%]" : `${value.toFixed(digits)}%`;
}

export function formatUnits(value: number | null): string {
  return value == null ? "[units]" : value.toLocaleString("en-SG");
}

export function formatYears(value: number | null): string {
  return value == null ? "[years]" : `${value} yr${value === 1 ? "" : "s"}`;
}

export function formatOrPlaceholder(value: string | number | null | undefined, label = "[pending]"): string {
  if (value == null) return label;
  if (typeof value === "number" && Number.isNaN(value)) return label;
  if (typeof value === "string" && value.trim() === "") return label;
  return String(value);
}
