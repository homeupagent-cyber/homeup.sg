import type { Metadata } from "next";
import { LoginForm } from "@/components/new-launch/LoginForm";
import { CEA_LICENSE, LEGAL_NAME } from "@/lib/seo/constants";

export const metadata: Metadata = {
  title: "New Launch Desk login | HomeUP",
};

const NUMBERED_ITEMS = [
  { n: "1", title: "Market pulse", body: "Where prices, supply and vacancy stand this quarter." },
  { n: "2", title: "Launch verdicts", body: "A plain-English buy, wait or pass call on each project." },
  { n: "3", title: "New launch vs resale", body: "The same budget, priced both ways, side by side." },
];

export default function NewLaunchLoginPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div
        className="flex flex-col justify-center gap-8 px-8 py-16 md:px-14"
        style={{ backgroundColor: "#16181B", color: "#F5F3EE" }}
      >
        <div className="max-w-md space-y-6">
          <div>
            <p className="text-sm tracking-wide" style={{ color: "#BFC3C9" }}>HomeUP</p>
            <p className="text-sm" style={{ color: "#BFC3C9" }}>New Launch Desk</p>
          </div>
          <h1
            className="text-3xl leading-tight md:text-4xl"
            style={{ fontFamily: "var(--font-nl-heading)" }}
          >
            Should you buy this new launch, or a resale unit instead?
          </h1>
          <p className="text-base" style={{ color: "#BFC3C9" }}>
            Your HomeUP advisor uses this page to walk through the market, the project, and how it
            stacks up against a resale unit at the same budget.
          </p>
          <ol className="space-y-4 border-t pt-6" style={{ borderColor: "#45494F" }}>
            {NUMBERED_ITEMS.map((item) => (
              <li key={item.n} className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                  style={{ backgroundColor: "#45494F", color: "#F5F3EE" }}
                >
                  {item.n}
                </span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm" style={{ color: "#BFC3C9" }}>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 py-16 md:px-14" style={{ backgroundColor: "#F5F3EE" }}>
        <div className="mx-auto w-full max-w-sm space-y-6">
          <LoginForm />
          <p className="text-xs" style={{ color: "#585C63" }}>
            This page is for discussion with your HomeUP advisor and is not financial advice.
            {" "}
            {LEGAL_NAME}, CEA licence {CEA_LICENSE}.
          </p>
        </div>
      </div>
    </div>
  );
}
