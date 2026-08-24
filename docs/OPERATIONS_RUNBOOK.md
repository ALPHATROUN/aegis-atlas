# Operations Runbook

## Start an engagement

Create an engagement only after a written authorization exists. Record the engagement code, approval period, in-scope systems and areas, exclusions, permitted data sources, permitted analyst actions, client contacts, and expected report recipients. Assign an engagement manager, at least one analyst, and a reviewer before enabling write workflows.

## Intake workflow

Import data through the preview and quarantine process. Review schema status, scope-policy outcome, duplicate candidates, and provenance before approval. Coordinate data should be tagged as exact, rounded, inferred, or synthetic. Satellite or aerial context must show source attribution, acquisition-time information where supplied, and an analyst review state.

## Evidence workflow

Use secure evidence intake for permitted artifacts. Verify the object-storage reference, SHA-256, classification, provenance, and retention state. Associate evidence with a finding only after review. Never place bytes, secrets, access tokens, or unapproved customer data in a finding description, task, or general comment.

## Finding and retest workflow

Every finding should include scope context, evidence reference, severity, confidence, risk factors, owner, remediation, and retest status. Status changes require analyst confirmation and generate an audit event. Mark a finding verified only after the agreed retest evidence is reviewed.

## Report delivery workflow

Create a governed delivery draft with the appropriate report type and redaction profile. Confirm that authorization, scope, exclusions, provenance, evidence references, and synthetic/customer data banners are present. A reviewer approves before sharing. Maintain a supersession chain when reports are updated.

## Incident and exception handling

If out-of-scope data enters a preview, quarantine it immediately and do not promote it to map, report, or finding. If an artifact is misclassified, change its access state, record an audit event, and follow the organization’s retention and notification process. If authorization expires, block data-intake and report-delivery actions pending renewal.
