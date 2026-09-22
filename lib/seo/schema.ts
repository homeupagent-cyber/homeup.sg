import type { Agent } from "@/lib/data/agents";
import { getAgentBySlug, getAgentShareImage } from "@/lib/data/agents";
import type { FaqItem } from "@/lib/data/faqs";
import type { PlaybookVideo } from "@/lib/data/playbook";
import type { Listing } from "@/lib/listings/types";
import { getPublishedPressEntries, PRESS_META, type PressEntry } from "@/lib/data/press";
import { TRACK_RECORD_META } from "@/lib/data/track-record";
import { ADVANTAGES, stripEmphasis, WHY_HOMEUP_META } from "@/lib/data/why-homeup";
import { getPublicListingUrl } from "@/lib/listings/utils";
import {
  externalVideoWatchUrl,
  resolveThumbnail,
  toEmbedUrl as playbookEmbedUrl,
} from "@/lib/playbook/embed";
import {
  CEA_LICENSE,
  CEA_PUBLIC_REGISTER_URL,
  CEA_WEBSITE_URL,
  LEGAL_NAME,
  ORG_ID,
  ORG_SAME_AS,
  PARENT_ORG_ID,
  PARENT_ORG_NAME,
  PARENT_ORG_UEN,
  SITE_URL,
  SITE_VISION,
} from "./constants";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export interface HowToStep {
  name: string;
  text: string;
}

export function howToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  totalTime = "P3M",
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export const SELL_HOW_TO_STEPS: HowToStep[] = [
  {
    name: "Planning consultation",
    text: "Review your financial position, outstanding Central Provident Fund (CPF), estimated net proceeds, and selling timeline. Free and obligation-free.",
  },
  {
    name: "List and market",
    text: "Your property is listed on PropertyGuru, SRX, 99.co, and HomeUP.sg, plus social channels for maximum buyer reach.",
  },
  {
    name: "Viewings and offers",
    text: "Your dedicated agent coordinates all viewings, handles buyer enquiries, and presents offers with a clear assessment of terms and net proceeds.",
  },
  {
    name: "Documentation and completion",
    text: "HomeUP handles all sales documentation, including Option to Purchase (OTP), contracts, and HDB submission where applicable, through to a smooth handover.",
  },
];

export const BUY_HOW_TO_STEPS: HowToStep[] = [
  {
    name: "Book a free planning consultation",
    text: "Speak with a HomeUP advisor to review affordability, financing options, and your buying timeline. No commitment required.",
  },
  {
    name: "Shortlist and compare properties",
    text: "HomeUP helps you compare HDB, condo, landed, or new launch options with clear guidance on grants, Additional Buyer's Stamp Duty (ABSD), and sell-and-buy timing.",
  },
  {
    name: "Viewings and offer strategy",
    text: "Your advisor coordinates viewings, reviews unit condition and comparables, and structures an offer strategy aligned with your budget.",
  },
  {
    name: "Complete the purchase",
    text: "HomeUP supports Option to Purchase (OTP), financing, and documentation through to completion, with a fixed $1,999 fee for HDB or complimentary representation for most private purchases.",
  },
];

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "RealEstateAgent", "LocalBusiness"],
    "@id": ORG_ID,
    name: "HomeUP",
    alternateName: ["HOMEUP", "HomeUP.sg", LEGAL_NAME],
    legalName: LEGAL_NAME,
    parentOrganization: {
      "@type": "Organization",
      "@id": PARENT_ORG_ID,
      name: PARENT_ORG_NAME,
      identifier: {
        "@type": "PropertyValue",
        name: "UEN",
        value: PARENT_ORG_UEN,
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "SG",
      },
    },
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/homeup-logo-square-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/images/team-group.png`,
    description:
      "HomeUP is a team of Singapore fixed-fee property agents offering full-service property sales and purchases at a transparent flat fee. HDB sellers from $1,999, Condo/EC from $4,999, Landed from $9,999. Over 1,000 transactions closed by CEA-licensed agents under C & H Properties (CEA L3007139C).",
    address: {
      "@type": "PostalAddress",
      streetAddress: "125A Lor 2 Toa Payoh, #02-138",
      addressLocality: "Singapore",
      postalCode: "311125",
      addressCountry: "SG",
    },
    areaServed: { "@type": "Country", name: "Singapore" },
    telephone: "+6580877015",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+6580877015",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
    sameAs: [...ORG_SAME_AS],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "4",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Ernest Lim" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "The team led by Dennis has done a wonderful job in selling my house. Their professionalism, friendliness, and efficiency made selling my house a wonderful experience.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Terrence Koh" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "If I can give more than 5 stars, I will unreservedly do so. Tong Boon provided top notch agent service for the sale of my condo. His commitment towards meeting the best interests of the seller is exceptional.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Mark Kwok Leong" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "Highly recommend Kenji for his professional and honest service. He helped us secure a buyer for my dad's HDB flat quickly at a price higher than the last transacted price.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Kwok Yung" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "Second time engaging Dennis and Kenji to sell my property and it has been as smooth as the first time. Great work and excellent value for money.",
      },
    ],
    identifier: {
      "@type": "PropertyValue",
      name: "CEA Licence",
      value: CEA_LICENSE,
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "CEA Estate Agency Licence",
      identifier: CEA_LICENSE,
      recognizedBy: {
        "@type": "Organization",
        name: "Council for Estate Agencies (CEA)",
        url: CEA_WEBSITE_URL,
      },
      url: CEA_PUBLIC_REGISTER_URL,
    },
    knowsAbout: [
      "Singapore property resale",
      "HDB resale",
      "Condominium sales",
      "Landed property sales",
      "Fixed-fee property agents",
      "Property buying representation",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "HomeUP Fixed-Fee Selling Packages",
      itemListElement: [
        {
          "@type": "Offer",
          name: "HDB Selling Package",
          price: "1999",
          priceCurrency: "SGD",
          description:
            "Full HDB resale service. Fixed fee of $1,999 plus 9% GST. Not a percentage of sale price.",
        },
        {
          "@type": "Offer",
          name: "Condo or EC Selling Package",
          price: "4999",
          priceCurrency: "SGD",
          description:
            "Full condo or EC resale service. Fixed fee of $4,999 plus 9% GST.",
        },
        {
          "@type": "Offer",
          name: "Landed Selling Package",
          price: "9999",
          priceCurrency: "SGD",
          description:
            "Full landed resale service. Fixed fee of $9,999 plus 9% GST.",
        },
      ],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "HomeUP",
    description:
      "Fixed-fee property agents in Singapore. Operated by C and H Properties Pte Ltd under the HomeUP brand.",
    publisher: { "@id": ORG_ID },
    inLanguage: "en-SG",
  };
}

export function collectionPageSchema({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: Array<{ name: string; path: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 50).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: `${SITE_URL}${item.path}`,
      })),
    },
  };
}

/** CSS selectors for voice-friendly answer blocks (SpeakableSpecification). */
export const SPEAKABLE_HOMEPAGE_SELECTORS = [
  ".speakable-fixed-fee-definition",
  ".speakable-faq-answer",
] as const;

export function speakableWebPageSchema({
  path,
  name,
  cssSelectors,
}: {
  path: string;
  name: string;
  cssSelectors: readonly string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [...cssSelectors],
    },
  };
}

function agentSameAs(agent: Agent): string[] {
  const links: string[] = [];
  if (agent.social?.instagram) links.push(agent.social.instagram);
  if (agent.social?.youtube) links.push(agent.social.youtube);
  if (agent.social?.facebook) links.push(agent.social.facebook);
  if (agent.social?.tiktok) links.push(agent.social.tiktok);
  return links;
}

export function personSchema(agent: Agent) {
  const sameAs = agentSameAs(agent);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/agents/${agent.slug}#person`,
    name: agent.name,
    url: `${SITE_URL}/agents/${agent.slug}`,
    image: `${SITE_URL}${getAgentShareImage(agent)}`,
    description: agent.bio,
    jobTitle: "CEA-Licensed Property Advisor",
    worksFor: { "@id": ORG_ID },
    identifier: {
      "@type": "PropertyValue",
      name: "CEA Registration Number",
      value: agent.cea,
    },
    knowsAbout: agent.specialties,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function realEstateAgentSchema(agent: Agent) {
  const sameAs = agentSameAs(agent);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/agents/${agent.slug}#agent`,
    name: agent.name,
    url: `${SITE_URL}/agents/${agent.slug}`,
    image: `${SITE_URL}${getAgentShareImage(agent)}`,
    description: agent.bio,
    parentOrganization: { "@id": ORG_ID },
    identifier: {
      "@type": "PropertyValue",
      name: "CEA Registration Number",
      value: agent.cea,
    },
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about#webpage`,
    url: `${SITE_URL}/about`,
    name: "About HomeUP",
    description: `${SITE_VISION} Learn about HomeUP, a team of fixed-fee property agents in Singapore operating under C and H Properties Pte Ltd (CEA L3007139C), with CEA-licensed advisors and transparent pricing.`,
    isPartOf: { "@id": ORG_ID },
    about: { "@id": ORG_ID },
    mainEntity: { "@id": ORG_ID },
  };
}

export function listingsItemListSchema(listings: Listing[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "HomeUP Property Listings Singapore",
    description:
      "Active HDB, condo, and landed property listings represented by HomeUP's CEA-licensed agents.",
    numberOfItems: listings.length,
    itemListElement: listings.slice(0, 50).map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "RealEstateListing",
        name: listing.title,
        url: getPublicListingUrl(listing.slug),
        offers: {
          "@type": "Offer",
          price: Number(listing.price),
          priceCurrency: "SGD",
          availability:
            listing.listed_as === "sell"
              ? "https://schema.org/InStock"
              : "https://schema.org/ForRent",
        },
      },
    })),
  };
}

export function realEstateListingSchema(listing: Listing) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    url: getPublicListingUrl(listing.slug),
    ...(listing.featured_image_url && { image: listing.featured_image_url }),
    ...(listing.address_line_1 && {
      address: {
        "@type": "PostalAddress",
        streetAddress: listing.address_line_1,
        addressCountry: "SG",
      },
    }),
    offers: {
      "@type": "Offer",
      price: Number(listing.price),
      priceCurrency: "SGD",
      availability:
        listing.listed_as === "sell"
          ? "https://schema.org/InStock"
          : "https://schema.org/ForRent",
    },
  };
}

function durationToIso(duration: string): string {
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) {
    const [m, s] = parts;
    return `PT${m}M${s}S`;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return `PT${h}H${m}M${s}S`;
  }
  return "PT0S";
}

type VideoSchemaInput = {
  slug?: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  publishedAt?: string;
  duration?: string;
};

function buildVideoObjectSchema(video: VideoSchemaInput) {
  const pageUrl = video.slug ? `${SITE_URL}/playbook/watch/${video.slug}` : undefined;
  const thumbnailUrl = resolveThumbnail(video.thumbnail, video.videoUrl);

  return {
    "@type": "VideoObject" as const,
    ...(pageUrl && { "@id": `${pageUrl}#video`, url: pageUrl }),
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl,
    contentUrl: externalVideoWatchUrl(video.videoUrl),
    embedUrl: playbookEmbedUrl(video.videoUrl),
    ...(video.publishedAt ? { uploadDate: video.publishedAt } : {}),
    ...(video.duration ? { duration: durationToIso(video.duration) } : {}),
    publisher: { "@id": ORG_ID },
  };
}

export function videoObjectsSchema(
  videos: {
    slug?: string;
    title: string;
    description: string;
    thumbnail: string;
    videoUrl: string;
    publishedAt: string;
    duration: string;
  }[],
) {
  return videos
    .filter((video) => video.videoUrl && video.thumbnail)
    .map((video) => ({
      "@context": "https://schema.org",
      ...buildVideoObjectSchema(video),
    }));
}

/** Watch-primary page schema so Google can index the video on a dedicated watch URL. */
export function watchPageSchema(video: VideoSchemaInput & { slug: string }) {
  const pageUrl = `${SITE_URL}/playbook/watch/${video.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: video.title,
    description: video.description || video.title,
    inLanguage: "en-SG",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: buildVideoObjectSchema({ ...video, slug: video.slug }),
  };
}

/** Article/guide schema for a Playbook entry. Pairs with faqSchema + videoObjectsSchema
 *  on the /playbook/[slug] page so the guide is eligible for rich results and AI answers. */
export function articleSchema(video: PlaybookVideo, authorAgentSlug?: string) {
  const url = `${SITE_URL}/playbook/${video.slug}`;
  const author = authorAgentSlug
    ? { "@id": `${SITE_URL}/agents/${authorAgentSlug}#person` }
    : { "@id": ORG_ID };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: video.title,
    description: video.metaDescription || video.description || video.title,
    ...(video.thumbnail && { image: video.thumbnail }),
    datePublished: video.publishedAt,
    dateModified: video.publishedAt,
    inLanguage: "en-SG",
    author,
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(video.tags?.length ? { keywords: video.tags.join(", ") } : {}),
    ...(video.videoUrl && video.thumbnail
      ? { video: buildVideoObjectSchema({ ...video, description: video.description || video.title }) }
      : {}),
  };
}

export function serviceSchema({
  name,
  description,
  path,
  offers,
}: {
  name: string;
  description: string;
  path: string;
  offers?: Array<{ name: string; price: string; description: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${path}#service`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Singapore" },
    ...(offers && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${name} Packages`,
        itemListElement: offers.map((offer) => ({
          "@type": "Offer",
          name: offer.name,
          price: offer.price,
          priceCurrency: "SGD",
          description: offer.description,
        })),
      },
    }),
  };
}

/**
 * Citation graph for /track-record. The WebPage node points at the sitewide
 * `#website` and `#organization` nodes rather than defining its own, so the page
 * attaches to the existing entity graph instead of creating a parallel one.
 */
export function trackRecordSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/track-record#webpage`,
        url: `${SITE_URL}/track-record`,
        name: "Our Track Record | HomeUP, Verified Against CEA Records",
        description:
          "Two HomeUP advisors rank #1 in Singapore for private residential resale, with a top 1% HDB seller-side result, in CEA's published transaction records.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": ORG_ID },
        dateModified: TRACK_RECORD_META.lastVerifiedIso,
        lastReviewed: TRACK_RECORD_META.lastVerifiedIso,
        citation: { "@id": `${SITE_URL}/track-record#dataset` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".speakable-ranking"],
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/agents/dennis-lim#person`,
        name: "Dennis Lim",
        alternateName: "Lim Swee Ser",
        identifier: "R055990G",
        jobTitle: "Co-Founder",
        worksFor: { "@id": ORG_ID },
        url: `${SITE_URL}/agents/dennis-lim`,
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/agents/yeo-tong-boon#person`,
        name: "Yeo Tong Boon",
        identifier: "R069651E",
        jobTitle: "Co-Founder",
        worksFor: { "@id": ORG_ID },
        url: `${SITE_URL}/agents/yeo-tong-boon`,
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "National University of Singapore",
        },
      },
      {
        "@type": "Dataset",
        "@id": `${SITE_URL}/track-record#dataset`,
        name: "CEA Salespersons' Property Transaction Records (Residential)",
        description:
          "Published transaction records for licensed property salespersons in Singapore, used as the source for all figures on this page.",
        creator: {
          "@type": "GovernmentOrganization",
          name: "Council for Estate Agencies",
        },
        isAccessibleForFree: true,
        url: "https://data.gov.sg",
        temporalCoverage: "2017-01/2026-06",
        spatialCoverage: { "@type": "Country", name: "Singapore" },
        license: "https://data.gov.sg/open-data-licence",
        includedInDataCatalog: {
          "@type": "DataCatalog",
          name: "data.gov.sg",
          url: "https://data.gov.sg",
        },
      },
    ],
  };
}


function pressDurationToIso(duration: string): string | undefined {
  const parts = duration.split(":").map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
  if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  return undefined;
}

/**
 * One node per published coverage item. Radio segments become PodcastEpisode inside a
 * PodcastSeries, written pieces become NewsArticle, and a release we issue ourselves is
 * an Article published by HomeUP. Every node is `about` the organisation and `mentions`
 * the advisors it features, so the coverage attaches to the existing entity graph.
 */
function pressCoverageNode(entry: PressEntry) {
  const id = `${SITE_URL}/press#${entry.slug}`;
  const isRelease = entry.kind === "press-release";
  const type = isRelease ? "Article" : entry.medium === "Radio" ? "PodcastEpisode" : "NewsArticle";
  const duration = entry.duration ? pressDurationToIso(entry.duration) : undefined;

  return {
    "@type": type,
    "@id": id,
    name: entry.headline,
    ...(type === "NewsArticle" && { headline: entry.headline }),
    description: entry.statement ?? entry.summary,
    ...(entry.summary && entry.statement && { abstract: entry.summary }),
    ...(entry.url && { url: entry.url }),
    ...(entry.date.length === 10 && { datePublished: entry.date }),
    ...(duration && { duration }),
    inLanguage: "en-SG",
    publisher: isRelease
      ? { "@id": ORG_ID }
      : {
          "@type": "NewsMediaOrganization",
          name: entry.outlet,
          ...(entry.outletUrl && { url: entry.outletUrl }),
        },
    ...(type === "PodcastEpisode" &&
      entry.programme && {
        partOfSeries: {
          "@type": "PodcastSeries",
          name: entry.programme,
          ...(entry.programmeUrl && { url: entry.programmeUrl }),
        },
      }),
    ...(entry.presenters?.length && {
      actor: entry.presenters.map((name) => ({ "@type": "Person", name })),
    }),
    about: { "@id": ORG_ID },
    ...(entry.people.length > 0 && {
      mentions: entry.people.map((slug) => ({ "@id": `${SITE_URL}/agents/${slug}#person` })),
    }),
  };
}

/**
 * Citation graph for /press. Only published coverage is listed; upcoming entries stay
 * out of structured data until they exist. The CollectionPage points at the sitewide
 * `#website` and `#organization` nodes, and each featured advisor gets a Person node
 * whose `subjectOf` lists the coverage they appear in.
 */
export function pressPageSchema() {
  const published = getPublishedPressEntries();
  const coverageIds = new Map<string, string[]>();
  for (const entry of published) {
    for (const slug of entry.people) {
      const ids = coverageIds.get(slug) ?? [];
      ids.push(`${SITE_URL}/press#${entry.slug}`);
      coverageIds.set(slug, ids);
    }
  }

  const people = [...coverageIds.entries()].flatMap(([slug, ids]) => {
    const agent = getAgentBySlug(slug);
    if (!agent) return [];
    return [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/agents/${slug}#person`,
        name: agent.name,
        url: `${SITE_URL}/agents/${slug}`,
        ...(agent.profileTitle && { jobTitle: agent.profileTitle }),
        worksFor: { "@id": ORG_ID },
        subjectOf: ids.map((id) => ({ "@id": id })),
      },
    ];
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/press#webpage`,
        url: `${SITE_URL}/press`,
        name: "Press and Media | HomeUP in the News",
        description:
          "Media coverage of HomeUP, Singapore's fixed-fee property advisory, with press releases, spokespeople, boilerplate and brand assets for journalists.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": ORG_ID },
        datePublished: PRESS_META.publishedIso,
        dateModified: PRESS_META.lastUpdatedIso,
        lastReviewed: PRESS_META.lastUpdatedIso,
        inLanguage: "en-SG",
        mainEntity: { "@id": `${SITE_URL}/press#coverage` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".speakable-coverage", ".speakable-boilerplate"],
        },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/press#coverage`,
        name: "Media coverage of HomeUP",
        numberOfItems: published.length,
        itemListElement: published.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: pressCoverageNode(entry),
        })),
      },
      ...people,
    ],
  };
}

export function whyHomeUpSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/why-homeup#webpage`,
        url: `${SITE_URL}/why-homeup`,
        name: "HomeUP vs Other Agents | Why Sellers Choose HomeUP",
        description:
          "What changes when you list with HomeUP instead of a traditional agent: a 24/7 live seller portal, 8-platform video-first exposure, data-backed pricing, under-5-minute enquiry response and a fixed fee from $1,999.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": ORG_ID },
        datePublished: WHY_HOMEUP_META.publishedIso,
        dateModified: WHY_HOMEUP_META.lastUpdatedIso,
        inLanguage: "en-SG",
        mainEntity: { "@id": `${SITE_URL}/why-homeup#advantages` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".speakable-advantage", ".speakable-proof"],
        },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/why-homeup#advantages`,
        name: "What HomeUP sellers get that a traditional listing does not",
        numberOfItems: ADVANTAGES.length,
        itemListElement: ADVANTAGES.map((advantage, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}/why-homeup#${advantage.slug}`,
          name: advantage.title,
          description: stripEmphasis(advantage.body),
        })),
      },
    ],
  };
}
