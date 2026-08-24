export type Severity = "critical" | "high" | "medium" | "low";
export type Confidence = "confirmed" | "high" | "medium" | "inferred";

export type Asset = {
  id: string;
  name: string;
  type: "domain" | "host" | "service" | "site" | "cloud" | "provider";
  coordinates: { x: number; y: number };
  location: string;
  status: "observed" | "validated" | "watch";
  criticality: number;
  confidence: Confidence;
  provenance: string;
  lastSeen: string;
  summary: string;
  related: string[];
};

export type Finding = {
  id: string;
  title: string;
  severity: Severity;
  assetId: string;
  evidence: string;
  owner: string;
  remediation: string;
  retest: "pending" | "scheduled" | "verified";
  confidence: Confidence;
  factors: string[];
  status: "open" | "in-progress" | "accepted" | "resolved";
};

export const assets: Asset[] = [
  {
    id: "site-northstar",
    name: "Northstar Relay Campus",
    type: "site",
    coordinates: { x: 23, y: 32 },
    location: "Fictional North Atlantic Zone",
    status: "validated",
    criticality: 9,
    confidence: "confirmed",
    provenance: "Authorized facilities register · 2026-08-16",
    lastSeen: "6 min ago",
    summary: "Primary synthetic operations campus with 12 mapped logical assets.",
    related: ["edge.helix-labs.example", "Aurora Compute Region", "Solstice Transit"],
  },
  {
    id: "edge-helix",
    name: "edge.helix-labs.example",
    type: "domain",
    coordinates: { x: 27, y: 39 },
    location: "Northstar Relay Campus",
    status: "validated",
    criticality: 9,
    confidence: "confirmed",
    provenance: "Synthetic authorized DNS inventory · run 1042",
    lastSeen: "18 min ago",
    summary: "Authorized external ingress domain routing to a fictional edge service.",
    related: ["203.0.113.18", "HTTPS / 443", "Northstar Relay Campus"],
  },
  {
    id: "host-203",
    name: "203.0.113.18",
    type: "host",
    coordinates: { x: 31, y: 43 },
    location: "Synthetic provider edge · Northstar",
    status: "observed",
    criticality: 8,
    confidence: "high",
    provenance: "Nmap XML import · authorized lab fixture",
    lastSeen: "18 min ago",
    summary: "Synthetic IPv4 host retained as an RFC 5737 documentation address.",
    related: ["edge.helix-labs.example", "HTTPS / 443", "Solstice Transit"],
  },
  {
    id: "aurora-cloud",
    name: "Aurora Compute Region",
    type: "cloud",
    coordinates: { x: 64, y: 35 },
    location: "Fictional Eastern Cloud Region",
    status: "validated",
    criticality: 8,
    confidence: "confirmed",
    provenance: "Synthetic cloud inventory export · verified",
    lastSeen: "42 min ago",
    summary: "Fictional cloud region supporting the assessment application tier.",
    related: ["api.helix-labs.example", "VantaNet Fabric", "Northstar Relay Campus"],
  },
  {
    id: "api-helix",
    name: "api.helix-labs.example",
    type: "service",
    coordinates: { x: 68, y: 42 },
    location: "Aurora Compute Region",
    status: "watch",
    criticality: 7,
    confidence: "high",
    provenance: "Synthetic Nuclei JSONL fixture · analyst reviewed",
    lastSeen: "42 min ago",
    summary: "Fictional API service with evidence-backed configuration observations.",
    related: ["Aurora Compute Region", "HTTPS / 443", "VantaNet Fabric"],
  },
  {
    id: "solstice-provider",
    name: "Solstice Transit",
    type: "provider",
    coordinates: { x: 47, y: 53 },
    location: "Fictional interregional carrier",
    status: "validated",
    criticality: 6,
    confidence: "inferred",
    provenance: "Synthetic BGP relationship fixture · confidence 0.71",
    lastSeen: "1 hr ago",
    summary: "Illustrative provider relationship used for dependency concentration analysis.",
    related: ["203.0.113.18", "Aurora Compute Region", "Mariner Research Annex"],
  },
  {
    id: "mariner-site",
    name: "Mariner Research Annex",
    type: "site",
    coordinates: { x: 57, y: 68 },
    location: "Fictional Southern Research Zone",
    status: "validated",
    criticality: 5,
    confidence: "confirmed",
    provenance: "Synthetic facilities register · 2026-08-16",
    lastSeen: "2 hr ago",
    summary: "Fictional research site connected to the same synthetic transit provider.",
    related: ["Solstice Transit", "archive.helix-labs.example"],
  },
];

export const findings: Finding[] = [
  {
    id: "F-104",
    title: "External service baseline deviates from approved exposure profile",
    severity: "critical",
    assetId: "edge-helix",
    evidence: "EV-309 · HTTP response and approved-scope comparison",
    owner: "Platform Engineering",
    remediation: "Constrain the synthetic edge policy to the approved service profile, then request a retest.",
    retest: "scheduled",
    confidence: "confirmed",
    factors: ["Externally reachable", "Critical business path", "Confirmed evidence", "Shared provider dependency"],
    status: "open",
  },
  {
    id: "F-122",
    title: "API diagnostic metadata persists outside intended release window",
    severity: "high",
    assetId: "api-helix",
    evidence: "EV-327 · Nuclei JSONL fixture and analyst annotation",
    owner: "Application Security",
    remediation: "Remove diagnostic headers and validate in the next authorized comparison run.",
    retest: "pending",
    confidence: "high",
    factors: ["Internet-facing API", "High confidence", "Change detected", "Low user impact"],
    status: "in-progress",
  },
  {
    id: "F-095",
    title: "Provider concentration exceeds the engagement resilience threshold",
    severity: "medium",
    assetId: "solstice-provider",
    evidence: "EV-292 · Dependency graph concentration analysis",
    owner: "Enterprise Architecture",
    remediation: "Document alternate transit strategy and verify dependency segmentation.",
    retest: "pending",
    confidence: "inferred",
    factors: ["Three linked sites", "Inferred relationship", "Medium criticality", "Strategic resilience"],
    status: "open",
  },
];

export const techniqueCoverage = [
  { id: "T1595", label: "Active Scanning", state: "planned" },
  { id: "T1580", label: "Cloud Infrastructure Discovery", state: "observed" },
  { id: "T1190", label: "Exploit Public-Facing Application", state: "not-tested" },
  { id: "T1071", label: "Application Layer Protocol", state: "reviewed" },
];

export const auditEvents = [
  { time: "09:42", action: "Scope policy reviewed", actor: "Lead Analyst", type: "control" },
  { time: "09:27", action: "Nuclei JSONL fixture quarantined for review", actor: "Import Gateway", type: "import" },
  { time: "09:19", action: "Finding F-104 moved to retest scheduled", actor: "A. Reyes", type: "finding" },
  { time: "08:55", action: "Saved view updated: Critical external surface", actor: "A. Reyes", type: "view" },
];

export const riskScore = (finding: Finding) => {
  const severity = { critical: 40, high: 30, medium: 18, low: 8 }[finding.severity];
  const confidence = { confirmed: 25, high: 20, medium: 13, inferred: 7 }[finding.confidence];
  const exposure = finding.factors.includes("Externally reachable") || finding.factors.includes("Internet-facing API") ? 20 : 8;
  const criticality = finding.factors.includes("Critical business path") ? 15 : 8;
  return Math.min(100, severity + confidence + exposure + criticality);
};

export const scope = {
  authorization: "AUTHORIZED · SYNTHETIC LAB ONLY",
  inScope: ["*.helix-labs.example", "203.0.113.0/24", "Aurora Compute Region", "Northstar Relay Campus"],
  excluded: ["Production systems", "Non-lab addresses", "Credential attacks", "Exploit execution"],
};
