import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhyHomeUpContent } from "@/components/sections/WhyHomeUpContent";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, whyHomeUpSchema } from "@/lib/seo/schema";

export const metadata = buildPageMetadata({
  title: "HomeUP vs Other Agents | Why Sellers Choose HomeUP",
  description:
    "What changes when you list with HomeUP instead of a traditional agent: a 24/7 live seller portal, 8-platform video-first exposure, data-backed pricing, under-5-minute enquiry response and a fixed fee from $1,999.",
  path: "/why-homeup",
  ogImageAlt: "The HomeUP advisory team, Singapore",
});

export default function WhyHomeUpPage() {
  return (
    <>
      <JsonLd
        data={[
          whyHomeUpSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
            { name: "Why HomeUP", path: "/why-homeup" },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-white">
        <WhyHomeUpContent />
      </main>
      <Footer />
    </>
  );
}
