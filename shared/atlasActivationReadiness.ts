export type OlympusActivationPlan = {
  organizationKey: string;
  scopeApprovalReference: string;
  dataRegion: string;
  identityIssuerUrl: string;
  identityAudience: string;
  storagePrefix: string;
  encryptionKeyReference: string;
  connectorOwner: string;
  approvedReadOnlyScope: string;
  recoveryOwner: string;
  releaseApprover: string;
};

export type OlympusActivationGate = { id: string; label: string; state: "ready" | "blocked"; detail: string };

function named(value: string) { return value.trim().length >= 3 && !/(password|secret|token|private.?key|credential)/i.test(value); }

export function assessOlympusActivation(plan: OlympusActivationPlan) {
  const gates: OlympusActivationGate[] = [
    { id: "authorization", label: "Engagement authorization", state: /^[A-Z0-9-]{6,80}$/i.test(plan.scopeApprovalReference) ? "ready" : "blocked", detail: "A non-secret signed-authorization reference is required before private intake." },
    { id: "tenant", label: "Tenant and region", state: /^[a-z0-9-]{3,80}$/.test(plan.organizationKey) && plan.dataRegion.trim().length >= 2 ? "ready" : "blocked", detail: "A normalized tenant key and declared data region are required." },
    { id: "identity", label: "Identity boundary", state: /^https:\/\//.test(plan.identityIssuerUrl) && plan.identityAudience.trim().length >= 3 ? "ready" : "blocked", detail: "HTTPS identity metadata and an audience are required; no secret values are accepted." },
    { id: "custody", label: "Evidence custody", state: plan.storagePrefix.trim().endsWith("/") && plan.storagePrefix.trim().includes("/") && named(plan.encryptionKeyReference) ? "ready" : "blocked", detail: "An isolated prefix and non-secret encryption-key reference are required." },
    { id: "connector", label: "Read-only connector review", state: named(plan.connectorOwner) && plan.approvedReadOnlyScope.trim().length >= 24 ? "ready" : "blocked", detail: "A named owner and customer-approved read-only scope are required; no provider is contacted." },
    { id: "assurance", label: "Recovery and release ownership", state: named(plan.recoveryOwner) && named(plan.releaseApprover) ? "ready" : "blocked", detail: "Named recovery and release owners are required; the packet cannot deploy anything." },
  ];
  const readyCount = gates.filter((gate) => gate.state === "ready").length;
  return { gates, readyCount, totalCount: gates.length, status: readyCount === gates.length ? "review-ready" as const : "incomplete" as const, boundary: "This Olympus Atlas workbench validates a local non-secret activation plan only. It cannot create a tenant, validate a signed authorization, federate identity, access evidence storage, accept credentials, connect a provider, target a system, or deploy a service." };
}

export function buildOlympusActivationPacket(plan: OlympusActivationPlan) {
  const assessment = assessOlympusActivation(plan);
  return { schema: "aegis-atlas-olympus-activation/v1", generatedAt: new Date().toISOString(), status: assessment.status, tenant: { key: plan.organizationKey, region: plan.dataRegion }, authorization: { reference: plan.scopeApprovalReference, state: "not externally validated" }, identity: { issuerUrl: plan.identityIssuerUrl, audience: plan.identityAudience, operation: "not federated" }, evidenceCustody: { tenantPrefix: plan.storagePrefix, encryptionKeyReference: plan.encryptionKeyReference, operation: "not connected" }, connector: { owner: plan.connectorOwner, approvedReadOnlyScope: plan.approvedReadOnlyScope, operation: "read-only-disabled" }, accountableOwners: { recovery: plan.recoveryOwner, release: plan.releaseApprover }, gates: assessment.gates, nonActivationStatement: assessment.boundary };
}
