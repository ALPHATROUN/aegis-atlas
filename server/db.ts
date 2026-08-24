import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { assessmentAssets, assessmentAuditEvents, assessmentFindings, assessmentTasks, engagementMembers, evidenceArtifacts, geospatialArtifacts, InsertUser, reportDeliveries, savedAtlasViews, users } from "../drizzle/schema";
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
