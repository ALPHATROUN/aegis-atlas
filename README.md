# Aegis Atlas

> **A GIS-first, evidence-backed mission-control workspace for authorized security assessments using synthetic data.**

Aegis Atlas turns a fictional assessment engagement into a synchronized command workspace: a cartographic atlas, relationship graph, finding queue, evidence view, change timeline, import validation surface, technique context, and report-oriented deliverable center. The project is designed as a portfolio-quality demonstration of how **geospatial intelligence and authorized security assessment workflows** can work together without exposing or acting against real targets.

## What is implemented

| Area | Included capability |
| --- | --- |
| Mission control | High-density dark workspace, engagement state, metrics, safety posture, scope and audit indicators |
| Earth & local GIS | Interactive Leaflet Earth map with real street, satellite, terrain, dark, and Earth-overview tiles; selectable synthetic pointers, dynamic clusters, declared-geofence enforcement, observation-window filtering, risk halos, region aggregation, bounded LOS context, coordinate readout, and safeguarded GeoJSON/CSV/audit exports |
| Spatiotemporal context | Synthetic STAC-style imagery catalog, acquisition and cloud metadata, temporal comparison, analyst annotation staging, persisted review restoration, and source attribution |
| Local planning | Persisted synthetic floor-plan routes with access-transition nodes, rendered AOIs, privacy-aware waypoint coordinates, offline-pack metadata, and a clearly labeled bounded 3D local-terrain perspective with illustrative structures |
| Security model | Synthetic domains, documentation hosts, services, sites, cloud regions, providers, dependencies, confidence, and provenance |
| Findings | Evidence-backed severity, ownership, remediation, retest state, and transparent risk factors |
| Relationships | Map-synchronized relationship graph with visual distinction for inferred links |
| Imports | Preview-oriented GeoJSON with bounded Leaflet geometry display, dedicated coordinate CSV validation, generic CSV/JSON, Nmap XML, Nuclei JSONL, KML, GPX, and STAC Item support with scope evaluation and quarantine logic |
| Intelligence | ATT&CK-style coverage states, STIX-compatible relationship preview, citation-preserving evidence context |
| Reports | Executive, technical, geographic, evidence-register, and retest report views with export-integrity metadata |
| Assistant | Citation-backed, analyst-confirmed draft assistant that cannot modify records automatically |
| Production operations | Protected task, governed GIS artifact, report-delivery, role-aware engagement-write, reusable templates, synthetic client workspaces, scoped governance, import decisions, analyst comments, review/retest events, in-app notifications, approval records, read-only share records, immutable audit ledger, delivery-governance, and business-packaging workflows |
| Private deployment readiness | Fail-closed authorization checklist, governed adapter inventory, campaign planner, business-service ownership, analyst exposure validation, GIS coverage gaps, client delivery assurance, and enterprise governance posture—without live external connectivity in the public build |
| Enterprise operating system | Private integration catalog, automation policy preview, customer invitation/delivery model, analyst workbench, spatial stewardship, remediation scenarios, assurance-control library, identity/tenancy readiness, and engineering quality control room—all synthetic and outbound-locked in the public build |
| Command-center experience | First-run authorized-use orientation, contextual keyboard guidance, global command palette, responsive mobile navigation, analyst density control, empty-state guidance, and visible export/automation safety boundaries |
| Public-safe service readiness | RACI and SLA planning, evidence/delivery closure checklists, assurance and supplier registers, commercial-readiness models, synthetic SLO/recovery/performance controls, localization and accessibility verification workflows—without private data, external actions, or claims of live service operation |
| Persistence design | Database metadata schema for engagements, assets, findings, audit events, saved views, team membership, tasks, governed geospatial artifacts, report deliveries, evidence references, governance lifecycle, import decisions, collaboration comments, task-review events, and expiring share records; secure object storage for evidence bytes |
| Evidence intake | Bounded, media-type-validated upload to object storage with SHA-256, classification, custody metadata, storage reference, retention state, and audit event; no file bytes are stored in the database |

## Safety and data boundary

**This repository contains only synthetic data.** All domains use the reserved `.example` namespace; the displayed address uses a documentation-only IPv4 range; all organizations, providers, facilities, findings, evidence, and relationships are fictional.

The application is deliberately designed around a visible safety boundary. It displays authorization state, declared in-scope objects, excluded activity, synthetic-data labeling, provenance, confidence, and audit trail context. It does **not** include remote scanning, credential attacks, exploit execution, target discovery, or real-world assessment data.

Read the full [Authorized Use Policy](docs/AUTHORIZED_USE.md) before adapting the project.

## Local development

```bash
pnpm install
pnpm dev
```

The development server exposes the local application. Run the quality checks before committing:

```bash
pnpm test
pnpm check
```

## Architecture

The project uses a React + TypeScript frontend, tRPC server, Drizzle/MySQL metadata model, and object-storage reference pattern. The application keeps evidence bytes outside the database and persists only reference metadata such as storage key, content type, hash, byte size, classification, and provenance.

For implementation details, read the [Architecture Notes](docs/ARCHITECTURE.md), [Data Model Reference](docs/DATA_MODEL.md), [Production Readiness](docs/PRODUCTION_READINESS.md), [Governance and Collaboration](docs/GOVERNANCE_AND_COLLABORATION.md), [Private Authorized Deployment Model](docs/PRIVATE_AUTHORIZED_DEPLOYMENT.md), [Deployment and Configuration Guide](docs/DEPLOYMENT_CONFIGURATION.md), [Business Model](docs/BUSINESS_MODEL.md), [Operations Runbook](docs/OPERATIONS_RUNBOOK.md), and [Product Roadmap](docs/ROADMAP.md).

## Sample artifacts

The [`samples/`](samples) directory contains completely synthetic fixtures for GeoJSON, CSV, Nmap XML, Nuclei JSONL, and STIX-compatible relationship exchange. These files are intended for parser tests, demonstrations, and local interface exploration; they must never be replaced with client data in a public repository.

## Project structure

```text
client/src/pages/MissionControl.tsx   Mission-control workspace and interaction states
client/src/components/EarthMap.tsx    Interactive Earth/satellite/terrain mapping and synthetic geographic layers
client/src/components/AtlasGraph.tsx  Relationship visualization
client/src/components/ProductionOperations.tsx  Production operations, governed delivery, evidence intake, and typed business dashboard
client/src/components/GovernanceCollaborationPanel.tsx  Authenticated governance, collaboration, review, and controlled-sharing patterns
client/src/lib/atlasData.ts           Synthetic assessment dataset
client/src/lib/gisWorkspace.ts        Persisted imagery, AOI, local-planning, and terrain-context restoration helpers
server/assessment.ts                  Scope enforcement, risk scoring, import preview, cited draft logic
server/accessControl.ts               Pure engagement role gates used by protected workflows
server/evidenceStorage.ts             Object-storage metadata reference pattern
server/governance.ts                  Evidence-media and coordinate-precision policy helpers
server/*.test.ts                      Core workflow and governance tests
drizzle/schema.ts                     Workspace metadata schema and governance/collaboration lifecycle tables
shared/exportGovernance.ts            Synthetic export watermark and safeguard manifest helper
shared/businessMetrics.ts             Typed non-customer business demonstration data source
docs/                                 Architecture, policy, and data reference
samples/                              Safe synthetic import fixtures
```

## Design intent

The interface follows a **classified synthetic geospatial command atlas** visual system: void-black fields, restrained amber signal color, cartographic grids, confidence radii, relationship lines, procedural copy, and clear red/blue operational states. The central map is deliberately the operational focus—not a decorative dashboard panel.

## Extending responsibly

Useful future extensions include OGC API Feature adapters; STIX/TAXII feed ingestion; an organization-managed 3D globe and building stream; organization SSO; a managed malware-scanning pipeline; customer-approved imagery credentials; report sharing with expiring access; and fully administered engagement membership. Any extension must retain scope enforcement, synthetic/public-data separation, provenance, analyst confirmation, and auditability.

## License and contributions

This project is intended for educational and authorized-assessment use. Before accepting external contributions, review the policy and add a license appropriate to your organization’s requirements. Contributions should include tests for parser, scoring, scope, or interface behavior they change.
