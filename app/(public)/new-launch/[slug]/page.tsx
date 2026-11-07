import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { LaunchReviewContent, faqItems } from "@/components/launch-review/LaunchReviewContent";
import { stillImageFor } from "@/components/launch-review/still";
import { getLaunchBySlug, getVisibleLaunches, launchPath } from "@/lib/data/launches";
import { OG_IMAGE, SITE_URL } from "@/lib/seo/constants";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  faqSchema,
  launchReviewArticleSchema,
  videoObjectsSchema,
} from "@/lib/seo/schema";
import { youtubeThumbnail } from "@/lib/youtube";
import { youtubeId } from "@/lib/playbook/embed";

interface LaunchReviewPageProps {
  params: { slug: string };
}

/** Only reviews visible in this environment are built; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getVisibleLaunches().map((entry) => ({ slug: entry.review.slug }));
}

export function generateMetadata({ params }: LaunchReviewPageProps) {
  const entry = getLaunchBySlug(params.slug);
  if (!entry) return {};
  const { review, missing } = entry;
  const still = stillImageFor(review.slug);
  return buildPageMetadata({
    title: review.seo.title,
    description: review.seo.description,
    path: launchPath(review.slug),
    ...(still && {
      ogImage: `${SITE_URL}${still.src}`,
      ogImageAlt: `HomeUP indicative site study for ${review.name}`,
      ogImageWidth: still.width,
      ogImageHeight: still.height,
    }),
    ...(missing.length > 0 && { robots: { index: false, follow: false } }),
  });
}

export default function LaunchReviewPage({ params }: LaunchReviewPageProps) {
  const entry = getLaunchBySlug(params.slug);
  if (!entry) notFound();
  const { review } = entry;
  const path = launchPath(review.slug);
  const videoId = review.youtubeUrl ? youtubeId(review.youtubeUrl) : "";
  const still = stillImageFor(review.slug);

  return (
    <>
      <JsonLd
        data={[
          launchReviewArticleSchema({
            slug: review.slug,
            headline: review.seo.h1,
            description: review.seo.description,
            image: still ? `${SITE_URL}${still.src}` : OG_IMAGE,
            datePublished: review.datePublished,
            dateModified: review.dateModified,
            authorAgentSlug: "yeo-tong-boon",
            aboutName: `${review.name} ${review.propertyType}`,
          }),
          faqSchema(faqItems(entry)),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "New Launch Reviews", path: "/new-launch" },
            { name: review.name, path },
          ]),
          ...(videoId
            ? videoObjectsSchema([
                {
                  title: `${review.name} review by HomeUP`,
                  description: review.seo.description,
                  thumbnail: youtubeThumbnail(videoId),
                  videoUrl: review.youtubeUrl!,
                  publishedAt: review.dateModified,
                  duration: "",
                },
              ])
            : []),
        ]}
      />
      <Navbar />
      <main className="bg-white">
        <LaunchReviewContent entry={entry} />
      </main>
      <Footer />
    </>
  );
}
