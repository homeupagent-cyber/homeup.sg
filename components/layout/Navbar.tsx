"use client";

import Link from "next/link";
import { BarChart3, Building2, Home, Info, Newspaper, Sparkles, Trees } from "lucide-react";
import { Navbar1, type MenuItem } from "@/components/ui/shadcnblocks-com-navbar1";
import { HomeUpLogo } from "@/components/ui/HomeUpLogo";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsAppUrlFor } from "@/lib/whatsapp";

const WHATSAPP = whatsAppUrlFor("navbar");

export const HOMEUP_NAV_MENU: MenuItem[] = [
  { title: "Home", url: "/" },
  {
    title: "Sell",
    url: "/sell",
    items: [
      {
        title: "Sell HDB",
        description: "Fixed $1,999 + GST",
        icon: <Home className="size-5 shrink-0 text-blue-600" />,
        url: "/sell-hdb",
      },
      {
        title: "Sell Condo",
        description: "Fixed $4,999 + GST",
        icon: <Building2 className="size-5 shrink-0 text-primary-600" />,
        url: "/sell-condo",
      },
      {
        title: "Sell Landed",
        description: "Fixed $9,999 + GST",
        icon: <Trees className="size-5 shrink-0 text-amber-600" />,
        url: "/sell-landed",
      },
    ],
  },
  {
    title: "Buy",
    url: "/buy",
    items: [
      {
        title: "Buy HDB",
        description: "Agent fee from $1,999",
        icon: <Home className="size-5 shrink-0 text-blue-600" />,
        url: "/buy-hdb",
      },
      {
        title: "Buy Condo/Landed",
        description: "Buyers pay no commission",
        icon: <Building2 className="size-5 shrink-0 text-primary-600" />,
        url: "/buy-condo-landed",
      },
      {
        title: "Buy New Launch",
        description: "Buyers pay no commission",
        icon: <Sparkles className="size-5 shrink-0 text-amber-600" />,
        url: "/buy-new-launch",
      },
    ],
  },
  { title: "Listings", url: "/listings" },
  { title: "Playbook", url: "/playbook" },
  {
    title: "About",
    url: "/about",
    items: [
      {
        title: "About HomeUP",
        description: "Our story and fixed-fee model",
        icon: <Info className="size-5 shrink-0 text-blue-600" />,
        url: "/about",
      },
      {
        title: "Track Record",
        description: "CEA-verified 2025 rankings",
        icon: <BarChart3 className="size-5 shrink-0 text-primary-600" />,
        url: "/track-record",
      },
      {
        title: "Press",
        description: "Media coverage and enquiries",
        icon: <Newspaper className="size-5 shrink-0 text-amber-600" />,
        url: "/press",
      },
    ],
  },
  { title: "Our Team", url: "/agents" },
];

export function Navbar() {
  return (
    <div className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md">
      <Navbar1
        menu={HOMEUP_NAV_MENU}
        logoSlot={
          <Link href="/" className="shrink-0">
            <HomeUpLogo variant="wordmark" imageClassName="h-12 w-auto sm:h-14 lg:h-16" />
          </Link>
        }
        auth={{
          signup: {
            text: "WhatsApp Us",
            url: WHATSAPP,
            icon: <WhatsAppIcon className="h-4 w-4 shrink-0" />,
          },
        }}
        className="py-3"
      />
    </div>
  );
}
