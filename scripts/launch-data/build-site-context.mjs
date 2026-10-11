#!/usr/bin/env node
/**
 * Build the 3D site context and measured location facts for one launch review.
 *
 * Usage:
 *   node scripts/launch-data/build-site-context.mjs <slug>
 *
 * Reads:  lib/data/launches/<slug>.ts (via Node's TypeScript type stripping)
 * Writes: public/launch-data/<slug>/context.geojson   (geometry for the 3D viewer)
 *         lib/data/launches/measured/<slug>.json      (distances shown on the page)
 *
 * Both outputs are committed, so the live site never calls these APIs. Large downloads are
 * cached in .cache/launch-data/ (gitignored). Delete that folder to force fresh data.
 *
 * Sources:
 *   - Plot boundary: URA Master Plan 2019 Land Use layer, data.gov.sg (Singapore Open Data Licence)
 *   - Surrounding buildings, rail stations, malls, expressways: OpenStreetMap via Overpass (ODbL)
 *   - HDB block storeys: HDB Property Information, data.gov.sg (Singapore Open Data Licence)
 *   - Primary schools: MOE General information of schools, data.gov.sg; geocoded with SLA OneMap
 *   - Walking distances: OpenStreetMap foot router (FOSSGIS, routing.openstreetmap.de)
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CACHE_DIR = join(ROOT, ".cache", "launch-data");
const USER_AGENT = "homeup.sg launch site study (https://homeup.sg)";

const DATASETS = {
  masterPlan2019: "d_90d86daa5bfaa371668b84fa5f01424f",
  hdbProperty: "d_17f5382f26140b1fdae0ba2ef6239d2f",
  moeSchools: "d_688b934f82c1059ed0a6993d2a829089",
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const FOOT_ROUTER = "https://routing.openstreetmap.de/routed-foot/route/v1/driving";

/** Stated on the page: HDB storeys and OSM building:levels are converted at 3.0 m per storey. */
const METRES_PER_STOREY = 3.0;
/** Stated on the page: walking minutes assume 80 m per minute (about 4.8 km/h). */
const WALK_METRES_PER_MIN = 80;
/** Height used when OSM has no height or levels and the block is not in the HDB dataset. */
const ESTIMATED_HEIGHT_M = { small: 4, default: 9 };

const POI_RADIUS_M = 3000;
const SCHOOL_OUTER_M = 2000;
const SCHOOL_INNER_M = 1000;

// ── helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function log(message) {
  console.log(`[launch-data] ${message}`);
}

async function fetchWithRetry(url, init = {}, { tries = 3, label = url } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "User-Agent": USER_AGENT, ...(init.headers ?? {}) },
      });
      if (res.ok) return res;
      lastError = new Error(`${label}: HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(1500 * attempt);
  }
  throw lastError;
}

function cachePath(name) {
  mkdirSync(CACHE_DIR, { recursive: true });
  return join(CACHE_DIR, name);
}

async function downloadDataGovSg(datasetId, fileName) {
  const target = cachePath(fileName);
  if (existsSync(target) && statSync(target).size > 0) return target;
  log(`downloading ${fileName} from data.gov.sg`);
  const poll = await fetchWithRetry(
    `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/poll-download`,
    {},
    { label: `data.gov.sg ${datasetId}` },
  );
  const { data } = await poll.json();
  if (!data?.url) throw new Error(`data.gov.sg gave no download URL for ${datasetId}`);
  const file = await fetchWithRetry(data.url, {}, { label: fileName });
  writeFileSync(target, Buffer.from(await file.arrayBuffer()));
  return target;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

// ── geometry (local metres around the plot centre) ───────────────────────────

const EARTH_R = 6371008.8;

function makeProjector(centre) {
  const cosLat = Math.cos((centre.lat * Math.PI) / 180);
  return ([lng, lat]) => [
    ((lng - centre.lng) * Math.PI * EARTH_R * cosLat) / 180,
    ((lat - centre.lat) * Math.PI * EARTH_R) / 180,
  ];
}

function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

function ringAreaM2(ring, project) {
  const pts = ring.map(project);
  let sum = 0;
  for (let i = 0; i < pts.length - 1; i++) sum += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
  return Math.abs(sum / 2);
}

function ringCentroid(ring) {
  // Area-weighted centroid in lng/lat (fine at plot scale).
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  a /= 2;
  return { lng: cx / (6 * a), lat: cy / (6 * a) };
}

function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distanceToPolylineM(point, coords, project) {
  const [px, py] = project([point.lng, point.lat]);
  let best = Infinity;
  let bestPoint = null;
  const pts = coords.map(project);
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    const qx = ax + t * dx;
    const qy = ay + t * dy;
    const d = Math.hypot(px - qx, py - qy);
    if (d < best) {
      best = d;
      const [lngA, latA] = coords[i];
      const [lngB, latB] = coords[i + 1];
      bestPoint = { lng: lngA + t * (lngB - lngA), lat: latA + t * (latB - latA) };
    }
  }
  return { distance: best, nearest: bestPoint };
}

const round6 = (n) => Math.round(n * 1e6) / 1e6;
const roundTo = (n, step) => Math.round(n / step) * step;

// ── sources ──────────────────────────────────────────────────────────────────

async function loadLaunch(slug) {
  const file = join(ROOT, "lib", "data", "launches", `${slug}.ts`);
  if (!existsSync(file)) throw new Error(`No data file at lib/data/launches/${slug}.ts`);
  const mod = await import(pathToFileURL(file).href);
  return mod.default;
}

async function findPlotBoundary(launch) {
  const file = await downloadDataGovSg(DATASETS.masterPlan2019, "mp2019-land-use.geojson");
  log("reading Master Plan 2019 land use layer");
  const gj = JSON.parse(readFileSync(file, "utf8"));
  const pick = [launch.site.boundary.pickPoint.lng, launch.site.boundary.pickPoint.lat];
  for (const feature of gj.features) {
    const g = feature.geometry;
    if (!g) continue;
    const polygons = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const polygon of polygons) {
      const outer = polygon[0].map(([x, y]) => [x, y]);
      if (pointInRing(pick, outer)) {
        return {
          ring: outer,
          landUse: feature.properties.LU_DESC ?? "",
          grossPlotRatio: String(feature.properties.GPR ?? ""),
        };
      }
    }
  }
  throw new Error("No Master Plan polygon contains the pickPoint. Check site.boundary.pickPoint.");
}

async function overpass(query) {
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetchWithRetry(
        endpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
        },
        { tries: 2, label: `Overpass ${endpoint}` },
      );
      const text = await res.text();
      if (text.trimStart().startsWith("{")) return JSON.parse(text);
      lastError = new Error(`Overpass ${endpoint} returned non-JSON`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function wayRing(element) {
  if (element.type === "way" && element.geometry) {
    return element.geometry.map((p) => [p.lon, p.lat]);
  }
  if (element.type === "relation" && element.members) {
    const outer = element.members.find((m) => m.role === "outer" && m.geometry);
    return outer ? outer.geometry.map((p) => [p.lon, p.lat]) : null;
  }
  return null;
}

function elementPoint(element) {
  if (element.type === "node") return { lat: element.lat, lng: element.lon };
  const ring = wayRing(element);
  if (!ring || ring.length < 2) return null;
  const lng = ring.reduce((s, p) => s + p[0], 0) / ring.length;
  const lat = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  return { lat, lng };
}

const STREET_ABBREVIATIONS = {
  AVENUE: "AVE",
  ROAD: "RD",
  STREET: "ST",
  DRIVE: "DR",
  CLOSE: "CL",
  CRESCENT: "CRES",
  BUKIT: "BT",
  JALAN: "JLN",
  LORONG: "LOR",
  NORTH: "NTH",
  SOUTH: "STH",
  CENTRAL: "CTRL",
  PLACE: "PL",
  TERRACE: "TER",
  HEIGHTS: "HTS",
  UPPER: "UPP",
  TANJONG: "TG",
  KAMPONG: "KG",
  GARDENS: "GDNS",
  COMMONWEALTH: "C'WEALTH",
};

function hdbKey(block, street) {
  const normalisedStreet = street
    .toUpperCase()
    .split(/\s+/)
    .map((word) => STREET_ABBREVIATIONS[word] ?? word)
    .join(" ")
    .replace(/[^A-Z0-9' ]/g, "");
  return `${block.toUpperCase().trim()}|${normalisedStreet}`;
}

async function loadHdbStoreys() {
  const file = await downloadDataGovSg(DATASETS.hdbProperty, "hdb-property-information.csv");
  const rows = parseCsv(readFileSync(file, "utf8"));
  const map = new Map();
  for (const row of rows) {
    const storeys = Number(row.max_floor_lvl);
    if (row.blk_no && row.street && storeys > 0) map.set(hdbKey(row.blk_no, row.street), storeys);
  }
  return map;
}

async function loadPrimarySchools(centre) {
  const file = await downloadDataGovSg(DATASETS.moeSchools, "moe-schools.csv");
  const rows = parseCsv(readFileSync(file, "utf8")).filter(
    (r) => r.mainlevel_code === "PRIMARY" || r.mainlevel_code === "MIXED LEVELS",
  );

  const geocodeCacheFile = cachePath("onemap-postal-geocode.json");
  const geocodeCache = existsSync(geocodeCacheFile)
    ? JSON.parse(readFileSync(geocodeCacheFile, "utf8"))
    : {};

  const schools = [];
  for (const row of rows) {
    const postal = row.postal_code.padStart(6, "0");
    if (!(postal in geocodeCache)) {
      const res = await fetchWithRetry(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postal}&returnGeom=Y&getAddrDetails=N&pageNum=1`,
        {},
        { label: `OneMap ${postal}` },
      );
      const json = await res.json();
      const hit = json.results?.[0];
      geocodeCache[postal] = hit ? { lat: Number(hit.LATITUDE), lng: Number(hit.LONGITUDE) } : null;
      await sleep(300);
    }
    const point = geocodeCache[postal];
    if (!point) continue;
    schools.push({
      name: titleCase(row.school_name),
      mixedLevels: row.mainlevel_code === "MIXED LEVELS",
      point,
      straightM: haversineM(centre, point),
    });
  }
  writeFileSync(geocodeCacheFile, JSON.stringify(geocodeCache));
  return schools.sort((a, b) => a.straightM - b.straightM);
}

function titleCase(name) {
  return name
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/'S\b/g, "'s")
    .replace(/\bChij\b/g, "CHIJ");
}

async function walkingRoute(from, to) {
  const url = `${FOOT_ROUTER}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
  try {
    const res = await fetchWithRetry(url, {}, { label: "foot router" });
    const json = await res.json();
    const route = json.routes?.[0];
    await sleep(1000);
    if (!route) return null;
    const walkM = roundTo(route.distance, 10);
    return { walkM, walkMin: Math.max(1, Math.round(route.distance / WALK_METRES_PER_MIN)) };
  } catch (error) {
    log(`foot router failed (${error.message}); walking distance left blank`);
    return null;
  }
}

function railLabel(tags) {
  const isLrt = tags.station === "light_rail" || /LRT/i.test(tags.network ?? "");
  const base = (tags["name:en"] ?? tags.name ?? "")
    .replace(/\s+(MRT|LRT)\s+Station$/i, "")
    .replace(/\s+Station$/i, "");
  const ref = tags.ref ? ` (${tags.ref.replace(/;/g, "/")})` : "";
  return `${base} ${isLrt ? "LRT" : "MRT"}${ref}`;
}

function isRailStation(tags) {
  if (tags.railway !== "station") return false;
  if (tags.station === "subway" || tags.station === "light_rail") return true;
  return /MRT|LRT|SMRT|SBS/i.test(`${tags.network ?? ""} ${tags.operator ?? ""}`);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: node scripts/launch-data/build-site-context.mjs <slug>");
    process.exit(1);
  }

  const launch = await loadLaunch(slug);
  log(`building ${launch.name}`);

  // 1. Plot boundary and centre
  const boundary = await findPlotBoundary(launch);
  const centre = ringCentroid(boundary.ring);
  const project = makeProjector(centre);
  const areaSqm = ringAreaM2(boundary.ring, project);
  const stated = launch.site.boundary.statedAreaSqm;
  log(
    `plot: ${boundary.landUse}, GPR ${boundary.grossPlotRatio}, ${Math.round(areaSqm)} sqm ` +
      `(tender states ${stated} sqm, ${(((areaSqm - stated) / stated) * 100).toFixed(1)}% difference)`,
  );

  // 2. Surrounding buildings
  const radius = launch.site.contextRadiusM;
  log(`fetching OSM buildings within ${radius} m`);
  const buildingsJson = await overpass(
    `[out:json][timeout:90];(way["building"](around:${radius},${centre.lat},${centre.lng});relation["building"](around:${radius},${centre.lat},${centre.lng}););out body geom;`,
  );
  const hdbStoreys = await loadHdbStoreys();

  const counts = { total: 0, hdbMatched: 0, osmHeight: 0, estimated: 0 };
  const buildingFeatures = [];
  for (const element of buildingsJson.elements) {
    const ring = wayRing(element);
    if (!ring || ring.length < 4) continue;
    const tags = element.tags ?? {};
    if (tags.building === "construction" || tags.building === "no") continue;
    const c = ringCentroid(ring);
    if (Number.isFinite(c.lng) && pointInRing([c.lng, c.lat], boundary.ring)) continue;

    let height;
    let heightSource;
    const block = tags["addr:housenumber"];
    const street = tags["addr:street"];
    const hdb = block && street ? hdbStoreys.get(hdbKey(block, street)) : undefined;
    if (hdb) {
      height = hdb * METRES_PER_STOREY;
      heightSource = "hdb";
      counts.hdbMatched++;
    } else if (tags.height && Number.parseFloat(tags.height) > 0) {
      height = Number.parseFloat(tags.height);
      heightSource = "osm";
      counts.osmHeight++;
    } else if (tags["building:levels"] && Number.parseFloat(tags["building:levels"]) > 0) {
      height = Number.parseFloat(tags["building:levels"]) * METRES_PER_STOREY;
      heightSource = "osm";
      counts.osmHeight++;
    } else {
      const small = ringAreaM2(ring, project) < 150 || ["roof", "shelter", "carport", "kiosk"].includes(tags.building);
      height = small ? ESTIMATED_HEIGHT_M.small : ESTIMATED_HEIGHT_M.default;
      heightSource = "estimated";
      counts.estimated++;
    }
    counts.total++;

    buildingFeatures.push({
      type: "Feature",
      properties: {
        kind: "building",
        h: Math.round(height * 10) / 10,
        hs: heightSource,
        ...(hdb ? { name: `Blk ${block}` } : tags.name ? { name: tags.name } : {}),
      },
      geometry: { type: "Polygon", coordinates: [ring.map(([x, y]) => [round6(x), round6(y)])] },
    });
  }
  log(
    `buildings: ${counts.total} (HDB storeys ${counts.hdbMatched}, OSM height ${counts.osmHeight}, estimated ${counts.estimated})`,
  );

  // 3. Rail, malls, expressways
  log(`fetching OSM rail stations, malls and expressways within ${POI_RADIUS_M} m`);
  const poiJson = await overpass(
    `[out:json][timeout:90];(` +
      `node["railway"="station"](around:${POI_RADIUS_M},${centre.lat},${centre.lng});` +
      `node["railway"="subway_entrance"](around:${POI_RADIUS_M},${centre.lat},${centre.lng});` +
      `nwr["shop"="mall"](around:${POI_RADIUS_M},${centre.lat},${centre.lng});` +
      `way["highway"="motorway"](around:${POI_RADIUS_M},${centre.lat},${centre.lng});` +
      `);out body geom;`,
  );

  const stations = [];
  const entrances = [];
  const malls = [];
  const motorways = [];
  for (const element of poiJson.elements) {
    const tags = element.tags ?? {};
    if (tags.railway === "station" && isRailStation(tags)) {
      stations.push({ name: railLabel(tags), point: { lat: element.lat, lng: element.lon } });
    } else if (tags.railway === "subway_entrance") {
      entrances.push({ lat: element.lat, lng: element.lon });
    } else if (tags.shop === "mall" && tags.name) {
      const point = elementPoint(element);
      if (point) malls.push({ name: tags.name, point });
    } else if (tags.highway === "motorway" && element.geometry) {
      motorways.push({
        name: tags.name ? `${tags.name}${tags.ref ? ` (${tags.ref})` : ""}` : (tags.ref ?? "Expressway"),
        ref: tags.ref ?? tags.name ?? "",
        coords: element.geometry.map((p) => [p.lon, p.lat]),
      });
    }
  }

  // De-duplicate stations by label (interchanges can have several nodes).
  const stationByName = new Map();
  for (const station of stations) {
    const d = haversineM(centre, station.point);
    const existing = stationByName.get(station.name);
    if (!existing || d < existing.straightM) stationByName.set(station.name, { ...station, straightM: d });
  }
  const nearestStations = [...stationByName.values()].sort((a, b) => a.straightM - b.straightM).slice(0, 3);

  const rail = [];
  for (const station of nearestStations) {
    const nearbyEntrances = entrances.filter((e) => haversineM(e, station.point) < 250);
    const target =
      nearbyEntrances.sort((a, b) => haversineM(centre, a) - haversineM(centre, b))[0] ?? station.point;
    const walk = station.straightM < 2500 ? await walkingRoute(centre, target) : null;
    rail.push({ name: station.name, straightM: roundTo(station.straightM, 10), ...(walk ?? {}), point: station.point });
  }

  const mallByName = new Map();
  for (const mall of malls) {
    const d = haversineM(centre, mall.point);
    const existing = mallByName.get(mall.name);
    if (!existing || d < existing.straightM) mallByName.set(mall.name, { ...mall, straightM: d });
  }
  const nearestMalls = [...mallByName.values()].sort((a, b) => a.straightM - b.straightM).slice(0, 3);
  const mallFacts = [];
  for (const mall of nearestMalls) {
    const walk = mall.straightM < 2000 ? await walkingRoute(centre, mall.point) : null;
    mallFacts.push({ name: mall.name, straightM: roundTo(mall.straightM, 10), ...(walk ?? {}), point: mall.point });
  }

  const expresswayByRef = new Map();
  for (const motorway of motorways) {
    const { distance, nearest } = distanceToPolylineM(centre, motorway.coords, project);
    const existing = expresswayByRef.get(motorway.ref);
    if (!existing || distance < existing.straightM) {
      expresswayByRef.set(motorway.ref, { name: motorway.name, straightM: distance, point: nearest });
    }
  }
  const expressways = [...expresswayByRef.values()]
    .sort((a, b) => a.straightM - b.straightM)
    .slice(0, 2)
    .map((e) => ({ ...e, straightM: roundTo(e.straightM, 10) }));

  // 4. Schools
  log("loading MOE school list (geocoding postcodes with OneMap, cached)");
  const schools = await loadPrimarySchools(centre);
  const schoolFact = (s) => ({
    name: s.mixedLevels ? `${s.name} (mixed levels)` : s.name,
    straightM: roundTo(s.straightM, 10),
  });
  const schoolsWithin1km = schools.filter((s) => s.straightM <= SCHOOL_INNER_M);
  const schools1to2km = schools.filter((s) => s.straightM > SCHOOL_INNER_M && s.straightM <= SCHOOL_OUTER_M);

  // 5. Nearest rail for comparison columns
  const allStations = [...stationByName.values()];
  const comparisonNearestRail = {};
  for (const column of launch.comparison.columns) {
    if (!column.coords) continue;
    const ranked = allStations
      .map((s) => ({ name: s.name, straightM: haversineM(column.coords, s.point) }))
      .sort((a, b) => a.straightM - b.straightM);
    if (ranked[0]) comparisonNearestRail[column.key] = { name: ranked[0].name, straightM: roundTo(ranked[0].straightM, 10) };
  }

  // 6. Write outputs
  const asOf = new Date().toISOString().slice(0, 10);
  const strip = ({ point, ...rest }) => rest;

  const poi = (cat, item) => ({
    type: "Feature",
    properties: { kind: "poi", cat, name: item.name, d: item.straightM },
    geometry: { type: "Point", coordinates: [round6(item.point.lng), round6(item.point.lat)] },
  });

  const context = {
    type: "FeatureCollection",
    meta: {
      slug,
      generatedAt: asOf,
      centre: { lat: round6(centre.lat), lng: round6(centre.lng) },
      radiusM: radius,
      metresPerStorey: METRES_PER_STOREY,
      statedMaxStoreys: launch.statedMaxStoreys,
      attribution: [
        "© OpenStreetMap contributors (ODbL)",
        "URA Master Plan 2019 Land Use layer, HDB Property Information and MOE General information of schools, data.gov.sg, Singapore Open Data Licence",
        "School locations geocoded with SLA OneMap",
      ],
    },
    features: [
      {
        type: "Feature",
        properties: { kind: "plot", landUse: boundary.landUse, gpr: boundary.grossPlotRatio, areaSqm: Math.round(areaSqm) },
        geometry: { type: "Polygon", coordinates: [boundary.ring.map(([x, y]) => [round6(x), round6(y)])] },
      },
      ...buildingFeatures,
      ...rail.slice(0, 2).map((r) => poi("rail", r)),
      ...expressways.slice(0, 1).map((e) => poi("expressway", e)),
      ...schoolsWithin1km.map((s) => poi("school", { ...schoolFact(s), point: s.point })),
      ...mallFacts.slice(0, 2).map((m) => poi("mall", m)),
    ],
  };

  const measured = {
    slug,
    generatedAt: asOf,
    centre: { lat: round6(centre.lat), lng: round6(centre.lng) },
    boundary: {
      areaSqm: Math.round(areaSqm),
      statedAreaSqm: stated,
      landUse: boundary.landUse,
      grossPlotRatio: boundary.grossPlotRatio,
    },
    rail: rail.map(strip),
    expressways: expressways.map(strip),
    schoolsWithin1km: schoolsWithin1km.map(schoolFact),
    schools1to2km: schools1to2km.map(schoolFact),
    malls: mallFacts.map(strip),
    comparisonNearestRail,
    buildings: counts,
  };

  const contextDir = join(ROOT, "public", "launch-data", slug);
  mkdirSync(contextDir, { recursive: true });
  const contextFile = join(contextDir, "context.geojson");
  writeFileSync(contextFile, JSON.stringify(context));

  const measuredDir = join(ROOT, "lib", "data", "launches", "measured");
  mkdirSync(measuredDir, { recursive: true });
  writeFileSync(join(measuredDir, `${slug}.json`), `${JSON.stringify(measured, null, 2)}\n`);

  const sizeKb = statSync(contextFile).size / 1024;
  log(`wrote public/launch-data/${slug}/context.geojson (${sizeKb.toFixed(0)} KB)`);
  log(`wrote lib/data/launches/measured/${slug}.json`);
  if (sizeKb > 2048) log("WARNING: context.geojson is over 2 MB; reduce contextRadiusM");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
