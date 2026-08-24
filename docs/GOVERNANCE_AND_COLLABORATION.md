# Governance and Collaboration

## Purpose

This document describes the production-oriented controls implemented in the public Aegis Atlas demonstration. The controls are intentionally designed around **synthetic, authorized assessment records**. They do not grant authority to collect, test, or share real-world target information.

## Governance lifecycle

Every engagement can retain one current governance record. It captures scope approval, import gating, data-origin label, retention profile, redaction profile, and export watermark. A manager-only update appends an immutable audit event. The record is designed to make the delivery boundary visible before a GIS artifact, evidence reference, or report is promoted.

| Control | States or values | Operational effect in this project |
| --- | --- | --- |
| Scope approval | Draft, pending review, approved, expired, blocked | Makes authorization lifecycle explicit; manager-only updates are audited. |
| Import gate | Review required, approved, blocked | Records a named, hashed synthetic import decision with rationale. |
| Data origin | `synthetic-authorized-demo` | Ensures the public interface and export manifest carry a visible provenance boundary. |
| Retention profile | Demo session, engagement, legal hold, restricted | Preserves lifecycle intent for metadata and evidence references; raw bytes remain in object storage. |
| Redaction profile | Synthetic demo, internal, client, restricted | Is retained with governed report delivery records and export manifests. |
| Watermark | Synthetic authorized demonstration | Is included in GIS export metadata or the coordinate CSV comment row. |

> The public demonstration intentionally provides **no action that bypasses declared scope, imports non-lab targets, or releases an unauthenticated report URL**.

## Role model

The engagement membership model applies a narrow least-privilege policy. Global administrators are allowed through the protected write guards for project administration; other users must have an active membership at the applicable level.

| Capability | Manager | Analyst | Reviewer | Read-only |
| --- | ---: | ---: | ---: | ---: |
| View private engagement operations | Yes | Yes | Yes | Yes |
| Stage tasks, GIS artifacts, evidence metadata, and comments | Yes | Yes | No | No |
| Approve reports, record task review, or retest sign-off | Yes | No | Yes | No |
| Update governance or assign engagement members | Yes | No | No | No |

## Collaboration and delivery records

The workspace persists narrowly scoped metadata for collaboration. Comments can attach to an engagement, task, finding, or report delivery. Task-review events capture requested review, approved review, changes requested, or retest sign-off. Report approvals record the approving user. Read-only delivery shares are represented as an expiring token record, rather than an exposed public report endpoint.

This separation is deliberate: the public repository demonstrates the workflow and auditability model without publishing client data or creating an uncontrolled delivery channel.

## Templates, workspaces, notifications, and audit visibility

Managers can persist reusable engagement templates that describe the default synthetic scope, import, and report-redaction gates. Administrators can register synthetic client/project workspace metadata with a constrained workspace code and classification. Both concepts remain metadata-only in the public demonstration.

The authenticated operations view also contains an in-app notification ledger. Governance updates, member assignment, task review or retest sign-off, report approval, and delivery-share creation append a notification record for the relevant workspace user. Notifications can be marked read by their recipient; they do not send external email, messaging, or webhook traffic.

An **immutable engagement audit ledger** renders the appended metadata events in a read-only surface. It is intentionally separate from mutation controls so an analyst can inspect the sequence of template, membership, governance, import, review, approval, and sharing actions without being offered an edit path.

## Export safeguards

GIS exports are generated only from the local synthetic dataset. The GeoJSON, coordinate CSV, and audit snapshot add a synthetic export manifest or watermark that retains the authorization label, data-origin label, retention setting, redaction profile, coordinate precision, selected scene, and a list of safeguards. The manifest makes clear that the exported record is not evidence of a real target or permission to perform collection.

The import workbench now provides a dedicated **Coordinate CSV** parser that requires a named `name` or `host` column plus valid `latitude` and `longitude` fields. It validates coordinates before scope evaluation. GeoJSON fixtures render in a bounded Leaflet preview prior to promotion, while coordinate rows are shown in a typed mapping preview. Neither preview materializes an external target in the atlas without analyst approval and scope enforcement.

## Validation coverage

The automated suite exercises the pure role gates, export-manifest safeguards, typed business snapshot shape, persisted GIS restoration, and synthetic line-of-sight labeling. Existing coverage continues to validate risk scoring, scope quarantine, import formats, assistant citations, evidence intake policy, and coordinate rounding.
