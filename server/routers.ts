import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
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

  therapists: router({
    list: publicProcedure
      .input(z.object({
        specialtyId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllTherapists({
          isActive: true,
          specialtyId: input?.specialtyId,
        });
      }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const therapist = await db.getTherapistBySlug(input.slug);
        if (!therapist) {
          throw new Error("Therapist not found");
        }
        
        const specialties = await db.getTherapistSpecialties(therapist.id);
        const reviews = await db.getTherapistReviews(therapist.id, true);
        
        return {
          ...therapist,
          specialties,
          reviews,
        };
      }),
    
    create: protectedProcedure
      .input(z.object({
        slug: z.string(),
        name: z.string(),
        credentials: z.string().optional(),
        tagline: z.string().optional(),
        bio: z.string().optional(),
        photoUrl: z.string().optional(),
        yearsExperience: z.number().optional(),
        gender: z.enum(["male", "female", "non-binary", "other"]).optional(),
        languagesSpoken: z.string().optional(),
        licenseState: z.string().optional(),
        licenseNumber: z.string().optional(),
        licenseExpiry: z.string().optional(),
        npiNumber: z.string().optional(),
        betterHelpAffiliateUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await db.createTherapist(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          slug: z.string().optional(),
          name: z.string().optional(),
          credentials: z.string().optional(),
          tagline: z.string().optional(),
          bio: z.string().optional(),
          photoUrl: z.string().optional(),
          yearsExperience: z.number().optional(),
          gender: z.enum(["male", "female", "non-binary", "other"]).optional(),
          languagesSpoken: z.string().optional(),
          licenseState: z.string().optional(),
          licenseNumber: z.string().optional(),
          licenseExpiry: z.string().optional(),
          npiNumber: z.string().optional(),
          betterHelpAffiliateUrl: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await db.updateTherapist(input.id, input.data);
      }),
  }),

  specialties: router({
    list: publicProcedure.query(async () => {
      return await db.getAllSpecialties();
    }),
  }),

  reviews: router({
    submit: publicProcedure
      .input(z.object({
        therapistId: z.number(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
        reviewerName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createReview({
          ...input,
          isApproved: false, // Reviews need admin approval
        });
      }),
    
    approve: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        isApproved: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await db.updateReviewApproval(input.reviewId, input.isApproved);
      }),
  }),

  blog: router({
    list: publicProcedure.query(async () => {
      return await db.getAllBlogPosts(true);
    }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (!post) {
          throw new Error("Blog post not found");
        }
        return post;
      }),
    
    create: protectedProcedure
      .input(z.object({
        slug: z.string(),
        title: z.string(),
        excerpt: z.string().optional(),
        content: z.string(),
        featuredImageUrl: z.string().optional(),
        categoryId: z.number().optional(),
        isPublished: z.boolean().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await db.createBlogPost({
          ...input,
          authorId: ctx.user.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          slug: z.string().optional(),
          title: z.string().optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          featuredImageUrl: z.string().optional(),
          categoryId: z.number().optional(),
          isPublished: z.boolean().optional(),
          publishedAt: z.date().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await db.updateBlogPost(input.id, input.data);
      }),
  }),

  blogCategories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllBlogCategories();
    }),
  }),

  services: router({
    list: publicProcedure.query(async () => {
      return await db.getAllServices(true);
    }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const service = await db.getServiceBySlug(input.slug);
        if (!service) {
          throw new Error("Service not found");
        }
        return service;
      }),
  }),
});

export type AppRouter = typeof appRouter;
