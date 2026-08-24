export type BusinessMetricKey = "portfolio" | "engagement" | "remediation" | "executiveRisk" | "utilization";

export type BusinessMetric = {
  key: BusinessMetricKey;
  label: string;
  value: string;
  detail: string;
  headline: string;
  trend: string;
  owner: string;
  gate: string;
  action: string;
  series: number[];
};

export type BusinessSnapshot = {
  source: "synthetic-demonstration";
  generatedAt: string;
  metrics: BusinessMetric[];
};

export type BusinessDashboardState = "loading" | "error" | "empty" | "ready";

export function getBusinessDashboardState(input: { isLoading: boolean; isError: boolean; metricCount: number }): BusinessDashboardState {
  if (input.isLoading) return "loading";
  if (input.isError) return "error";
  return input.metricCount === 0 ? "empty" : "ready";
}

export function buildSyntheticBusinessSnapshot(): BusinessSnapshot {
  return {
    source: "synthetic-demonstration",
    generatedAt: "2026-08-24T09:42:00.000Z",
    metrics: [
      { key: "portfolio", label: "Portfolio health", value: "82 / 100", detail: "3 authorized engagements · 1 awaiting review", headline: "82 / 100 controlled delivery health", trend: "+6 points over synthetic four-week baseline", owner: "Portfolio manager", gate: "One engagement requires evidence-register approval", action: "Review the highest-risk delivery gate before capacity is reassigned", series: [58, 64, 70, 76, 82] },
      { key: "engagement", label: "Engagement health", value: "ON TRACK", detail: "Scope, evidence, and delivery gates green", headline: "On track across scope, evidence, and report gates", trend: "Scope variance held at 0 quarantined in-scope writes", owner: "Assessment manager", gate: "Retest window needs calendar confirmation", action: "Confirm retest owner and lock the governed delivery date", series: [52, 60, 68, 74, 79] },
      { key: "remediation", label: "Remediation program", value: "67%", detail: "4 of 6 synthetic actions verified", headline: "4 of 6 synthetic actions evidence-verified", trend: "+2 verified actions since the previous review", owner: "Remediation lead", gate: "Critical edge exposure awaits owner acknowledgement", action: "Route the critical finding to the designated accountable owner", series: [22, 31, 42, 58, 67] },
      { key: "executiveRisk", label: "Executive risk", value: "HIGH", detail: "1 critical decision needs sponsor review", headline: "High exposure concentration requires sponsor decision", trend: "One critical issue dominates the synthetic risk register", owner: "Executive sponsor", gate: "Risk acceptance or remediation funding decision pending", action: "Review geographic concentration alongside customer-impact narrative", series: [88, 82, 79, 76, 72] },
      { key: "utilization", label: "Utilization", value: "74%", detail: "Synthetic analyst capacity this week", headline: "74% synthetic analyst capacity allocation", trend: "Within the documented 65–80% sustainable planning band", owner: "Practice operations", gate: "No capacity exception in the current synthetic plan", action: "Reserve review capacity before scheduling additional retest work", series: [61, 66, 70, 72, 74] },
    ],
  };
}
