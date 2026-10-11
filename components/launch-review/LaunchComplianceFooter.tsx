import Link from "next/link";
import { getAgentBySlug } from "@/lib/data/agents";
import { CEA_LICENSE, LEGAL_NAME } from "@/lib/seo/constants";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

const REVIEWER_SLUG = "yeo-tong-boon";

/** Advisor and licence details required on every launch review page. */
export function LaunchComplianceFooter() {
  const reviewer = getAgentBySlug(REVIEWER_SLUG);
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700">
      <p>
        Review by{" "}
        <Link href={`/agents/${REVIEWER_SLUG}`} className="font-semibold text-primary-700 hover:underline">
          {reviewer?.name ?? "Yeo Tong Boon"}
        </Link>
        , CEA Reg. No. {reviewer?.cea ?? "R069651E"}.
      </p>
      <p className="mt-1">
        {LEGAL_NAME}, CEA Licence {CEA_LICENSE}.
      </p>
      <p className="mt-1">
        Contact: WhatsApp{" "}
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="font-semibold text-primary-700 hover:underline">
          +65 8087 7015
        </a>
        , Mon to Sun, 9am to 9pm. 125A Lor 2 Toa Payoh #02-138.
      </p>
    </div>
  );
}
