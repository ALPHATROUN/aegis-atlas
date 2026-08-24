# ADR 0001: Public Synthetic / Private Authorized Boundary

**Status:** Accepted

## Decision

The public application uses fictional organizations, demonstration records, and outbound-locked control planes. Real assets, evidence, integrations, identities, messages, and customer data require a separately authorized private tenant.

## Consequences

The public product remains portfolio-safe and non-harmful. Private deployment must add tenant isolation, identity lifecycle, data-processing controls, secrets management, scoped connectivity, redaction, audit retention, and incident operations before importing organization data.
