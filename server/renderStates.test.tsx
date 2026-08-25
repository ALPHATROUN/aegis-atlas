import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it } from "vitest";
import { BusinessDashboardStatus } from "../client/src/components/BusinessDashboardStatus";
import { MapFilterStatus } from "../client/src/components/MapFilterStatus";
import { atlasActivationRoute, atlasWorkspacePaths, atlasWorkspaceRoutes } from "../client/src/lib/atlasRoutes";
import ReportStudio from "../client/src/components/ReportStudio";
import { olympusCommandDestinations } from "../client/src/components/WorkspaceExperienceControls";

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

describe("Olympus Atlas route contracts", () => {
  it("exposes every operational domain at a distinct deep link", () => {
    expect(atlasWorkspaceRoutes).toEqual(["/", "/atlas", "/surface", "/findings", "/intelligence", "/imports", "/reports", "/operations"]);
    expect(new Set(atlasWorkspaceRoutes).size).toBe(atlasWorkspaceRoutes.length);
  });

  it("keeps the named Olympus chamber routes bound to their purposeful Atlas domains", () => {
    expect(atlasWorkspacePaths).toMatchObject({ mission: "/", atlas: "/atlas", surface: "/surface", findings: "/findings", intelligence: "/intelligence", imports: "/imports", reports: "/reports", operations: "/operations" });
  });

  it("registers the separate local-only Olympus activation workbench", () => {
    expect(atlasActivationRoute).toBe("/readiness");
    expect(atlasWorkspaceRoutes).not.toContain(atlasActivationRoute);
  });
});

describe("Muses’ Archive report controls", () => {
  it("renders the bounded local snapshot action and each report selection affordance", () => {
    const markup = renderToStaticMarkup(<ReportStudio/>);
    expect(markup).toContain("Download Markdown snapshot");
    expect(markup).toContain("Executive intelligence brief");
    expect(markup).toContain("Evidence register");
    expect(markup).toContain("Synthetic-only disclosure");
  });
});

describe("Olympus command and bounded-control contracts", () => {
  it("exposes every named chamber through the command-palette registry", () => {
    expect(olympusCommandDestinations.map(([section]) => section)).toEqual(["mission", "atlas", "surface", "findings", "intelligence", "imports", "reports", "operations"]);
    expect(new Set(olympusCommandDestinations.map(([, , key]) => key)).size).toBe(olympusCommandDestinations.length);
  });

  it("retains a source-bounded import preview with explicit quarantine semantics", async () => {
    const { previewAuthorizedImport } = await import("../server/assessment");
    const result = previewAuthorizedImport({ format: "nuclei-jsonl", payload: '{"host":"edge.helix-labs.example"}\n{"host":"production.real-target.example"}', policy: { allowedFragments: ["helix-labs.example"], excludedFragments: ["production"] } });
    expect(result.acceptedCount).toBe(1);
    expect(result.quarantinedCount).toBe(1);
    expect(result.rows[1]?.reason).toContain("excluded");
  });
});
