import type { Metadata } from "next";
import Link from "next/link";
import { NlHeader } from "@/components/new-launch/NlHeader";
import { NlFooter } from "@/components/new-launch/NlFooter";
import { NlCard } from "@/components/new-launch/NlCard";
import { KpiCard } from "@/components/new-launch/KpiCard";
import { SegmentChangeChart } from "@/components/new-launch/SegmentChangeChart";
import { GlsSupplyChart } from "@/components/new-launch/GlsSupplyChart";
import { MacroSignalCard } from "@/components/new-launch/MacroSignalCard";
import { PipelineTable } from "@/components/new-launch/PipelineTable";
import { VerdictBadge } from "@/components/new-launch/VerdictBadge";
import { MACRO_DATA } from "@/lib/new-launch/macro";
import { PIPELINE_ROWS } from "@/lib/new-launch/pipeline";
import { getAllProjects } from "@/lib/new-launch/projects";
import {
  NEW_LAUNCH_PREMIUM_BAD_THRESHOLD_PERCENT,
  NEW_LAUNCH_PREMIUM_GOOD_THRESHOLD_PERCENT,
} from "@/lib/new-launch/scoring-constants";

export const metadata: Metadata = {
  title: "New Launch Desk | HomeUP",
};

export default function NewLaunchPulsePage() {
  const topPicks = getAllProjects().filter((p) => p.slug !== "demo-project" && p.score != null);

  return (
    <div style={{ backgroundColor: "#F5F3EE", minHeight: "100vh" }}>
      <NlHeader />

      <main className="mx-auto max-w-6xl space-y-14 px-6 py-10">
        <section id="market-pulse" className="space-y-6">
          <div>
            <p className="text-sm" style={{ color: "#585C63" }}>Market pulse, {MACRO_DATA.houseViewAsOf}</p>
            <h1 className="mt-1 text-3xl md:text-4xl" style={{ fontFamily: "var(--font-nl-heading)", color: "#16181B" }}>
              Where the market stands before you look at any project
            </h1>
          </div>
          <NlCard>
            <p className="text-sm" style={{ color: "#585C63" }}>House view, {MACRO_DATA.houseViewAsOf}</p>
            <p className="mt-2 text-xl" style={{ fontFamily: "var(--font-nl-heading)", color: "#16181B" }}>
              {MACRO_DATA.houseView}
            </p>
          </NlCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard figure={MACRO_DATA.priceIndex} />
            <KpiCard figure={MACRO_DATA.firstHalf} />
            <KpiCard figure={MACRO_DATA.vacancy} />
            <KpiCard figure={MACRO_DATA.sora} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <NlCard>
              <p className="mb-3 font-medium" style={{ color: "#16181B" }}>Segment change, q-o-q</p>
              <SegmentChangeChart data={MACRO_DATA.segmentChanges} />
            </NlCard>
            <NlCard>
              <p className="mb-3 font-medium" style={{ color: "#16181B" }}>GLS Confirmed List supply, 2026</p>
              <GlsSupplyChart data={MACRO_DATA.glsSupply} average={MACRO_DATA.glsTenYearAverage} />
            </NlCard>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MACRO_DATA.signals.map((signal) => (
              <MacroSignalCard key={signal.name} signal={signal} />
            ))}
          </div>
        </section>

        <section id="verdicts" className="space-y-4">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-nl-heading)", color: "#16181B" }}>
            Top picks
          </h2>
          {topPicks.length === 0 ? (
            <NlCard>
              <p style={{ color: "#3E4248" }}>
                [No verdicts published yet — projects below are still under review]
              </p>
              <Link href="/new-launch/demo-project" className="mt-3 inline-block text-sm underline-offset-4 hover:underline" style={{ color: "#1F3A5F" }}>
                View a sample verdict page
              </Link>
            </NlCard>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topPicks.slice(0, 3).map((project) => (
                <Link key={project.slug} href={`/new-launch/${project.slug}`}>
                  <NlCard>
                    <div className="flex items-center justify-between">
                      <VerdictBadge verdict={project.verdict} />
                      <span style={{ fontFamily: "var(--font-nl-mono)", color: "#16181B" }}>
                        {project.score ?? "[--]"}/100
                      </span>
                    </div>
                    <p className="mt-3 font-medium" style={{ color: "#16181B" }}>{project.name}</p>
                  </NlCard>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="pipeline" className="space-y-4">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-nl-heading)", color: "#16181B" }}>
            Launch pipeline
          </h2>
          <PipelineTable rows={PIPELINE_ROWS} />
          <p className="text-xs" style={{ color: "#585C63" }}>
            Timings are from developer and media reports and change often. Treat every date here as
            provisional until confirmed at launch.
          </p>
        </section>

        <section id="versus" className="space-y-4">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-nl-heading)", color: "#16181B" }}>
            When a new launch beats resale, and when it does not
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <NlCard>
              <p className="mb-3 font-medium" style={{ color: "#1E5B45" }}>A new launch tends to win when</p>
              <ul className="space-y-2 text-sm" style={{ color: "#3E4248" }}>
                <li>The launch premium over comparable resale is under {NEW_LAUNCH_PREMIUM_GOOD_THRESHOLD_PERCENT}%.</li>
                <li>A firm catalyst (new MRT line, hub, Master Plan item) lands before your exit year.</li>
                <li>Competing supply within 2km is limited.</li>
                <li>You can hold through to TOP without needing the capital sooner.</li>
                <li>The developer is pricing close to breakeven, ahead of an ABSD deadline.</li>
              </ul>
            </NlCard>
            <NlCard>
              <p className="mb-3 font-medium" style={{ color: "#9B3426" }}>Resale tends to win when</p>
              <ul className="space-y-2 text-sm" style={{ color: "#3E4248" }}>
                <li>The launch premium over comparable resale is over {NEW_LAUNCH_PREMIUM_BAD_THRESHOLD_PERCENT}%.</li>
                <li>You need to move in soon and cannot wait for TOP.</li>
                <li>Nearby competing supply is heavy.</li>
                <li>You want a proven, established neighbourhood.</li>
                <li>Your budget is tight after cash and loan needed before keys.</li>
              </ul>
            </NlCard>
          </div>
        </section>
      </main>

      <NlFooter sources={["URA 2Q 2026 real estate statistics"]} />
    </div>
  );
}
