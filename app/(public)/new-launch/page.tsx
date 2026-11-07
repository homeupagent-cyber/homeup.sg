import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LaunchReviewCard } from "@/components/launch-review/LaunchReviewCard";
import { PaidDisclosure } from "@/components/launch-review/PaidDisclosure";
import { getVisibleLaunches, launchPath } from "@/lib/data/launches";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, launchReviewItemListSchema } from "@/lib/seo/schema";

export const metadata = buildPageMetadata({
  title: "New Launch & EC Reviews 2026: Independent Analysis | HomeUP",
  description:
    "Independent reviews of Singapore new launches and ECs: measured location facts, land prices, honest pros and cons, and who should skip each project.",
  path: "/new-launch",
});

export default function NewLaunchHubPage() {
  const entries = getVisibleLaunches();
  const published = entries.filter((entry) => entry.missing.length === 0);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "New Launch Reviews", path: "/new-launch" },
          ]),
          ...(published.length > 0
            ? [
                launchReviewItemListSchema(
                  published.map(({ review }) => ({
                    name: `${review.name} ${review.propertyType} review`,
                    path: launchPath(review.slug),
                  })),
                ),
              ]
            : []),
        ]}
      />
      <Navbar />
      <main className="bg-white">
        <section aria-labelledby="hub-title" className="section-padding bg-white">
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              <Eyebrow>Independent analysis</Eyebrow>
              <h1 id="hub-title" className="section-title !text-left">
                New Launch &amp; EC Reviews
              </h1>
              <p className="mt-6 text-md leading-relaxed text-neutral-700">
                HomeUP reviews new launches and executive condominiums independently. We are not any
                developer&apos;s sales team, so these reviews do not sell projects. Each one compares the project
                with the alternatives you are really weighing, including resale and staying in your HDB, with
                measured distances, land prices, honest cons, and who should skip it.
              </p>
              <PaidDisclosure className="mt-8" />
            </div>
          </div>
        </section>

        <section aria-label="Launch reviews" className="section-padding border-t border-neutral-200 bg-neutral-50">
          <div className="container-page">
            {entries.length > 0 ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <li key={entry.review.slug}>
                    <LaunchReviewCard entry={entry} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mx-auto max-w-3xl text-md text-neutral-700">
                Our first reviews are being checked and will appear here shortly.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
