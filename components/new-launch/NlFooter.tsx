import { CEA_LICENSE, LEGAL_NAME } from "@/lib/seo/constants";

export function NlFooter({ sources }: { sources?: string[] }) {
  return (
    <footer className="border-t px-6 py-8 text-sm" style={{ borderColor: "#DEDAD1", color: "#585C63" }}>
      <div className="mx-auto max-w-6xl space-y-2">
        {sources && sources.length > 0 && (
          <p>Sources: {sources.join("; ")}</p>
        )}
        <p>
          This page is for discussion with your HomeUP advisor and is not financial advice.
        </p>
        <p>
          {LEGAL_NAME}, CEA licence {CEA_LICENSE}.
        </p>
      </div>
    </footer>
  );
}
