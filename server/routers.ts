import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { buildCitedAssistantDraft, calculateTransparentRiskScore, previewAuthorizedImport } from "./assessment";
import { appendAssessmentAuditEvent, createAssessmentTask, createEvidenceReference, createGeospatialArtifact, createReportDelivery, createSavedAtlasView, getActiveEngagementMembership, getSavedAtlasViewsForOwner, getWorkspaceRecords, listAssessmentTasks, listGeospatialArtifacts, listReportDeliveries } from "./db";
import { storeEvidenceArtifact } from "./evidenceStorage";
import { validateEvidenceIntake } from "./governance";

async function requireEngagementWrite(user: { id: number; role: "user" | "admin" }, engagementId: number) {
  if (user.role === "admin") return "manager" as const;
  const membership = await getActiveEngagementMembership(engagementId, user.id);
  if (!membership || membership.workspaceRole === "read-only") throw new TRPCError({ code: "FORBIDDEN", message: "Active analyst or manager engagement membership is required for this operation" });
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
    previewImport: publicProcedure.input(z.object({
      format: z.enum(["geojson", "csv", "json", "nmap-xml", "nuclei-jsonl", "kml", "gpx", "stac-item"]),
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
    operationsSnapshot: protectedProcedure.input(z.object({ engagementId: z.number().int().positive() })).query(async ({ input }) => {
      const [tasks, geospatialArtifacts, reports] = await Promise.all([
        listAssessmentTasks(input.engagementId),
        listGeospatialArtifacts(input.engagementId),
        listReportDeliveries(input.engagementId),
      ]);
      return { tasks, geospatialArtifacts, reports };
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
