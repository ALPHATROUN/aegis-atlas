import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getActiveEngagementMembership: vi.fn(),
  createAssessmentTask: vi.fn(),
  appendAssessmentAuditEvent: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./db")>()),
  getActiveEngagementMembership: dbMocks.getActiveEngagementMembership,
  createAssessmentTask: dbMocks.createAssessmentTask,
  appendAssessmentAuditEvent: dbMocks.appendAssessmentAuditEvent,
}));

import { appRouter } from "./routers";

describe("protected workspace mutation guards", () => {
  beforeEach(() => {
    dbMocks.getActiveEngagementMembership.mockReset();
    dbMocks.createAssessmentTask.mockReset();
    dbMocks.appendAssessmentAuditEvent.mockReset();
  });

  it("rejects a read-only member before creating an engagement task", async () => {
    dbMocks.getActiveEngagementMembership.mockResolvedValue({ workspaceRole: "read-only" });
    const caller = appRouter.createCaller({ user: { id: 42, role: "user" } } as never);
    await expect(caller.workspace.createTask({ engagementId: 1, title: "Blocked synthetic task", priority: "low" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.createAssessmentTask).not.toHaveBeenCalled();
    expect(dbMocks.appendAssessmentAuditEvent).not.toHaveBeenCalled();
  });
});
