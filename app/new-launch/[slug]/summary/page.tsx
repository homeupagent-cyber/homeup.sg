import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerdictBadge } from "@/components/new-launch/VerdictBadge";
import { NlCard } from "@/components/new-launch/NlCard";
import { pricePremium } from "@/components/new-launch/PricePositioningChart";
import { getProjectBySlug } from "@/lib/new-launch/projects";
import { MACRO_DATA } from "@/lib/new-launch/macro";
import { formatOrPlaceholder, formatPercent } from "@/lib/new-launch/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { CEA_LICENSE, LEGAL_NAME } from "@/lib/seo/constants";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);
  return { title: project ? `${project.name} summary | New Launch Desk` : "New Launch Desk" };
}

function versusRow(rows: { label: string; newLaunch: string | null; resale: string | null }[], label: string) {
  return rows.find((r) => r.label === label) ?? { newLaunch: null, resale: null };
}

export default function NewLaunchSummaryPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  const midPsf =
    project.pricing.thisProjectPsfLow != null && project.pricing.thisProjectPsfHigh != null
      ? (project.pricing.thisProjectPsfLow + project.pricing.thisProjectPsfHigh) / 2
      : null;
  const premium = pricePremium(midPsf, project.pricing.resale5to10yrPsf);

  const priceRow = versusRow(project.versus.rows, "Price and psf");
  const sizeRow = versusRow(project.versus.rows, "Unit and size");
  const moveInRow = versusRow(project.versus.rows, "Rent or stay before TOP");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3EE" }}>
      <div className="mx-auto max-w-sm space-y-5 px-5 py-8">
        <div className="flex items-center justify-between">
          <VerdictBadge verdict={project.verdict} />
          <span className="text-2xl" style={{ fontFamily: "var(--font-nl-mono)", color: "#16181B" }}>
            {project.score ?? "[--]"}/100
          </span>
        </div>

        <h1 className="text-2xl leading-snug" style={{ fontFamily: "var(--font-nl-heading)", color: "#16181B" }}>
          {project.name}
        </h1>
        <p className="text-sm" style={{ color: "#3E4248" }}>{project.thesis}</p>

        <NlCard>
          <p className="mb-2 text-sm font-medium" style={{ color: "#1E5B45" }}>Why it works</p>
          <ul className="space-y-1.5 text-sm" style={{ color: "#3E4248" }}>
            {(project.catalysts.length > 0 ? project.catalysts.slice(0, 3) : ["[Pending review]"]).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </NlCard>

        <NlCard>
          <p className="mb-2 text-sm font-medium" style={{ color: "#9B3426" }}>Watch out for</p>
          <ul className="space-y-1.5 text-sm" style={{ color: "#3E4248" }}>
            {(project.risks.length > 0 ? project.risks.slice(0, 3) : ["[Pending review]"]).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </NlCard>

        <NlCard>
          <p className="mb-3 text-sm font-medium" style={{ color: "#16181B" }}>New launch vs resale</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt style={{ color: "#585C63" }}>Price psf</dt>
              <dd style={{ color: "#16181B", textAlign: "right" }}>
                {formatOrPlaceholder(priceRow.newLaunch)} vs {formatOrPlaceholder(priceRow.resale)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: "#585C63" }}>Size</dt>
              <dd style={{ color: "#16181B", textAlign: "right" }}>
                {formatOrPlaceholder(sizeRow.newLaunch)} vs {formatOrPlaceholder(sizeRow.resale)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: "#585C63" }}>Move in</dt>
              <dd style={{ color: "#16181B", textAlign: "right" }}>
                {formatOrPlaceholder(moveInRow.newLaunch)} vs {formatOrPlaceholder(moveInRow.resale)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt style={{ color: "#585C63" }}>Premium</dt>
              <dd style={{ color: "#16181B" }}>{formatPercent(premium)}</dd>
            </div>
          </dl>
        </NlCard>

        <p className="text-xs" style={{ color: "#585C63" }}>
          Market backdrop: {MACRO_DATA.houseView} ({MACRO_DATA.houseViewAsOf})
        </p>

        <a
          href={buildWhatsAppUrl(`Hi, I'd like to discuss ${project.name} on the New Launch Desk.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="block min-h-[44px] rounded-md px-5 py-3 text-center text-sm font-medium text-white"
          style={{ backgroundColor: "#1E5B45" }}
        >
          WhatsApp your advisor
        </a>
        <Link
          href={`/new-launch/${project.slug}`}
          className="block min-h-[44px] rounded-md border px-5 py-3 text-center text-sm font-medium"
          style={{ borderColor: "#DEDAD1", color: "#16181B" }}
        >
          View full analysis
        </Link>

        <p className="text-xs" style={{ color: "#585C63" }}>
          This page is for discussion with your HomeUP advisor and is not financial advice.
          {" "}
          {LEGAL_NAME}, CEA licence {CEA_LICENSE}.
        </p>
      </div>
    </div>
  );
}
