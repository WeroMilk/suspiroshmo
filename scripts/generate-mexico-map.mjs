import fs from 'fs';
import { geoArea, geoMercator, geoPath } from 'd3-geo';

const MEX_BBOX = {
  minLon: -118.6,
  maxLon: -86.4,
  minLat: 14.3,
  maxLat: 32.85,
};

const VIEW = { minX: -20, maxX: 1020, minY: -20, maxY: 700 };
const MIN_RING_AREA = 1e-5; // geo degrees² — drop micro islands

function inMexicoBBox([lon, lat]) {
  return (
    Number.isFinite(lon) &&
    Number.isFinite(lat) &&
    lon >= MEX_BBOX.minLon &&
    lon <= MEX_BBOX.maxLon &&
    lat >= MEX_BBOX.minLat &&
    lat <= MEX_BBOX.maxLat
  );
}

function ringOk(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return false;
  if (!ring.every(inMexicoBBox)) return false;
  // Drop degenerate tiny rings by lon/lat span
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of ring) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return maxLon - minLon > 0.01 || maxLat - minLat > 0.01;
}

function cleanPolygon(coords) {
  const rings = coords.filter(ringOk);
  return rings.length ? rings : null;
}

function cleanMultiPolygon(coords) {
  const polys = coords.map(cleanPolygon).filter(Boolean);
  return polys.length ? polys : null;
}

function cleanFeature(feature) {
  const geom = feature.geometry;
  if (!geom) return null;

  let cleaned = null;
  if (geom.type === 'Polygon') {
    const rings = cleanPolygon(geom.coordinates);
    if (rings) cleaned = { type: 'Polygon', coordinates: rings };
  } else if (geom.type === 'MultiPolygon') {
    const polys = cleanMultiPolygon(geom.coordinates);
    if (polys) cleaned = { type: 'MultiPolygon', coordinates: polys };
  } else {
    return null;
  }

  const next = { ...feature, geometry: cleaned };
  // Drop near-zero area leftovers
  if (Math.abs(geoArea(next)) < MIN_RING_AREA) return null;
  return next;
}

/** Decimate ring points keeping endpoints — no turf simplify artifacts */
function decimateRing(ring, step) {
  if (ring.length <= 8) return ring;
  const out = [];
  for (let i = 0; i < ring.length - 1; i += step) out.push(ring[i]);
  const last = ring[ring.length - 1];
  const first = out[0];
  if (last[0] !== first[0] || last[1] !== first[1]) out.push(last);
  else out.push(first);
  return out.length >= 4 ? out : ring;
}

function decimateGeometry(geom, step) {
  if (geom.type === 'Polygon') {
    return { type: 'Polygon', coordinates: geom.coordinates.map((r) => decimateRing(r, step)) };
  }
  return {
    type: 'MultiPolygon',
    coordinates: geom.coordinates.map((poly) => poly.map((r) => decimateRing(r, step))),
  };
}

function pathWithinView(d) {
  if (!d) return false;
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  for (let i = 0; i < nums.length; i += 1) {
    // path commands mix x/y; check absolute extremes loosely
    if (Math.abs(nums[i]) > 5000) return false;
  }
  // Sample every pair-ish by checking max/min of all numbers
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  return max < VIEW.maxX + 200 && min > VIEW.minY - 200 && max < 2000 && min > -500;
}

const raw = JSON.parse(fs.readFileSync('scripts/data/mexico.geojson', 'utf8'));

const cleanedFeatures = raw.features
  .map(cleanFeature)
  .filter(Boolean)
  .map((f) => ({
    ...f,
    geometry: decimateGeometry(f.geometry, 8),
  }));

const cleaned = { type: 'FeatureCollection', features: cleanedFeatures };
console.log('cleaned features', cleaned.features.length, 'from', raw.features.length);

const projection = geoMercator().fitExtent([[36, 30], [964, 640]], cleaned);
const path = geoPath(projection).digits(1);

const nameMap = {
  Mexico: 'Estado de México',
  México: 'Estado de México',
  'Distrito Federal': 'Ciudad de México',
  Michoacan: 'Michoacán',
  'Michoacán de Ocampo': 'Michoacán',
  'Nuevo Leon': 'Nuevo León',
  Queretaro: 'Querétaro',
  'San Luis Potosi': 'San Luis Potosí',
  Yucatan: 'Yucatán',
  'Coahuila de Zaragoza': 'Coahuila',
  'Veracruz de Ignacio de la Llave': 'Veracruz',
};

const storeStates = new Set([
  'Baja California',
  'Baja California Sur',
  'Sonora',
  'Coahuila',
  'Nuevo León',
  'Querétaro',
]);

const states = cleaned.features
  .map((f) => {
    const id = nameMap[f.properties.name] || f.properties.name;
    const d = path(f);
    if (!d || !pathWithinView(d)) {
      console.warn('dropped bad path', id, d?.slice(0, 80));
      return null;
    }
    return { id, d, hasStore: storeStates.has(id) };
  })
  .filter(Boolean)
  .sort((a, b) => a.id.localeCompare(b.id, 'es'));

const cities = {
  Hermosillo: [-110.9559, 29.0729],
  Mexicali: [-115.4523, 32.6245],
  Tijuana: [-117.0382, 32.5149],
  Saltillo: [-100.9737, 25.4383],
  Monterrey: [-100.3161, 25.6866],
  'San José del Cabo': [-109.7024, 23.0637],
  Querétaro: [-100.3899, 20.5888],
};

const pins = Object.fromEntries(
  Object.entries(cities).map(([city, ll]) => {
    const [x, y] = projection(ll);
    return [city, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }];
  }),
);

const saguaroLLs = [
  [-112.2, 30.1],
  [-111.4, 29.4],
  [-113.0, 28.6],
  [-114.2, 31.2],
  [-110.2, 30.5],
  [-112.8, 27.2],
  [-111.0, 28.3],
];
const saguaros = saguaroLLs.map((ll, i) => {
  const [x, y] = projection(ll);
  return {
    x: Math.round(x),
    y: Math.round(y),
    scale: [0.85, 0.62, 0.48, 0.55, 0.42, 0.5, 0.36][i],
    delay: i * 0.25,
  };
});

const out = `/* Auto-generated by scripts/generate-mexico-map.mjs — do not edit by hand */
export const mexicoViewBox = "0 0 1000 680";
export const mexicoStates = ${JSON.stringify(states)} as const;
export const storePins = ${JSON.stringify(pins)} as const;
export const saguaroPoints = ${JSON.stringify(saguaros)} as const;
`;

fs.writeFileSync('src/mexicoPaths.ts', out);

// Sanity: no wild coords in any path
let bad = 0;
for (const s of states) {
  if (/8915|-1806|6432|-4288/.test(s.d) || !pathWithinView(s.d)) {
    console.error('INVALID', s.id);
    bad += 1;
  }
}

console.log('states', states.length, 'chars', out.length, 'bad', bad);
console.log('pins', pins);
console.log(
  'store states',
  states.filter((s) => s.hasStore).map((s) => s.id),
);
if (bad > 0) process.exit(1);
