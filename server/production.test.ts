import { describe, expect, it } from "vitest";
import { canManageEngagement, canReadEngagement, canReviewEngagement, canWriteEngagement } from "./accessControl";
import { buildSyntheticBusinessSnapshot, getBusinessDashboardState } from "@shared/businessMetrics";
import { buildSyntheticExportManifest } from "@shared/exportGovernance";
import { restoreGeospatialArtifacts, syntheticLineOfSightContext, type ArtifactRecord } from "../client/src/lib/gisWorkspace";
import { createReport } from "../client/src/components/ReportStudio";
import { findings } from "../client/src/lib/atlasData";
import { previewAuthorizedImport } from "./assessment";
import { filterSyntheticMapAssets, isWithinDeclaredSyntheticScope } from "../client/src/lib/spatialControls";

describe("production governance helpers", () => {
  it("separates read, write, review, and manager permissions", () => {
    expect(canReadEngagement("read-only")).toBe(true);
    expect(canWriteEngagement("read-only")).toBe(false);
    expect(canWriteEngagement("analyst")).toBe(true);
    expect(canReviewEngagement("reviewer")).toBe(true);
    expect(canManageEngagement("reviewer")).toBe(false);
    expect(canManageEngagement(undefined, true)).toBe(true);
  });

  it("builds export manifests that retain the synthetic authorization safeguard", () => {
    const manifest = buildSyntheticExportManifest({ artifactType: "audit-snapshot", selectedAssetId: "edge-helix", coordinatePrecision: "exact-synthetic", scene: "2026-08-24" });
    expect(manifest.authorization).toContain("SYNTHETIC");
    expect(manifest.watermark).toContain("SYNTHETIC");
    expect(manifest.redactionProfile).toBe("synthetic-demo");
    expect(manifest.safeguards).toContain("No real targets");
  });
});

describe("typed synthetic business dashboard data", () => {
  it("returns the complete non-customer portfolio lens set", () => {
    const snapshot = buildSyntheticBusinessSnapshot();
    expect(snapshot.source).toBe("synthetic-demonstration");
    expect(snapshot.metrics).toHaveLength(5);
    expect(snapshot.metrics.map((metric) => metric.key)).toEqual(["portfolio", "engagement", "remediation", "executiveRisk", "utilization"]);
    expect(snapshot.metrics.every((metric) => metric.series.length === 5)).toBe(true);
  });

  it("selects distinct loading, error, empty, and ready dashboard render states", () => {
    expect(getBusinessDashboardState({ isLoading: true, isError: false, metricCount: 0 })).toBe("loading");
    expect(getBusinessDashboardState({ isLoading: false, isError: true, metricCount: 5 })).toBe("error");
    expect(getBusinessDashboardState({ isLoading: false, isError: false, metricCount: 0 })).toBe("empty");
    expect(getBusinessDashboardState({ isLoading: false, isError: false, metricCount: 5 })).toBe("ready");
  });
});

describe("persisted GIS artifact restoration", () => {
  const createdAt = new Date("2026-08-24T09:42:00.000Z");
  const artifacts: ArtifactRecord[] = [
    { id: 1, title: "STAC review / 2026-08-24", artifactType: "stac-item", reviewStatus: "approved", coordinatePrecision: "synthetic", sourceReference: "Authorized synthetic workspace", metadataJson: { primaryScene: { id: "2026-08-24" }, comparisonScene: { id: "2026-08-23" }, analyst: "Reviewer" }, geometryJson: null, createdByUserId: 1, createdAt },
    { id: 2, title: "Northstar floor 02", artifactType: "floor-plan", reviewStatus: "draft", coordinatePrecision: "synthetic", sourceReference: "Authorized synthetic workspace", metadataJson: { selectedRoute: "Entry → Control → Exit", reviewer: "Planner", classification: "synthetic" }, geometryJson: null, createdByUserId: 1, createdAt },
    { id: 3, title: "Synthetic waypoint pack", artifactType: "aoi", reviewStatus: "approved", coordinatePrecision: "synthetic", sourceReference: "Authorized synthetic workspace", metadataJson: { waypoints: [{ latitude: 64.1012, longitude: -23.1098 }], reviewer: "Planner", scope: "authorized demonstration", retention: "demo-session" }, geometryJson: { type: "Polygon", coordinates: [[[-23.1098, 64.1012], [-23.1054, 64.1031], [-23.1121, 64.0997]]] }, createdByUserId: 1, createdAt },
  ];

  it("restores imagery selections, floor-plan route state, AOI geometry, and waypoint metadata", () => {
    const restored = restoreGeospatialArtifacts(artifacts);
    expect(restored.imagery[0]?.primarySceneId).toBe("2026-08-24");
    expect(restored.floorPlans[0]?.route).toEqual(["Entry", "Control", "Exit"]);
    expect(restored.aois[0]?.points).toHaveLength(3);
    expect(restored.planning[0]?.waypoints[0]).toEqual([64.1012, -23.1098]);
    expect(restored.planning[0]?.scope).toBe("authorized demonstration");
  });

  it("labels the terrain calculation as synthetic context rather than a visibility decision", () => {
    const context = syntheticLineOfSightContext([64.1, -23.1], [64.2, -23.4]);
    expect(context.distanceKm).toBeGreaterThan(0);
    expect(context.terrainIndex).toBeGreaterThan(0);
    expect(context.state).toContain("not a visibility determination");
  });
});

describe("report output safeguards", () => {
  it("retains authorization and synthetic-data disclosures in generated exports", () => {
    const report = createReport("Executive intelligence brief", findings.slice(0, 1));
    expect(report).toContain("Authorization:");
    expect(report).toContain("Synthetic demonstration data only");
    expect(report).toContain(findings[0].id);
  });
});

describe("coordinate CSV interchange", () => {
  it("validates named latitude/longitude columns and quarantines out-of-scope coordinate rows", () => {
    const result = previewAuthorizedImport({ format: "coordinate-csv", payload: "name,latitude,longitude,precision\nNorthstar Relay Campus,64.1012,-23.1098,synthetic\nproduction.real-target.example,1,1,unknown", policy: { allowedFragments: ["Northstar", "Aurora", "Helix"], excludedFragments: ["production", "real-target"] } });
    expect(result.schemaValidation.valid).toBe(true);
    expect(result.acceptedCount).toBe(1);
    expect(result.quarantinedCount).toBe(1);
    expect(result.rows[0].subject).toBe("Northstar Relay Campus");
  });
});

describe("Earth-map spatial controls", () => {
  const records = [
    { id: "northstar", lastSeen: "12 minutes ago", geo: { latitude: 64.1, longitude: -23.1 } },
    { id: "aurora-old", lastSeen: "90 minutes ago", geo: { latitude: 25.2, longitude: 48.3 } },
    { id: "out-of-scope", lastSeen: "8 minutes ago", geo: { latitude: -40, longitude: 130 } },
  ];

  it("applies the observation window and declared synthetic geofence independently", () => {
    expect(filterSyntheticMapAssets(records, { timeRange: "30", scopeOnly: false }).map((record) => record.id)).toEqual(["northstar", "out-of-scope"]);
    expect(filterSyntheticMapAssets(records, { timeRange: "all", scopeOnly: true }).map((record) => record.id)).toEqual(["northstar", "aurora-old"]);
    expect(isWithinDeclaredSyntheticScope(records[2])).toBe(false);
  });
});
