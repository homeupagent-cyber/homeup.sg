import SunCalc from "suncalc";

/** Fixed year so presets render the same every visit. The sun path barely changes year to year. */
export const SUN_YEAR = 2026;
export const MIN_MINUTES = 7 * 60;
export const MAX_MINUTES = 19 * 60;
/** Singapore has no daylight saving: Asia/Singapore is always UTC+8. */
const SGT_OFFSET_MINUTES = 8 * 60;

export const SUN_PRESETS = [
  { key: "jun", label: "21 Jun", month: 5, day: 21 },
  { key: "equinox", label: "21 Mar / 23 Sep", month: 2, day: 21 },
  { key: "dec", label: "21 Dec", month: 11, day: 21 },
] as const;

export type SunPresetKey = (typeof SUN_PRESETS)[number]["key"];

export function sgtDate(month: number, day: number, minutesSinceMidnight: number): Date {
  return new Date(Date.UTC(SUN_YEAR, month, day, 0, minutesSinceMidnight - SGT_OFFSET_MINUTES));
}

export interface SunState {
  /** Unit vector pointing at the sun, in viewer space: x = east, y = up, z = south. */
  direction: [number, number, number];
  altitudeDeg: number;
  /** Compass bearing of the sun, degrees clockwise from north. */
  bearingDeg: number;
  up: boolean;
}

export function sunState(date: Date, lat: number, lng: number): SunState {
  // SunCalc azimuth: 0 = south, positive towards west.
  const { azimuth, altitude } = SunCalc.getPosition(date, lat, lng);
  const cosAlt = Math.cos(altitude);
  return {
    direction: [-Math.sin(azimuth) * cosAlt, Math.sin(altitude), Math.cos(azimuth) * cosAlt],
    altitudeDeg: (altitude * 180) / Math.PI,
    bearingDeg: ((azimuth * 180) / Math.PI + 180 + 360) % 360,
    up: altitude > 0,
  };
}

const COMPASS_WORDS = [
  "north",
  "north-north-east",
  "north-east",
  "east-north-east",
  "east",
  "east-south-east",
  "south-east",
  "south-south-east",
  "south",
  "south-south-west",
  "south-west",
  "west-south-west",
  "west",
  "west-north-west",
  "north-west",
  "north-north-west",
];

export function compassWord(bearingDeg: number): string {
  return COMPASS_WORDS[Math.round((((bearingDeg % 360) + 360) % 360) / 22.5) % 16];
}

export function formatMinutes(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}
