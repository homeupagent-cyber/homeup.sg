"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/new-launch/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, accessCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/new-launch");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="mobileNumber" className="mb-1 block text-sm font-medium" style={{ color: "#1e1812" }}>
          Mobile number
        </label>
        <input
          id="mobileNumber"
          type="tel"
          required
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          className="w-full rounded-md border px-3 py-3 text-base"
          style={{ borderColor: "#e8e3db", minHeight: 44 }}
          autoComplete="tel"
        />
        <p className="mt-1 text-xs" style={{ color: "#6b5f52" }}>
          This is only used to record access to this page.
        </p>
      </div>

      <div>
        <label htmlFor="accessCode" className="mb-1 block text-sm font-medium" style={{ color: "#1e1812" }}>
          Access code
        </label>
        <input
          id="accessCode"
          type="password"
          required
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          className="w-full rounded-md border px-3 py-3 text-base"
          style={{ borderColor: "#e8e3db", minHeight: 44 }}
          autoComplete="off"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md px-4 py-3 text-base font-medium text-white disabled:opacity-60"
        style={{ backgroundColor: "#009A44", minHeight: 44 }}
      >
        {submitting ? "Checking…" : "Continue"}
      </button>

      <p className="text-xs" style={{ color: "#6b5f52" }}>
        Your advisor issues this code. It signs you in for 30 days.
      </p>
    </form>
  );
}
