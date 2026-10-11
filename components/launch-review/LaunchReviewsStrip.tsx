import Link from "next/link";
import { getVisibleLaunches } from "@/lib/data/launches";
import { CurrentLaunchReviews } from "./CurrentLaunchReviews";

/** Prominent link from /buy-new-launch to the independent reviews hub. */
export function LaunchReviewsStrip() {
  const current = getVisibleLaunches().filter((entry) => entry.review.status !== "completed");
  return (
    <section aria-labelledby="launch-reviews-strip" className="border-y border-neutral-200 bg-neutral-50 py-12">
      <div className="container-page">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:items-start">
          <div>
            <h2 id="launch-reviews-strip" className="text-2xl font-bold text-neutral-900">
              Weighing a new launch or EC? Read our independent reviews first
            </h2>
            <p className="mt-3 text-md leading-relaxed text-neutral-700">
              Each review compares the project with resale alternatives and staying in your HDB, with measured
              distances, land prices, honest cons, and who should skip it.
            </p>
            <Link href="/new-launch" className="btn btn-primary mt-6">
              See all new launch and EC reviews
            </Link>
          </div>
          <CurrentLaunchReviews entries={current} title="EC and new launch reviews" />
        </div>
      </div>
    </section>
  );
}
