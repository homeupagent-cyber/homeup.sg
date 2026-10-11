"use client";

import { trackLaunchEvent, trackWhatsAppClick } from "@/lib/analytics";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

interface VerdictCtaProps {
  slug: string;
  href: string;
}

export function VerdictCta({ slug, href }: VerdictCtaProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackLaunchEvent("launch_lead_submit", slug, { channel: "whatsapp" });
        trackWhatsAppClick(`/new-launch/${slug}`);
      }}
      className="btn btn-primary btn-lg w-full gap-2 sm:w-auto"
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      Get our independent verdict
    </a>
  );
}
