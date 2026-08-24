import React from "react";

export function MapFilterStatus({ visibleRecordCount, timeRange, scopeOnly }: { visibleRecordCount: number; timeRange: "30" | "60" | "all"; scopeOnly: boolean }) {
  const windowLabel = timeRange === "all" ? "all synthetic observations" : `observed within ${timeRange} minutes`;
  return <p className="mt-1 text-[9px] text-[#b9c7ff]" data-map-filter-state={`${timeRange}-${scopeOnly ? "geofenced" : "policy"}`}>{visibleRecordCount} records visible · {windowLabel} · geofence {scopeOnly ? "enforced" : "shown as policy"}</p>;
}
