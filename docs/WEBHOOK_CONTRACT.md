# Private Webhook Contract

## Public-demo behavior

No webhook is emitted by the public project. The examples below specify a private-tenant contract only.

## Envelope

```json
{
  "id": "evt_private_example_001",
  "type": "delivery.attested",
  "occurredAt": "2026-08-24T09:00:00.000Z",
  "tenantId": "private-tenant-reference",
  "engagementId": 1,
  "data": {
    "attestationType": "retest-sign-off",
    "audience": "technical",
    "classification": "restricted"
  }
}
```

## Delivery controls

Use HTTPS, per-tenant endpoint allow-lists, HMAC signature headers, timestamp validation, replay protection, retry backoff, delivery IDs, redacted payloads, and a manual revocation path. A failed delivery must never change assessment, approval, or retest status; the record remains in the application audit ledger.

## Event categories

| Category | Example event | Private prerequisite |
|---|---|---|
| Governance | `scope.approved` | Authorized tenant and verified signer. |
| Delivery | `delivery.attested` | Audience, redaction, expiry, and approval gate. |
| Evidence | `evidence.reviewed` | Classification and custody-safe payload. |
| Connector | `connector.reviewed` | Owner, residency, scope, and revocation record. |
