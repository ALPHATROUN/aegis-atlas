import { describe, expect, it } from "vitest";
import { buildCitedAssistantDraft, calculateTransparentRiskScore, enforceScope, findPotentialDuplicates, previewAuthorizedImport, validateImportSchema } from "./assessment";

const policy = {
  allowedFragments: ["helix-labs.example", "203.0.113.", "Aurora", "Northstar"],
  excludedFragments: ["production", "real-target"],
};

describe("transparent risk scoring", () => {
  it("shows the independent factor contributions and caps the total", () => {
    const result = calculateTransparentRiskScore({ severity: "critical", confidence: "confirmed", externallyReachable: true, criticalBusinessPath: true });
    expect(result).toEqual({ total: 100, factors: { severity: 40, confidence: 25, exposure: 20, criticality: 15 } });
  });
});

describe("scope enforcement", () => {
  it("accepts a declared synthetic asset and quarantines an excluded record", () => {
    expect(enforceScope("edge.helix-labs.example", policy)).toEqual({ inScope: true });
    expect(enforceScope("production.real-target.example", policy)).toEqual({ inScope: false, reason: "Matches excluded boundary: production" });
  });

  it("returns a preview that keeps out-of-scope rows out of the accepted count", () => {
    const result = previewAuthorizedImport({
      format: "csv",
      payload: "host,severity\nedge.helix-labs.example,high\nproduction.real-target.example,critical",
      policy,
    });
    expect(result.acceptedCount).toBe(1);
    expect(result.quarantinedCount).toBe(1);
    expect(result.disposition).toBe("review-required");
    expect(result.artifactSha256).toHaveLength(64);
  });
});

describe("analyst assistant output", () => {
  it("requires confirmation and provides supporting workspace citations", () => {
    const result = buildCitedAssistantDraft({ findingId: "F-104", assetName: "edge.helix-labs.example", evidenceReference: "EV-309", score: 100 });
    expect(result.requiresAnalystConfirmation).toBe(true);
    expect(result.citations).toHaveLength(4);
    expect(result.draft).toContain("F-104");
  });
});

describe("duplicate candidates", () => {
  it("flags repeated records without treating them as a confirmed merge", () => {
    expect(findPotentialDuplicates(["edge.helix-labs.example", "EDGE.HELIX-LABS.EXAMPLE", "api.helix-labs.example"])).toEqual([
      { subject: "EDGE.HELIX-LABS.EXAMPLE", matches: "edge.helix-labs.example" },
    ]);
  });
});

describe("format-aware schema checks", () => {
  it("reports the specific parser expectation for supported input formats", () => {
    expect(validateImportSchema("csv", "host,severity\nedge.helix-labs.example,high")).toMatchObject({ valid: true });
    expect(validateImportSchema("geojson", "{\"type\":\"Feature\"}")).toEqual({ valid: false, message: "GeoJSON requires a FeatureCollection with features" });
    expect(validateImportSchema("kml", "<kml><Document/></kml>")).toMatchObject({ valid: true });
    expect(validateImportSchema("gpx", "<gpx><wpt lat=\"64.10\" lon=\"-23.10\"/></gpx>")).toMatchObject({ valid: true });
    expect(validateImportSchema("stac-item", "{\"type\":\"Feature\",\"stac_version\":\"1.0.0\",\"properties\":{\"name\":\"Northstar\"}}")).toMatchObject({ valid: true });
  });

  it("quarantines a KML planning object that fails the declared synthetic scope policy", () => {
    const result = previewAuthorizedImport({ format: "kml", payload: "<kml><Placemark><name>Northstar Relay Campus</name></Placemark><Placemark><name>production.real-target.example</name></Placemark></kml>", policy });
    expect(result.acceptedCount).toBe(1);
    expect(result.quarantinedCount).toBe(1);
  });
});
