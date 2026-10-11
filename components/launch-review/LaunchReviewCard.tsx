import Link from "next/link";
import { STATUS_LABEL, launchPath, type LaunchEntry } from "@/lib/data/launches";

const STATUS_STYLE = {
  upcoming: "bg-amber-50 text-amber-800 border-amber-200",
  preview: "bg-blue-50 text-blue-800 border-blue-200",
  launched: "bg-primary-50 text-primary-800 border-primary-200",
  completed: "bg-neutral-100 text-neutral-700 border-neutral-200",
} as const;

export function LaunchReviewCard({ entry }: { entry: LaunchEntry }) {
  const { review, missing } = entry;
  return (
    <Link
      href={launchPath(review.slug)}
      className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[review.status]}`}>
          {STATUS_LABEL[review.status]}
        </span>
        <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
          {review.propertyType}
        </span>
        {missing.length > 0 && (
          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            Draft
          </span>
        )}
      </div>
      <h3 className="mt-4 text-xl font-bold text-neutral-900 group-hover:text-primary-700">
        {review.name} {review.propertyType === "EC" ? "EC" : ""}
      </h3>
      <p className="mt-1 text-sm text-neutral-600">
        {review.street}, {review.area} · {review.developer}
      </p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-700">
        {review.hubTake ?? "[HomeUP take to be written by Tong Boon]"}
      </p>
      <span className="mt-5 text-sm font-semibold text-primary-700">Read the review →</span>
    </Link>
  );
}
