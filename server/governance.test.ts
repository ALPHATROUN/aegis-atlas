import { describe, expect, it } from "vitest";
import { applyCoordinatePrecision, validateEvidenceIntake } from "./governance";

describe("production governance helpers", () => {
  it("accepts bounded supported evidence and rejects unsafe media or oversized artifacts", () => {
    expect(validateEvidenceIntake({ fileName: "synthetic-map.geojson", mediaType: "application/geo+json", byteSize: 2048 })).toEqual({ valid: true });
    expect(validateEvidenceIntake({ fileName: "payload.exe", mediaType: "application/octet-stream", byteSize: 2048 }).valid).toBe(false);
    expect(validateEvidenceIntake({ fileName: "oversized.pdf", mediaType: "application/pdf", byteSize: 3_000_001 }).valid).toBe(false);
  });

  it("rounds coordinates according to public privacy precision and rejects invalid locations", () => {
    expect(applyCoordinatePrecision({ latitude: 64.101235, longitude: -23.109876, precision: "rounded" })).toEqual({ latitude: 64.101, longitude: -23.11, precision: "rounded" });
    expect(() => applyCoordinatePrecision({ latitude: 101, longitude: 0, precision: "synthetic" })).toThrow("Coordinates are outside geographic bounds");
  });
});
