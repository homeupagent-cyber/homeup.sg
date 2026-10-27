import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackRecordContent } from "@/components/sections/TrackRecordContent";
import { TRACK_RECORD_FAQS } from "@/lib/data/track-record";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqSchema, trackRecordSchema } from "@/lib/seo/schema";

export const metadata = buildPageMetadata({
  title: "Our Track Record and How We Count It | HomeUP",
  description:
    "Two HomeUP advisors ranked first in Singapore in their 2025 categories, based on our count of CEA's published transaction records, with a top 1% HDB result. Full figures and method.",
  path: "/track-record",
  ogImageAlt: "The HomeUP advisory team, Singapore",
});

export default function TrackRecordPage() {
  return (
    <>
      <JsonLd
        data={[
          trackRecordSchema(),
          faqSchema(TRACK_RECORD_FAQS),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Track record", path: "/track-record" },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-white">
        <TrackRecordContent />
      </main>
      <Footer />
    </>
  );
}
