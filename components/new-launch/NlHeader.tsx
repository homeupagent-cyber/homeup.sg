import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function NlHeader({ breadcrumb }: { breadcrumb?: { label: string; href: string } }) {
  return (
    <header className="border-b" style={{ borderColor: "#DEDAD1", backgroundColor: "#FFFFFF" }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <span style={{ fontFamily: "var(--font-nl-heading)" }} className="text-lg font-semibold">
            HomeUP <span className="text-sm font-normal" style={{ color: "#585C63" }}>New Launch Desk</span>
          </span>
          {breadcrumb ? (
            <Link
              href={breadcrumb.href}
              className="text-sm underline-offset-4 hover:underline"
              style={{ color: "#585C63" }}
            >
              &larr; {breadcrumb.label}
            </Link>
          ) : (
            <nav className="hidden gap-5 text-sm md:flex" style={{ color: "#3E4248" }}>
              <a href="#market-pulse" className="hover:underline">Market pulse</a>
              <a href="#pipeline" className="hover:underline">Launch pipeline</a>
              <a href="#verdicts" className="hover:underline">Verdicts</a>
              <a href="#versus" className="hover:underline">New launch vs resale</a>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm" style={{ color: "#585C63" }}>
          <span>Prepared for [client]</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
