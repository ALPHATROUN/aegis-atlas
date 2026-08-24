export type ExportManifestInput = {
  artifactType: "geojson" | "coordinate-csv" | "audit-snapshot" | "image-annotation";
  selectedAssetId: string;
  coordinatePrecision: string;
  scene?: string;
};

export function buildSyntheticExportManifest(input: ExportManifestInput) {
  return {
    classification: "synthetic",
    authorization: "AUTHORIZED · SYNTHETIC LAB ONLY",
    watermark: "SYNTHETIC · AUTHORIZED DEMONSTRATION",
    dataOrigin: "synthetic-authorized-demo",
    retention: "demo-session",
    redactionProfile: "synthetic-demo",
    artifactType: input.artifactType,
    selectedAssetId: input.selectedAssetId,
    coordinatePrecision: input.coordinatePrecision,
    scene: input.scene ?? "not-applicable",
    safeguards: ["No real targets", "No active collection", "No credentials", "No non-lab coordinates"],
  };
}
