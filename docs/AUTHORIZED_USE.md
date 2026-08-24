# Authorized Use Policy

## Purpose

Aegis Atlas is an assessment-intelligence workspace. It is intended to organize, validate, visualize, and report **authorized** security assessment information. It is not a platform for unapproved discovery, targeting, credential activity, exploitation, or interference with systems.

## Required conditions

Use the project only when there is a documented authorization, a declared target scope, a defined assessment period, an agreed activity boundary, and a designated owner responsible for results. Every engagement should identify in-scope targets, excluded targets, test limitations, data-retention rules, and escalation contacts before any data enters the workspace.

| Control | Required behavior |
| --- | --- |
| Authorization | Record the authorizing party, time window, and permitted assessment category |
| Scope | Maintain explicit in-scope and excluded targets; quarantine unapproved records |
| Data | Keep client data private; never publish it in a repository, screenshot, fixture, or report sample |
| Evidence | Store file bytes in secured object storage and persist only metadata references in the database |
| Safety | Keep remote scanning, exploit execution, credential activity, and active validation disabled unless separately controlled and authorized |
| Assistant | Treat AI-generated text as an analyst draft that requires review and confirmation |
| Reporting | Preserve provenance, confidence, limitations, and synthetic-data labels where relevant |

## Public repository rule

The public project must remain demonstrably safe. Use fictional organizations and sites, `.example` domains, documentation address ranges, fabricated findings, and synthetic evidence. Do not commit private targets, client screenshots, API tokens, unredacted exports, live credentials, proprietary topology, or undisclosed vulnerabilities.

## Prohibited uses

The following are outside this project’s intended use: unauthorized network interaction; target enumeration without permission; malicious payload delivery; credential harvesting; persistence; denial-of-service activity; destructive testing; evasion; operational instructions against third parties; and presentation of inferred links as confirmed compromise.

## Disclosure and escalation

When adapting this project for a real authorized engagement, define the engagement’s escalation path before testing. Critical findings, suspected exposure, or data-handling incidents should be reported through the authorized process—not published or stored in a shared demo environment.
