# Aegis Atlas

> **A GIS-first, evidence-backed mission-control workspace for authorized security assessments using synthetic data.**

Aegis Atlas turns a fictional assessment engagement into a synchronized command workspace: a cartographic atlas, relationship graph, finding queue, evidence view, change timeline, import validation surface, technique context, and report-oriented deliverable center. The project is designed as a portfolio-quality demonstration of how **geospatial intelligence and authorized security assessment workflows** can work together without exposing or acting against real targets.

## What is implemented

| Area | Included capability |
| --- | --- |
| Mission control | High-density dark workspace, engagement state, metrics, safety posture, scope and audit indicators |
| GIS atlas | Interactive synthetic map with selectable assets, clusters/risk context, inferred-location rings, layers, zoom controls, and timeline controls |
| Security model | Synthetic domains, documentation hosts, services, sites, cloud regions, providers, dependencies, confidence, and provenance |
| Findings | Evidence-backed severity, ownership, remediation, retest state, and transparent risk factors |
| Relationships | Map-synchronized relationship graph with visual distinction for inferred links |
| Imports | Preview-oriented GeoJSON, CSV, generic JSON, Nmap XML, and Nuclei JSONL support with scope evaluation and quarantine logic |
| Intelligence | ATT&CK-style coverage states, STIX-compatible relationship preview, citation-preserving evidence context |
| Reports | Executive, technical, geographic, evidence-register, and retest report views with export-integrity metadata |
| Assistant | Citation-backed, analyst-confirmed draft assistant that cannot modify records automatically |
| Persistence design | Database metadata schema for engagements, assets, findings, audit events, saved views, and evidence references; secure object storage for evidence bytes |

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

For implementation details, read the [Architecture Notes](docs/ARCHITECTURE.md) and [Data Model Reference](docs/DATA_MODEL.md).

## Sample artifacts

The [`samples/`](samples) directory contains completely synthetic fixtures for GeoJSON, CSV, Nmap XML, Nuclei JSONL, and STIX-compatible relationship exchange. These files are intended for parser tests, demonstrations, and local interface exploration; they must never be replaced with client data in a public repository.

## Project structure

```text
client/src/pages/MissionControl.tsx   Mission-control workspace and interaction states
client/src/components/AtlasMap.tsx    Custom synthetic GIS canvas
client/src/components/AtlasGraph.tsx  Relationship visualization
client/src/lib/atlasData.ts           Synthetic assessment dataset
server/assessment.ts                  Scope enforcement, risk scoring, import preview, cited draft logic
server/evidenceStorage.ts             Object-storage metadata reference pattern
server/assessment.test.ts             Core workflow tests
drizzle/schema.ts                     Workspace metadata schema
docs/                                 Architecture, policy, and data reference
samples/                              Safe synthetic import fixtures
```

## Design intent

The interface follows a **classified synthetic geospatial command atlas** visual system: void-black fields, restrained amber signal color, cartographic grids, confidence radii, relationship lines, procedural copy, and clear red/blue operational states. The central map is deliberately the operational focus—not a decorative dashboard panel.

## Extending responsibly

Useful future extensions include a local-only, authorization-gated importer workflow; OGC API Feature adapters; STIX/TAXII feed ingestion; indoor or 3D map adapters; richer report export; object-storage upload UI; and fully authenticated engagement persistence. Any extension must retain scope enforcement, synthetic/public-data separation, provenance, analyst confirmation, and auditability.

## License and contributions

This project is intended for educational and authorized-assessment use. Before accepting external contributions, review the policy and add a license appropriate to your organization’s requirements. Contributions should include tests for parser, scoring, scope, or interface behavior they change.
