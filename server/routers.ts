import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { buildCitedAssistantDraft, calculateTransparentRiskScore, previewAuthorizedImport } from "./assessment";
import { appendAssessmentAuditEvent, createSavedAtlasView, getSavedAtlasViewsForOwner, getWorkspaceRecords } from "./db";

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
      format: z.enum(["geojson", "csv", "json", "nmap-xml", "nuclei-jsonl"]),
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
  }),

});

export type AppRouter = typeof appRouter;
