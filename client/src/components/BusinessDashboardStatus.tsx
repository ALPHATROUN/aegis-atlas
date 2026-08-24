import type { BusinessDashboardState } from "@shared/businessMetrics";
import React from "react";

export function BusinessDashboardStatus({ state }: { state: BusinessDashboardState }) {
  const label = state === "loading" ? "Loading" : state === "error" ? "Unavailable" : state === "empty" ? "No metrics" : "Demo metrics";
  const detail = state === "loading" ? "Loading protected synthetic metrics" : state === "error" ? "Synthetic dashboard is unavailable" : state === "empty" ? "No synthetic metrics configured" : "Synthetic demonstration metrics";
  return <span className="atlas-status" data-dashboard-state={state} aria-label={detail}>{label}</span>;
}
