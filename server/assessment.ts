import { createHash } from "node:crypto";

export type AssessmentSeverity = "critical" | "high" | "medium" | "low";
export type AssessmentConfidence = "confirmed" | "high" | "medium" | "inferred";
export type ImportFormat = "geojson" | "csv" | "json" | "nmap-xml" | "nuclei-jsonl";

export type ScopePolicy = {
  allowedFragments: string[];
  excludedFragments: string[];
};

export type ImportRow = {
  line: number;
  subject: string;
  inScope: boolean;
  reason?: string;
};

export function findPotentialDuplicates(subjects: string[]) {
  const seen = new Map<string, string>();
  const duplicates: Array<{ subject: string; matches: string }> = [];
  subjects.forEach((subject) => {
    const normalized = subject.trim().toLowerCase();
    if (!normalized || normalized.startsWith("[")) return;
    const match = seen.get(normalized);
    if (match) duplicates.push({ subject, matches: match });
    else seen.set(normalized, subject);
  });
  return duplicates;
}

export function validateImportSchema(format: ImportFormat, payload: string) {
  if (format === "csv") {
    const [header] = payload.split(/\r?\n/);
    return header?.split(",").map((item) => item.trim().toLowerCase()).includes("host")
      ? { valid: true, message: "CSV header contains a required host column" }
      : { valid: false, message: "CSV requires a host column" };
  }
  if (format === "nmap-xml") return payload.includes("<nmaprun") ? { valid: true, message: "Nmap XML root element detected" } : { valid: false, message: "Nmap XML root element is missing" };
  if (format === "nuclei-jsonl") {
    const invalid = payload.split(/\r?\n/).filter(Boolean).some((line) => { try { const value = JSON.parse(line) as { host?: string; matched?: string }; return !value.host && !value.matched; } catch { return true; } });
    return invalid ? { valid: false, message: "Each JSONL record must include host or matched" } : { valid: true, message: "All Nuclei JSONL records include a target field" };
  }
  try {
    const parsed = JSON.parse(payload) as { type?: string; features?: unknown[]; items?: unknown[] };
    if (format === "geojson") return parsed.type === "FeatureCollection" && Array.isArray(parsed.features) ? { valid: true, message: "GeoJSON FeatureCollection structure detected" } : { valid: false, message: "GeoJSON requires a FeatureCollection with features" };
    return Array.isArray(parsed.items) || Array.isArray(parsed.features) ? { valid: true, message: "Generic JSON collection structure detected" } : { valid: false, message: "Generic JSON requires an items or features collection" };
  } catch {
    return { valid: false, message: "Payload is not valid JSON" };
  }
}

const severityPoints: Record<AssessmentSeverity, number> = { critical: 40, high: 30, medium: 18, low: 8 };
const confidencePoints: Record<AssessmentConfidence, number> = { confirmed: 25, high: 20, medium: 13, inferred: 7 };

export function calculateTransparentRiskScore(input: {
  severity: AssessmentSeverity;
  confidence: AssessmentConfidence;
  externallyReachable: boolean;
  criticalBusinessPath: boolean;
}) {
  const severity = severityPoints[input.severity];
  const confidence = confidencePoints[input.confidence];
  const exposure = input.externallyReachable ? 20 : 8;
  const criticality = input.criticalBusinessPath ? 15 : 8;
  return {
    total: Math.min(100, severity + confidence + exposure + criticality),
    factors: { severity, confidence, exposure, criticality },
  };
}

export function enforceScope(subject: string, policy: ScopePolicy) {
  const normalized = subject.toLowerCase();
  const exclusion = policy.excludedFragments.find((fragment) => normalized.includes(fragment.toLowerCase()));
  if (exclusion) return { inScope: false, reason: `Matches excluded boundary: ${exclusion}` };
  const allowed = policy.allowedFragments.some((fragment) => normalized.includes(fragment.toLowerCase()));
  return allowed ? { inScope: true } : { inScope: false, reason: "Does not match an authorized synthetic scope boundary" };
}

function subjectsFromPayload(format: ImportFormat, payload: string) {
  if (format === "csv") {
    return payload.split(/\r?\n/).slice(1).map((line, index) => ({ line: index + 2, subject: line.split(",")[0]?.trim() ?? "" })).filter((item) => item.subject);
  }
  if (format === "nmap-xml") {
    return Array.from(payload.matchAll(/addr=["']([^"']+)["']/g)).map((match, index) => ({ line: index + 1, subject: match[1] }));
  }
  if (format === "nuclei-jsonl") {
    return payload.split(/\r?\n/).flatMap((line, index) => {
      try {
        const parsed = JSON.parse(line) as { host?: string; matched?: string };
        return parsed.host || parsed.matched ? [{ line: index + 1, subject: parsed.host ?? parsed.matched ?? "" }] : [];
      } catch {
        return line.trim() ? [{ line: index + 1, subject: "[unparseable record]" }] : [];
      }
    });
  }
  if (format === "geojson" || format === "json") {
    try {
      const parsed = JSON.parse(payload) as { features?: Array<{ properties?: Record<string, unknown> }>; items?: Array<Record<string, unknown>> };
      const records = parsed.features?.map((feature) => feature.properties ?? {}) ?? parsed.items ?? [];
      return records.map((record, index) => ({ line: index + 1, subject: String(record.name ?? record.host ?? record.domain ?? record.ip ?? "[unnamed record]") }));
    } catch {
      return [{ line: 1, subject: "[invalid JSON payload]" }];
    }
  }
  return [];
}

export function previewAuthorizedImport(input: { format: ImportFormat; payload: string; policy: ScopePolicy }) {
  const schemaValidation = validateImportSchema(input.format, input.payload);
  const rows: ImportRow[] = subjectsFromPayload(input.format, input.payload).map((item) => ({ ...item, ...enforceScope(item.subject, input.policy) }));
  const accepted = rows.filter((row) => row.inScope);
  const quarantined = rows.filter((row) => !row.inScope);
  const duplicateCandidates = findPotentialDuplicates(rows.map((row) => row.subject));
  return {
    parser: input.format,
    schemaValidation,
    artifactSha256: createHash("sha256").update(input.payload).digest("hex"),
    totalRows: rows.length,
    acceptedCount: accepted.length,
    quarantinedCount: quarantined.length,
    duplicateCandidates,
    rows,
    disposition: quarantined.length > 0 ? "review-required" : "ready-for-analyst-approval",
  } as const;
}

export function buildCitedAssistantDraft(input: { findingId: string; assetName: string; evidenceReference: string; score: number }) {
  return {
    findingId: input.findingId,
    requiresAnalystConfirmation: true,
    citations: [
      { id: "1", label: input.evidenceReference, relation: "Evidence reference" },
      { id: "2", label: input.assetName, relation: "Selected asset" },
      { id: "3", label: `Transparent risk score: ${input.score}`, relation: "Workspace calculation" },
      { id: "4", label: "Synthetic import preview: case-variant duplicate candidate", relation: "Duplicate review context" },
    ],
    draft: `The synthetic finding ${input.findingId} is prioritized because its documented evidence applies to ${input.assetName}. The workspace risk calculation is ${input.score}/100. Analyst review is required before this draft is used in an assessment report.`,
  } as const;
}
