import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { users, savedTherapists, userActivity } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { storagePut } from "./storage";

export const userProfileRouter = router({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    return user[0] || null;
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(), // ISO date string
        location: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.dateOfBirth !== undefined) {
        updateData.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
      }
      if (input.emailNotifications !== undefined) {
        updateData.emailNotifications = input.emailNotifications ? 1 : 0;
      }
      if (input.smsNotifications !== undefined) {
        updateData.smsNotifications = input.smsNotifications ? 1 : 0;
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id));

      return { success: 1 };
    }),

  /**
   * Upload profile photo
   */
  uploadPhoto: protectedProcedure
    .input(
      z.object({
        photoData: z.string(), // Base64 encoded image
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Convert base64 to buffer
      const base64Data = input.photoData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Generate unique filename
      const timestamp = Date.now();
      const ext = input.mimeType.split("/")[1] || "jpg";
      const fileKey = `user-photos/${ctx.user.id}-${timestamp}.${ext}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Update user record
      await db
        .update(users)
        .set({ photoUrl: url })
        .where(eq(users.id, ctx.user.id));

      return { url };
    }),

  /**
   * Get saved/favorited therapists
   */
  getSavedTherapists: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const saved = await db
      .select()
      .from(savedTherapists)
      .where(eq(savedTherapists.userId, ctx.user.id))
      .orderBy(desc(savedTherapists.createdAt));

    return saved;
  }),

  /**
   * Save/favorite a therapist
   */
  saveTherapist: protectedProcedure
    .input(
      z.object({
        therapistId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already saved
      const existing = await db
        .select()
        .from(savedTherapists)
        .where(
          and(
            eq(savedTherapists.userId, ctx.user.id),
            eq(savedTherapists.therapistId, input.therapistId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update notes if provided
        if (input.notes !== undefined) {
          await db
            .update(savedTherapists)
            .set({ notes: input.notes })
            .where(eq(savedTherapists.id, existing[0].id));
        }
        return { success: 1, alreadySaved: 1 };
      }

      // Insert new saved therapist
      await db.insert(savedTherapists).values({
        userId: ctx.user.id,
        therapistId: input.therapistId,
        notes: input.notes || null,
      });

      return { success: 1, alreadySaved: 0 };
    }),

  /**
   * Remove saved therapist
   */
  unsaveTherapist: protectedProcedure
    .input(
      z.object({
        therapistId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(savedTherapists)
        .where(
          and(
            eq(savedTherapists.userId, ctx.user.id),
            eq(savedTherapists.therapistId, input.therapistId)
          )
        );

      return { success: 1 };
    }),

  /**
   * Log user activity
   */
  logActivity: protectedProcedure
    .input(
      z.object({
        activityType: z.string(),
        entityType: z.string().optional(),
        entityId: z.number().optional(),
        metadata: z.string().optional(), // JSON string
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(userActivity).values({
        userId: ctx.user.id,
        activityType: input.activityType,
        entityType: input.entityType || null,
        entityId: input.entityId || null,
        metadata: input.metadata || null,
      });

      return { success: 1 };
    }),

  /**
   * Get user activity history
   */
  getActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const activities = await db
        .select()
        .from(userActivity)
        .where(eq(userActivity.userId, ctx.user.id))
        .orderBy(desc(userActivity.createdAt))
        .limit(input.limit);

      return activities;
    }),
});
