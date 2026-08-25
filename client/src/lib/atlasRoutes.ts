export type AtlasSection = "mission" | "atlas" | "surface" | "findings" | "intelligence" | "imports" | "reports" | "operations";

export const atlasWorkspacePaths: Record<AtlasSection, string> = {
  mission: "/",
  atlas: "/atlas",
  surface: "/surface",
  findings: "/findings",
  intelligence: "/intelligence",
  imports: "/imports",
  reports: "/reports",
  operations: "/operations",
};

export const atlasWorkspaceRoutes = Object.values(atlasWorkspacePaths) as string[];
export const atlasRouteSection = Object.fromEntries(Object.entries(atlasWorkspacePaths).map(([section, path]) => [path, section as AtlasSection])) as Record<string, AtlasSection>;
export const atlasActivationRoute = "/readiness" as const;
