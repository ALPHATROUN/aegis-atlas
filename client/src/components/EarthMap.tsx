import type { Asset } from "@/lib/atlasData";
import { syntheticLineOfSightContext, type GeoPoint, type RestoredAoi } from "@/lib/gisWorkspace";
import { filterSyntheticMapAssets, syntheticScopeZones } from "@/lib/spatialControls";
import { MapFilterStatus } from "@/components/MapFilterStatus";
import type { LatLngExpression } from "leaflet";
import { Circle, CircleMarker, MapContainer, Polygon, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Globe2, Search, SquareDashedMousePointer, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BasemapMode = "dark" | "streets" | "satellite" | "terrain" | "earth";
type EarthMapProps = {
  assets: Asset[];
  selectedId: string;
  activeLayers: string[];
  onSelect: (asset: Asset) => void;
  persistedAois?: RestoredAoi[];
  onSaveAoi?: (points: GeoPoint[]) => void;
};

const tiles: Record<BasemapMode, { label: string; attribution: string; url: string; notice: string }> = {
  dark: { label: "Dark operational", attribution: "© OpenStreetMap contributors © CARTO", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", notice: "Operational dark context with global geographic reference." },
  streets: { label: "Street context", attribution: "© OpenStreetMap contributors", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", notice: "Public street context. Use only with approved assessment boundaries." },
  satellite: { label: "Satellite context", attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", notice: "Public satellite basemap for geographic context only; acquisition dates vary by area." },
  terrain: { label: "Terrain / relief", attribution: "Tiles © Esri — World Shaded Relief", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}", notice: "Relief context for planning. It does not establish access, ownership, or scope." },
  earth: { label: "Earth overview", attribution: "© OpenStreetMap contributors © CARTO", url: "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", notice: "Global Earth overview. A bounded synthetic local-terrain perspective is available in the workspace, not a remote building stream." },
};

const linePairs = [["site-northstar", "edge-helix"], ["edge-helix", "host-203"], ["host-203", "solstice-provider"], ["solstice-provider", "aurora-cloud"], ["aurora-cloud", "api-helix"], ["solstice-provider", "mariner-site"]];
const markerColor = (asset: Asset) => asset.type === "host" ? "#ee7664" : asset.type === "cloud" ? "#9db4ff" : asset.type === "provider" ? "#c3b8a0" : "#e8b760";

function MapInteraction({ aoiMode, onCoordinate, onAoiPoint }: { aoiMode: boolean; onCoordinate: (text: string) => void; onAoiPoint: (point: GeoPoint) => void }) {
  useMapEvents({ mousemove(event) { onCoordinate(`${event.latlng.lat.toFixed(4)}°, ${event.latlng.lng.toFixed(4)}°`); }, click(event) { if (aoiMode) onAoiPoint([event.latlng.lat, event.latlng.lng]); } });
  return null;
}

function FlyTo({ target, revision }: { target: Asset | null; revision: number }) { const map = useMap(); useEffect(() => { if (target) map.flyTo([target.geo.latitude, target.geo.longitude], 6, { duration: 1.1 }); }, [map, revision, target]); return null; }
function FlyToCluster({ members }: { members: Asset[] | null }) { const map = useMap(); useEffect(() => { if (members && members.length > 1) map.fitBounds(members.map((asset) => [asset.geo.latitude, asset.geo.longitude] as [number, number]), { padding: [54, 54], maxZoom: 8, animate: true }); }, [map, members]); return null; }
function ResetView({ revision }: { revision: number }) { const map = useMap(); useEffect(() => { if (revision) map.flyTo([25, 8], 2, { duration: 0.9 }); }, [map, revision]); return null; }

export default function EarthMap({ assets, selectedId, activeLayers, onSelect, persistedAois = [], onSaveAoi }: EarthMapProps) {
  const [mode, setMode] = useState<BasemapMode>("dark");
  const [search, setSearch] = useState("");
  const [coordinate, setCoordinate] = useState("—");
  const [aoiMode, setAoiMode] = useState(false);
  const [aoiPoints, setAoiPoints] = useState<GeoPoint[]>([]);
  const [bufferKm, setBufferKm] = useState(25);
  const [heatmap, setHeatmap] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [showLineOfSight, setShowLineOfSight] = useState(false);
  const [timeRange, setTimeRange] = useState<"30" | "60" | "all">("all");
  const [scopeOnly, setScopeOnly] = useState(false);
  const [flyTarget, setFlyTarget] = useState<Asset | null>(null);
  const [focusRevision, setFocusRevision] = useState(0);
  const [clusterFocus, setClusterFocus] = useState<Asset[] | null>(null);
  const [resetRevision, setResetRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const mapAssets = useMemo(() => filterSyntheticMapAssets(assets, { timeRange, scopeOnly }), [assets, scopeOnly, timeRange]);
  const selected = assets.find((asset) => asset.id === selectedId);
  const selectedTile = tiles[mode];
  const dependencyLines = useMemo(() => linePairs.flatMap(([from, to]) => { const start = mapAssets.find((asset) => asset.id === from); const end = mapAssets.find((asset) => asset.id === to); return start && end ? [[start, end]] : []; }), [mapAssets]);
  const nearest = useMemo(() => selected ? mapAssets.filter((asset) => asset.id !== selected.id).map((asset) => ({ asset, km: 6371 * 2 * Math.asin(Math.sqrt(Math.sin(((asset.geo.latitude - selected.geo.latitude) * Math.PI / 180) / 2) ** 2 + Math.cos(selected.geo.latitude * Math.PI / 180) * Math.cos(asset.geo.latitude * Math.PI / 180) * Math.sin(((asset.geo.longitude - selected.geo.longitude) * Math.PI / 180) / 2) ** 2)) })).sort((a, b) => a.km - b.km)[0] : undefined, [mapAssets, selected]);
  const searchResults = search ? mapAssets.filter((asset) => asset.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : [];
  const clusters = useMemo(() => {
    const groups: Asset[][] = [];
    for (const asset of mapAssets) {
      const group = groups.find((items) => {
        const center = items.reduce((total, item) => ({ lat: total.lat + item.geo.latitude, lng: total.lng + item.geo.longitude }), { lat: 0, lng: 0 });
        const lat = center.lat / items.length; const lng = center.lng / items.length;
        return Math.hypot(asset.geo.latitude - lat, asset.geo.longitude - lng) < 3.5;
      });
      if (group) group.push(asset); else groups.push([asset]);
    }
    return groups.filter((group) => group.length > 1).map((group) => ({ group, center: group.reduce((total, item) => ({ lat: total.lat + item.geo.latitude, lng: total.lng + item.geo.longitude }), { lat: 0, lng: 0 }) })).map((entry) => ({ ...entry, center: { lat: entry.center.lat / entry.group.length, lng: entry.center.lng / entry.group.length } }));
  }, [mapAssets]);
  const regions = useMemo(() => {
    const buckets = new Map<string, Asset[]>();
    mapAssets.forEach((asset) => {
      const key = `${asset.geo.latitude >= 0 ? "N" : "S"}${Math.floor(Math.abs(asset.geo.latitude) / 20) * 20} · ${asset.geo.longitude >= 0 ? "E" : "W"}${Math.floor(Math.abs(asset.geo.longitude) / 30) * 30}`;
      buckets.set(key, [...(buckets.get(key) ?? []), asset]);
    });
    return Array.from(buckets.entries()).map(([label, members]: [string, Asset[]]) => ({ label, members, latitude: members.reduce((sum: number, asset: Asset) => sum + asset.geo.latitude, 0) / members.length, longitude: members.reduce((sum: number, asset: Asset) => sum + asset.geo.longitude, 0) / members.length, risk: Math.round(members.reduce((sum: number, asset: Asset) => sum + asset.criticality, 0) / members.length) }));
  }, [mapAssets]);
  const los = syntheticLineOfSightContext(selected ? [selected.geo.latitude, selected.geo.longitude] : null, nearest ? [nearest.asset.geo.latitude, nearest.asset.geo.longitude] : null);
  const selectAsset = (asset: Asset) => { onSelect(asset); setFlyTarget(asset); setSearch(""); };
  const persistDrawnAoi = () => {
    if (aoiPoints.length < 3) { setNotice("Add at least three fictional vertices before staging an AOI."); return; }
    if (!onSaveAoi) { setNotice("AOI is currently local to this public synthetic view; sign in to stage it for governance review."); return; }
    onSaveAoi(aoiPoints);
    setNotice("AOI sent to the governed synthetic GIS review queue.");
    setAoiMode(false);
    setAoiPoints([]);
  };

  return <section className="relative min-h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-[#070807] shadow-[0_40px_120px_rgba(0,0,0,.6)]" aria-label="Interactive synthetic Earth assessment map">
    <MapContainer center={[25, 8] as LatLngExpression} zoom={2} minZoom={2} maxZoom={15} zoomControl className="absolute inset-0 z-0 h-full w-full" attributionControl={false}>
      <TileLayer key={mode} url={selectedTile.url} attribution={selectedTile.attribution} />
      <MapInteraction aoiMode={aoiMode} onCoordinate={setCoordinate} onAoiPoint={(point) => setAoiPoints((items) => [...items, point])} />
      <FlyTo target={flyTarget} revision={focusRevision} />
      <FlyToCluster members={clusterFocus} />
      <ResetView revision={resetRevision} />
      {activeLayers.includes("Provider dependencies") && dependencyLines.map(([from, to]) => <Polyline key={`${from.id}-${to.id}`} positions={[[from.geo.latitude, from.geo.longitude], [to.geo.latitude, to.geo.longitude]]} pathOptions={{ color: from.confidence === "inferred" || to.confidence === "inferred" ? "#b6ad9e" : "#e8b760", weight: 1.7, dashArray: "6 6", opacity: 0.78 }} />)}
      {activeLayers.includes("Critical findings") && mapAssets.filter((asset) => asset.criticality >= 7).map((asset) => <Circle key={`risk-${asset.id}`} center={[asset.geo.latitude, asset.geo.longitude]} radius={420000} pathOptions={{ color: asset.criticality >= 9 ? "#ee7664" : "#e8b760", fillColor: asset.criticality >= 9 ? "#ee7664" : "#e8b760", fillOpacity: 0.09, weight: 1, opacity: 0.42 }} />)}
      {activeLayers.includes("Confidence radius") && mapAssets.filter((asset) => asset.confidence === "inferred").map((asset) => <Circle key={`confidence-${asset.id}`} center={[asset.geo.latitude, asset.geo.longitude]} radius={650000} pathOptions={{ color: "#e6cf9b", fillOpacity: 0, dashArray: "5 7", weight: 1.3, opacity: 0.7 }} />)}
      {selected && <Circle center={[selected.geo.latitude, selected.geo.longitude]} radius={bufferKm * 1000} pathOptions={{ color: "#87bfff", fillColor: "#87bfff", fillOpacity: 0.035, dashArray: "4 5", weight: 1.1, opacity: 0.75 }} />}
      {heatmap && mapAssets.filter((asset) => asset.criticality >= 6).map((asset) => <Circle key={`heat-${asset.id}`} center={[asset.geo.latitude, asset.geo.longitude]} radius={(asset.criticality - 4) * 130000} pathOptions={{ color: "#ee7664", fillColor: "#ee7664", fillOpacity: 0.055, weight: 0, opacity: 0 }} />)}
      {scopeOnly && syntheticScopeZones.map((zone) => <Circle key={zone.label} center={zone.center} radius={zone.radius} pathOptions={{ color: "#bde0b5", fillColor: "#83a77c", fillOpacity: 0.03, dashArray: "8 6", weight: 1.2 }}><Tooltip direction="top" className="atlas-leaflet-tooltip">{zone.label} · declared synthetic geofence</Tooltip></Circle>)}
      {showRegions && regions.map((region) => <CircleMarker key={region.label} center={[region.latitude, region.longitude]} radius={11 + region.members.length * 2} pathOptions={{ color: "#93b7ff", fillColor: "#25355f", fillOpacity: 0.55, weight: 1.2, dashArray: "3 4" }} eventHandlers={{ click: () => { setClusterFocus(region.members); onSelect(region.members[0]); } }}><Tooltip direction="top" className="atlas-leaflet-tooltip"><b>{region.label}</b><br/>{region.members.length} synthetic records · mean priority {region.risk}/10</Tooltip></CircleMarker>)}
      {activeLayers.includes("Asset clusters") && clusters.map((cluster, index) => <CircleMarker key={`cluster-${index}`} center={[cluster.center.lat, cluster.center.lng]} radius={16 + cluster.group.length * 2} pathOptions={{ color: "#fff1cf", fillColor: "#e8b760", fillOpacity: 0.86, weight: 1.4 }} eventHandlers={{ click: () => { setClusterFocus(cluster.group); onSelect(cluster.group[0]); } }}><Tooltip permanent direction="center" className="atlas-leaflet-cluster">{cluster.group.length}</Tooltip><Tooltip direction="top" className="atlas-leaflet-tooltip">{cluster.group.length} nearby synthetic records · select to expand</Tooltip></CircleMarker>)}
      {activeLayers.includes("Assets") && mapAssets.map((asset) => <CircleMarker key={asset.id} center={[asset.geo.latitude, asset.geo.longitude]} radius={asset.id === selectedId ? 10 : 6 + Math.max(0, asset.criticality - 6) * .8} pathOptions={{ color: "#fff4dc", fillColor: markerColor(asset), fillOpacity: asset.id === selectedId ? 1 : 0.9, weight: asset.id === selectedId ? 2.2 : 1.25 }} eventHandlers={{ click: () => selectAsset(asset) }}><Tooltip permanent={asset.id === selectedId} direction={asset.id === selectedId ? "bottom" : "top"} offset={[0, asset.id === selectedId ? 9 : -10]} className={asset.id === selectedId ? "atlas-leaflet-label" : "atlas-leaflet-tooltip"}><b>{asset.name}</b><br/>{asset.type} · {asset.geo.precision}<br/>{asset.id === selectedId ? "Selected intelligence" : "Select for evidence context"}</Tooltip></CircleMarker>)}
      {persistedAois.filter((aoi) => aoi.points.length >= 3).map((aoi) => <Polygon key={`persisted-${aoi.id}`} positions={aoi.points} pathOptions={{ color: aoi.reviewStatus === "approved" ? "#bde0b5" : "#f3cc80", fillColor: aoi.reviewStatus === "approved" ? "#83a77c" : "#e8b760", fillOpacity: 0.1, dashArray: aoi.reviewStatus === "approved" ? undefined : "5 5" }}><Tooltip direction="top" className="atlas-leaflet-tooltip"><b>{aoi.title}</b><br/>{aoi.reviewStatus} · {aoi.coordinatePrecision} precision<br/>Reviewer · {aoi.reviewer}</Tooltip></Polygon>)}
      {aoiPoints.length > 2 && <Polygon positions={aoiPoints} pathOptions={{ color: "#f3cc80", fillColor: "#e8b760", fillOpacity: 0.12, dashArray: "5 5" }} />}
      {showLineOfSight && selected && nearest && <Polyline positions={[[selected.geo.latitude, selected.geo.longitude], [nearest.asset.geo.latitude, nearest.asset.geo.longitude]]} pathOptions={{ color: "#87bfff", weight: 1.6, dashArray: "2 8", opacity: 0.85 }} />}
    </MapContainer>
    <div className="pointer-events-none absolute inset-0 z-[300] bg-[linear-gradient(180deg,rgba(5,5,4,.42),transparent_23%,transparent_70%,rgba(5,5,4,.50))]" />
    <div className="absolute inset-x-0 top-0 z-[400] flex flex-col gap-3 border-b border-white/10 bg-black/58 px-4 py-3 backdrop-blur-md md:flex-row md:items-center md:justify-between"><div><p className="eyebrow">EARTH / SYNTHETIC GEOSPATIAL MODEL</p><p className="mt-1 text-xs text-white/60">Drag, zoom, select records, or draw a bounded fictional AOI. All assessment entities and coordinates are synthetic.</p></div><div className="flex flex-wrap items-center gap-2"><div className="relative"><Search size={13} className="pointer-events-none absolute left-2.5 top-2 text-white/35"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find synthetic asset" className="h-8 w-40 rounded-md border border-white/15 bg-black/45 pl-7 pr-2 text-[11px] text-white placeholder:text-white/35"/>{searchResults.length > 0 && <div className="absolute right-0 top-9 z-[500] w-60 overflow-hidden rounded-lg border border-white/15 bg-[#0d0b08] shadow-2xl">{searchResults.map((asset) => <button key={asset.id} onClick={() => selectAsset(asset)} className="block w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/[.06]">{asset.name}<span className="ml-2 text-[10px] text-[#e8b760]">{asset.type}</span></button>)}</div>}</div><select value={mode} onChange={(event) => setMode(event.target.value as BasemapMode)} className="h-8 rounded-md border border-[#e8b760]/35 bg-[#15110a] px-2 text-[10px] font-semibold tracking-[.08em] text-[#f2cb82]"><option value="dark">DARK OPS</option><option value="streets">STREETS</option><option value="satellite">SATELLITE</option><option value="terrain">TERRAIN</option><option value="earth">EARTH</option></select><select value={timeRange} onChange={(event) => setTimeRange(event.target.value as "30" | "60" | "all")} className="h-8 rounded-md border border-[#87bfff]/35 bg-[#10131a] px-2 text-[10px] font-semibold tracking-[.08em] text-[#c9d6ff]"><option value="30">≤ 30M</option><option value="60">≤ 60M</option><option value="all">ALL TIME</option></select><button onClick={() => setScopeOnly((value) => !value)} className={`h-8 rounded-md border px-2 text-[10px] font-semibold tracking-[.07em] ${scopeOnly ? "border-[#bde0b5]/45 bg-[#83a77c]/15 text-[#bde0b5]" : "border-white/15 bg-black/35 text-white/55"}`}>GEOFENCE {scopeOnly ? "ON" : "OFF"}</button><button onClick={() => { if (!selected) { setNotice("Select a synthetic record before requesting orientation focus."); return; } setFlyTarget(selected); setFocusRevision((value) => value + 1); setClusterFocus(null); setNotice(`Focused ${selected.name} for synthetic orientation. No collection, probe, or external action was performed.`); }} className="atlas-icon-button h-8 w-8" aria-label="Focus selected synthetic record" title={selected ? `Focus ${selected.name}` : "Focus selected synthetic record"}><Crosshair size={14}/></button><button onClick={() => setAoiMode((state) => !state)} className={`atlas-icon-button h-8 w-8 ${aoiMode ? "border-[#e8b760] text-[#f2cb82]" : ""}`} aria-label="Toggle area of interest drawing"><SquareDashedMousePointer size={14}/></button><button onClick={() => setResetRevision((value) => value + 1)} className="atlas-icon-button h-8 w-8" aria-label="Reset Earth view"><Globe2 size={14}/></button></div></div>
    <div className="absolute bottom-4 left-4 z-[400] max-w-[330px] rounded-lg border border-white/12 bg-[#080705]/86 p-3 backdrop-blur-md"><p className="eyebrow">MAP STATUS</p><p className="mt-1 text-[11px] leading-5 text-white/66">{aoiMode ? `AOI drawing active · ${aoiPoints.length} vertices · click the map to add points` : selected ? `${selected.name} · ${selected.geo.latitude.toFixed(4)}°, ${selected.geo.longitude.toFixed(4)}° · ${selected.geo.precision}` : "Select a synthetic pointer to inspect provenance and evidence."}</p><MapFilterStatus visibleRecordCount={mapAssets.length} timeRange={timeRange} scopeOnly={scopeOnly}/>{clusterFocus && <div className="mt-2 border-t border-white/10 pt-2"><p className="text-[9px] uppercase tracking-[.12em] text-[#f0c678]">Expanded cluster · {clusterFocus.length} records</p><p className="mt-1 text-[10px] leading-4 text-white/55">{clusterFocus.map((asset) => asset.name).join(" · ")}</p></div>}{notice && <p className="mt-2 border-t border-white/10 pt-2 text-[10px] leading-4 text-[#f0c678]">{notice}</p>}</div>
    <div className="absolute bottom-4 right-4 z-[400] max-w-[280px] rounded-lg border border-white/12 bg-[#080705]/86 px-3 py-2 text-right backdrop-blur-md"><p className="text-[10px] uppercase tracking-[.14em] text-white/42">Cursor coordinate</p><p className="mt-1 font-mono text-[11px] text-[#f2cb82]">{coordinate}</p><p className="mt-1 text-[9px] leading-4 text-white/42">{selectedTile.label} · {selectedTile.notice}</p></div>
    <div className="absolute left-4 top-[104px] z-[400] w-[205px] rounded-lg border border-white/12 bg-[#080705]/86 p-3 backdrop-blur-md"><p className="eyebrow">SPATIAL ANALYSIS</p><label className="mt-2 block text-[10px] text-white/45">Buffer · {bufferKm} km<input className="mt-1 w-full accent-[#e8b760]" type="range" min="10" max="150" step="5" value={bufferKm} onChange={(event) => setBufferKm(Number(event.target.value))}/></label><button onClick={() => setHeatmap((value) => !value)} className={`mt-2 w-full rounded border px-2 py-1.5 text-left text-[10px] ${heatmap ? "border-[#e8b760]/35 bg-[#e8b760]/[.08] text-[#f2cb82]" : "border-white/10 text-white/48"}`}>Risk concentration heat · {heatmap ? "visible" : "hidden"}</button><button onClick={() => setShowRegions((value) => !value)} className={`mt-2 w-full rounded border px-2 py-1.5 text-left text-[10px] ${showRegions ? "border-[#87bfff]/35 bg-[#87bfff]/[.08] text-[#c9d6ff]" : "border-white/10 text-white/48"}`}>Region aggregation · {showRegions ? `${regions.length} cells` : "hidden"}</button><button onClick={() => setShowLineOfSight((value) => !value)} className={`mt-2 w-full rounded border px-2 py-1.5 text-left text-[10px] ${showLineOfSight ? "border-[#87bfff]/35 bg-[#87bfff]/[.08] text-[#c9d6ff]" : "border-white/10 text-white/48"}`}>Synthetic LOS context · {showLineOfSight ? "visible" : "hidden"}</button><p className="mt-2 text-[10px] leading-4 text-white/50">{nearest ? `Nearest synthetic context: ${nearest.asset.name} · ${nearest.km.toFixed(0)} km great-circle distance` : "Select a record for distance context."}</p>{showLineOfSight && <p className="mt-1 text-[9px] leading-4 text-[#b9c7ff]">{los.distanceKm ? `${los.distanceKm.toFixed(0)} km · terrain complexity index ${los.terrainIndex}` : los.state}</p>}<div className="mt-3 border-t border-white/10 pt-2"><p className="text-[9px] uppercase tracking-[.12em] text-white/42">AOI lifecycle</p><div className="mt-2 flex gap-1.5"><button onClick={persistDrawnAoi} className="flex-1 rounded border border-[#e8b760]/30 px-1.5 py-1 text-[9px] text-[#f2cb82]">Stage {aoiPoints.length} vertices</button><button onClick={() => { setAoiPoints([]); setAoiMode(false); setNotice("Draft AOI cleared locally."); }} className="atlas-icon-button h-6 w-6" aria-label="Clear draft area of interest"><Trash2 size={12}/></button></div></div></div>
    <div className="absolute right-4 top-[104px] z-[400] w-[174px] rounded-lg border border-white/12 bg-[#080705]/86 p-3 backdrop-blur-md"><div className="flex items-center gap-1.5"><Crosshair size={12} className="text-[#e8b760]"/><p className="eyebrow">LEGEND</p></div><div className="mt-2 space-y-1.5 text-[9px] text-white/58"><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#e8b760]"/>Site / service / domain</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#ee7664]"/>Host / elevated priority</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#9db4ff]"/>Cloud / regional context</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full border border-[#f3cc80]"/>Draft AOI / uncertainty</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full border border-[#bde0b5]"/>Approved persisted AOI</p></div></div>
  </section>;
}
