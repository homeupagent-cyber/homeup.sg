/** Required on every 3D view and every still taken from it. */
export const INDICATIVE_LABEL =
  "HomeUP indicative site study. Not a developer model. Layout and heights subject to the developer's final plans.";

/** Draft wording. Tong Boon and C & H's KEO confirm it before DISCLOSURE_CONFIRMED is set. */
export const HOW_HOMEUP_IS_PAID =
  "If you buy a new launch unit with us, the developer pays our commission. We share it with the developer's appointed sales team, so we earn less than they do. You pay the same developer price as buying at the showflat, and you pay HomeUP nothing. We are also paid when we help clients buy resale, so we can tell you honestly when a project is not right for you.";

export function independenceDisclaimer(developer: string): string {
  return `This page is independent analysis by HomeUP. It is not affiliated with, endorsed by, or produced for ${developer} or the project's appointed sales team. Figures come from the sources listed, as of the dates shown, and may change. The 3D site study is indicative and is not a plan of the development.`;
}

export const WALKING_METHOD =
  "Walking distances use the OpenStreetMap foot router and assume 80 m per minute. Actual walking routes may differ slightly, and depend on where the development's gates end up.";

export const HEIGHT_METHOD =
  "HDB block heights are the HDB storey count multiplied by 3.0 m. Other buildings use OpenStreetMap height or storey data at 3.0 m per storey. Buildings with no height data are drawn at an estimated height in a lighter grey.";

export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return `${d} ${month} ${y}`;
}
