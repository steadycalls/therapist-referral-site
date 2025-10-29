import { int, mysqlTable, timestamp, varchar, text } from "drizzle-orm/mysql-core";

/**
 * Saved Therapists (Favorites)
 * Tracks which therapists users have saved/favorited
 */
export const savedTherapists = mysqlTable("saved_therapists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  therapistId: int("therapist_id").notNull(),
  notes: text("notes"), // Personal notes about this therapist
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SavedTherapist = typeof savedTherapists.$inferSelect;
export type InsertSavedTherapist = typeof savedTherapists.$inferInsert;

/**
 * User Activity Log
 * Tracks user interactions for analytics and personalization
 */
export const userActivity = mysqlTable("user_activity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // 'view_therapist', 'search', 'click_affiliate', etc.
  entityType: varchar("entity_type", { length: 50 }), // 'therapist', 'blog_post', etc.
  entityId: int("entity_id"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = typeof userActivity.$inferInsert;
