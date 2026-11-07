import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NlHeader } from "@/components/new-launch/NlHeader";
import { NlFooter } from "@/components/new-launch/NlFooter";
import { NlCard } from "@/components/new-launch/NlCard";
import { VerdictScoreSection } from "@/components/new-launch/VerdictScoreSection";
import { PricePositioningChart, pricePremium } from "@/components/new-launch/PricePositioningChart";
import { BreakevenPanel } from "@/components/new-launch/BreakevenPanel";
import { VersusTable } from "@/components/new-launch/VersusTable";
import { DistrictTrendChart } from "@/components/new-launch/DistrictTrendChart";
import { ExitTestPanel } from "@/components/new-launch/ExitTestPanel";
import { ListCard } from "@/components/new-launch/ListCard";
import { getProjectBySlug } from "@/lib/new-launch/projects";
import { formatOrPlaceholder, formatPercent } from "@/lib/new-launch/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);
  return { title: project ? `${project.name} | New Launch Desk` : "New Launch Desk" };
}

export default function NewLaunchProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  const midPsf =
    project.pricing.thisProjectPsfLow != null && project.pricing.thisProjectPsfHigh != null
      ? (project.pricing.thisProjectPsfLow + project.pricing.thisProjectPsfHigh) / 2
      : null;
  const premiumVsResale = pricePremium(midPsf, project.pricing.resale5to10yrPsf);
  const premiumVsRecentLaunches = pricePremium(midPsf, project.pricing.recentLaunchPsf);
  const impliedMargin = pricePremium(midPsf, project.pricing.breakevenPsf);

  const chips = [
    formatOrPlaceholder(project.district, "[District]"),
    project.region,
    formatOrPlaceholder(project.tenure, "[Tenure]"),
    project.totalUnits ? `${project.totalUnits.toLocaleString("en-SG")} units` : "[Units]",
    formatOrPlaceholder(project.developer, "[Developer]"),
    `Preview ${formatOrPlaceholder(project.previewDate, "[Preview date]")}`,
    `TOP ${formatOrPlaceholder(project.expectedTop, "[Expected TOP]")}`,
  ];

  return (
    <div style={{ backgroundColor: "#faf9f5", minHeight: "100vh" }}>
      <NlHeader breadcrumb={{ label: "Launch pipeline", href: "/new-launch#pipeline" }} />

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <section className="space-y-3">
          <h1 className="text-3xl md:text-4xl" style={{ fontFamily: "var(--font-nl-heading)", color: "#1e1812" }}>
            {project.name}
          </h1>
          <div className="flex flex-wrap gap-2 text-xs" style={{ color: "#6b5f52" }}>
            {chips.map((chip, i) => (
              <span key={i} className="rounded-full border px-2.5 py-1" style={{ borderColor: "#e8e3db" }}>
                {chip}
              </span>
            ))}
          </div>
          <p className="max-w-3xl text-base" style={{ color: "#4e4439" }}>{project.thesis}</p>
        </section>

        <VerdictScoreSection project={project} />

        <section className="space-y-3">
          <NlCard>
            <p className="mb-4 font-medium" style={{ color: "#1e1812" }}>Price positioning</p>
            <PricePositioningChart pricing={project.pricing} />
            <dl className="mt-4 grid grid-cols-1 gap-3 border-t pt-4 text-sm sm:grid-cols-3" style={{ borderColor: "#e8e3db" }}>
              <div>
                <dt style={{ color: "#6b5f52" }}>Premium vs 5–10yr resale</dt>
                <dd style={{ fontFamily: "var(--font-nl-mono)", color: "#1e1812" }}>{formatPercent(premiumVsResale)}</dd>
              </div>
              <div>
                <dt style={{ color: "#6b5f52" }}>Premium vs recent launches</dt>
                <dd style={{ fontFamily: "var(--font-nl-mono)", color: "#1e1812" }}>{formatPercent(premiumVsRecentLaunches)}</dd>
              </div>
              <div>
                <dt style={{ color: "#6b5f52" }}>Implied developer margin</dt>
                <dd style={{ fontFamily: "var(--font-nl-mono)", color: "#1e1812" }}>{formatPercent(impliedMargin)}</dd>
              </div>
            </dl>
          </NlCard>
        </section>

        <BreakevenPanel breakeven={project.breakeven} />
        <VersusTable versus={project.versus} />
        <DistrictTrendChart />
        <ExitTestPanel exitTest={project.exitTest} />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ListCard title="Catalysts" items={project.catalysts} />
          <ListCard title="Risks" items={project.risks} />
          <ListCard title="What would change our view" items={project.wouldChangeView} />
        </section>

        <section className="flex flex-wrap gap-3">
          <a
            href={buildWhatsAppUrl(`Hi, I'd like to discuss ${project.name} on the New Launch Desk.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] rounded-md px-5 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: "#009A44" }}
          >
            WhatsApp your advisor
          </a>
          <Link
            href={`/new-launch/${project.slug}/summary`}
            className="flex min-h-[44px] items-center rounded-md border px-5 py-3 text-sm font-medium"
            style={{ borderColor: "#e8e3db", color: "#1e1812" }}
          >
            View client summary
          </Link>
        </section>
      </main>

      <NlFooter />
    </div>
  );
}
