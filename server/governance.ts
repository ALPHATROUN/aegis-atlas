const ALLOWED_EVIDENCE_TYPES = new Set([
  "application/pdf", "application/json", "application/geo+json", "text/plain", "text/csv", "image/png", "image/jpeg", "image/webp",
]);

export function validateEvidenceIntake(input: { fileName: string; mediaType: string; byteSize: number }) {
  if (!input.fileName.trim() || input.fileName.length > 512) return { valid: false as const, reason: "Evidence file name is missing or exceeds the policy limit" };
  if (input.byteSize < 1 || input.byteSize > 3_000_000) return { valid: false as const, reason: "Evidence artifact must be between 1 byte and 3 MB" };
  if (!ALLOWED_EVIDENCE_TYPES.has(input.mediaType)) return { valid: false as const, reason: "Evidence media type is not allowed by the intake policy" };
  return { valid: true as const };
}

export function applyCoordinatePrecision(input: { latitude: number; longitude: number; precision: "exact" | "rounded" | "inferred" | "synthetic" }) {
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude) || input.latitude < -90 || input.latitude > 90 || input.longitude < -180 || input.longitude > 180) throw new Error("Coordinates are outside geographic bounds");
  const decimals = input.precision === "exact" ? 6 : input.precision === "rounded" ? 3 : input.precision === "inferred" ? 2 : 4;
  return { latitude: Number(input.latitude.toFixed(decimals)), longitude: Number(input.longitude.toFixed(decimals)), precision: input.precision };
}
