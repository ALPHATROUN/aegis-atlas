import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const engagements = mysqlTable("engagements", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  authorizationStatus: mysqlEnum("authorizationStatus", ["draft", "authorized", "expired", "closed"]).notNull().default("draft"),
  safetyPosture: mysqlEnum("safetyPosture", ["enforced", "review", "blocked"]).notNull().default("enforced"),
  scopeJson: json("scopeJson").notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessmentAssets = mysqlTable("assessmentAssets", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  stableId: varchar("stableId", { length: 128 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  assetType: mysqlEnum("assetType", ["domain", "host", "service", "site", "cloud", "provider", "custom"]).notNull(),
  status: mysqlEnum("status", ["observed", "validated", "watch", "excluded", "quarantined"]).notNull().default("observed"),
  confidence: mysqlEnum("confidence", ["confirmed", "high", "medium", "inferred"]).notNull().default("medium"),
  geometryJson: json("geometryJson"),
  provenance: text("provenance").notNull(),
  rawReference: varchar("rawReference", { length: 512 }),
  lastObservedAt: timestamp("lastObservedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessmentFindings = mysqlTable("assessmentFindings", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  assetId: int("assetId").notNull(),
  stableId: varchar("stableId", { length: 128 }).notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "informational"]).notNull(),
  confidence: mysqlEnum("confidence", ["confirmed", "high", "medium", "inferred"]).notNull(),
  status: mysqlEnum("status", ["open", "in-progress", "accepted", "resolved"]).notNull().default("open"),
  riskFactorsJson: json("riskFactorsJson").notNull(),
  remediation: text("remediation").notNull(),
  owner: varchar("owner", { length: 255 }),
  retestStatus: mysqlEnum("retestStatus", ["pending", "scheduled", "verified", "not-required"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const evidenceArtifacts = mysqlTable("evidenceArtifacts", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  findingId: int("findingId"),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  storageUrl: varchar("storageUrl", { length: 768 }).notNull(),
  originalName: varchar("originalName", { length: 512 }).notNull(),
  mediaType: varchar("mediaType", { length: 255 }).notNull(),
  byteSize: int("byteSize").notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  classification: mysqlEnum("classification", ["synthetic", "internal", "confidential", "restricted"]).notNull().default("synthetic"),
  sourceMetadataJson: json("sourceMetadataJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const assessmentAuditEvents = mysqlTable("assessmentAuditEvents", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  actorUserId: int("actorUserId"),
  eventType: varchar("eventType", { length: 128 }).notNull(),
  summary: text("summary").notNull(),
  detailsJson: json("detailsJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const savedAtlasViews = mysqlTable("savedAtlasViews", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  ownerUserId: int("ownerUserId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  stateJson: json("stateJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Engagement = typeof engagements.$inferSelect;
export type AssessmentAsset = typeof assessmentAssets.$inferSelect;
export type AssessmentFinding = typeof assessmentFindings.$inferSelect;
export type EvidenceArtifact = typeof evidenceArtifacts.$inferSelect;
