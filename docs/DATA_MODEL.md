# Data Model Reference

## Core vocabulary

| Entity | Definition | GIS relevance |
| --- | --- | --- |
| Engagement | Authorized assessment container with scope and safety posture | Governs what can appear in a map or report |
| Asset | Domain, host, service, site, cloud region, provider, or custom record | May contain exact, approximate, inferred, or absent geometry |
| Finding | Evidence-backed assessment conclusion | Links risk to affected asset and location context |
| Evidence artifact | File stored outside the database | Provides source, integrity hash, classification, and provenance |
| Relationship | A typed link between two records | Enables map lines, graph edges, dependency and concentration analysis |
| Audit event | Traceable action or state change | Makes scope, import, review, and reporting activities accountable |
| Saved view | Reproducible map and filter state | Supports handoff and report snapshots |

## Location-confidence policy

Location attributes must include a confidence and provenance. A verified facility coordinate, a cloud-region label, an inferred provider location, and an approximate IP geolocation are different claims. The visual system should show them differently, and reports should retain those distinctions.

## Evidence metadata

Evidence metadata includes object-storage key and URL, original filename, media type, byte size, SHA-256, classification, source metadata, engagement link, and optional finding link. The object store is the file source of truth; the database is the queryable metadata index.

## Risk semantics

Aegis Atlas calculates a transparent prioritization value by exposing four components: base severity, evidence confidence, external exposure, and business-path criticality. The score is a workflow aid, not a replacement for professional judgment. Analysts may add rationale or override a conclusion, but that action should be audit logged.
