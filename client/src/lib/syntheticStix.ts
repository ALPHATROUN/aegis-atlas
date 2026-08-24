import type { Asset } from "@/lib/atlasData";

export function buildSyntheticStixPreview(selected: Asset) {
  const infrastructureId = `infrastructure--aegis-${selected.id}`;
  const locationId = "location--aegis-synthetic-context";
  return {
    type: "bundle",
    id: "bundle--aegis-atlas-synthetic-preview",
    spec_version: "2.1",
    objects: [
      { type: "infrastructure", spec_version: "2.1", id: infrastructureId, name: selected.name, description: "Synthetic Aegis Atlas assessment entity. Not a real target.", x_aegis_synthetic: true, x_aegis_provenance: selected.provenance, x_aegis_confidence: selected.confidence },
      { type: "location", spec_version: "2.1", id: locationId, name: selected.location, description: "Fictional contextual location for an authorized synthetic demonstration.", x_aegis_synthetic: true, x_aegis_coordinate_precision: selected.geo.precision },
      { type: "relationship", spec_version: "2.1", id: `relationship--aegis-${selected.id}-context`, relationship_type: "related-to", source_ref: infrastructureId, target_ref: locationId, confidence: selected.confidence === "confirmed" ? 92 : 65, x_aegis_synthetic: true, x_aegis_provenance: "EV-309 · synthetic relationship context" },
    ],
    x_aegis_export_manifest: {
      classification: "synthetic",
      authorization: "AUTHORIZED · SYNTHETIC LAB ONLY",
      watermark: "SYNTHETIC · NOT A REAL TARGET",
      safeguards: ["No real targets", "No active collection", "No credentials", "No non-lab coordinates"],
    },
  };
}
