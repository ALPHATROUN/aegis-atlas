import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { buildCitedAssistantDraft, calculateTransparentRiskScore, previewAuthorizedImport } from "./assessment";
import { appendAssessmentAuditEvent, approveReportDelivery, createAssessmentComment, createAssessmentTask, createClientWorkspace, createEngagementNotification, createEngagementTemplate, createEvidenceReference, createGeospatialArtifact, createImportDecision, createReportDelivery, createReportShareLink, createSavedAtlasView, createTaskReviewEvent, getActiveEngagementMembership, getEngagementGovernance, getSavedAtlasViewsForOwner, getWorkspaceRecords, listAssessmentAuditEvents, listAssessmentComments, listAssessmentTasks, listClientWorkspaces, listEngagementMembers, listEngagementNotifications, listEngagementTemplates, listGeospatialArtifacts, listImportDecisions, listReportDeliveries, listReportShareLinks, listTaskReviewEvents, markEngagementNotificationRead, updateAssessmentTaskStatus, upsertEngagementGovernance, upsertEngagementMember } from "./db";
import { storeEvidenceArtifact } from "./evidenceStorage";
import { validateEvidenceIntake } from "./governance";
import { buildSyntheticBusinessSnapshot } from "@shared/businessMetrics";
import { canManageEngagement, canReadEngagement, canReviewEngagement, canWriteEngagement, type EngagementRole } from "./accessControl";

async function requireEngagementWrite(user: { id: number; role: "user" | "admin" }, engagementId: number) {
  if (user.role === "admin") return "manager" as const;
  const membership = await getActiveEngagementMembership(engagementId, user.id);
  if (!membership || !canWriteEngagement(membership.workspaceRole as EngagementRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Active analyst or manager engagement membership is required for this operation" });
  return membership.workspaceRole;
}

async function requireEngagementReview(user: { id: number; role: "user" | "admin" }, engagementId: number) {
  if (user.role === "admin") return "manager" as const;
  const membership = await getActiveEngagementMembership(engagementId, user.id);
  if (!membership || !canReviewEngagement(membership.workspaceRole as EngagementRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Active reviewer or manager engagement membership is required for this operation" });
  return membership.workspaceRole;
}

async function requireEngagementManager(user: { id: number; role: "user" | "admin" }, engagementId: number) {
  if (user.role === "admin") return "manager" as const;
  const membership = await getActiveEngagementMembership(engagementId, user.id);
  if (!membership || !canManageEngagement(membership.workspaceRole as EngagementRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Active manager engagement membership is required for this operation" });
  return membership.workspaceRole;
}

async function requireEngagementRead(user: { id: number; role: "user" | "admin" }, engagementId: number) {
  if (user.role === "admin") return "manager" as const;
  const membership = await getActiveEngagementMembership(engagementId, user.id);
  if (!membership || !canReadEngagement(membership.workspaceRole as EngagementRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Active engagement membership is required to view private operations" });
  return membership.workspaceRole;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  workspace: router({
    demoSafety: publicProcedure.query(() => ({
      engagement: "Helix Meridian Assessment",
      authorization: "AUTHORIZED · SYNTHETIC LAB ONLY",
      scope: ["*.helix-labs.example", "203.0.113.0/24", "Aurora Compute Region", "Northstar Relay Campus"],
      excluded: ["Production systems", "Non-lab addresses", "Credential attacks", "Exploit execution"],
    })),
    businessSnapshot: protectedProcedure.query(() => buildSyntheticBusinessSnapshot()),
    previewImport: publicProcedure.input(z.object({
      format: z.enum(["geojson", "coordinate-csv", "csv", "json", "nmap-xml", "nuclei-jsonl", "kml", "gpx", "stac-item"]),
      payload: z.string().max(250_000),
    })).mutation(({ input }) => previewAuthorizedImport({
      ...input,
      policy: {
        allowedFragments: ["helix-labs.example", "203.0.113.", "Aurora", "Northstar"],
        excludedFragments: ["production", "real-target", "198.51.100.250"],
      },
    })),
    riskPreview: publicProcedure.input(z.object({
      severity: z.enum(["critical", "high", "medium", "low"]),
      confidence: z.enum(["confirmed", "high", "medium", "inferred"]),
      externallyReachable: z.boolean(),
      criticalBusinessPath: z.boolean(),
    })).query(({ input }) => calculateTransparentRiskScore(input)),
    citedAssistantDraft: publicProcedure.input(z.object({
      findingId: z.string(),
      assetName: z.string(),
      evidenceReference: z.string(),
      score: z.number().min(0).max(100),
    })).query(({ input }) => buildCitedAssistantDraft(input)),
    listSavedViews: protectedProcedure.query(({ ctx }) => getSavedAtlasViewsForOwner(ctx.user.id)),
    persistentRecords: protectedProcedure.query(() => getWorkspaceRecords()),
    saveView: protectedProcedure.input(z.object({
      engagementId: z.number().int().positive(),
      name: z.string().min(2).max(255),
      stateJson: z.record(z.string(), z.unknown()),
    })).mutation(async ({ ctx, input }) => {
      await createSavedAtlasView({
        engagementId: input.engagementId,
        ownerUserId: ctx.user.id,
        name: input.name,
        stateJson: input.stateJson,
      });
      return { saved: true } as const;
    }),
    recordWorkflowAudit: protectedProcedure.input(z.object({
      engagementId: z.number().int().positive(),
      eventType: z.string().min(2).max(128),
      summary: z.string().min(2).max(2000),
      detailsJson: z.record(z.string(), z.unknown()),
    })).mutation(async ({ ctx, input }) => {
      await appendAssessmentAuditEvent({
        engagementId: input.engagementId,
        actorUserId: ctx.user.id,
        eventType: input.eventType,
        summary: input.summary,
        detailsJson: input.detailsJson,
      });
      return { recorded: true } as const;
    }),
    operationsSnapshot: protectedProcedure.input(z.object({ engagementId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      await requireEngagementRead(ctx.user, input.engagementId);
      const [tasks, geospatialArtifacts, reports, governance, members, comments, taskReviews, importDecisions, shareLinks, templates, clientWorkspaces, notifications, auditEvents] = await Promise.all([
        listAssessmentTasks(input.engagementId),
        listGeospatialArtifacts(input.engagementId),
        listReportDeliveries(input.engagementId),
        getEngagementGovernance(input.engagementId),
        listEngagementMembers(input.engagementId),
        listAssessmentComments(input.engagementId),
        listTaskReviewEvents(input.engagementId),
        listImportDecisions(input.engagementId),
        listReportShareLinks(input.engagementId),
        listEngagementTemplates(),
        listClientWorkspaces(ctx.user.id),
        listEngagementNotifications(input.engagementId, ctx.user.id),
        listAssessmentAuditEvents(input.engagementId),
      ]);
      return { tasks, geospatialArtifacts, reports, governance, members, comments, taskReviews, importDecisions, shareLinks, templates, clientWorkspaces, notifications, auditEvents };
    }),
    createTemplate: protectedProcedure.input(z.object({ name: z.string().min(3).max(255), description: z.string().min(8).max(2000), templateJson: z.record(z.string(), z.unknown()) })).mutation(async ({ ctx, input }) => {
      await requireEngagementManager(ctx.user, 1);
      await createEngagementTemplate({ ...input, createdByUserId: ctx.user.id });
      await appendAssessmentAuditEvent({ engagementId: 1, actorUserId: ctx.user.id, eventType: "engagement-template-created", summary: `Reusable template created: ${input.name}`, detailsJson: { synthetic: true } });
      return { created: true } as const;
    }),
    createClientWorkspace: protectedProcedure.input(z.object({ displayName: z.string().min(3).max(255), workspaceCode: z.string().regex(/^CW-[A-Z0-9-]{3,60}$/), classification: z.enum(["synthetic", "internal", "restricted"]) })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required to create a client workspace" });
      await createClientWorkspace({ ...input, status: "active", ownerUserId: ctx.user.id });
      return { created: true } as const;
    }),
    markNotificationRead: protectedProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await markEngagementNotificationRead(input.notificationId, ctx.user.id);
      return { read: true } as const;
    }),
    updateGovernance: protectedProcedure.input(z.object({
      engagementId: z.number().int().positive(),
      scopeApprovalStatus: z.enum(["draft", "pending-review", "approved", "expired", "blocked"]),
      importGateStatus: z.enum(["review-required", "approved", "blocked"]),
      dataOriginLabel: z.string().min(3).max(255),
      retentionProfile: z.enum(["demo-session", "engagement", "legal-hold", "restricted"]),
      redactionProfile: z.enum(["synthetic-demo", "internal", "client", "restricted"]),
      watermarkText: z.string().min(3).max(255),
    })).mutation(async ({ ctx, input }) => {
      await requireEngagementManager(ctx.user, input.engagementId);
      await upsertEngagementGovernance({ ...input, approvedByUserId: input.scopeApprovalStatus === "approved" ? ctx.user.id : undefined, approvedAt: input.scopeApprovalStatus === "approved" ? new Date() : undefined, updatedByUserId: ctx.user.id });
      await createEngagementNotification({ engagementId: input.engagementId, recipientUserId: ctx.user.id, notificationType: "governance-updated", message: `Governance lifecycle saved: scope ${input.scopeApprovalStatus}; import gate ${input.importGateStatus}.` });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "governance-updated", summary: `Governance lifecycle updated: scope ${input.scopeApprovalStatus}, import gate ${input.importGateStatus}`, detailsJson: { retentionProfile: input.retentionProfile, redactionProfile: input.redactionProfile, watermarkText: input.watermarkText, synthetic: true } });
      return { updated: true } as const;
    }),
    decideImport: protectedProcedure.input(z.object({ engagementId: z.number().int().positive(), artifactName: z.string().min(3).max(512), artifactHash: z.string().regex(/^[a-f0-9]{64}$/), disposition: z.enum(["approved", "quarantined", "rejected"]), rationale: z.string().min(8).max(2000) })).mutation(async ({ ctx, input }) => {
      await requireEngagementWrite(ctx.user, input.engagementId);
      await createImportDecision({ ...input, decidedByUserId: ctx.user.id });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "import-decision-recorded", summary: `Import ${input.disposition}: ${input.artifactName}`, detailsJson: { artifactHash: input.artifactHash, rationale: input.rationale, synthetic: true } });
      return { recorded: true } as const;
    }),
    assignMember: protectedProcedure.input(z.object({ engagementId: z.number().int().positive(), userId: z.number().int().positive(), workspaceRole: z.enum(["manager", "analyst", "reviewer", "read-only"]), membershipStatus: z.enum(["invited", "active", "suspended"]) })).mutation(async ({ ctx, input }) => {
      await requireEngagementManager(ctx.user, input.engagementId);
      await upsertEngagementMember(input);
      await createEngagementNotification({ engagementId: input.engagementId, recipientUserId: input.userId, notificationType: "review-requested", message: `You were assigned as ${input.workspaceRole} in the synthetic engagement workspace.` });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "member-assigned", summary: `Engagement member ${input.userId} set to ${input.workspaceRole} / ${input.membershipStatus}`, detailsJson: { memberUserId: input.userId, workspaceRole: input.workspaceRole, membershipStatus: input.membershipStatus, synthetic: true } });
      return { assigned: true } as const;
    }),
    addComment: protectedProcedure.input(z.object({ engagementId: z.number().int().positive(), taskId: z.number().int().positive().optional(), findingId: z.number().int().positive().optional(), reportDeliveryId: z.number().int().positive().optional(), body: z.string().min(2).max(4000) })).mutation(async ({ ctx, input }) => {
      await requireEngagementWrite(ctx.user, input.engagementId);
      await createAssessmentComment({ ...input, authorUserId: ctx.user.id });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "collaboration-comment-added", summary: "Engagement review comment added", detailsJson: { taskId: input.taskId, findingId: input.findingId, reportDeliveryId: input.reportDeliveryId, synthetic: true } });
      return { added: true } as const;
    }),
    reviewTask: protectedProcedure.input(z.object({ engagementId: z.number().int().positive(), taskId: z.number().int().positive(), reviewState: z.enum(["requested", "approved", "changes-requested", "retest-signed-off"]), summary: z.string().min(4).max(2000) })).mutation(async ({ ctx, input }) => {
      await requireEngagementReview(ctx.user, input.engagementId);
      await createTaskReviewEvent({ ...input, reviewerUserId: ctx.user.id });
      if (input.reviewState === "approved" || input.reviewState === "retest-signed-off") await updateAssessmentTaskStatus(input.engagementId, input.taskId, "done");
      await createEngagementNotification({ engagementId: input.engagementId, recipientUserId: ctx.user.id, notificationType: input.reviewState === "retest-signed-off" ? "retest-signed-off" : "review-requested", message: `Task ${input.taskId} review state recorded: ${input.reviewState}.` });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "task-review-recorded", summary: `Task ${input.taskId} ${input.reviewState}`, detailsJson: { reviewState: input.reviewState, reviewSummary: input.summary, synthetic: true } });
      return { reviewed: true } as const;
    }),
    approveReport: protectedProcedure.input(z.object({ engagementId: z.number().int().positive(), reportDeliveryId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await requireEngagementReview(ctx.user, input.engagementId);
      await approveReportDelivery(input.reportDeliveryId, ctx.user.id);
      await createEngagementNotification({ engagementId: input.engagementId, recipientUserId: ctx.user.id, notificationType: "report-approved", message: `Report delivery ${input.reportDeliveryId} was approved.` });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "report-approved", summary: `Report delivery ${input.reportDeliveryId} approved`, detailsJson: { reportDeliveryId: input.reportDeliveryId, synthetic: true } });
      return { approved: true } as const;
    }),
    createReadOnlyShare: protectedProcedure.input(z.object({ engagementId: z.number().int().positive(), reportDeliveryId: z.number().int().positive(), expiresAt: z.date() })).mutation(async ({ ctx, input }) => {
      await requireEngagementReview(ctx.user, input.engagementId);
      const token = randomUUID().replace(/-/g, "");
      await createReportShareLink({ ...input, token, accessLevel: "read-only", createdByUserId: ctx.user.id });
      await createEngagementNotification({ engagementId: input.engagementId, recipientUserId: ctx.user.id, notificationType: "delivery-share-created", message: `Read-only delivery share created for report ${input.reportDeliveryId}.` });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "read-only-share-created", summary: `Read-only report share created for delivery ${input.reportDeliveryId}`, detailsJson: { reportDeliveryId: input.reportDeliveryId, expiresAt: input.expiresAt.toISOString(), synthetic: true } });
      return { created: true, token } as const;
    }),
    createTask: protectedProcedure.input(z.object({
      engagementId: z.number().int().positive(),
      findingId: z.number().int().positive().optional(),
      title: z.string().min(3).max(512),
      priority: z.enum(["critical", "high", "medium", "low"]),
      dueAt: z.date().optional(),
    })).mutation(async ({ ctx, input }) => {
      await requireEngagementWrite(ctx.user, input.engagementId);
      await createAssessmentTask({ ...input, createdByUserId: ctx.user.id, taskStatus: "open" });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "task-created", summary: `Task created: ${input.title}`, detailsJson: { priority: input.priority, synthetic: true } });
      return { created: true } as const;
    }),
    createGeospatialArtifact: protectedProcedure.input(z.object({
      engagementId: z.number().int().positive(),
      title: z.string().min(3).max(512),
      artifactType: z.enum(["geojson", "kml", "gpx", "stac-item", "imagery-annotation", "floor-plan", "offline-pack", "aoi"]),
      coordinatePrecision: z.enum(["exact", "rounded", "inferred", "synthetic"]),
      metadataJson: z.record(z.string(), z.unknown()),
      geometryJson: z.unknown().optional(),
    })).mutation(async ({ ctx, input }) => {
      await requireEngagementWrite(ctx.user, input.engagementId);
      await createGeospatialArtifact({ ...input, reviewStatus: "draft", createdByUserId: ctx.user.id, sourceReference: "Authorized synthetic workspace" });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "geospatial-artifact-created", summary: `Geospatial artifact staged: ${input.title}`, detailsJson: { artifactType: input.artifactType, coordinatePrecision: input.coordinatePrecision, synthetic: true } });
      return { created: true } as const;
    }),
    createReportDelivery: protectedProcedure.input(z.object({
      engagementId: z.number().int().positive(),
      reportType: z.enum(["executive", "technical", "geographic", "evidence", "retest"]),
      redactionProfile: z.enum(["synthetic-demo", "internal", "client", "restricted"]),
    })).mutation(async ({ ctx, input }) => {
      await requireEngagementWrite(ctx.user, input.engagementId);
      await createReportDelivery({ ...input, deliveryStatus: "draft", createdByUserId: ctx.user.id });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "report-delivery-created", summary: `Report delivery draft created: ${input.reportType}`, detailsJson: { redactionProfile: input.redactionProfile, synthetic: true } });
      return { created: true } as const;
    }),
    uploadEvidence: protectedProcedure.input(z.object({
      engagementId: z.number().int().positive(),
      fileName: z.string().min(1).max(512),
      mediaType: z.string().min(3).max(255),
      base64: z.string().min(1).max(4_200_000),
      classification: z.enum(["synthetic", "internal", "confidential", "restricted"]),
      findingId: z.number().int().positive().optional(),
    })).mutation(async ({ ctx, input }) => {
      await requireEngagementWrite(ctx.user, input.engagementId);
      const bytes = Buffer.from(input.base64, "base64");
      const validation = validateEvidenceIntake({ fileName: input.fileName, mediaType: input.mediaType, byteSize: bytes.byteLength });
      if (!validation.valid) throw new TRPCError({ code: "BAD_REQUEST", message: validation.reason });
      const stored = await storeEvidenceArtifact({
        engagementCode: `ENG-${input.engagementId}`,
        originalName: input.fileName,
        mediaType: input.mediaType,
        bytes,
        classification: input.classification,
        sourceMetadata: { uploadedBy: String(ctx.user.id), syntheticWorkspace: "true", malwareScanStatus: "pending-external-scan", receivedAt: new Date().toISOString() },
      });
      await createEvidenceReference({ engagementId: input.engagementId, findingId: input.findingId, ...stored, retentionStatus: "active", custodyJson: { receivedAt: new Date().toISOString(), receivedByUserId: ctx.user.id, integrityHash: stored.sha256, storageKey: stored.storageKey, lifecycle: "active", malwareScanStatus: "pending-external-scan" }, sourceMetadataJson: stored.sourceMetadata });
      await appendAssessmentAuditEvent({ engagementId: input.engagementId, actorUserId: ctx.user.id, eventType: "evidence-uploaded", summary: `Evidence stored: ${input.fileName}`, detailsJson: { sha256: stored.sha256, classification: input.classification, byteSize: stored.byteSize, synthetic: true } });
      return { stored: true, originalName: stored.originalName, sha256: stored.sha256, storageUrl: stored.storageUrl, byteSize: stored.byteSize } as const;
    }),
  }),

});

export type AppRouter = typeof appRouter;
