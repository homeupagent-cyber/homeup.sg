// New Launch Desk look and feel — deliberately not the main site theme. Colors are used
// as Tailwind arbitrary values (bg-[#F5F3EE]) throughout components/new-launch, not wired
// into tailwind.config.ts, so this stays isolated from the rest of the site.
export const NL_COLORS = {
  background: "#F5F3EE",
  surface: "#FFFFFF",
  ink: "#16181B",
  secondaryText: "#3E4248",
  muted: "#585C63",
  hairline: "#DEDAD1",

  darkPanel: "#16181B",
  darkText: "#F5F3EE",
  darkHairline: "#45494F",
  darkMuted: "#BFC3C9",

  green: "#1E5B45",
  amber: "#B7791F",
  red: "#9B3426",
  navy: "#1F3A5F",

  badgeGreenBg: "#DDEEE6",
  badgeGreenText: "#143F30",
  badgeAmberBg: "#F3E6CF",
  badgeAmberText: "#6B4410",
  badgeNavyBg: "#E4E9F0",
  badgeNavyText: "#1F3A5F",
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
  PASS: { bg: "#F3DAD4", text: NL_COLORS.red, label: "Pass" },
  PENDING: { bg: NL_COLORS.badgeNavyBg, text: NL_COLORS.badgeNavyText, label: "Pending" },
};
