export type EngagementRole = "manager" | "analyst" | "reviewer" | "read-only";

export function canReadEngagement(role: EngagementRole | undefined, isAdmin = false) {
  return isAdmin || Boolean(role);
}

export function canWriteEngagement(role: EngagementRole | undefined, isAdmin = false) {
  return isAdmin || role === "manager" || role === "analyst";
}

export function canReviewEngagement(role: EngagementRole | undefined, isAdmin = false) {
  return isAdmin || role === "manager" || role === "reviewer";
}

export function canManageEngagement(role: EngagementRole | undefined, isAdmin = false) {
  return isAdmin || role === "manager";
}
