import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { assessmentAssets, assessmentAuditEvents, assessmentComments, assessmentFindings, assessmentTasks, clientWorkspaces, engagementGovernance, engagementMembers, engagementNotifications, engagementTemplates, evidenceArtifacts, geospatialArtifacts, importDecisions, InsertUser, reportDeliveries, reportShareLinks, savedAtlasViews, taskReviewEvents, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export type EvidenceReferenceInput = typeof evidenceArtifacts.$inferInsert;
export type AuditEventInput = typeof assessmentAuditEvents.$inferInsert;

/** Persists only an object-storage reference and integrity metadata, never evidence bytes. */
export async function createEvidenceReference(input: EvidenceReferenceInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for evidence metadata persistence");
  await db.insert(evidenceArtifacts).values(input);
}

/** Appends a workspace action that should remain visible in the engagement audit trail. */
export async function appendAssessmentAuditEvent(input: AuditEventInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for audit persistence");
  await db.insert(assessmentAuditEvents).values(input);
}

export async function listAssessmentAuditEvents(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessmentAuditEvents).where(eq(assessmentAuditEvents.engagementId, engagementId)).orderBy(desc(assessmentAuditEvents.createdAt));
}

export async function createSavedAtlasView(input: typeof savedAtlasViews.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for saved-view persistence");
  await db.insert(savedAtlasViews).values(input);
}

export async function getSavedAtlasViewsForOwner(ownerUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedAtlasViews).where(eq(savedAtlasViews.ownerUserId, ownerUserId));
}

export async function getWorkspaceRecords() {
  const db = await getDb();
  if (!db) return { assets: [], findings: [] };
  const [assets, findings] = await Promise.all([db.select().from(assessmentAssets), db.select().from(assessmentFindings)]);
  return { assets, findings };
}

export async function createAssessmentTask(input: typeof assessmentTasks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for task persistence");
  await db.insert(assessmentTasks).values(input);
}

export async function listAssessmentTasks(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessmentTasks).where(eq(assessmentTasks.engagementId, engagementId));
}

export async function createGeospatialArtifact(input: typeof geospatialArtifacts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for geospatial artifact persistence");
  await db.insert(geospatialArtifacts).values(input);
}

export async function listGeospatialArtifacts(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(geospatialArtifacts).where(eq(geospatialArtifacts.engagementId, engagementId));
}

export async function createReportDelivery(input: typeof reportDeliveries.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for report-delivery persistence");
  await db.insert(reportDeliveries).values(input);
}

export async function listReportDeliveries(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reportDeliveries).where(eq(reportDeliveries.engagementId, engagementId));
}

export async function getActiveEngagementMembership(engagementId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(engagementMembers).where(and(eq(engagementMembers.engagementId, engagementId), eq(engagementMembers.userId, userId), eq(engagementMembers.membershipStatus, "active"))).limit(1);
  return rows[0];
}

export async function listEngagementMembers(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(engagementMembers).where(eq(engagementMembers.engagementId, engagementId));
}

export async function upsertEngagementMember(input: typeof engagementMembers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for engagement membership persistence");
  const existing = await db.select().from(engagementMembers).where(and(eq(engagementMembers.engagementId, input.engagementId), eq(engagementMembers.userId, input.userId))).limit(1);
  if (existing[0]) {
    await db.update(engagementMembers).set({ workspaceRole: input.workspaceRole, membershipStatus: input.membershipStatus }).where(eq(engagementMembers.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(engagementMembers).values(input);
  return Number(result[0].insertId);
}

export async function getEngagementGovernance(engagementId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(engagementGovernance).where(eq(engagementGovernance.engagementId, engagementId)).limit(1);
  return rows[0];
}

export async function upsertEngagementGovernance(input: typeof engagementGovernance.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for engagement governance persistence");
  const existing = await getEngagementGovernance(input.engagementId);
  if (existing) {
    await db.update(engagementGovernance).set({ scopeApprovalStatus: input.scopeApprovalStatus, approvedByUserId: input.approvedByUserId, approvedAt: input.approvedAt, importGateStatus: input.importGateStatus, dataOriginLabel: input.dataOriginLabel, retentionProfile: input.retentionProfile, redactionProfile: input.redactionProfile, watermarkText: input.watermarkText, updatedByUserId: input.updatedByUserId }).where(eq(engagementGovernance.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(engagementGovernance).values(input);
  return Number(result[0].insertId);
}

export async function createImportDecision(input: typeof importDecisions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for import decision persistence");
  await db.insert(importDecisions).values(input);
}

export async function listImportDecisions(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(importDecisions).where(eq(importDecisions.engagementId, engagementId)).orderBy(desc(importDecisions.createdAt));
}

export async function createAssessmentComment(input: typeof assessmentComments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for engagement comment persistence");
  await db.insert(assessmentComments).values(input);
}

export async function listAssessmentComments(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessmentComments).where(eq(assessmentComments.engagementId, engagementId)).orderBy(desc(assessmentComments.createdAt));
}

export async function createTaskReviewEvent(input: typeof taskReviewEvents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for task review persistence");
  await db.insert(taskReviewEvents).values(input);
}

export async function listTaskReviewEvents(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskReviewEvents).where(eq(taskReviewEvents.engagementId, engagementId)).orderBy(desc(taskReviewEvents.createdAt));
}

export async function updateAssessmentTaskStatus(engagementId: number, taskId: number, taskStatus: "open" | "in-progress" | "blocked" | "done") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for task update persistence");
  await db.update(assessmentTasks).set({ taskStatus }).where(and(eq(assessmentTasks.id, taskId), eq(assessmentTasks.engagementId, engagementId)));
}

export async function approveReportDelivery(reportDeliveryId: number, approvedByUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for report approval persistence");
  await db.update(reportDeliveries).set({ deliveryStatus: "approved", approvedByUserId }).where(eq(reportDeliveries.id, reportDeliveryId));
}

export async function createReportShareLink(input: typeof reportShareLinks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for report share-link persistence");
  await db.insert(reportShareLinks).values(input);
}

export async function listReportShareLinks(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reportShareLinks).where(eq(reportShareLinks.engagementId, engagementId)).orderBy(desc(reportShareLinks.createdAt));
}

export async function createClientWorkspace(input: typeof clientWorkspaces.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for client workspace persistence");
  await db.insert(clientWorkspaces).values(input);
}

export async function listClientWorkspaces(ownerUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientWorkspaces).where(eq(clientWorkspaces.ownerUserId, ownerUserId)).orderBy(desc(clientWorkspaces.createdAt));
}

export async function createEngagementTemplate(input: typeof engagementTemplates.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for engagement template persistence");
  await db.insert(engagementTemplates).values(input);
}

export async function listEngagementTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(engagementTemplates).orderBy(desc(engagementTemplates.createdAt));
}

export async function createEngagementNotification(input: typeof engagementNotifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for notification persistence");
  await db.insert(engagementNotifications).values(input);
}

export async function listEngagementNotifications(engagementId: number, recipientUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(engagementNotifications).where(and(eq(engagementNotifications.engagementId, engagementId), eq(engagementNotifications.recipientUserId, recipientUserId))).orderBy(desc(engagementNotifications.createdAt));
}

export async function markEngagementNotificationRead(notificationId: number, recipientUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for notification update persistence");
  await db.update(engagementNotifications).set({ readAt: new Date() }).where(and(eq(engagementNotifications.id, notificationId), eq(engagementNotifications.recipientUserId, recipientUserId)));
}
