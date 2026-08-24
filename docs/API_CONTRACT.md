# Private API Contract

## Boundary

All production procedures are exposed through the typed tRPC contract under `/api/trpc`. The public build is synthetic-only. Private deployment must require tenant authentication, engagement-scoped authorization, audit logging, request limits, schema validation, and redaction.

| Contract family | Representative procedure | Required control |
|---|---|---|
| Workspace read | `workspace.operationsSnapshot` | Active membership or administrator; engagement-scoped records only. |
| Assessment workflow | `workspace.createExposureValidation` | Analyst/manager write access; evidence reference; audit event. |
| Review workflow | `workspace.reviewExposureValidation` | Reviewer/manager access; confidence transition, reviewer, timestamp, audit event. |
| Delivery governance | `workspace.createDeliveryException`, `workspace.createDeliveryAttestation` | Approved audience, expiry, attestation identity, and immutable audit history. |
| Integration governance | `workspace.createConnectorReview`, `workspace.createComplianceEvidence` | Manager approval, tenant ownership, minimization and residency evidence. |

## Request policy

Private deployments should impose a tenant-aware limit before application execution. Recommended policy is a small burst allowance for interactive reads, lower limits for export and upload actions, body-size caps, request IDs, idempotency keys for writes, and an allow-list for privileged operations. Never place access tokens, raw evidence bytes, or precise restricted coordinates in API logs.

## Versioning

Additive tRPC fields may be introduced in a minor release. Breaking input or response changes require a documented deprecation period, migration note, contract test, and architecture decision record.
