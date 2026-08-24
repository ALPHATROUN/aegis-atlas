export type SpatialRecord = { lastSeen: string; geo: { latitude: number; longitude: number } };
export type SyntheticScopeZone = { label: string; center: [number, number]; radius: number };

export const syntheticScopeZones: SyntheticScopeZone[] = [
  { label: "Northstar declared area", center: [64.05, -23.1], radius: 260_000 },
  { label: "Aurora declared area", center: [25.1, 48.35], radius: 260_000 },
  { label: "Solstice declared context", center: [18, 11.5], radius: 300_000 },
];

export function observedMinutes(record: SpatialRecord) {
  return Number.parseInt(record.lastSeen, 10) || 999;
}

export function isWithinDeclaredSyntheticScope(record: SpatialRecord, zones = syntheticScopeZones) {
  return zones.some((zone) => Math.hypot(record.geo.latitude - zone.center[0], record.geo.longitude - zone.center[1]) < 5);
}

export function filterSyntheticMapAssets<T extends SpatialRecord>(assets: T[], options: { timeRange: "30" | "60" | "all"; scopeOnly: boolean }) {
  return assets.filter((asset) => (options.timeRange === "all" || observedMinutes(asset) <= Number(options.timeRange)) && (!options.scopeOnly || isWithinDeclaredSyntheticScope(asset)));
}
