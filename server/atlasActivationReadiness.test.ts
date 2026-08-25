import { describe, expect, it } from "vitest";
import { assessOlympusActivation, buildOlympusActivationPacket, type OlympusActivationPlan } from "@shared/atlasActivationReadiness";

const completePlan: OlympusActivationPlan = { organizationKey: "olympus-demo", scopeApprovalReference: "AUTH-2026-HELIOS-01", dataRegion: "eu-central-1", identityIssuerUrl: "https://id.example.com", identityAudience: "aegis-atlas", storagePrefix: "atlas/olympus-demo/", encryptionKeyReference: "kms/atlas-olympus", connectorOwner: "Platform evidence owner", approvedReadOnlyScope: "Customer-approved read-only inventory metadata for the declared assessment only.", recoveryOwner: "Recovery accountable owner", releaseApprover: "Release accountable owner" };

describe("Olympus Atlas activation readiness", () => {
  it("marks a complete non-secret plan review-ready without activating any external system", () => {
    expect(assessOlympusActivation(completePlan)).toMatchObject({ status: "review-ready", readyCount: 6, totalCount: 6 });
    expect(buildOlympusActivationPacket(completePlan).nonActivationStatement).toContain("cannot create a tenant");
  });

  it("blocks secret-like owner input and an unapproved scope", () => {
    const assessment = assessOlympusActivation({ ...completePlan, connectorOwner: "secret token", approvedReadOnlyScope: "short" });
    expect(assessment.status).toBe("incomplete");
    expect(assessment.gates.find((gate) => gate.id === "connector")?.state).toBe("blocked");
  });
});
