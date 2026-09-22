import type { BuyerProfileKey } from "./scoring-constants";
import { BUYER_PROFILES } from "./scoring-constants";
import type { Criterion } from "./types";

const MAX_RAW_SCORE = 60; // six criteria, 0 to 10 each

function rawScore(criteria: Criterion[]): number | null {
  if (criteria.some((c) => c.score == null)) return null;
  return criteria.reduce((sum, c) => sum + (c.score ?? 0), 0);
}

export function weightedScoreForProfile(
  fundamentals: Criterion[],
  technicals: Criterion[],
  profileKey: BuyerProfileKey,
): number | null {
  const profile = BUYER_PROFILES.find((p) => p.key === profileKey);
  if (!profile) return null;

  const fundamentalRaw = rawScore(fundamentals);
  const technicalRaw = rawScore(technicals);
  if (fundamentalRaw == null || technicalRaw == null) return null;

  const fundamentalPct = (fundamentalRaw / MAX_RAW_SCORE) * profile.fundamentalWeight;
  const technicalPct = (technicalRaw / MAX_RAW_SCORE) * profile.technicalWeight;

  return Math.round(fundamentalPct + technicalPct);
}
