import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { getAgentBySlug } from "@/lib/data/agents";
import {
  getPressFaqs,
  getPressReleases,
  getPublishedPressEntries,
  getUpcomingPressEntries,
  PRESS_ASSETS,
  PRESS_BOILERPLATE,
  PRESS_KIND_LABELS,
  PRESS_META,
  PRESS_PAGE_CITATION,
  PRESS_SPOKESPERSON_NOTES,
  PRESS_SPOKESPERSON_SLUGS,
  type PressEntry,
} from "@/lib/data/press";
import { CEA_LICENSE, CEA_PUBLIC_REGISTER_URL, LEGAL_NAME } from "@/lib/seo/constants";
import { whatsAppUrlFor } from "@/lib/whatsapp";

/**
 * Server component by design, like TrackRecordContent. Every headline, date, citable
 * statement and FAQ answer must be in the server-rendered HTML so a journalist or an
 * answer engine can read it without JavaScript.
 */

const SECTION_RULE = "border-t border-neutral-200";
const PROSE = "text-base leading-relaxed text-neutral-700";
const INLINE_LINK =
  "font-medium text-primary-600 underline underline-offset-2 transition-colors hover:text-primary-700";
const ACTION_LINK =
  "inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700";

const WHATSAPP_PRESS = whatsAppUrlFor("press");

interface TimelineGroup {
  label: string;
  entries: PressEntry[];
}

/** Upcoming coverage leads, then published coverage grouped by year, newest first. */
function buildTimelineGroups(): TimelineGroup[] {
  const groups: TimelineGroup[] = [];
  const upcoming = getUpcomingPressEntries();
  if (upcoming.length > 0) groups.push({ label: "Upcoming", entries: upcoming });

  for (const entry of getPublishedPressEntries()) {
    const year = entry.date.slice(0, 4);
    const current = groups[groups.length - 1];
    if (current && current.label === year) {
      current.entries.push(entry);
    } else {
      groups.push({ label: year, entries: [entry] });
    }
  }
  return groups;
}

/** "16:26" → "16m 26s", "1:02:05" → "1h 2m 5s". */
function formatDuration(duration: string): string {
  const parts = duration.split(":").map(Number);
  if (parts.some(Number.isNaN)) return duration;
  const units = parts.length === 3 ? ["h", "m", "s"] : ["m", "s"];
  return parts.map((value, index) => `${value}${units[index]}`).join(" ");
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function Badge({ children, tone }: { children: ReactNode; tone: "brand" | "muted" }) {
  const toneClass =
    tone === "brand"
      ? "border-primary-200 bg-primary-50 text-primary-700"
      : "border-neutral-200 bg-white text-neutral-600";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${toneClass}`}
    >
      {children}
    </span>
  );
}

function TimelineEntry({ entry }: { entry: PressEntry }) {
  const upcoming = entry.status === "upcoming";
  const people = entry.people.flatMap((slug) => {
    const agent = getAgentBySlug(slug);
    return agent ? [agent] : [];
  });
  const programmeLine = entry.programme
    ? entry.presenters?.length
      ? `${entry.programme}, presented by ${joinNames(entry.presenters)}`
      : entry.programme
    : null;

  return (
    <li id={entry.slug} className="relative scroll-mt-28 pb-10 last:pb-0">
      <span
        aria-hidden="true"
        className={`absolute top-6 h-3 w-3 rounded-full ${
          upcoming
            ? "border-2 border-neutral-300 bg-white"
            : "bg-primary-600 ring-4 ring-primary-100"
        }`}
        style={{ left: "calc(-2rem - 6.5px)" }}
      />
      <article
        className={`rounded-2xl border p-6 ${
          upcoming ? "border-dashed border-neutral-300 bg-neutral-50" : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm font-bold uppercase tracking-wider text-primary-700">
            {entry.outlet}
          </span>
          <span aria-hidden="true" className="hidden text-neutral-300 sm:inline">
            ·
          </span>
          <time dateTime={entry.date} className="text-sm font-semibold text-neutral-900">
            {upcoming ? `Coming ${entry.dateLabel}` : entry.dateLabel}
          </time>
          <Badge tone={upcoming ? "muted" : "brand"}>
            {upcoming ? "Upcoming" : PRESS_KIND_LABELS[entry.kind]}
          </Badge>
          <span className="text-sm text-neutral-500">
            {entry.medium}
            {entry.duration ? ` · ${formatDuration(entry.duration)}` : ""}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-semibold text-neutral-900">{entry.headline}</h3>
        {programmeLine && <p className="mt-1 text-sm text-neutral-600">{programmeLine}</p>}

        {entry.statement && (
          <p className={`speakable-coverage mt-3 font-medium text-neutral-900 leading-relaxed`}>
            {entry.statement}
          </p>
        )}
        <p className={`mt-2 ${PROSE}`}>{entry.summary}</p>

        {(people.length > 0 || entry.url || entry.relatedLinks?.length) && (
          <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {people.length > 0 && (
                <p className="text-neutral-600">
                  Featuring{" "}
                  {people.map((agent, index) => (
                    <span key={agent.slug}>
                      {index > 0 && ", "}
                      <Link href={`/agents/${agent.slug}`} className={INLINE_LINK}>
                        {agent.name}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
              {entry.url && (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ACTION_LINK}
                >
                  {entry.urlLabel ?? `View on ${entry.outlet}`}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
            {entry.relatedLinks?.length ? (
              <p className="text-neutral-600">
                See also:{" "}
                {entry.relatedLinks.map((link, index) => (
                  <span key={link.href}>
                    {index > 0 && ", "}
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={INLINE_LINK}
                    >
                      {link.label}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        )}
      </article>
    </li>
  );
}

export function PressContent() {
  const groups = buildTimelineGroups();
  const releases = getPressReleases();
  const faqs = getPressFaqs();
  const published = getPublishedPressEntries();
  const spokespeople = PRESS_SPOKESPERSON_SLUGS.flatMap((slug) => {
    const agent = getAgentBySlug(slug);
    return agent ? [{ agent, note: PRESS_SPOKESPERSON_NOTES[slug] }] : [];
  });

  return (
    <>
      <section aria-label="Press introduction" className="section-padding bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Press and media</Eyebrow>
            <h1 className="section-title !text-left">HomeUP in the Press</h1>
            <p className={`mt-6 ${PROSE}`}>
              Media coverage of HomeUP and its co-founders, press releases as they are issued,
              and everything a journalist needs to write about us: spokespeople, boilerplate,
              verifiable facts and brand assets.
            </p>

            <dl className="mt-8 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                <dt className="text-sm font-semibold text-neutral-900">Media enquiries:</dt>
                <dd className="text-sm text-neutral-600">
                  <a
                    href={WHATSAPP_PRESS}
                    className={INLINE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp +65 8087 7015
                  </a>
                  , Mon to Sun, 9am to 9pm
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                <dt className="text-sm font-semibold text-neutral-900">Last updated:</dt>
                <dd className="text-sm text-neutral-600">{PRESS_META.lastUpdated}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        id="coverage"
        aria-label="Media coverage timeline"
        className={`section-padding bg-white ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">Coverage timeline</h2>
            <p className={`mt-4 ${PROSE}`}>
              Features, interviews and commentary involving HomeUP, newest first. Scheduled
              coverage is listed at the top and filled in on the day it is published.
            </p>

            <div className="mt-10 flex flex-col gap-10">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {group.label}
                  </p>
                  <ol className="relative mt-4 border-l border-neutral-200 pl-8">
                    {group.entries.map((entry) => (
                      <TimelineEntry key={entry.slug} entry={entry} />
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {releases.length > 0 && (
        <section
          id="press-releases"
          aria-label="Press releases"
          className={`section-padding bg-neutral-50 ${SECTION_RULE}`}
        >
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              <h2 className="section-title !text-left">Press releases</h2>
              <div className="mt-8 flex flex-col gap-4">
                {releases.map((release) => (
                  <article
                    key={release.slug}
                    className="rounded-2xl border border-neutral-200 bg-white p-6"
                  >
                    <time
                      dateTime={release.date}
                      className="text-sm font-semibold text-neutral-900"
                    >
                      {release.dateLabel}
                    </time>
                    <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                      {release.headline}
                    </h3>
                    <p className={`mt-2 ${PROSE}`}>{release.summary}</p>
                    {release.url && (
                      <a href={release.url} className={`mt-4 ${ACTION_LINK}`}>
                        {release.urlLabel ?? "Read the full release"}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        id="spokespeople"
        aria-label="Spokespeople available for comment"
        className={`section-padding bg-neutral-50 ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">Spokespeople</h2>
            <p className={`mt-4 ${PROSE}`}>
              Both co-founders are available for interviews and comment on Singapore&apos;s
              residential market. Their transaction figures are published and verifiable on
              the{" "}
              <Link href="/track-record" className={INLINE_LINK}>
                track record page
              </Link>
              .
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {spokespeople.map(({ agent, note }) => (
                <div
                  key={agent.slug}
                  className="rounded-2xl border border-neutral-200 bg-white p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                      <Image
                        src={agent.photo}
                        alt={`${agent.name}, CEA ${agent.cea}, HomeUP co-founder`}
                        fill
                        className="object-cover object-top"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-neutral-900">{agent.name}</h3>
                      <p className="text-sm text-neutral-600">
                        {agent.profileTitle ?? "Property advisor"} · CEA {agent.cea}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 border-t border-neutral-200 pt-4 text-sm leading-relaxed text-neutral-700">
                    {note.speaksTo}
                  </p>
                  <Link href={`/agents/${agent.slug}`} className={`mt-4 ${ACTION_LINK}`}>
                    Full profile
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="media-kit"
        aria-label="Media kit"
        className={`section-padding bg-white ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">Media kit</h2>

            <h3 className="mt-8 text-lg font-semibold text-neutral-900">About HomeUP</h3>
            <p className={`mt-3 ${PROSE}`}>This paragraph may be used verbatim.</p>
            <p className={`speakable-boilerplate mt-4 rounded-2xl bg-neutral-50 p-6 ${PROSE}`}>
              {PRESS_BOILERPLATE}
            </p>

            <h3 className="mt-10 text-lg font-semibold text-neutral-900">Facts for citation</h3>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5">
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Licensed estate agency:</strong>{" "}
                {LEGAL_NAME}, CEA Licence {CEA_LICENSE}. HomeUP is a property advisory team
                operating under this licence and is not itself a licensed estate agency. Verify
                at{" "}
                <a
                  href={CEA_PUBLIC_REGISTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={INLINE_LINK}
                >
                  eservices.cea.gov.sg/aceas/public-register
                </a>
                .
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Fixed seller fees, before GST:</strong>{" "}
                HDB $1,999, condominium or EC $4,999, landed $9,999.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Buyer representation:</strong>{" "}
                complimentary on most private property and new launch purchases; $1,999 for HDB.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Office:</strong> 125A Lor 2
                Toa Payoh #02-138, Singapore 311125.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Rankings:</strong> CEA-derived
                2025 rankings, the method behind them and how to reproduce every figure are on
                the{" "}
                <Link href="/track-record" className={INLINE_LINK}>
                  track record page
                </Link>
                .
              </li>
            </ul>

            <h3 className="mt-10 text-lg font-semibold text-neutral-900">Brand assets</h3>
            <p className={`mt-3 ${PROSE}`}>
              Please use the logo unaltered and refer to the company as HomeUP, with a capital
              H, U and P.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {PRESS_ASSETS.map((asset) => (
                <li key={asset.href}>
                  <a
                    href={asset.href}
                    download
                    className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-primary-600/40 hover:shadow-md"
                  >
                    <span className="text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
                      {asset.label}
                    </span>
                    <span className="mt-1 text-sm text-neutral-600">{asset.description}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div id="cite" className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-neutral-900">Cite this page</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {PRESS_PAGE_CITATION}
              </p>
              {published.length > 0 && (
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Each item on the timeline can be linked directly, for example{" "}
                  <code className="text-neutral-900">#{published[0].slug}</code>, and the
                  boilerplate at <code className="text-neutral-900">#media-kit</code>.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        aria-label="Frequently asked questions"
        className={`section-padding bg-neutral-50 ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">Frequently asked questions</h2>
            <div className="mt-8 flex flex-col gap-8">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-lg font-semibold text-neutral-900">{faq.q}</h3>
                  <p className={`mt-3 ${PROSE}`}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="enquiries"
        aria-label="Media enquiries"
        className={`section-padding bg-white ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">Media enquiries</h2>
            <p className={`mt-4 ${PROSE}`}>
              For interview requests, comment on a story or data from our transaction records,
              message us on WhatsApp and say which publication you are writing for and your
              deadline. We reply the same day, seven days a week.
            </p>
            <a
              href={WHATSAPP_PRESS}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              WhatsApp the press line
            </a>
            <p className={`mt-8 ${PROSE}`}>
              More about the company is on the{" "}
              <Link href="/about" className={INLINE_LINK}>
                about page
              </Link>
              , and every advisor is on the{" "}
              <Link href="/agents" className={INLINE_LINK}>
                team page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
