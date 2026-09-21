import Image from "next/image";
import Link from "next/link";
import {
  TEAM_RECORD_ADVISORS,
  TEAM_RECORD_META,
  TEAM_RECORD_METHOD,
  type TeamRecordAdvisor,
} from "@/lib/data/team-record";

/**
 * Server component. Every figure renders in the HTML with no toggle or tab, so the
 * HDB and private splits are both always present for crawlers and answer engines.
 */

const PROSE = "text-md leading-relaxed text-neutral-700";

function HeadlineStat({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-3xl font-bold text-primary-700">{value}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{label}</p>
      <p className="mt-1 text-sm text-neutral-600">{note}</p>
    </div>
  );
}

function SplitStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-lg font-bold text-neutral-900">{value}</dd>
    </div>
  );
}

function AdvisorCard({ advisor }: { advisor: TeamRecordAdvisor }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100">
          <Image
            src={advisor.photo}
            alt={advisor.name}
            fill
            className="object-cover object-top"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-neutral-900">
            <Link
              href={`/agents/${advisor.slug}`}
              className="transition-colors hover:text-primary-700"
            >
              {advisor.name}
            </Link>
          </h3>
          <p className="text-sm text-neutral-500">CEA {advisor.cea}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-700">{advisor.total}</p>
          <p className="text-xs uppercase tracking-wide text-neutral-500">total sales</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-5 sm:grid-cols-4">
        <SplitStat value={advisor.hdb} label="HDB" />
        <SplitStat value={advisor.private} label="Private" />
        <SplitStat
          value={advisor.sellerSide}
          label={advisor.sideNote ? `Seller (${advisor.sideNote})` : "Seller side"}
        />
        <SplitStat
          value={advisor.buyerSide}
          label={advisor.sideNote ? `Buyer (${advisor.sideNote})` : "Buyer side"}
        />
      </dl>

      <p className="mt-4 border-t border-neutral-200 pt-4 text-sm leading-relaxed text-neutral-600">
        <span className="font-semibold text-neutral-900">{advisor.spanLabel}:</span>{" "}
        {advisor.span}.{advisor.detail ? ` ${advisor.detail}` : ""}
      </p>
    </div>
  );
}

export function TeamRecordSection() {
  return (
    <div className="container-page">
      <div className="mx-auto max-w-3xl">
        <h2 className="section-title !text-left">
          How many homes the HomeUP team has sold
        </h2>
        <p className={`mt-4 ${PROSE}`}>
          Across its four most active advisors, HomeUP has closed{" "}
          <strong className="font-semibold text-neutral-900">
            {TEAM_RECORD_META.totalSales} property sales
          </strong>
          . The figures below are lifetime totals for each advisor, not the 2025 rankings
          above, and they cover HDB and private sale and resale transactions.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <HeadlineStat
            value={TEAM_RECORD_META.totalSales}
            label="Total transactions"
            note="HDB and private, sale and resale only"
          />
          <HeadlineStat
            value={TEAM_RECORD_META.hdbSales}
            label="HDB sales"
            note={`${TEAM_RECORD_META.hdbShare} of team volume`}
          />
          <HeadlineStat
            value={TEAM_RECORD_META.privateSales}
            label="Private sales"
            note={`Condo, EC and landed · ${TEAM_RECORD_META.privateShare} of team volume`}
          />
        </div>

        <h3 className="mt-12 text-lg font-semibold text-neutral-900">By advisor</h3>
        <p className={`mt-2 ${PROSE}`}>
          Sale and resale transactions, CEA-verified where the public register covers them.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {TEAM_RECORD_ADVISORS.map((advisor) => (
            <AdvisorCard key={advisor.slug} advisor={advisor} />
          ))}
        </div>

        <h3 className="mt-12 text-lg font-semibold text-neutral-900">
          How these totals are verified
        </h3>
        <ul className="mt-4 flex list-disc flex-col gap-3 pl-5">
          {TEAM_RECORD_METHOD.map((item) => (
            <li key={item} className={PROSE}>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-neutral-500">
          Compiled {TEAM_RECORD_META.compiled} from the CEA Salespersons&apos; Property
          Transaction Records on data.gov.sg (resource{" "}
          <code className="text-neutral-700">{TEAM_RECORD_META.ceaResourceId}</code>), plus
          HomeUP office records for the period before {TEAM_RECORD_META.registerStart}.
        </p>
      </div>
    </div>
  );
}
