import type { Asset } from "@/lib/atlasData";
import type { LatLngExpression } from "leaflet";
import { Circle, CircleMarker, MapContainer, Polygon, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Globe2, LocateFixed, Search, SquareDashedMousePointer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BasemapMode = "dark" | "streets" | "satellite" | "terrain" | "earth";
type EarthMapProps = { assets: Asset[]; selectedId: string; activeLayers: string[]; onSelect: (asset: Asset) => void };

const tiles: Record<BasemapMode, { label: string; attribution: string; url: string; notice: string }> = {
  dark: { label: "Dark operational", attribution: "© OpenStreetMap contributors © CARTO", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", notice: "Operational dark context with global geographic reference." },
  streets: { label: "Street context", attribution: "© OpenStreetMap contributors", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", notice: "Public street context. Use only with approved assessment boundaries." },
  satellite: { label: "Satellite context", attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", notice: "Public satellite basemap for geographic context only; acquisition dates vary by area." },
  terrain: { label: "Terrain / relief", attribution: "Tiles © Esri — World Shaded Relief", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}", notice: "Relief context for planning. It does not establish access, ownership, or scope." },
  earth: { label: "Earth overview", attribution: "© OpenStreetMap contributors © CARTO", url: "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", notice: "Global Earth overview. Full 3D terrain and building streams are staged for the next module." },
};

const linePairs = [["site-northstar", "edge-helix"], ["edge-helix", "host-203"], ["host-203", "solstice-provider"], ["solstice-provider", "aurora-cloud"], ["aurora-cloud", "api-helix"], ["solstice-provider", "mariner-site"]];
const markerColor = (asset: Asset) => asset.type === "host" ? "#ee7664" : asset.type === "cloud" ? "#9db4ff" : asset.type === "provider" ? "#c3b8a0" : "#e8b760";

function MapInteraction({ aoiMode, onCoordinate, onAoiPoint }: { aoiMode: boolean; onCoordinate: (text: string) => void; onAoiPoint: (point: [number, number]) => void }) {
  useMapEvents({ mousemove(event) { onCoordinate(`${event.latlng.lat.toFixed(4)}°, ${event.latlng.lng.toFixed(4)}°`); }, click(event) { if (aoiMode) onAoiPoint([event.latlng.lat, event.latlng.lng]); } });
  return null;
}

function FlyTo({ target }: { target: Asset | null }) { const map = useMap(); useEffect(() => { if (target) map.flyTo([target.geo.latitude, target.geo.longitude], 6, { duration: 1.1 }); }, [map, target]); return null; }
function FlyToCluster({ members }: { members: Asset[] | null }) { const map = useMap(); useEffect(() => { if (members && members.length > 1) map.fitBounds(members.map((asset) => [asset.geo.latitude, asset.geo.longitude] as [number, number]), { padding: [54, 54], maxZoom: 8, animate: true }); }, [map, members]); return null; }
function ResetView({ revision }: { revision: number }) { const map = useMap(); useEffect(() => { if (revision) map.flyTo([25, 8], 2, { duration: 0.9 }); }, [map, revision]); return null; }

export default function EarthMap({ assets, selectedId, activeLayers, onSelect }: EarthMapProps) {
  const [mode, setMode] = useState<BasemapMode>("dark");
  const [search, setSearch] = useState("");
  const [coordinate, setCoordinate] = useState("—");
  const [aoiMode, setAoiMode] = useState(false);
  const [aoiPoints, setAoiPoints] = useState<[number, number][]>([]);
  const [flyTarget, setFlyTarget] = useState<Asset | null>(null);
  const [clusterFocus, setClusterFocus] = useState<Asset[] | null>(null);
  const [resetRevision, setResetRevision] = useState(0);
  const selected = assets.find((asset) => asset.id === selectedId);
  const selectedTile = tiles[mode];
  const dependencyLines = useMemo(() => linePairs.flatMap(([from, to]) => { const start = assets.find((asset) => asset.id === from); const end = assets.find((asset) => asset.id === to); return start && end ? [[start, end]] : []; }), [assets]);
  const searchResults = search ? assets.filter((asset) => asset.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : [];
  const clusters = useMemo(() => {
    const groups: Asset[][] = [];
    for (const asset of assets) {
      const group = groups.find((items) => {
        const center = items.reduce((total, item) => ({ lat: total.lat + item.geo.latitude, lng: total.lng + item.geo.longitude }), { lat: 0, lng: 0 });
        const lat = center.lat / items.length; const lng = center.lng / items.length;
        return Math.hypot(asset.geo.latitude - lat, asset.geo.longitude - lng) < 3.5;
      });
      if (group) group.push(asset); else groups.push([asset]);
    }
    return groups.filter((group) => group.length > 1).map((group) => ({ group, center: group.reduce((total, item) => ({ lat: total.lat + item.geo.latitude, lng: total.lng + item.geo.longitude }), { lat: 0, lng: 0 }) })).map((entry) => ({ ...entry, center: { lat: entry.center.lat / entry.group.length, lng: entry.center.lng / entry.group.length } }));
  }, [assets]);

  const selectAsset = (asset: Asset) => { onSelect(asset); setFlyTarget(asset); setSearch(""); };

  return <section className="relative min-h-[590px] overflow-hidden rounded-2xl border border-white/10 bg-[#070807] shadow-[0_40px_120px_rgba(0,0,0,.6)]" aria-label="Interactive synthetic Earth assessment map">
    <MapContainer center={[25, 8] as LatLngExpression} zoom={2} minZoom={2} maxZoom={15} zoomControl className="absolute inset-0 z-0 h-full w-full" attributionControl={false}>
      <TileLayer key={mode} url={selectedTile.url} attribution={selectedTile.attribution} />
      <MapInteraction aoiMode={aoiMode} onCoordinate={setCoordinate} onAoiPoint={(point) => setAoiPoints((items) => [...items, point])} />
      <FlyTo target={flyTarget} />
      <FlyToCluster members={clusterFocus} />
      <ResetView revision={resetRevision} />
      {activeLayers.includes("Provider dependencies") && dependencyLines.map(([from, to]) => <Polyline key={`${from.id}-${to.id}`} positions={[[from.geo.latitude, from.geo.longitude], [to.geo.latitude, to.geo.longitude]]} pathOptions={{ color: from.confidence === "inferred" || to.confidence === "inferred" ? "#b6ad9e" : "#e8b760", weight: 1.7, dashArray: "6 6", opacity: 0.78 }} />)}
      {activeLayers.includes("Critical findings") && assets.filter((asset) => asset.criticality >= 7).map((asset) => <Circle key={`risk-${asset.id}`} center={[asset.geo.latitude, asset.geo.longitude]} radius={420000} pathOptions={{ color: asset.criticality >= 9 ? "#ee7664" : "#e8b760", fillColor: asset.criticality >= 9 ? "#ee7664" : "#e8b760", fillOpacity: 0.09, weight: 1, opacity: 0.42 }} />)}
      {activeLayers.includes("Confidence radius") && assets.filter((asset) => asset.confidence === "inferred").map((asset) => <Circle key={`confidence-${asset.id}`} center={[asset.geo.latitude, asset.geo.longitude]} radius={650000} pathOptions={{ color: "#e6cf9b", fillOpacity: 0, dashArray: "5 7", weight: 1.3, opacity: 0.7 }} />)}
      {activeLayers.includes("Asset clusters") && clusters.map((cluster, index) => <CircleMarker key={`cluster-${index}`} center={[cluster.center.lat, cluster.center.lng]} radius={16 + cluster.group.length * 2} pathOptions={{ color: "#fff1cf", fillColor: "#e8b760", fillOpacity: 0.86, weight: 1.4 }} eventHandlers={{ click: () => { setClusterFocus(cluster.group); onSelect(cluster.group[0]); } }}><Tooltip permanent direction="center" className="atlas-leaflet-cluster">{cluster.group.length}</Tooltip><Tooltip direction="top" className="atlas-leaflet-tooltip">{cluster.group.length} nearby synthetic records · select to expand</Tooltip></CircleMarker>)}
      {activeLayers.includes("Assets") && assets.map((asset) => <CircleMarker key={asset.id} center={[asset.geo.latitude, asset.geo.longitude]} radius={asset.id === selectedId ? 10 : 6 + Math.max(0, asset.criticality - 6) * .8} pathOptions={{ color: "#fff4dc", fillColor: markerColor(asset), fillOpacity: asset.id === selectedId ? 1 : 0.9, weight: asset.id === selectedId ? 2.2 : 1.25 }} eventHandlers={{ click: () => selectAsset(asset) }}><Tooltip permanent={asset.id === selectedId} direction={asset.id === selectedId ? "bottom" : "top"} offset={[0, asset.id === selectedId ? 9 : -10]} className={asset.id === selectedId ? "atlas-leaflet-label" : "atlas-leaflet-tooltip"}><b>{asset.name}</b><br/>{asset.type} · {asset.geo.precision}<br/>{asset.id === selectedId ? "Selected intelligence" : "Select for evidence context"}</Tooltip></CircleMarker>)}
      {aoiPoints.length > 2 && <Polygon positions={aoiPoints} pathOptions={{ color: "#f3cc80", fillColor: "#e8b760", fillOpacity: 0.12, dashArray: "5 5" }} />}
    </MapContainer>
    <div className="pointer-events-none absolute inset-0 z-[300] bg-[linear-gradient(180deg,rgba(5,5,4,.42),transparent_23%,transparent_70%,rgba(5,5,4,.50))]" />
    <div className="absolute inset-x-0 top-0 z-[400] flex flex-col gap-3 border-b border-white/10 bg-black/58 px-4 py-3 backdrop-blur-md md:flex-row md:items-center md:justify-between"><div><p className="eyebrow">EARTH / SYNTHETIC GEOSPATIAL MODEL</p><p className="mt-1 text-xs text-white/60">Drag, zoom, and select a real geographic pointer. All entities and coordinates are fictional lab records.</p></div><div className="flex flex-wrap items-center gap-2"><div className="relative"><Search size={13} className="pointer-events-none absolute left-2.5 top-2 text-white/35"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find synthetic asset" className="h-8 w-40 rounded-md border border-white/15 bg-black/45 pl-7 pr-2 text-[11px] text-white placeholder:text-white/35"/>{searchResults.length > 0 && <div className="absolute right-0 top-9 z-[500] w-60 overflow-hidden rounded-lg border border-white/15 bg-[#0d0b08] shadow-2xl">{searchResults.map((asset) => <button key={asset.id} onClick={() => selectAsset(asset)} className="block w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/[.06]">{asset.name}<span className="ml-2 text-[10px] text-[#e8b760]">{asset.type}</span></button>)}</div>}</div><select value={mode} onChange={(event) => setMode(event.target.value as BasemapMode)} className="h-8 rounded-md border border-[#e8b760]/35 bg-[#15110a] px-2 text-[10px] font-semibold tracking-[.08em] text-[#f2cb82]"><option value="dark">DARK OPS</option><option value="streets">STREETS</option><option value="satellite">SATELLITE</option><option value="terrain">TERRAIN</option><option value="earth">EARTH</option></select><button onClick={() => { setAoiMode((state) => !state); if (aoiMode) setAoiPoints([]); }} className={`atlas-icon-button h-8 w-8 ${aoiMode ? "border-[#e8b760] text-[#f2cb82]" : ""}`} aria-label="Toggle area of interest drawing"><SquareDashedMousePointer size={14}/></button><button onClick={() => setResetRevision((value) => value + 1)} className="atlas-icon-button h-8 w-8" aria-label="Reset Earth view"><Globe2 size={14}/></button></div></div>
    <div className="absolute bottom-4 left-4 z-[400] max-w-[315px] rounded-lg border border-white/12 bg-[#080705]/86 p-3 backdrop-blur-md"><p className="eyebrow">MAP STATUS</p><p className="mt-1 text-[11px] leading-5 text-white/66">{aoiMode ? `AOI drawing active · ${aoiPoints.length} vertices · click the map to add points` : selected ? `${selected.name} · ${selected.geo.latitude.toFixed(4)}°, ${selected.geo.longitude.toFixed(4)}° · ${selected.geo.precision}` : "Select a synthetic pointer to inspect provenance and evidence."}</p>{clusterFocus && <div className="mt-2 border-t border-white/10 pt-2"><p className="text-[9px] uppercase tracking-[.12em] text-[#f0c678]">Expanded cluster · {clusterFocus.length} records</p><p className="mt-1 text-[10px] leading-4 text-white/55">{clusterFocus.map((asset) => asset.name).join(" · ")}</p></div>}</div>
    <div className="absolute bottom-4 right-4 z-[400] max-w-[265px] rounded-lg border border-white/12 bg-[#080705]/86 px-3 py-2 text-right backdrop-blur-md"><p className="text-[10px] uppercase tracking-[.14em] text-white/42">Cursor coordinate</p><p className="mt-1 font-mono text-[11px] text-[#f2cb82]">{coordinate}</p><p className="mt-1 text-[9px] leading-4 text-white/42">{selectedTile.label} · {selectedTile.notice}</p></div>
  </section>;
}
