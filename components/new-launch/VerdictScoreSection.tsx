"use client";

import { useState } from "react";
import { NlCard } from "./NlCard";
import { VerdictBadge } from "./VerdictBadge";
import { ScoreCard } from "./ScoreCard";
import { BUYER_PROFILES, type BuyerProfileKey } from "@/lib/new-launch/scoring-constants";
import { weightedScoreForProfile } from "@/lib/new-launch/scoring";
import type { Project } from "@/lib/new-launch/types";

export function VerdictScoreSection({ project }: { project: Project }) {
  const [profileKey, setProfileKey] = useState<BuyerProfileKey>(BUYER_PROFILES[0].key);
  const profile = BUYER_PROFILES.find((p) => p.key === profileKey)!;
  const weightedScore = weightedScoreForProfile(project.fundamentals, project.technicals, profileKey);

  return (
    <div className="space-y-6">
      <NlCard>
        <div className="flex flex-wrap items-center gap-4">
          <VerdictBadge verdict={project.verdict} />
          <span className="text-3xl" style={{ fontFamily: "var(--font-nl-mono)", color: "#1e1812" }}>
            {weightedScore ?? project.score ?? "[--]"}/100
          </span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "#6b5f52" }}>
          Fundamentals weighted {profile.fundamentalWeight}%, technicals weighted {profile.technicalWeight}%
          for a {profile.label.toLowerCase()}.
        </p>
        <p className="mt-1 text-xs" style={{ color: "#6b5f52" }}>
          Reviewed by {project.reviewedBy ?? "[Advisor name]"} on {project.reviewedOn ?? "[Review date]"}
        </p>
      </NlCard>

      <NlCard>
        <p className="mb-3 font-medium" style={{ color: "#1e1812" }}>Who is this for?</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Buyer profile">
          {BUYER_PROFILES.map((p) => {
            const active = p.key === profileKey;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setProfileKey(p.key)}
                aria-pressed={active}
                className="min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                style={
                  active
                    ? { backgroundColor: "#009A44", color: "#FFFFFF", borderColor: "#009A44" }
                    : { backgroundColor: "#FFFFFF", color: "#1e1812", borderColor: "#e8e3db" }
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm" style={{ color: "#4e4439" }}>{profile.description}</p>
      </NlCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScoreCard title="Fundamentals" criteria={project.fundamentals} />
        <ScoreCard title="Technicals" criteria={project.technicals} />
      </div>
    </div>
  );
}
