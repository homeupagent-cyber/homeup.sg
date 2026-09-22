import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import {
  BarChart3,
  Check,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ListingPlatformIcons } from "@/components/ui/ListingPlatformIcons";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import {
  ADVANTAGES,
  COMPARISON_ROWS,
  HEADLINE_STATS,
  WHY_HOMEUP_INTRO,
  WHY_HOMEUP_META,
  WHY_HOMEUP_PROOF_LINE,
  type Advantage,
  type ComparisonRow,
} from "@/lib/data/why-homeup";
import { whatsAppUrlFor } from "@/lib/whatsapp";

/**
 * Server component by design, like TrackRecordContent and PressContent. Every advantage,
 * comparison row and claim must be in the server-rendered HTML, so no client hooks, no
 * motion wrappers and no collapsible panels.
 */

const SECTION_RULE = "border-t border-neutral-200";
const PROSE = "text-base leading-relaxed text-neutral-700";
const INLINE_LINK =
  "font-medium text-primary-600 underline underline-offset-2 transition-colors hover:text-primary-700";

const WHATSAPP = whatsAppUrlFor("whyHomeup");

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const ADVANTAGE_ICONS: Record<Advantage["slug"], Icon> = {
  "seller-portal": LayoutDashboard,
  exposure: Megaphone,
  pricing: BarChart3,
  response: MessageCircle,
};

/**
 * Renders `**key phrase**` markers from the data file as an underline-marker: a band of
 * brand green under the lower part of the phrase, so it reads as highlighted without
 * introducing a second accent colour. The band colour changes with the panel behind it;
 * `strong` is plain bold for inside the green table cells.
 */
type EmphasisTone = "marker" | "marker-on-dark" | "marker-on-brand" | "strong";

const MARKER_BASE = "px-0.5 font-semibold box-decoration-clone";

const EMPHASIS_CLASS: Record<EmphasisTone, string> = {
  marker: `${MARKER_BASE} text-neutral-900 bg-[linear-gradient(transparent_58%,theme(colors.primary.200)_58%)]`,
  "marker-on-dark": `${MARKER_BASE} text-white bg-[linear-gradient(transparent_58%,theme(colors.primary.600)_58%)]`,
  "marker-on-brand": `${MARKER_BASE} text-white bg-[linear-gradient(transparent_58%,theme(colors.primary.800)_58%)]`,
  strong: "font-bold text-primary-800",
};

function Emphasis({ text, tone = "marker" }: { text: string; tone?: EmphasisTone }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className={EMPHASIS_CLASS[tone]}>
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative flex h-2.5 w-2.5 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75 motion-reduce:animate-none" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" />
    </span>
  );
}

/** Static, illustrative sketch of the seller portal. Figures are examples, not a live listing. */
function PortalSketch() {
  const themes = [
    { label: "Price concern", count: 4 },
    { label: "Still deciding", count: 6 },
    { label: "No reply", count: 2 },
  ];
  return (
    <figure className="w-full">
      <div
        aria-hidden="true"
        className="rounded-xl bg-white p-4 text-neutral-900 shadow-xl ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Your listing
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
            <LiveDot className="h-2 w-2" />
            Live
          </span>
        </div>

        <dl className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-neutral-50 p-2.5">
            <dt className="text-[11px] leading-tight text-neutral-500">Viewings booked</dt>
            <dd className="mt-0.5 font-display text-xl font-bold">14</dd>
          </div>
          <div className="rounded-lg bg-neutral-50 p-2.5">
            <dt className="text-[11px] leading-tight text-neutral-500">This week</dt>
            <dd className="mt-0.5 font-display text-xl font-bold">5</dd>
          </div>
          <div className="rounded-lg bg-primary-50 p-2.5">
            <dt className="text-[11px] leading-tight text-primary-700">Viewing health</dt>
            <dd className="mt-0.5 font-display text-xl font-bold text-primary-700">82</dd>
          </div>
        </dl>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span>Viewing health</span>
            <span className="font-semibold text-primary-700">82 / 100</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-neutral-100">
            <div className="h-2 w-[82%] rounded-full bg-primary-600" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[11px] text-neutral-500">Buyer feedback themes</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {themes.map((theme) => (
              <li
                key={theme.label}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-800"
              >
                {theme.label}
                <span className="font-semibold text-neutral-500">{theme.count}</span>
              </li>
            ))}
            <li className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              + more
            </li>
          </ul>
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-neutral-400">
        Illustration of the seller portal. Figures are examples, not a live listing.
      </figcaption>
    </figure>
  );
}

function FeaturedAdvantage({ advantage }: { advantage: Advantage }) {
  const IconComponent = ADVANTAGE_ICONS[advantage.slug] ?? LayoutDashboard;
  return (
    <article
      id={advantage.slug}
      className="scroll-mt-28 rounded-2xl bg-neutral-900 p-6 text-white shadow-xl sm:p-8"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <LiveDot className="h-2 w-2" />
              Our biggest difference
            </span>
            <span className="font-mono text-sm font-semibold tracking-wider text-neutral-500">
              {advantage.number}
            </span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
              <IconComponent className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {advantage.title}
            </h3>
          </div>
          <p className="speakable-advantage mt-4 text-base leading-relaxed text-neutral-300">
            <Emphasis text={advantage.body} tone="marker-on-dark" />
          </p>
        </div>
        <PortalSketch />
      </div>
    </article>
  );
}

function AdvantageCard({ advantage }: { advantage: Advantage }) {
  const IconComponent = ADVANTAGE_ICONS[advantage.slug] ?? LayoutDashboard;
  return (
    <article
      id={advantage.slug}
      className="flex scroll-mt-28 flex-col rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="font-mono text-sm font-semibold tracking-wider text-neutral-400">
          {advantage.number}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-neutral-900">{advantage.title}</h3>
      <p className="speakable-advantage mt-2 text-sm leading-relaxed text-neutral-700">
        <Emphasis text={advantage.body} />
      </p>
    </article>
  );
}

function FeaturedTag() {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-800">
      Biggest difference
    </span>
  );
}

function HomeUpCell({ row }: { row: ComparisonRow }) {
  return (
    <span className="flex items-start gap-2">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
        <Check className="h-2.5 w-2.5" aria-hidden="true" strokeWidth={3} />
      </span>
      <span>
        <Emphasis text={row.homeup} tone="strong" />
      </span>
    </span>
  );
}

export function WhyHomeUpContent() {
  const featured = ADVANTAGES.find((advantage) => advantage.featured) ?? ADVANTAGES[0];
  const others = ADVANTAGES.filter((advantage) => advantage !== featured);

  return (
    <>
      <section aria-label="Why sellers choose HomeUP" className="section-padding bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Why sellers choose HomeUP</Eyebrow>
            <h1 className="section-title !text-left">HomeUP vs Other Agents</h1>
            <p className={`mt-6 ${PROSE}`}>
              <Emphasis text={WHY_HOMEUP_INTRO} />
            </p>

            {/* Three tiles: side by side from `sm`; on phones the featured tile goes full width. */}
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {HEADLINE_STATS.map((stat) =>
                stat.featured ? (
                  <div
                    key={stat.label}
                    className="col-span-2 rounded-2xl bg-primary-600 p-5 text-white shadow-brand-md sm:col-span-1"
                  >
                    <dd className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight">
                      {stat.value}
                      <LiveDot />
                    </dd>
                    <dt className="mt-1 text-sm font-medium leading-snug text-primary-50">
                      {stat.label}
                    </dt>
                  </div>
                ) : (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <dd className="font-display text-3xl font-bold tracking-tight text-primary-700">
                      {stat.value}
                    </dd>
                    <dt className="mt-1 text-sm leading-snug text-neutral-600">{stat.label}</dt>
                    {stat.platformIcons && (
                      <dd className="mt-2.5">
                        {/* Two rows of four on phones (portals, then social), one row from sm. */}
                        <ListingPlatformIcons className="grid w-fit grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:items-center" />
                      </dd>
                    )}
                  </div>
                ),
              )}
            </dl>
          </div>
        </div>
      </section>

      <section
        id="advantages"
        aria-label="Our four unique advantages"
        className={`section-padding bg-neutral-50 ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Section 01</Eyebrow>
            <h2 className="section-title !text-left">Our 4 unique advantages</h2>
            <p className={`mt-4 ${PROSE}`}>
              These are the four things a HomeUP seller gets that a traditional listing does
              not. Each one is built into how we work, not an add-on.
            </p>

            <div className="mt-8">
              <FeaturedAdvantage advantage={featured} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {others.map((advantage) => (
                <AdvantageCard key={advantage.slug} advantage={advantage} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="comparison"
        aria-label="Side-by-side comparison"
        className={`section-padding bg-white ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Section 02</Eyebrow>
            <h2 className="section-title !text-left">Side-by-side comparison</h2>
            <p className={`mt-4 ${PROSE}`}>
              Line by line, here is what changes between a traditional agent and HomeUP.
            </p>

            {/* Phone: one card per row so the HomeUP column is never off-screen. `grid` rather than
                `flex` because the inline critical CSS re-declares `.flex` after the Tailwind bundle
                and would override `sm:hidden`. */}
            <ul className="mt-8 grid gap-3 sm:hidden">
              {COMPARISON_ROWS.map((row) => (
                <li
                  key={row.label}
                  className={`overflow-hidden rounded-2xl border bg-white ${
                    row.featured ? "border-primary-600 ring-1 ring-primary-600" : "border-neutral-200"
                  }`}
                >
                  <p className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900">
                    {row.label}
                    {row.featured && <FeaturedTag />}
                  </p>
                  <dl>
                    <div className="px-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Traditional agent
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-neutral-700">
                        {row.traditional}
                      </dd>
                    </div>
                    <div className="bg-primary-50 px-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                        HomeUP
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-primary-700">
                        <HomeUpCell row={row} />
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            {/* Tablet and up: the side-by-side table from the one-pager. */}
            <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm [-webkit-overflow-scrolling:touch] sm:block">
              <table className="comparison-table min-w-[560px]">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Area</span>
                    </th>
                    <th scope="col">Traditional agent</th>
                    <th className="highlight" scope="col">
                      HomeUP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="whitespace-nowrap align-top">
                        {row.label}
                        {row.featured && (
                          <span className="mt-1.5 block">
                            <FeaturedTag />
                          </span>
                        )}
                      </th>
                      <td>{row.traditional}</td>
                      <td className="highlight">
                        <HomeUpCell row={row} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              The full fixed-fee schedule by property type is on the{" "}
              <Link href="/sell" className={INLINE_LINK}>
                sell page
              </Link>
              . Fees are before GST.
            </p>
          </div>
        </div>
      </section>

      <section
        id="proof"
        aria-label="Track record and next steps"
        className={`section-padding bg-neutral-50 ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-primary-600 p-8 text-white shadow-brand-md sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-100">
                HomeUP.sg
              </p>
              <p className="speakable-proof mt-3 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                <Emphasis text={WHY_HOMEUP_PROOF_LINE} tone="marker-on-brand" />
              </p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-primary-50">
                Every ranking we publish is computed from the Council for Estate Agencies&apos;
                own transaction records, with the method and the size of the field shown so you
                can check it yourself.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  WhatsApp us about selling
                </a>
                <Link
                  href="/track-record"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  See the track record
                </Link>
              </div>
            </div>

            <p className={`mt-10 ${PROSE}`}>
              More about how we work is on the{" "}
              <Link href="/about" className={INLINE_LINK}>
                about page
              </Link>
              , and the advisors behind these numbers are on the{" "}
              <Link href="/agents" className={INLINE_LINK}>
                team page
              </Link>
              .
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              Last updated {WHY_HOMEUP_META.lastUpdated}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
