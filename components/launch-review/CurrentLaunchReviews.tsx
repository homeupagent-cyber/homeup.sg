import Link from "next/link";
import { STATUS_LABEL, launchPath, type LaunchEntry } from "@/lib/data/launches";

interface CurrentLaunchReviewsProps {
  entries: LaunchEntry[];
  title?: string;
  className?: string;
}

/** Compact list of launch reviews, used on Playbook guides and /buy-new-launch. */
export function CurrentLaunchReviews({
  entries,
  title = "Current launch reviews",
  className = "",
}: CurrentLaunchReviewsProps) {
  if (entries.length === 0) return null;
  return (
    <section aria-label={title} className={`rounded-2xl border border-neutral-200 bg-neutral-50 p-6 ${className}`}>
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Independent reviews with pros, cons and comparisons. Not project marketing.
      </p>
      <ul className="mt-4 space-y-3">
        {entries.map(({ review }) => (
          <li key={review.slug}>
            <Link
              href={launchPath(review.slug)}
              className="font-semibold text-primary-700 underline-offset-2 hover:underline"
            >
              {review.name} {review.propertyType} review
            </Link>
            <span className="text-sm text-neutral-600">
              {" "}
              · {review.area} · {STATUS_LABEL[review.status]}
            </span>
          </li>
        ))}
      </ul>
      <Link href="/new-launch" className="mt-4 inline-block text-sm font-semibold text-primary-700 hover:underline">
        All new launch and EC reviews →
      </Link>
    </section>
  );
}
