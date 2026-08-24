# Deployment and Configuration Guide

## Environment configuration

Aegis Atlas uses platform-provided database, authentication, and object-storage configuration. Do not commit secrets, access tokens, customer-map credentials, or imagery API keys. Private deployments should configure secrets through the hosting environment and restrict them to the server runtime.

| Concern | Production configuration |
| --- | --- |
| Authentication | Organization-managed identity provider, enforced MFA, and short session lifetime |
| Database | Encrypted managed MySQL-compatible service, automated backups, least-privilege application user, and network allow list |
| Object storage | Private bucket, encrypted storage, lifecycle policy, scanning pipeline, and signed, short-lived reads |
| Maps and imagery | Approved provider credentials, attribution, licensing review, tile usage limits, acquisition-date disclosure, and caching policy |
| Evidence policy | Size limit, approved media types, SHA-256, classification, retention state, custody record, malware scan state, and engagement-level authorization |
| Observability | Structured logs, error tracking, audit export, database monitoring, storage access audit, and incident alerting |

## Role configuration

The data model supports manager, analyst, reviewer, and read-only engagement roles. Production deployments should administer active membership at the engagement level. Manager or analyst access is required for protected task, geospatial-artifact, report-delivery, and evidence-intake writes; read-only members must not receive write permissions.

## GIS configuration

The public project exposes street, satellite, terrain, dark, and Earth-overview tiles solely for synthetic context. A private deployment should choose approved providers, preserve visible attribution, define offline caching rules, record tile/scene provenance, and forbid the use of basemap context as authority to access a location or collect from a system.

## Release sequence

Apply database migrations, run `pnpm test` and `pnpm check`, deploy to a private environment, validate authentication and evidence storage, test scope quarantine, verify report redaction, conduct a role-permission review, and complete an authorized engagement dry run before customer onboarding.
