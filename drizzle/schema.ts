import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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

/**
 * Therapist profiles
 */
export const therapists = mysqlTable("therapists", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  credentials: varchar("credentials", { length: 100 }),
  tagline: varchar("tagline", { length: 500 }),
  bio: text("bio"),
  photoUrl: varchar("photoUrl", { length: 500 }),
  yearsExperience: int("yearsExperience"),
  gender: mysqlEnum("gender", ["male", "female", "non-binary", "other"]),
  languagesSpoken: text("languagesSpoken"), // JSON array of languages
  licenseState: varchar("licenseState", { length: 100 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  licenseExpiry: varchar("licenseExpiry", { length: 100 }),
  npiNumber: varchar("npiNumber", { length: 50 }),
  rating: int("rating").default(0), // Average rating * 10 (e.g., 4.6 = 46)
  reviewCount: int("reviewCount").default(0),
  betterHelpAffiliateUrl: varchar("betterHelpAffiliateUrl", { length: 500 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Therapist = typeof therapists.$inferSelect;
export type InsertTherapist = typeof therapists.$inferInsert;

/**
 * Specialties/treatment areas
 */
export const specialties = mysqlTable("specialties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;

/**
 * Many-to-many relationship between therapists and specialties
 */
export const therapistSpecialties = mysqlTable("therapist_specialties", {
  id: int("id").autoincrement().primaryKey(),
  therapistId: int("therapistId").notNull(),
  specialtyId: int("specialtyId").notNull(),
});

export type TherapistSpecialty = typeof therapistSpecialties.$inferSelect;
export type InsertTherapistSpecialty = typeof therapistSpecialties.$inferInsert;

/**
 * Reviews for therapists
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  therapistId: int("therapistId").notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  reviewText: text("reviewText"),
  reviewerName: varchar("reviewerName", { length: 100 }),
  isApproved: boolean("isApproved").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Blog categories
 */
export const blogCategories = mysqlTable("blog_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = typeof blogCategories.$inferInsert;

/**
 * Blog posts
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImageUrl: varchar("featuredImageUrl", { length: 500 }),
  authorId: int("authorId"),
  categoryId: int("categoryId"),
  isPublished: boolean("isPublished").default(false),
  publishedAt: timestamp("publishedAt"),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Services/Resources pages
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"),
  iconName: varchar("iconName", { length: 100 }),
  displayOrder: int("displayOrder").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Relations
 */
export const therapistsRelations = relations(therapists, ({ many }) => ({
  specialties: many(therapistSpecialties),
  reviews: many(reviews),
}));

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  therapists: many(therapistSpecialties),
}));

export const therapistSpecialtiesRelations = relations(therapistSpecialties, ({ one }) => ({
  therapist: one(therapists, {
    fields: [therapistSpecialties.therapistId],
    references: [therapists.id],
  }),
  specialty: one(specialties, {
    fields: [therapistSpecialties.specialtyId],
    references: [specialties.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  therapist: one(therapists, {
    fields: [reviews.therapistId],
    references: [therapists.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
}));
