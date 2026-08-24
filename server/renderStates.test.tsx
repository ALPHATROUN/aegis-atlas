import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it } from "vitest";
import { BusinessDashboardStatus } from "../client/src/components/BusinessDashboardStatus";
import { MapFilterStatus } from "../client/src/components/MapFilterStatus";

describe("rendered protected dashboard states", () => {
  it.each([
    ["loading", "Loading"],
    ["error", "Unavailable"],
    ["empty", "No metrics"],
    ["ready", "Demo metrics"],
  ] as const)("renders the %s dashboard state label", (state, label) => {
    const markup = renderToStaticMarkup(<BusinessDashboardStatus state={state}/>);
    expect(markup).toContain(`data-dashboard-state="${state}"`);
    expect(markup).toContain(label);
  });
});

describe("rendered Earth-map filter state", () => {
  it("renders the active time-window and declared-geofence state used by the map status panel", () => {
    const markup = renderToStaticMarkup(<MapFilterStatus visibleRecordCount={2} timeRange="30" scopeOnly/>);
    expect(markup).toContain('data-map-filter-state="30-geofenced"');
    expect(markup).toContain("2 records visible");
    expect(markup).toContain("observed within 30 minutes");
    expect(markup).toContain("geofence enforced");
  });
});
