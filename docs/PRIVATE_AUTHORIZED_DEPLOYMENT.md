# Private Authorized Deployment Model

## Public demonstration versus private deployment

Aegis Atlas intentionally has two different operating contexts. The public repository is a **synthetic demonstration** and must never contain customer records, real target lists, service credentials, scans, endpoint telemetry, or live collection actions. A private deployment is a separately governed environment that may process only organization-owned data for a documented, explicitly authorized engagement.

| Dimension | Public demonstration | Private authorized deployment |
| --- | --- | --- |
| Data | Fictional organizations, `.example` names, documentation ranges, synthetic evidence | Consent-based organization data that is explicitly in scope |
| Connectivity | No live data connectors or collection paths | Individually reviewed, least-privilege organization-owned connectors |
| Authorization | Visible synthetic boundary | Signed engagement authorization, approved scope, exclusions, and expiration |
| Evidence | Synthetic metadata and object-storage pattern | Private evidence object storage, integrity controls, malware scanning, retention, and legal hold |
| Identity | Project authentication demonstration | Organization SSO, invitation flow, role lifecycle, revocation, and audit review |
| Outputs | Synthetic reports and export manifests | Redaction-approved, audience-bound client deliverables |

> A private deployment must fail closed: without an active authorization record, approved scope, required identity controls, and approved storage/data-processing profile, it must not accept private assessment data.

## Approved adapter classes

The private-deployment readiness control plane describes adapter **classes**, not preconfigured integrations. Each adapter requires a security review, service-identity approval, data-minimization definition, audit coverage, connector owner, retention policy, and removal procedure before use.

| Adapter class | Approved private purpose | Public-build behavior |
| --- | --- | --- |
| CMDB and asset inventory | Asset owner, business service, lifecycle, classification, and criticality enrichment | Not connected |
| Cloud and identity posture | Scoped account/resource context and authorized identity-risk metadata | Not connected |
| Vulnerability and EDR evidence | Finding metadata, evidence references, validation time, and remediation state | Not connected |
| Network and external-surface metadata | Scope-bound, customer-approved asset observation and topology context | Not connected |
| Ticketing and GRC | Ownership, remediation commitment, exception, and risk-acceptance workflow | Not connected |
| GIS and facilities systems | Organization-owned sites, floor plans, work zones, and assessment boundaries | Not connected |

## Assessment decision workbench

The added decision workbench provides a non-executing operational model for asset-service ownership, criticality, evidence freshness, evidence validation, exposure-path hypotheses, coverage gaps, and GIS coordination zones. It deliberately treats hypotheses as unconfirmed until an analyst verifies supporting evidence inside the engagement boundary.

The workbench is suitable for using outputs from approved assessment tools and private integrations. It is not a scanning, exploitation, persistence, credential, evasion, or targeting capability.

## Campaign planning and service ownership

The operations workspace now includes a synthetic **campaign planner** for external surface, internal assessment, cloud posture, API assurance, mobile assurance, wireless/field, physical/facilities, and leadership-approved red-team exercise tracks. Each track makes its authorization gates visible before any assessment activity is considered.

The linked service-ownership register adds accountable team, data classification, lifecycle, business criticality, provider context, and remediation handoff. This turns isolated technical observations into an assessment plan that has an owner, a business service, an approved scope, and a delivery path.

## Evidence-backed exposure validation and coverage

The analyst decision board treats an exposure path as a hypothesis until an analyst stages evidence, confirms or rejects the path, and records its confidence. The public build shows only synthetic examples. In a private tenant, the same decision record should persist its evidence references, reviewer, authorization state, GIS coordination zone, and audit event.

Coverage-gap cards group validation work by synthetic site or region and identify the next missing evidence condition. They provide planning context for field and remote coordination without performing collection or testing actions.

## Client delivery and enterprise posture

The delivery assurance center distinguishes executive, technical remediation, risk/compliance, and client read-only audiences. It models report versioning, metadata-only evidence bundles, release approval, remediation commitments, exceptions, attestation, and retest coordination. The public demonstration keeps release actions disabled.

The enterprise posture model covers SSO and role lifecycle, tenancy isolation and data residency, legal hold and retention, connector review, incident response, compliance evidence, and audit-export readiness. Private deployment requires these controls to be implemented—not merely displayed—before customer data is processed.

## Durable decision, delivery, and governance records

The protected workspace now persists exposure-validation records with a GIS coordination zone, evidence reference, confidence, validation state, reviewer identity, review time, and audit event. Analysts can stage a hypothesis and authorized reviewers can transition it through evidence review, confirmation, or rejection.

Private delivery governance also persists delivery-exception requests and delivery attestations, including a retest-sign-off attestation type. Connector reviews and compliance-evidence records are independent governed records, so a future private tenant can demonstrate which adapter is under review, who owns it, which residency applies, and what compliance evidence supports readiness. The public application stores only synthetic workflow metadata and keeps all external adapters disconnected.

## Recommended private deployment sequence

1. Establish a signed authorization, scope statement, exclusions, engagement expiry, and accountable sponsor.
2. Configure organization SSO, roles, audit review, private encryption, evidence storage, lifecycle settings, and incident contacts.
3. Approve the minimum necessary adapter set with scoped identities, connector owners, and data minimization.
4. Begin with an asset/CMDB and ticketing integration, validate every record against scope, then add selected evidence or GIS context.
5. Keep every assessment decision evidence-backed, analyst-confirmed, auditable, and export-redaction-aware.
