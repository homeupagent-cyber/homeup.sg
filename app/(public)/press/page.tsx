import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { PressContent } from "@/components/sections/PressContent";
import { getPressFaqs } from "@/lib/data/press";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqSchema, pressPageSchema } from "@/lib/seo/schema";

export const metadata = buildPageMetadata({
  title: "Press and Media | HomeUP in the News",
  description:
    "Media coverage of HomeUP, Singapore's fixed-fee property advisory, including co-founder Yeo Tong Boon on CNA938's Open House (20 June 2026). Spokespeople, boilerplate, brand assets and the press line for journalists.",
  path: "/press",
  ogImageAlt: "The HomeUP advisory team, Singapore",
});

export default function PressPage() {
  return (
    <>
      <JsonLd
        data={[
          pressPageSchema(),
          faqSchema(getPressFaqs()),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Press", path: "/press" },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-white">
        <PressContent />
      </main>
      <Footer />
    </>
  );
}
