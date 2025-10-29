import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { aiPrompts, aiSummaryCache, reviews, therapists } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const DEFAULT_REVIEW_SUMMARY_PROMPT = `You are analyzing reviews for a mental health therapist. Your task is to create a helpful, balanced summary that potential clients can use to make informed decisions.

Given the following reviews, provide:
1. A brief overall impression (2-3 sentences)
2. Key strengths mentioned across reviews
3. Any common concerns or areas for improvement
4. Who this therapist might be best suited for

Reviews:
{{reviews}}

Provide a professional, empathetic summary that helps potential clients understand what to expect. Be honest but constructive.`;

const DEFAULT_SYSTEM_MESSAGE = "You are a helpful assistant specialized in analyzing mental health professional reviews to help potential clients make informed decisions.";

/**
 * Generate a hash of the input data for caching
 */
function generateInputHash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export const aiReviewRouter = router({
  /**
   * Get or generate AI summary of therapist reviews
   */
  getReviewSummary: publicProcedure
    .input(
      z.object({
        therapistId: z.number(),
        forceRefresh: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all reviews for this therapist
      const therapistReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.therapistId, input.therapistId));

      if (therapistReviews.length === 0) {
        return {
          summary: null,
          reviewCount: 0,
          cached: false,
        };
      }

      // Get the active prompt configuration
      const promptConfig = await db
        .select()
        .from(aiPrompts)
        .where(and(eq(aiPrompts.name, "review_summary"), eq(aiPrompts.isActive, 1)))
        .limit(1);

      const promptTemplate =
        promptConfig[0]?.promptTemplate || DEFAULT_REVIEW_SUMMARY_PROMPT;
      const systemMessage =
        promptConfig[0]?.systemMessage || DEFAULT_SYSTEM_MESSAGE;

      // Format reviews for the prompt
      const reviewsText = therapistReviews
        .map(
          (r, idx) =>
            `Review ${idx + 1} (${r.rating}/5 stars):\n${r.reviewText}\n`
        )
        .join("\n");

      const inputHash = generateInputHash(reviewsText + promptTemplate);

      // Check cache if not forcing refresh
      if (!input.forceRefresh) {
        const cached = await db
          .select()
          .from(aiSummaryCache)
          .where(
            and(
              eq(aiSummaryCache.entityType, "therapist_reviews"),
              eq(aiSummaryCache.entityId, input.therapistId),
              eq(aiSummaryCache.inputHash, inputHash)
            )
          )
          .limit(1);

        if (cached[0]) {
          // Check if cache is still valid
          if (
            !cached[0].expiresAt ||
            new Date(cached[0].expiresAt) > new Date()
          ) {
            return {
              summary: cached[0].summary,
              reviewCount: therapistReviews.length,
              cached: true,
              cachedAt: cached[0].createdAt,
            };
          }
        }
      }

      // Generate new summary
      const finalPrompt = promptTemplate.replace("{{reviews}}", reviewsText);

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: finalPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const summary = typeof content === "string" ? content : "";

      // Cache the result (expires in 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.insert(aiSummaryCache).values({
        entityType: "therapist_reviews",
        entityId: input.therapistId,
        promptName: "review_summary",
        summary: summary.trim(),
        inputHash,
        expiresAt,
      });

      return {
        summary: summary.trim(),
        reviewCount: therapistReviews.length,
        cached: false,
      };
    }),

  /**
   * Get current prompt configuration
   */
  getPromptConfig: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const config = await db
        .select()
        .from(aiPrompts)
        .where(eq(aiPrompts.name, input.name))
        .limit(1);

      if (config[0]) {
        return config[0];
      }

      // Return default if not found
      return {
        name: input.name,
        description: "Default review summary prompt",
        promptTemplate: DEFAULT_REVIEW_SUMMARY_PROMPT,
        systemMessage: DEFAULT_SYSTEM_MESSAGE,
        isActive: 1,
      };
    }),

  /**
   * Update prompt configuration (admin only)
   */
  updatePromptConfig: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        promptTemplate: z.string(),
        systemMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if prompt exists
      const existing = await db
        .select()
        .from(aiPrompts)
        .where(eq(aiPrompts.name, input.name))
        .limit(1);

      if (existing[0]) {
        // Update existing
        await db
          .update(aiPrompts)
          .set({
            description: input.description,
            promptTemplate: input.promptTemplate,
            systemMessage: input.systemMessage,
            updatedAt: new Date(),
          })
          .where(eq(aiPrompts.id, existing[0].id));

        return { success: true, action: "updated" };
      } else {
        // Create new
        await db.insert(aiPrompts).values({
          name: input.name,
          description: input.description,
          promptTemplate: input.promptTemplate,
          systemMessage: input.systemMessage,
          isActive: 1,
        });

        return { success: true, action: "created" };
      }
    }),

  /**
   * Test prompt with sample data
   */
  testPrompt: protectedProcedure
    .input(
      z.object({
        promptTemplate: z.string(),
        systemMessage: z.string().optional(),
        therapistId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get reviews for testing
      const therapistReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.therapistId, input.therapistId));

      if (therapistReviews.length === 0) {
        throw new Error("No reviews found for this therapist");
      }

      const reviewsText = therapistReviews
        .map(
          (r, idx) =>
            `Review ${idx + 1} (${r.rating}/5 stars):\n${r.reviewText}\n`
        )
        .join("\n");

      const finalPrompt = input.promptTemplate.replace("{{reviews}}", reviewsText);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: input.systemMessage || DEFAULT_SYSTEM_MESSAGE,
          },
          { role: "user", content: finalPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const summary = typeof content === "string" ? content : "";

      return {
        summary: summary.trim(),
        reviewCount: therapistReviews.length,
        inputPreview: reviewsText.substring(0, 500) + "...",
      };
    }),

  /**
   * Clear cache for a specific therapist
   */
  clearCache: protectedProcedure
    .input(
      z.object({
        therapistId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(aiSummaryCache)
        .where(
          and(
            eq(aiSummaryCache.entityType, "therapist_reviews"),
            eq(aiSummaryCache.entityId, input.therapistId)
          )
        );

      return { success: true };
    }),
});
