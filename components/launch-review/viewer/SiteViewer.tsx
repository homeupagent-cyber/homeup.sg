"use client";

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementRef,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { trackLaunchEvent } from "@/lib/analytics";
import {
  MAX_MINUTES,
  MIN_MINUTES,
  SUN_PRESETS,
  compassWord,
  formatMinutes,
  sgtDate,
  sunState,
  type SunPresetKey,
} from "./sun";

type Ring = [number, number][];

interface ContextFeature {
  type: "Feature";
  properties: {
    kind: "plot" | "building" | "poi";
    h?: number;
    hs?: "hdb" | "osm" | "estimated";
    name?: string;
    cat?: "rail" | "school" | "expressway" | "mall";
    d?: number;
  };
  geometry: { type: "Polygon"; coordinates: Ring[] } | { type: "Point"; coordinates: [number, number] };
}

interface SiteContext {
  meta: {
    centre: { lat: number; lng: number };
    radiusM: number;
    metresPerStorey: number;
    statedMaxStoreys: number | null;
  };
  features: ContextFeature[];
}

export interface SiteViewerProps {
  slug: string;
  contextUrl: string;
  indicativeLabel: string;
}

const COLOURS = {
  ground: "#ecebe5",
  known: "#bdb6aa",
  estimated: "#e2ded6",
  plot: "#009A44",
  ring: "#b0a596",
};

/**
 * Opening camera, in metres from the plot centre (x = east, z = south). North-north-west and
 * high, so the plot is not hidden behind neighbouring blocks in a typical HDB estate.
 */
const CAMERA_START: [number, number, number] = [-150, 360, -380];
const CAMERA_START_AZIMUTH = Math.atan2(CAMERA_START[0], CAMERA_START[2]);

/** Labels further out than this are pinned to the edge of the view, with their distance. */
const LABEL_MAX_RADIUS_M = 420;

function useProjector(centre: { lat: number; lng: number } | undefined) {
  return useMemo(() => {
    if (!centre) return null;
    const R = 6371008.8;
    const cosLat = Math.cos((centre.lat * Math.PI) / 180);
    // Returns [east, north] in metres from the plot centre.
    return ([lng, lat]: [number, number]): [number, number] => [
      ((lng - centre.lng) * Math.PI * R * cosLat) / 180,
      ((lat - centre.lat) * Math.PI * R) / 180,
    ];
  }, [centre]);
}

function ringToShape(ring: [number, number][]): THREE.Shape {
  const pts = ring.slice(0, -1).map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.Shape(pts);
}

function Buildings({ data, project }: { data: SiteContext; project: (p: [number, number]) => [number, number] }) {
  const { known, estimated } = useMemo(() => {
    const groups: Record<"known" | "estimated", THREE.BufferGeometry[]> = { known: [], estimated: [] };
    for (const f of data.features) {
      if (f.properties.kind !== "building" || f.geometry.type !== "Polygon") continue;
      const ring = f.geometry.coordinates[0].map(project);
      const geometry = new THREE.ExtrudeGeometry(ringToShape(ring), {
        depth: f.properties.h ?? 9,
        bevelEnabled: false,
      });
      // Shape is drawn in (east, north); extrusion goes along +z. Rotate so height is +y and north is -z.
      geometry.rotateX(-Math.PI / 2);
      groups[f.properties.hs === "estimated" ? "estimated" : "known"].push(geometry);
    }
    const merge = (list: THREE.BufferGeometry[]) => (list.length ? mergeGeometries(list) : null);
    return { known: merge(groups.known), estimated: merge(groups.estimated) };
  }, [data, project]);

  return (
    <>
      {known && (
        <mesh geometry={known} castShadow receiveShadow>
          <meshStandardMaterial color={COLOURS.known} roughness={0.9} />
        </mesh>
      )}
      {estimated && (
        <mesh geometry={estimated} castShadow receiveShadow>
          <meshStandardMaterial color={COLOURS.estimated} roughness={0.9} />
        </mesh>
      )}
    </>
  );
}

function Plot({
  ring,
  statedMaxStoreys,
  metresPerStorey,
  showOutline,
  showLabels,
}: {
  ring: [number, number][];
  statedMaxStoreys: number | null;
  metresPerStorey: number;
  showOutline: boolean;
  showLabels: boolean;
}) {
  const fill = useMemo(() => {
    const geometry = new THREE.ShapeGeometry(ringToShape(ring));
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, [ring]);
  const outline = useMemo(() => ring.map(([x, y]) => [x, 0.6, -y] as [number, number, number]), [ring]);
  const markerHeight = statedMaxStoreys ? statedMaxStoreys * metresPerStorey : 0;

  return (
    <>
      {showOutline && (
        <>
          <mesh geometry={fill} position={[0, 0.3, 0]} receiveShadow>
            <meshStandardMaterial color={COLOURS.plot} transparent opacity={0.22} depthWrite={false} />
          </mesh>
          <Line points={outline} color={COLOURS.plot} lineWidth={3} />
        </>
      )}
      {markerHeight > 0 && (
        <>
          <Line
            points={[
              [0, 0, 0],
              [0, markerHeight, 0],
            ]}
            color={COLOURS.plot}
            lineWidth={2}
            dashed
            dashSize={4}
            gapSize={3}
          />
          {showLabels && (
            <Html position={[0, markerHeight, 0]} center zIndexRange={[20, 0]}>
              <div className="pointer-events-none whitespace-nowrap rounded-md border border-primary-600 bg-white/95 px-2 py-1 text-[11px] font-semibold text-primary-800 shadow-sm">
                Height reference: {statedMaxStoreys} storeys (about {Math.round(markerHeight)} m)
              </div>
            </Html>
          )}
        </>
      )}
    </>
  );
}

const POI_STYLE: Record<NonNullable<ContextFeature["properties"]["cat"]>, string> = {
  rail: "border-blue-600 text-blue-800",
  school: "border-amber-600 text-amber-800",
  expressway: "border-neutral-600 text-neutral-800",
  mall: "border-purple-600 text-purple-800",
};

/** Labels float at different heights by type so neighbouring labels do not sit on top of each other. */
const LABEL_HEIGHT_M: Record<NonNullable<ContextFeature["properties"]["cat"]>, number> = {
  expressway: 6,
  school: 24,
  rail: 32,
  mall: 95,
};

function PoiLabels({ data, project }: { data: SiteContext; project: (p: [number, number]) => [number, number] }) {
  return (
    <>
      {data.features.map((f, i) => {
        if (f.properties.kind !== "poi" || f.geometry.type !== "Point" || !f.properties.cat) return null;
        let [x, y] = project(f.geometry.coordinates);
        const r = Math.hypot(x, y);
        const pinned = r > LABEL_MAX_RADIUS_M;
        // Far-off malls stay in the location facts list; pinning them too crowds the view.
        if (pinned && f.properties.cat === "mall") return null;
        if (pinned) {
          x = (x / r) * LABEL_MAX_RADIUS_M;
          y = (y / r) * LABEL_MAX_RADIUS_M;
        }
        return (
          <Html key={i} position={[x, LABEL_HEIGHT_M[f.properties.cat], -y]} center zIndexRange={[10, 0]}>
            <div
              className={`pointer-events-none whitespace-nowrap rounded-full border bg-white/95 px-2 py-0.5 text-[11px] font-semibold shadow-sm ${POI_STYLE[f.properties.cat]}`}
            >
              {pinned ? "→ " : ""}
              {f.properties.name} · {f.properties.d} m
            </div>
          </Html>
        );
      })}
    </>
  );
}

function SunLight({
  direction,
  up,
  shadows,
  mapSize,
}: {
  direction: [number, number, number];
  up: boolean;
  shadows: boolean;
  mapSize: number;
}) {
  const target = useMemo(() => new THREE.Object3D(), []);
  const distance = 800;
  return (
    <>
      <primitive object={target} />
      <directionalLight
        position={[direction[0] * distance, direction[1] * distance, direction[2] * distance]}
        target={target}
        intensity={up ? 2.4 : 0}
        castShadow={shadows && up}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-450}
        shadow-camera-right={450}
        shadow-camera-top={450}
        shadow-camera-bottom={-450}
        shadow-camera-near={1}
        shadow-camera-far={2000}
        shadow-bias={-0.0005}
      />
      <hemisphereLight args={["#ffffff", "#b9b4aa", up ? 0.9 : 0.5]} />
    </>
  );
}

class ViewerErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ToggleButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        pressed
          ? "border-primary-600 bg-primary-50 text-primary-800"
          : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
      }`}
    >
      {children}
    </button>
  );
}

export default function SiteViewer({ slug, contextUrl, indicativeLabel }: SiteViewerProps) {
  const [data, setData] = useState<SiteContext | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [preset, setPreset] = useState<SunPresetKey>("equinox");
  const [minutes, setMinutes] = useState(9 * 60);
  const [playing, setPlaying] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [mapSize, setMapSize] = useState(2048);
  const compassRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(contextUrl)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: SiteContext) => !cancelled && setData(json))
      .catch(() => !cancelled && setLoadError(true));
    setMapSize(window.innerWidth < 640 ? 1024 : 2048);
    return () => {
      cancelled = true;
    };
  }, [contextUrl]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setMinutes((m) => Math.min(m + 5, MAX_MINUTES)), 90);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (playing && minutes >= MAX_MINUTES) setPlaying(false);
  }, [playing, minutes]);

  const project = useProjector(data?.meta.centre);
  const plotRing = useMemo(() => {
    const plot = data?.features.find((f) => f.properties.kind === "plot");
    if (!plot || plot.geometry.type !== "Polygon" || !project) return null;
    return plot.geometry.coordinates[0].map(project);
  }, [data, project]);

  const presetDef = SUN_PRESETS.find((p) => p.key === preset)!;
  const sun = useMemo(
    () =>
      data
        ? sunState(sgtDate(presetDef.month, presetDef.day, minutes), data.meta.centre.lat, data.meta.centre.lng)
        : null,
    [data, presetDef, minutes],
  );

  const updateCompass = useCallback(() => {
    const controls = controlsRef.current;
    if (controls && compassRef.current) {
      compassRef.current.style.transform = `rotate(${controls.getAzimuthalAngle()}rad)`;
    }
  }, []);

  const choosePreset = (key: SunPresetKey) => {
    setPreset(key);
    trackLaunchEvent("launch_sun_preset", slug, { preset: key });
  };

  const commitSlider = () => trackLaunchEvent("launch_time_slider", slug, { time: formatMinutes(minutes) });

  const fallback = (
    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-neutral-600">
      The 3D site study could not load on this device. The location facts below are measured from the same data.
    </div>
  );

  return (
    <div data-launch-viewer className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <p className="border-b border-neutral-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
        {indicativeLabel}
      </p>

      <div
        data-launch-canvas
        className="relative h-[360px] w-full bg-neutral-100 sm:h-[480px]"
        style={{ touchAction: "none" }}
      >
        {loadError ? (
          fallback
        ) : !data || !project || !plotRing || !sun ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">Loading site study…</div>
        ) : (
          <ViewerErrorBoundary fallback={fallback}>
            <Canvas
              shadows
              frameloop="demand"
              dpr={[1, 1.75]}
              camera={{ position: CAMERA_START, fov: 40, near: 1, far: 5000 }}
              aria-label="Interactive 3D site study"
            >
              <color attach="background" args={["#f4f3ef"]} />
              <SunLight direction={sun.direction} up={sun.up} shadows={showShadows} mapSize={mapSize} />
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[2400, 2400]} />
                <meshStandardMaterial color={COLOURS.ground} roughness={1} />
              </mesh>
              <Line
                points={Array.from({ length: 97 }, (_, i) => {
                  const a = (i / 96) * Math.PI * 2;
                  return [Math.cos(a) * data.meta.radiusM, 0.2, Math.sin(a) * data.meta.radiusM] as [
                    number,
                    number,
                    number,
                  ];
                })}
                color={COLOURS.ring}
                lineWidth={1}
                dashed
                dashSize={6}
                gapSize={6}
              />
              <Buildings data={data} project={project} />
              <Plot
                ring={plotRing}
                statedMaxStoreys={data.meta.statedMaxStoreys}
                metresPerStorey={data.meta.metresPerStorey}
                showOutline={showOutline}
                showLabels={showLabels}
              />
              {showLabels && <PoiLabels data={data} project={project} />}
              <OrbitControls
                ref={controlsRef}
                makeDefault
                enableDamping
                maxPolarAngle={1.45}
                minDistance={80}
                maxDistance={1100}
                onChange={updateCompass}
              />
            </Canvas>
          </ViewerErrorBoundary>
        )}

        <div className="pointer-events-none absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white/90 shadow-sm">
          <div ref={compassRef} className="flex flex-col items-center" style={{ transform: `rotate(${CAMERA_START_AZIMUTH}rad)` }}>
            <span className="text-[10px] font-bold leading-none text-red-600">N</span>
            <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
              <path d="M5 0 L10 16 L5 12 L0 16 Z" fill="#dc2626" />
            </svg>
          </div>
          <span className="sr-only">Compass: the red arrow points north</span>
        </div>
      </div>

      <div data-launch-controls className="space-y-4 border-t border-neutral-200 p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Date">
          {SUN_PRESETS.map((p) => (
            <ToggleButton key={p.key} pressed={preset === p.key} onClick={() => choosePreset(p.key)}>
              {p.label}
            </ToggleButton>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!playing && minutes >= MAX_MINUTES) setMinutes(MIN_MINUTES);
              setPlaying((p) => !p);
            }}
            className="shrink-0 rounded-full bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
            aria-label={playing ? "Pause the sun animation" : "Play the sun across the day"}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <label className="flex min-w-0 flex-1 items-center gap-3">
            <span className="sr-only">Time of day</span>
            <input
              type="range"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              step={5}
              value={minutes}
              onChange={(e) => {
                setPlaying(false);
                setMinutes(Number(e.target.value));
              }}
              onPointerUp={commitSlider}
              onKeyUp={commitSlider}
              className="min-w-0 flex-1 accent-primary-600"
            />
            <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-neutral-900">
              {formatMinutes(minutes)}
            </span>
          </label>
        </div>

        {sun && (
          <p className="text-sm text-neutral-700" aria-live="polite">
            {sun.up
              ? `Sun ${Math.round(sun.altitudeDeg)}° above the horizon, in the ${compassWord(sun.bearingDeg)}. Shadows fall to the ${compassWord(sun.bearingDeg + 180)}.`
              : "The sun is below the horizon at this time."}
          </p>
        )}

        <div className="flex flex-wrap gap-2" role="group" aria-label="Layers">
          <ToggleButton pressed={showOutline} onClick={() => setShowOutline((v) => !v)}>
            Plot outline
          </ToggleButton>
          <ToggleButton pressed={showLabels} onClick={() => setShowLabels((v) => !v)}>
            Labels
          </ToggleButton>
          <ToggleButton pressed={showShadows} onClick={() => setShowShadows((v) => !v)}>
            Shadows
          </ToggleButton>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-600">
          {[
            { colour: COLOURS.known, label: "Height from HDB storeys or OpenStreetMap" },
            { colour: COLOURS.estimated, label: "Height estimated" },
            { colour: COLOURS.plot, label: "Plot (URA Master Plan 2019, indicative)" },
          ].map((item) => (
            <li key={item.label} className="flex min-w-0 items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-sm border border-neutral-300"
                style={{ background: item.colour }}
              />
              <span className="min-w-0">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
