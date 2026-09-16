import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackRecordContent } from "@/components/sections/TrackRecordContent";
import { TRACK_RECORD_FAQS } from "@/lib/data/track-record";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqSchema, trackRecordSchema } from "@/lib/seo/schema";

export const metadata = buildPageMetadata({
  title: "Our Track Record | HomeUP, Verified Against CEA Records",
  description:
    "Two HomeUP advisors rank #1 in Singapore for private residential resale, with a top 1% HDB result, in CEA's published transaction records. Full figures and methodology.",
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
