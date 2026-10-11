"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { trackLaunchEvent } from "@/lib/analytics";

/** The 3D bundle (three.js) is only fetched after the reader asks for it. */
const SiteViewer = dynamic(() => import("./SiteViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-100 text-sm text-neutral-500 sm:h-[540px]">
      Loading the 3D site study…
    </div>
  ),
});

interface SiteStudyLoaderProps {
  slug: string;
  name: string;
  contextUrl: string;
  stillImage: { src: string; width: number; height: number } | null;
  indicativeLabel: string;
}

function hasWebGl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SiteStudyLoader({ slug, name, contextUrl, stillImage, indicativeLabel }: SiteStudyLoaderProps) {
  const [open, setOpen] = useState(false);
  const [webGl, setWebGl] = useState<boolean | null>(null);

  useEffect(() => setWebGl(hasWebGl()), []);

  if (open) {
    return <SiteViewer slug={slug} contextUrl={contextUrl} indicativeLabel={indicativeLabel} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <p className="border-b border-neutral-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
        {indicativeLabel}
      </p>
      <div className="relative bg-neutral-100">
        {stillImage ? (
          // The still carries the indicative label in its top band (for social previews). The same
          // label is in the bar above, so the band is cropped here: 45 px of the 1200 px-wide image.
          <div className="overflow-hidden" style={{ aspectRatio: `${stillImage.width} / ${stillImage.height - 45}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stillImage.src}
              width={stillImage.width}
              height={stillImage.height}
              alt={`Still image of the HomeUP site study for ${name}, showing the plot outline and surrounding blocks`}
              className="block h-auto w-full"
              style={{ marginTop: `-${(45 / stillImage.width) * 100}%` }}
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="h-[240px]" />
        )}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/40 to-transparent p-4 sm:items-center">
          {webGl === false ? (
            <p className="rounded-xl bg-white/95 px-4 py-3 text-center text-sm text-neutral-700 shadow">
              This browser cannot show the interactive 3D model. The image is a still from the same site study, and
              the measured facts are listed below.
            </p>
          ) : (
            <button
              type="button"
              disabled={webGl === null}
              onClick={() => {
                trackLaunchEvent("launch_viewer_open", slug);
                setOpen(true);
              }}
              className="btn btn-primary btn-lg disabled:opacity-60"
            >
              Open the 3D site study
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
