# Production Readiness

## Purpose and boundary

Aegis Atlas is designed for **authorized security assessment and exposure-management teams** that need to connect scoped technical findings with geographic, provider, facility, and evidence context. The public project remains synthetic by design. A private deployment must obtain explicit engagement authorization and establish a data-processing agreement before accepting customer records.

## Deployment architecture

| Layer | Responsibility | Production requirement |
| --- | --- | --- |
| React workspace | GIS views, analyst workflows, reporting, and confirmation controls | Content Security Policy, controlled origins, accessibility review, and client-side upload limits |
| tRPC service | Typed policy enforcement and workflow contracts | Authentication, authorization, request limits, audit logging, and structured error handling |
| Relational database | Metadata, scope, finding, task, report, and audit records | Encryption, backups, least-privilege database identity, and retention policy |
| Object storage | Evidence bytes and report attachments | Private bucket, short-lived signed access, malware scanning pipeline, lifecycle policies, and immutable integrity metadata |
| Map / imagery sources | Geographic context | License attribution, legal review, caching policy, acquisition-date disclosure, and no unsupported collection claims |

## Required deployment controls

The deployment should use an organization-managed identity provider, per-engagement membership, least-privilege roles, environment-scoped secrets, database backups, application monitoring, and scheduled vulnerability dependency review. The initial implementation exposes protected workflows through authenticated procedures and records accountable workflow activity. Private deployments should extend the engagement-membership table with invitation, revocation, and approval administration before external use.

## Evidence and data lifecycle

Evidence file bytes belong in object storage. Aegis Atlas persists only object key, reference URL, media type, byte size, SHA-256, classification, provenance, and custody metadata in the database. Each private deployment should define classification, retention duration, legal hold behavior, malware scanning, deletion confirmation, report sharing, and export approval procedures before processing customer data.

## Operational release checklist

| Control | Release decision |
| --- | --- |
| Scope approval and exclusions reviewed | Required before any data intake |
| Engagement members assigned with role | Required before write access |
| Evidence storage and scanning path verified | Required before upload enabled |
| Basemap/imagery attribution visible | Required before GIS release |
| Report redaction profile chosen | Required before external sharing |
| Automated tests and type check passing | Required before promotion |
| Backup, alerting, incident process, and owner contact validated | Required before customer production use |

## Public demonstration limitations

The repository intentionally does not include live scanning, exploitation, credential operations, real targets, customer data, paid imagery credentials, or automated actions against external systems. These exclusions are part of the product safety model, not incomplete functionality.
