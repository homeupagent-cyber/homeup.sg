// New Launch Desk look and feel — reuses the main site's own design tokens (see
// tailwind.config.ts `primary`/`accent`/`neutral` scales and app/globals.css `--bg-page`)
// so this section reads as HomeUP rather than a bespoke sub-brand. Colors are used as
// literal hex in inline styles and SVG fill/stroke (not Tailwind classes) because a lot of
// this UI is hand-built SVG charts where Tailwind classes don't reach — the hex values below
// are copied from the site's real tokens, not invented.
export const NL_COLORS = {
  background: "#faf9f5", // site body background (app/globals.css)
  surface: "#FFFFFF",
  ink: "#1e1812", // neutral-900
  secondaryText: "#4e4439", // neutral-700
  muted: "#6b5f52", // neutral-600
  hairline: "#e8e3db", // neutral-200 / --border-subtle

  darkPanel: "#005c28", // primary-800 — HomeUP green, not a generic near-black panel
  darkText: "#FFFFFF",
  darkHairline: "rgba(255,255,255,0.18)",
  darkMuted: "#cfe0d5",

  green: "#009A44", // primary-600, the actual HomeUP brand green
  amber: "#b47d04", // accent-600
  red: "#b91c1c",
  navy: "#2563eb", // matches the blue already used for HDB icons in the main nav

  badgeGreenBg: "#ddfaec", // primary-100
  badgeGreenText: "#005c28", // primary-800
  badgeAmberBg: "#fef3c7", // accent-100
  badgeAmberText: "#7c5a03",
  badgeNavyBg: "#dbeafe",
  badgeNavyText: "#1e40af",
} as const;

export const SIGNAL_DOT_COLOR: Record<"green" | "amber" | "red" | "grey", string> = {
  green: NL_COLORS.green,
  amber: NL_COLORS.amber,
  red: NL_COLORS.red,
  grey: "#9CA0A6",
};

export const VERDICT_BADGE: Record<
  "BUY" | "CONDITIONAL" | "WAIT" | "PASS" | "PENDING",
  { bg: string; text: string; label: string }
> = {
  BUY: { bg: NL_COLORS.badgeGreenBg, text: NL_COLORS.badgeGreenText, label: "Buy" },
  CONDITIONAL: { bg: NL_COLORS.badgeAmberBg, text: NL_COLORS.badgeAmberText, label: "Conditional" },
  WAIT: { bg: NL_COLORS.badgeAmberBg, text: NL_COLORS.badgeAmberText, label: "Wait" },
  PASS: { bg: "#fee2e2", text: NL_COLORS.red, label: "Pass" },
  PENDING: { bg: NL_COLORS.badgeNavyBg, text: NL_COLORS.badgeNavyText, label: "Pending" },
};
