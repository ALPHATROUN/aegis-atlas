export type ArtifactRecord = {
  id: number;
  title: string;
  artifactType: "geojson" | "kml" | "gpx" | "stac-item" | "imagery-annotation" | "floor-plan" | "offline-pack" | "aoi";
  reviewStatus: "draft" | "approved" | "quarantined" | "archived";
  coordinatePrecision: "exact" | "rounded" | "inferred" | "synthetic";
  sourceReference: string | null;
  metadataJson: unknown;
  geometryJson: unknown;
  createdByUserId: number;
  createdAt: Date;
};

type RecordValue = Record<string, unknown>;
export type GeoPoint = [number, number];

export type RestoredAoi = {
  id: number;
  title: string;
  points: GeoPoint[];
  reviewStatus: ArtifactRecord["reviewStatus"];
  coordinatePrecision: ArtifactRecord["coordinatePrecision"];
  reviewer: string;
  retention: string;
};

export type RestoredFloorPlan = {
  id: number;
  title: string;
  nodes: Array<{ id: string; label: string; x: number; y: number; kind: string }>;
  route: string[];
  reviewStatus: ArtifactRecord["reviewStatus"];
  reviewer: string;
  classification: string;
};

export type RestoredImageryRecord = {
  id: number;
  title: string;
  kind: "catalog" | "annotation";
  primarySceneId: string | null;
  comparisonSceneId: string | null;
  annotation: string | null;
  reviewStatus: ArtifactRecord["reviewStatus"];
  author: string;
  source: string;
};

export type RestoredPlanningRecord = {
  id: number;
  title: string;
  kind: "waypoint" | "offline-pack";
  waypoints: GeoPoint[];
  waypointCount: number;
  coordinatePrecision: ArtifactRecord["coordinatePrecision"];
  reviewer: string;
  scope: string;
  retention: string;
  reviewStatus: ArtifactRecord["reviewStatus"];
};

const asRecord = (value: unknown): RecordValue => value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const asText = (value: unknown, fallback = "Not recorded") => typeof value === "string" && value.trim() ? value : fallback;

function toPoint(value: unknown): GeoPoint | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const first = Number(value[0]);
  const second = Number(value[1]);
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  if (Math.abs(first) <= 90 && Math.abs(second) <= 180) return [first, second];
  if (Math.abs(second) <= 90 && Math.abs(first) <= 180) return [second, first];
  return null;
}

function geometryPoints(value: unknown): GeoPoint[] {
  const geometry = asRecord(value);
  const coordinates = geometry.coordinates;
  if (!Array.isArray(coordinates)) return [];
  const ring = Array.isArray(coordinates[0]) && Array.isArray(coordinates[0]?.[0]) ? coordinates[0] : coordinates;
  return ring.map(toPoint).filter((point): point is GeoPoint => Boolean(point));
}

function metadataWaypoints(value: unknown): GeoPoint[] {
  const metadata = asRecord(value);
  const waypoints = Array.isArray(metadata.waypoints) ? metadata.waypoints : [];
  return waypoints.map((waypoint) => {
    const item = asRecord(waypoint);
    const latitude = Number(item.latitude);
    const longitude = Number(item.longitude);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] as GeoPoint : null;
  }).filter((point): point is GeoPoint => Boolean(point));
}

function sceneId(value: unknown): string | null {
  const scene = asRecord(value);
  return typeof scene.id === "string" ? scene.id : null;
}

function parseRoute(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => asText(item)).filter((item) => item !== "Not recorded");
  if (typeof value === "string") return value.split("→").map((item) => item.trim()).filter(Boolean);
  return [];
}

function defaultFloorNodes(): RestoredFloorPlan["nodes"] {
  return [
    { id: "entry", label: "Entry", x: 12, y: 72, kind: "access" },
    { id: "control", label: "Control", x: 38, y: 48, kind: "checkpoint" },
    { id: "ops", label: "Operations", x: 64, y: 36, kind: "workspace" },
    { id: "exit", label: "Exit", x: 84, y: 72, kind: "egress" },
  ];
}

export function restoreGeospatialArtifacts(records: ArtifactRecord[]) {
  const aois: RestoredAoi[] = [];
  const floorPlans: RestoredFloorPlan[] = [];
  const imagery: RestoredImageryRecord[] = [];
  const planning: RestoredPlanningRecord[] = [];

  records.forEach((record) => {
    const metadata = asRecord(record.metadataJson);
    const reviewer = asText(metadata.reviewer ?? metadata.author ?? metadata.analyst, `User #${record.createdByUserId}`);
    if (record.artifactType === "aoi") {
      const points = geometryPoints(record.geometryJson);
      const waypoints = metadataWaypoints(record.metadataJson);
      aois.push({ id: record.id, title: record.title, points: points.length >= 3 ? points : waypoints, reviewStatus: record.reviewStatus, coordinatePrecision: record.coordinatePrecision, reviewer, retention: asText(metadata.retention, "engagement policy") });
    }
    if (record.artifactType === "floor-plan") {
      const rawNodes = Array.isArray(metadata.nodes) ? metadata.nodes : [];
      const nodes = rawNodes.map((raw, index) => {
        const node = asRecord(raw);
        return { id: asText(node.id, `node-${index + 1}`), label: asText(node.label ?? raw, `Node ${index + 1}`), x: Number.isFinite(Number(node.x)) ? Number(node.x) : 14 + index * 22, y: Number.isFinite(Number(node.y)) ? Number(node.y) : index % 2 ? 40 : 72, kind: asText(node.kind, "transition") };
      });
      floorPlans.push({ id: record.id, title: record.title, nodes: nodes.length ? nodes : defaultFloorNodes(), route: parseRoute(metadata.route ?? metadata.selectedRoute), reviewStatus: record.reviewStatus, reviewer, classification: asText(metadata.classification, "synthetic") });
    }
    if (record.artifactType === "stac-item" || record.artifactType === "imagery-annotation") {
      imagery.push({ id: record.id, title: record.title, kind: record.artifactType === "stac-item" ? "catalog" : "annotation", primarySceneId: sceneId(metadata.primaryScene), comparisonSceneId: sceneId(metadata.comparisonScene), annotation: typeof metadata.annotation === "string" ? metadata.annotation : null, reviewStatus: record.reviewStatus, author: reviewer, source: asText(record.sourceReference, "Authorized synthetic workspace") });
    }
    if (record.artifactType === "offline-pack" || (record.artifactType === "aoi" && metadataWaypoints(record.metadataJson).length > 0)) {
      const waypoints = metadataWaypoints(record.metadataJson);
      planning.push({ id: record.id, title: record.title, kind: record.artifactType === "offline-pack" ? "offline-pack" : "waypoint", waypoints, waypointCount: waypoints.length, coordinatePrecision: record.coordinatePrecision, reviewer, scope: asText(metadata.scope, "authorized synthetic demonstration"), retention: asText(metadata.retention, "engagement policy"), reviewStatus: record.reviewStatus });
    }
  });

  return { aois, floorPlans, imagery, planning };
}

export function syntheticLineOfSightContext(from: GeoPoint | null, to: GeoPoint | null) {
  if (!from || !to) return { distanceKm: null, terrainIndex: null, state: "Select two synthetic records to create a non-operational planning context." };
  const latDistance = (to[0] - from[0]) * 111.32;
  const longitudeScale = Math.cos(((from[0] + to[0]) / 2) * Math.PI / 180) * 111.32;
  const longitudeDistance = (to[1] - from[1]) * longitudeScale;
  const distanceKm = Math.hypot(latDistance, longitudeDistance);
  const terrainIndex = Math.round((Math.abs(Math.sin(from[0])) + Math.abs(Math.cos(to[1]))) * 40 + 20);
  return { distanceKm, terrainIndex, state: "Synthetic terrain profile only — it is not a visibility determination, access route, or real-world planning input." };
}
