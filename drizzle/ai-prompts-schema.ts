import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * AI Prompts Configuration Table
 * Stores configurable prompts for various AI operations
 */
export const aiPrompts = mysqlTable("ai_prompts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  promptTemplate: text("prompt_template").notNull(),
  systemMessage: text("system_message"),
  isActive: int("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AIPrompt = typeof aiPrompts.$inferSelect;
export type InsertAIPrompt = typeof aiPrompts.$inferInsert;

/**
 * AI Summary Cache Table
 * Caches AI-generated summaries to avoid redundant API calls
 */
export const aiSummaryCache = mysqlTable("ai_summary_cache", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // e.g., "therapist_reviews"
  entityId: int("entity_id").notNull(),
  promptName: varchar("prompt_name", { length: 100 }).notNull(),
  summary: text("summary").notNull(),
  inputHash: varchar("input_hash", { length: 64 }).notNull(), // SHA-256 hash of input data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export type AISummaryCache = typeof aiSummaryCache.$inferSelect;
export type InsertAISummaryCache = typeof aiSummaryCache.$inferInsert;
