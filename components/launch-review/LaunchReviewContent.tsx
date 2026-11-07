import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { YoutubeEmbed } from "@/components/ui/YoutubeEmbed";
import { leadSlug, type LaunchEntry } from "@/lib/data/launches";
import type { MeasuredDistance, SourceRef, SourcedValue } from "@/lib/data/launches/types";
import { youtubeId } from "@/lib/playbook/embed";
import { LaunchComplianceFooter } from "./LaunchComplianceFooter";
import { PaidDisclosure } from "./PaidDisclosure";
import { VerdictCta } from "./VerdictCta";
import {
  HEIGHT_METHOD,
  INDICATIVE_LABEL,
  WALKING_METHOD,
  formatIsoDate,
  independenceDisclaimer,
} from "./copy";
import { buildSourceList, measuredSources, type SourceList } from "./sources";
import { stillImageFor } from "./still";
import { SiteStudyLoader } from "./viewer/SiteStudyLoader";

/**
 * Server component. Every fact, table and FAQ answer is in the server-rendered HTML, so the
 * page reads fully before (or without) the 3D viewer. Only the viewer and CTA are client code.
 */

const SECTION = "section-padding bg-white border-t border-neutral-200";
const PROSE = "text-md leading-relaxed text-neutral-700";


function Placeholder({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-dashed border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
      [Tong Boon to write: {children}]
    </p>
  );
}

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 text-[10px] font-semibold">
      <a href={`#source-${n}`} className="text-primary-700 hover:underline" aria-label={`Source ${n}`}>
        [{n}]
      </a>
    </sup>
  );
}

function Value({ cell, sources }: { cell: SourcedValue; sources: SourceList }) {
  const muted = cell.value === "TBC" || cell.value === "Not applicable";
  return (
    <span className={muted ? "text-neutral-400" : undefined}>
      {cell.value}
      {cell.source && <Cite n={sources.number(cell.source)} />}
    </span>
  );
}

function SourceNote({ refs, sources, asOf }: { refs: SourceRef[]; sources: SourceList; asOf: string }) {
  return (
    <p className="mt-4 text-xs text-neutral-500">
      Sources:{" "}
      {refs.map((ref) => (
        <Cite key={ref.url ?? ref.label} n={sources.number(ref)} />
      ))}{" "}
      · as of {asOf}
    </p>
  );
}

function SectionHeading({ id, eyebrow, children }: { id: string; eyebrow?: string; children: ReactNode }) {
  return (
    <>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={id} className="section-title !text-left">
        {children}
      </h2>
    </>
  );
}

function formatDistance(d: MeasuredDistance) {
  const walk = d.walkM ? `, ${d.walkM.toLocaleString("en-SG")} m walk (about ${d.walkMin} min)` : "";
  return `${d.straightM.toLocaleString("en-SG")} m straight line${walk}`;
}

export function LaunchReviewContent({ entry }: { entry: LaunchEntry }) {
  const { review, measured, missing } = entry;
  const sources = buildSourceList(review, measured);
  const ms = measured ? measuredSources(measured) : null;
  const measuredAsOf = measured ? formatIsoDate(measured.generatedAt) : "";
  const videoId = review.youtubeUrl ? youtubeId(review.youtubeUrl) : "";
  const whatsAppHref = `/go/whatsapp?slug=${leadSlug(review.slug)}&ref=${review.verdict.whatsappRef}`;

  const units = review.keyFacts.find((f) => f.label === "Stated scheme")?.fact.value;

  return (
    <>
      {missing.length > 0 && (
        <div className="border-b border-red-200 bg-red-50">
          <div className="container-page py-3 text-sm text-red-800">
            <strong>Draft, not for publication.</strong> Hidden in production until these are done:{" "}
            {missing.join("; ")}.
          </div>
        </div>
      )}

      {/* 1. Hero */}
      <section aria-labelledby="review-title" className="section-padding bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
              <Link href="/new-launch" className="hover:text-primary-700 hover:underline">
                New Launch Reviews
              </Link>{" "}
              / {review.name}
            </nav>
            <Eyebrow>Independent review · {review.propertyType}</Eyebrow>
            <h1 id="review-title" className="section-title !text-left">
              {review.seo.h1}
            </h1>
            <div className="mt-6">
              {review.summary ? (
                <p className={PROSE}>{review.summary}</p>
              ) : (
                <Placeholder>one-line summary</Placeholder>
              )}
            </div>
            <dl className="mt-8 grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:grid-cols-2">
              {[
                ["Location", `${review.street}, ${review.area} (${review.district})`],
                ["Developer", review.developer],
                ["Tenure", review.tenure],
                ["Estimated units", units ?? "TBC"],
                ["Status", review.timingLabel],
                ["Last updated", formatIsoDate(review.dateModified)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-neutral-900">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-neutral-600">
              HomeUP is not part of this project&apos;s sales team. This review compares {review.name} with the
              alternatives a buyer is really weighing, including resale and staying in your HDB, and says who should
              skip it.
            </p>
          </div>
        </div>
      </section>

      {/* Key facts */}
      <section aria-labelledby="key-facts" className={SECTION}>
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="key-facts" eyebrow="Facts">
              Key facts about {review.name}
            </SectionHeading>
            <table className="mt-6 w-full text-left text-sm">
              <tbody className="divide-y divide-neutral-200">
                {review.keyFacts.map((fact) => (
                  <tr key={fact.label} className="align-top">
                    <th scope="row" className="w-2/5 py-3 pr-4 font-semibold text-neutral-900">
                      {fact.label}
                    </th>
                    <td className="py-3 text-neutral-700">
                      <Value cell={fact.fact} sources={sources} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-neutral-500">
              Facts checked against tender results:{" "}
              {review.lastVerified ? formatIsoDate(review.lastVerified) : "not yet"}.
            </p>
          </div>
        </div>
      </section>

      {/* 2 and 3. Site study and sun path */}
      <section aria-labelledby="site-study" className={SECTION}>
        <div className="container-page">
          <div className="mx-auto max-w-5xl">
            <SectionHeading id="site-study" eyebrow="3D site context">
              Site study and sun path
            </SectionHeading>
            <p className={`mt-4 max-w-3xl ${PROSE}`}>
              The model shows the plot boundary and the buildings within {review.site.contextRadiusM} m. No towers are
              drawn: the site plan has not been released. The dashed line marks the stated maximum height for
              reference only, not where a tower will stand.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
              <SiteStudyLoader
                slug={review.slug}
                name={review.name}
                contextUrl={`/launch-data/${review.slug}/context.geojson`}
                stillImage={stillImageFor(review.slug)}
                indicativeLabel={INDICATIVE_LABEL}
              />
              <div>
                <h3 id="sun-path" className="text-lg font-bold text-neutral-900">
                  Sun-path study
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  Singapore is close to the equator, so the sun rises in the east and sets in the west all year, and
                  passes almost overhead at about 1pm. From March to September it sits slightly to the north at
                  midday; from September to March, slightly to the south. Use the date buttons and time slider to see
                  which sides of the plot catch the morning sun, the afternoon sun, and shade from neighbouring blocks.
                </p>
                <div className="mt-4">
                  {review.sunStudy ? (
                    <p className="text-sm leading-relaxed text-neutral-700">{review.sunStudy}</p>
                  ) : (
                    <Placeholder>which sides catch morning sun, afternoon sun and shade, after viewing the model</Placeholder>
                  )}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                  {HEIGHT_METHOD} Sun positions are calculated for the plot&apos;s location in Singapore time.
                  {measured &&
                    ` Of ${measured.buildings.total} buildings modelled, ${measured.buildings.hdbMatched} use HDB storey counts, ${measured.buildings.osmHeight} use OpenStreetMap heights and ${measured.buildings.estimated} are estimated.`}
                </p>
                {ms && (
                  <SourceNote refs={[ms.masterPlan, ms.osm, ms.hdb]} sources={sources} asOf={measuredAsOf} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Location facts */}
      {measured && ms && (
        <section aria-labelledby="location" className={SECTION}>
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              <SectionHeading id="location" eyebrow="Measured, not marketed">
                Location facts
              </SectionHeading>
              <p className="mt-4 text-sm text-neutral-600">
                Measured from the plot centre (URA Master Plan 2019 boundary). Straight-line distances are as the
                crow flies. {WALKING_METHOD}
              </p>
              <dl className="mt-6 divide-y divide-neutral-200 text-sm">
                <div className="py-4">
                  <dt className="font-semibold text-neutral-900">Nearest MRT/LRT</dt>
                  {measured.rail.map((r) => (
                    <dd key={r.name} className="mt-1 text-neutral-700">
                      {r.name}: {formatDistance(r)}
                    </dd>
                  ))}
                </div>
                <div className="py-4">
                  <dt className="font-semibold text-neutral-900">Nearest expressways</dt>
                  {measured.expressways.map((e) => (
                    <dd key={e.name} className="mt-1 text-neutral-700">
                      {e.name}: {e.straightM.toLocaleString("en-SG")} m straight line
                    </dd>
                  ))}
                </div>
                <div className="py-4">
                  <dt className="font-semibold text-neutral-900">Primary schools within 1 km</dt>
                  {measured.schoolsWithin1km.length === 0 && <dd className="mt-1 text-neutral-500">None</dd>}
                  {measured.schoolsWithin1km.map((s) => (
                    <dd key={s.name} className="mt-1 text-neutral-700">
                      {s.name}: {s.straightM.toLocaleString("en-SG")} m
                    </dd>
                  ))}
                </div>
                <div className="py-4">
                  <dt className="font-semibold text-neutral-900">Primary schools 1 to 2 km away</dt>
                  {measured.schools1to2km.map((s) => (
                    <dd key={s.name} className="mt-1 text-neutral-700">
                      {s.name}: {s.straightM.toLocaleString("en-SG")} m
                    </dd>
                  ))}
                </div>
                <div className="py-4">
                  <dt className="font-semibold text-neutral-900">Nearest malls</dt>
                  {measured.malls.map((m) => (
                    <dd key={m.name} className="mt-1 text-neutral-700">
                      {m.name}: {formatDistance(m)}
                    </dd>
                  ))}
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                School distances are straight lines from the plot centre to the school&apos;s address point. They are
                not the measurement MOE uses for Primary 1 registration, which depends on the exact home address and
                school boundary. Check a specific address with OneMap&apos;s school query.
              </p>
              <SourceNote refs={[ms.osm, ms.footRouter, ms.moe, ms.oneMap]} sources={sources} asOf={measuredAsOf} />
            </div>
          </div>
        </section>
      )}

      {/* 5. Land price */}
      <section aria-labelledby="land-price" className={SECTION}>
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="land-price" eyebrow="Land cost">
              Land price and what it means
            </SectionHeading>
            <p className={`mt-4 ${PROSE}`}>
              Land rate is quoted in Singapore dollars per square foot of plot ratio (psf ppr): the price paid for
              each square foot of floor area the site is allowed to build. It is the developer&apos;s biggest cost, so
              it sets a floor under launch prices.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th scope="col" className="px-3 py-3 sm:px-4">
                      EC site
                    </th>
                    <th scope="col" className="px-3 py-3 sm:px-4">
                      Land rate
                    </th>
                    <th scope="col" className="px-3 py-3 sm:px-4">
                      Tender
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {review.landRates.map((rate) => (
                    <tr key={rate.name} className={rate.isSubject ? "bg-primary-50" : undefined}>
                      <th scope="row" className="px-3 py-3 sm:px-4 font-semibold text-neutral-900">
                        {rate.name}
                        <span className="block text-xs font-normal text-neutral-500">{rate.location}</span>
                        {rate.note && <span className="block text-xs font-normal text-neutral-500">{rate.note}</span>}
                      </th>
                      <td className="px-3 py-3 sm:px-4 text-neutral-700">
                        {rate.psfPpr === "TBC" ? "TBC" : `S$${rate.psfPpr} psf ppr`}
                        <Cite n={sources.number(rate.source)} />
                      </td>
                      <td className="px-3 py-3 sm:px-4 text-neutral-700">{rate.tenderDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-neutral-500">As of {review.landRatesAsOf}.</p>
            <div className="mt-6">
              {review.landAnalysis ? (
                <p className={PROSE}>{review.landAnalysis}</p>
              ) : (
                <Placeholder>what the land rate means for likely pricing</Placeholder>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Comparisons */}
      <section aria-labelledby="comparison" className={SECTION}>
        <div className="container-page">
          <div className="mx-auto max-w-5xl">
            <SectionHeading id="comparison" eyebrow="The core question">
              {review.name} compared with the alternatives
            </SectionHeading>
            {review.comparison.note && <p className={`mt-4 max-w-3xl ${PROSE}`}>{review.comparison.note}</p>}
            <p className="mt-6 text-xs text-neutral-500 md:hidden">Swipe the table sideways to see every option.</p>
            <div className="mt-2 overflow-x-auto rounded-2xl border border-neutral-200 md:mt-6">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="sticky left-0 bg-neutral-50 px-4 py-3">
                      <span className="sr-only">Measure</span>
                    </th>
                    {review.comparison.columns.map((column) => (
                      <th key={column.key} scope="col" className="px-4 py-3 align-bottom">
                        <span className="block font-bold text-neutral-900">{column.name}</span>
                        <span className="block text-xs font-normal text-neutral-500">{column.kind}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {review.comparison.rows.map((row) => (
                    <tr key={row.label} className="align-top">
                      <th scope="row" className="sticky left-0 bg-white px-4 py-3 font-semibold text-neutral-900">
                        {row.label}
                      </th>
                      {review.comparison.columns.map((column) => {
                        const measuredRail =
                          row.fillFrom === "nearestRail" && ms ? measured?.comparisonNearestRail[column.key] : undefined;
                        const cell: SourcedValue =
                          measuredRail && ms
                            ? { value: `${measuredRail.name}, ${measuredRail.straightM} m`, source: ms.osm }
                            : (row.cells[column.key] ?? { value: "TBC" });
                        return (
                          <td key={column.key} className="px-4 py-3 text-neutral-700">
                            <Value cell={cell} sources={sources} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Every cell is sourced or marked TBC. Prices are added at preview, for comparison only. As of{" "}
              {formatIsoDate(review.dateModified)}.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Pros, cons, who should skip */}
      <section aria-labelledby="pros-cons" className={SECTION}>
        <div className="container-page">
          <div className="mx-auto max-w-5xl">
            <SectionHeading id="pros-cons" eyebrow="Honest assessment">
              Pros, cons, and who should skip this
            </SectionHeading>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {(
                [
                  ["Pros", review.pros, "pros, 3 to 5 points"],
                  ["Cons", review.cons, "cons, 3 to 5 points"],
                  ["Who should skip this", review.whoShouldSkip, "who should skip this project"],
                ] as const
              ).map(([title, items, placeholder]) => (
                <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-6">
                  <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
                  {items.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-700">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3">
                      <Placeholder>{placeholder}</Placeholder>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Verdict (gated) */}
      <section aria-labelledby="verdict" className="section-padding border-t border-neutral-200 bg-neutral-50">
        <div className="container-page">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
            <div>
              <SectionHeading id="verdict" eyebrow="HomeUP Verdict">
                Get our independent verdict and a comparison for your budget
              </SectionHeading>
              <p className={`mt-4 ${PROSE}`}>{review.verdict.teaser}</p>
              <div className="mt-6">
                <VerdictCta slug={review.slug} href={whatsAppHref} />
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                Opens WhatsApp with a short message to HomeUP (Ref: {review.verdict.whatsappRef}). No obligation.
              </p>
            </div>
            <PaidDisclosure />
          </div>
        </div>
      </section>

      {/* 9. Video */}
      {videoId && (
        <section aria-labelledby="video" className={SECTION}>
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              <SectionHeading id="video" eyebrow="Watch">
                {review.name} review video
              </SectionHeading>
              <div className="mt-6 aspect-video overflow-hidden rounded-2xl">
                <YoutubeEmbed videoId={videoId} title={`${review.name} review by HomeUP`} className="h-full w-full" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 10. FAQ: native details so every answer is in the HTML */}
      <section aria-labelledby="faq" className={SECTION}>
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="faq" eyebrow="Common questions">
              {review.name} FAQ
            </SectionHeading>
            <div className="mt-6 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
              {faqItems(entry).map((item) => (
                <details key={item.q} className="group px-6 py-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-900 marker:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {item.q}
                      <span aria-hidden="true" className="text-primary-600 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="speakable-faq-answer mt-3 text-sm leading-relaxed text-neutral-600">{item.a}</p>
                </details>
              ))}
            </div>

            {review.relatedGuides.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-bold text-neutral-900">Related Playbook guides</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {review.relatedGuides.map((guide) => (
                    <li key={guide.slug}>
                      <Link
                        href={`/playbook/${guide.slug}`}
                        className="font-semibold text-primary-700 underline-offset-2 hover:underline"
                      >
                        {guide.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 11. Disclaimer, sources, CEA footer */}
      <section aria-labelledby="sources" className={SECTION}>
        <div className="container-page">
          <div className="mx-auto max-w-3xl space-y-6">
            <SectionHeading id="sources">Sources and disclaimer</SectionHeading>
            <p className="text-sm leading-relaxed text-neutral-700">{independenceDisclaimer(review.developer)}</p>
            <ol className="space-y-2 text-sm text-neutral-700">
              {sources.items.map((source, i) => (
                <li key={source.url ?? source.label} id={`source-${i + 1}`} className="scroll-mt-24">
                  <span className="font-semibold">[{i + 1}]</span>{" "}
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-700 underline-offset-2 hover:underline"
                    >
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                  <span className="text-neutral-500"> · as of {source.asOf}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs leading-relaxed text-neutral-500">
              Map and building data © OpenStreetMap contributors, available under the Open Database Licence (ODbL).
              Contains information from the URA Master Plan 2019 Land Use layer, HDB Property Information and MOE
              General information of schools, accessed from data.gov.sg and made available under the terms of the
              Singapore Open Data Licence version 1.0. School locations from SLA OneMap.
            </p>
            <LaunchComplianceFooter />
            <p className="text-sm">
              <Link href="/new-launch" className="font-semibold text-primary-700 hover:underline">
                ← All new launch and EC reviews
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/** Data-file FAQ plus one measured answer, shared by the page and its FAQPage schema. */
export function faqItems(entry: LaunchEntry) {
  const { review, measured } = entry;
  const nearest = measured?.rail[0];
  const measuredItem = nearest
    ? [
        {
          q: `How far is ${review.name} from the nearest MRT or LRT station?`,
          a: `Measured from the plot centre, ${nearest.name} is about ${nearest.straightM} m away in a straight line${
            nearest.walkM ? `, or about ${nearest.walkM} m (around ${nearest.walkMin} minutes) on foot` : ""
          }. Actual walking routes may differ slightly once the site's gates are known.`,
        },
      ]
    : [];
  return [...review.faq.slice(0, 2), ...measuredItem, ...review.faq.slice(2)];
}

