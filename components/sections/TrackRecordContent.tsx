import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  CATEGORY_FIELDS,
  DENNIS_PRIOR_YEAR,
  HDB_RESULT,
  HEADLINE_RANKINGS,
  PAGE_CITATION,
  TRACK_RECORD_FAQS,
  TRACK_RECORD_META,
} from "@/lib/data/track-record";
import { CEA_LICENSE, CEA_PUBLIC_REGISTER_URL, LEGAL_NAME } from "@/lib/seo/constants";

/**
 * Server component by design. Every figure, heading and FAQ answer must be present in the
 * server-rendered HTML, so this file uses no client hooks, no motion wrappers and no
 * collapsible panels that unmount their own content.
 */

const SECTION_RULE = "border-t border-neutral-200";
const PROSE = "text-md leading-relaxed text-neutral-700";

function SourceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
      <dt className="text-sm font-semibold text-neutral-900">{label}</dt>
      <dd className="text-sm text-neutral-600">{value}</dd>
    </div>
  );
}

export function TrackRecordContent() {
  return (
    <>
      <section aria-label="Track record introduction" className="section-padding bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Verified against CEA records</Eyebrow>
            <h1 className="section-title !text-left">
              Our Track Record, Verified Against CEA Records
            </h1>
            <p className={`mt-6 ${PROSE}`}>
              Plenty of people in Singapore property describe themselves as top producers.
              Almost none show you where the number comes from.
            </p>
            <p className={`mt-4 ${PROSE}`}>
              Every figure on this page is computed from the Council for Estate Agencies&apos;
              published salesperson transaction records, the same dataset anyone can download
              from data.gov.sg. We show the method, the size of the field and the shape of the
              distribution, so you can reproduce the work yourself.
            </p>

            <dl className="mt-8 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <SourceLine label="Figures cover:" value={TRACK_RECORD_META.reportingPeriod} />
              <SourceLine label="Dataset spans:" value={TRACK_RECORD_META.datasetCoverage} />
              <SourceLine label="Source:" value={TRACK_RECORD_META.source} />
              <SourceLine label="Last verified:" value={TRACK_RECORD_META.lastVerified} />
            </dl>
          </div>
        </div>
      </section>

      <section
        id="rankings-2025"
        aria-label="Who ranked first in Singapore in 2025"
        className={`section-padding bg-white ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">Who ranked first in Singapore in 2025</h2>
            <p className={`mt-4 ${PROSE}`}>
              Two HomeUP advisors hold the{" "}
              <strong className="font-semibold text-neutral-900">
                number one position in Singapore
              </strong>{" "}
              in their categories. The rankings below cover the 2025 calendar year, which is
              complete and will not be revised further.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {HEADLINE_RANKINGS.map((row) => (
                <div
                  key={row.slug}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6"
                >
                  <h3 className="text-lg font-semibold text-neutral-900">{row.advisor}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{row.category}</p>
                  <dl className="mt-5 flex flex-col gap-4 border-t border-neutral-200 pt-5">
                    <div>
                      <dt className="text-sm text-neutral-600">Transactions, 2025</dt>
                      <dd className="mt-0.5 text-2xl font-bold text-neutral-900">
                        {row.transactions}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-neutral-600">Rank in Singapore</dt>
                      <dd className="mt-0.5 text-2xl font-bold text-primary-700">{row.rank}</dd>
                    </div>
                  </dl>
                  <p className="speakable-ranking mt-5 border-t border-neutral-200 pt-5 text-sm leading-relaxed text-neutral-700">
                    {row.statement}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-neutral-900">
                Dennis Lim in {DENNIS_PRIOR_YEAR.year}, the year before
              </h3>
              <p className={`speakable-ranking mt-2 ${PROSE}`}>
                {DENNIS_PRIOR_YEAR.statement} That {DENNIS_PRIOR_YEAR.year} figure is resale
                only, on the same definition used everywhere else on this page.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="the-field"
        aria-label="How many salespersons were in each category"
        className={`section-padding bg-neutral-50 ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">
              How many salespersons were in each category
            </h2>
            <p className={`mt-4 ${PROSE}`}>
              A rank is only meaningful next to the field it was measured against. Here is the
              shape of each category in 2025.
            </p>

            {CATEGORY_FIELDS.map((field) => (
              <div key={field.heading} className="mt-10">
                <h3 className="text-lg font-semibold text-neutral-900">{field.heading}</h3>
                <p className={`mt-3 ${PROSE}`}>
                  In the 2025 calendar year,{" "}
                  <strong className="font-semibold text-neutral-900">
                    {field.fieldSize} salespersons
                  </strong>{" "}
                  in Singapore recorded at least one transaction in this category. Between them
                  they closed {field.categoryTransactions} transactions.
                </p>
                <ul className="mt-4 flex list-disc flex-col gap-2 pl-5">
                  <li className={PROSE}>
                    The median salesperson in this category closed{" "}
                    <strong className="font-semibold text-neutral-900">{field.median}</strong>{" "}
                    transaction.
                  </li>
                  {field.thresholds.map((threshold) => (
                    <li key={threshold} className={PROSE}>
                      {threshold}
                    </li>
                  ))}
                </ul>
                <p className={`mt-4 ${PROSE}`}>{field.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="hdb-2025"
        aria-label="HDB resale rankings 2025"
        className={`section-padding bg-white ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">HDB resale rankings, 2025</h2>
            <p className={`mt-4 ${PROSE}`}>
              The two number one positions on this page are in private property. HDB is a
              separate market with a separate field, so it is measured separately.
            </p>

            <h3 className="mt-10 text-lg font-semibold text-neutral-900">
              Yeo Tong Boon, top 1% in Singapore, HDB resale seller representation, 2025
            </h3>
            <p className={`speakable-ranking mt-3 ${PROSE}`}>{HDB_RESULT.statement}</p>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5">
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">
                  {HDB_RESULT.transactions} transactions
                </strong>{" "}
                on the seller side in the 2025 calendar year
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">
                  Ranked {HDB_RESULT.rank}
                </strong>{" "}
                salespersons active in the category
              </li>
              <li className={PROSE}>
                {HDB_RESULT.tieCount} salespersons are tied on {HDB_RESULT.transactions}{" "}
                transactions. Ranked last within that tie the position would be{" "}
                {HDB_RESULT.tieWorstCaseRank}, which is still inside the top 1% nationally.
              </li>
            </ul>

            <p className={`mt-6 ${PROSE}`}>
              The field, for context. In 2025, {HDB_RESULT.fieldSize} salespersons represented an
              HDB seller in at least one resale transaction, closing{" "}
              {HDB_RESULT.categoryTransactions} transactions between them.
            </p>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5">
              <li className={PROSE}>
                The median salesperson in this category closed{" "}
                <strong className="font-semibold text-neutral-900">{HDB_RESULT.median}</strong>{" "}
                transactions.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">
                  {HDB_RESULT.reachedTwenty} salespersons
                </strong>{" "}
                nationally reached twenty.
              </li>
              <li className={PROSE}>
                The threshold for the top 1% was {HDB_RESULT.topOnePercentThreshold}{" "}
                transactions.
              </li>
            </ul>

            <p className={`mt-6 rounded-2xl bg-neutral-50 p-6 ${PROSE}`}>
              <strong className="font-semibold text-neutral-900">
                This is a 2025 figure and we state it as one.
              </strong>{" "}
              Every ranking on this page is a 2025 calendar year result, and the one earlier
              figure we show is labelled 2024. We report the calendar year because it is the
              period in which the result was achieved and because it is closed, not because it
              is the most flattering window available.
            </p>
          </div>
        </div>
      </section>

      <section
        id="hdb-sellers"
        aria-label="Why these rankings matter if you are selling an HDB flat"
        className={`section-padding bg-neutral-50 ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">
              Why private resale rankings matter if you are selling an HDB flat
            </h2>
            <p className={`mt-4 ${PROSE}`}>
              If you are selling an HDB flat, two of the rankings on this page are in a different
              market. Here is why they still matter to you, alongside the HDB result above.
            </p>
            <p className={`mt-4 ${PROSE}`}>
              Buyer representation volume is a direct measure of how many active buyers an
              advisory team is working with at any time. When your flat is listed with us, it is
              being shown to the buyer pipeline of the salesperson who represented more private
              resale buyers than anyone else in Singapore, plus the rest of our team.
            </p>
            <p className={`mt-4 ${PROSE}`}>
              Upgrader demand is also the main driver of HDB resale pricing at the upper end. A
              team that transacts heavily in private resale sees where that demand is moving
              before it shows up in HDB data.
            </p>
          </div>
        </div>
      </section>

      <section
        id="methodology"
        aria-label="Methodology"
        className={`section-padding bg-white ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">
              Methodology: how these rankings are calculated
            </h2>
            <ul className="mt-6 flex list-disc flex-col gap-3 pl-5">
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Source:</strong> CEA
                Salespersons&apos; Property Transaction Records (Residential), published on
                data.gov.sg.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Reporting period:</strong>{" "}
                every ranking on this page is a 2025 calendar year result. Dennis Lim&apos;s 2024
                result is shown alongside it for comparison and is labelled as 2024 wherever it
                appears. The source file spans {TRACK_RECORD_META.datasetCoverage}.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Reporting lag.</strong> CEA
                publishes with a delay and recent months are revised upward as records are
                submitted. We therefore report a closed calendar year rather than a partial
                current one, so that no figure here can be revised after publication.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Category</strong> means a
                single combination of property type, transaction type and side represented, for
                example private residential resale on the buyer side.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Resale only.</strong> New sales
                are excluded from every private residential figure on this page. Resale and new
                sale are different categories and we do not combine them.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Rank</strong> is by transaction
                count within a single category and a single time window. Where salespersons tie on
                count, we disclose the tie rather than resolve it silently.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">The field</strong> is the
                number of salespersons who recorded at least one transaction in that category and
                window. Salespersons who recorded none are excluded, which makes every rank on
                this page harder to achieve than it would be against the full register.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Private residential</strong>{" "}
                covers condominium and apartment, executive condominium, landed, and strata
                landed.
              </li>
              <li className={PROSE}>
                Where an advisor holds more than one CEA registration number, records under both
                are combined.
              </li>
              <li className={PROSE}>
                We report rank against the field rather than percentile bands, because percentile
                boundaries depend on how ties are broken and rank does not.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        id="verify"
        aria-label="How to verify these figures yourself"
        className={`section-padding bg-neutral-50 ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">How to verify these figures yourself</h2>
            <ul className="mt-6 flex list-disc flex-col gap-3 pl-5">
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">CEA Public Register:</strong>{" "}
                search any registration number below at{" "}
                <a
                  href={CEA_PUBLIC_REGISTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 underline underline-offset-2 transition-colors hover:text-primary-700"
                >
                  eservices.cea.gov.sg/aceas/public-register
                </a>
                . Dennis Lim is {HEADLINE_RANKINGS[0].cea}, registered name Lim Swee Ser. Yeo Tong
                Boon is {HEADLINE_RANKINGS[1].cea}.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">
                  Licensed estate agency:
                </strong>{" "}
                {LEGAL_NAME}, CEA Licence {CEA_LICENSE}. HomeUP is a property advisory team
                operating under this licence. It is not itself a licensed estate agency.
              </li>
              <li className={PROSE}>
                <strong className="font-semibold text-neutral-900">Source dataset:</strong> CEA
                Salespersons&apos; Property Transaction Records (Residential),{" "}
                <a
                  href="https://data.gov.sg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 underline underline-offset-2 transition-colors hover:text-primary-700"
                >
                  data.gov.sg
                </a>
              </li>
            </ul>
            <p className={`mt-6 ${PROSE}`}>
              If you reproduce these figures and get a different answer, tell us and we will
              either correct the page or show you our working.
            </p>

            <div
              id="cite"
              className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <h3 className="text-sm font-semibold text-neutral-900">Cite this page</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{PAGE_CITATION}</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Individual sections can be linked directly: the 2025 rankings at{" "}
                <code className="text-neutral-900">#rankings-2025</code>, the HDB result at{" "}
                <code className="text-neutral-900">#hdb-2025</code>, and the method at{" "}
                <code className="text-neutral-900">#methodology</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        aria-label="Frequently asked questions"
        className={`section-padding bg-white ${SECTION_RULE}`}
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title !text-left">Frequently asked questions</h2>
            <div className="mt-8 flex flex-col gap-8">
              {TRACK_RECORD_FAQS.map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-lg font-semibold text-neutral-900">{faq.q}</h3>
                  <p className={`mt-3 ${PROSE}`}>{faq.a}</p>
                </div>
              ))}
            </div>

            <p className={`mt-12 ${PROSE}`}>
              More about how we work is on the{" "}
              <Link
                href="/about"
                className="font-medium text-primary-600 underline underline-offset-2 transition-colors hover:text-primary-700"
              >
                about page
              </Link>
              , and the advisors behind these figures are on the{" "}
              <Link
                href="/agents"
                className="font-medium text-primary-600 underline underline-offset-2 transition-colors hover:text-primary-700"
              >
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
