# Test Matrix

| Layer | Current verification | Private-deployment extension |
|---|---|---|
| Domain helpers | Risk, import, scope, coordinate, export, and governance unit tests | Add tenant, retention, and connector-policy cases. |
| Router guards | Read-only membership rejection for protected task and exposure writes | Test every role, membership state, tenant boundary, and idempotency behavior. |
| Render state | Dashboard and map-status component rendering | Add authenticated delivery, connector, and accessibility flows. |
| Database | Schema migrations reviewed and applied | Add migration rollback rehearsal and tenant-isolation tests. |
| Visual | Desktop and mobile operations screenshots | Add browser automation for key workflows and focus traversal. |
| Recovery | Checklist and runbook documentation | Execute encrypted backup restore drills in the private environment. |

## Release gate

A private release should require clean type checks, passing test suite, reviewed migration, approval of the security/privacy change record, visual regression review, accessibility review, backup/restore evidence, and a monitored post-release window.
