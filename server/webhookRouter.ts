import { Router } from "express";
import { z } from "zod";
import * as db from "./db";

const router = Router();

// Middleware to validate API key
const validateApiKey = (req: any, res: any, next: any) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.WEBHOOK_API_KEY || "your-secret-api-key-here";
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }
  
  next();
};

// Apply API key validation to all webhook routes
router.use(validateApiKey);

/**
 * Webhook: Create a new blog post
 * POST /api/webhook/blog-post
 * 
 * Body:
 * {
 *   "slug": "my-blog-post",
 *   "title": "My Blog Post Title",
 *   "excerpt": "Short description",
 *   "content": "Full markdown content",
 *   "featuredImageUrl": "https://example.com/image.jpg",
 *   "categoryId": 1,
 *   "isPublished": true
 * }
 */
router.post("/blog-post", async (req, res) => {
  try {
    const schema = z.object({
      slug: z.string(),
      title: z.string(),
      excerpt: z.string().optional(),
      content: z.string(),
      featuredImageUrl: z.string().optional(),
      categoryId: z.number().optional(),
      isPublished: z.boolean().optional().default(true),
    });

    const data = schema.parse(req.body);
    
    await db.createBlogPost({
      ...data,
      publishedAt: data.isPublished ? new Date() : undefined,
      authorId: undefined, // Webhook posts don't have an author
    });

    res.status(201).json({ 
      success: true, 
      message: "Blog post created successfully",
      slug: data.slug 
    });
  } catch (error: any) {
    console.error("Webhook error (blog-post):", error);
    res.status(400).json({ 
      error: "Failed to create blog post", 
      details: error.message 
    });
  }
});

/**
 * Webhook: Create a new therapist listing
 * POST /api/webhook/therapist
 * 
 * Body:
 * {
 *   "slug": "john-doe-lcsw",
 *   "name": "John Doe",
 *   "credentials": "LCSW",
 *   "tagline": "Compassionate therapy for anxiety",
 *   "bio": "Full bio text...",
 *   "photoUrl": "https://example.com/photo.jpg",
 *   "yearsExperience": 10,
 *   "gender": "male",
 *   "languagesSpoken": ["English", "Spanish"],
 *   "licenseState": "California",
 *   "licenseNumber": "LCSW-12345",
 *   "licenseExpiry": "December 2026",
 *   "npiNumber": "1234567890",
 *   "betterHelpAffiliateUrl": "https://www.betterhelp.com/...",
 *   "specialtyIds": [1, 2, 3]
 * }
 */
router.post("/therapist", async (req, res) => {
  try {
    const schema = z.object({
      slug: z.string(),
      name: z.string(),
      credentials: z.string().optional(),
      tagline: z.string().optional(),
      bio: z.string().optional(),
      photoUrl: z.string().optional(),
      yearsExperience: z.number().optional(),
      gender: z.enum(["male", "female", "non-binary", "other"]).optional(),
      languagesSpoken: z.array(z.string()).optional(),
      licenseState: z.string().optional(),
      licenseNumber: z.string().optional(),
      licenseExpiry: z.string().optional(),
      npiNumber: z.string().optional(),
      betterHelpAffiliateUrl: z.string().optional(),
      specialtyIds: z.array(z.number()).optional(),
    });

    const data = schema.parse(req.body);
    const { specialtyIds, languagesSpoken, ...therapistData } = data;
    
    // Create therapist
    await db.createTherapist({
      ...therapistData,
      languagesSpoken: languagesSpoken ? JSON.stringify(languagesSpoken) : undefined,
      isActive: true,
    });

    // Get the created therapist to get its ID
    const therapist = await db.getTherapistBySlug(data.slug);
    if (!therapist) {
      throw new Error("Failed to retrieve created therapist");
    }

    // Add specialties if provided
    if (specialtyIds && specialtyIds.length > 0) {
      for (const specialtyId of specialtyIds) {
        await db.addTherapistSpecialty(therapist.id, specialtyId);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: "Therapist created successfully",
      slug: data.slug,
      id: therapist.id
    });
  } catch (error: any) {
    console.error("Webhook error (therapist):", error);
    res.status(400).json({ 
      error: "Failed to create therapist", 
      details: error.message 
    });
  }
});

/**
 * Webhook: Create a new service
 * POST /api/webhook/service
 * 
 * Body:
 * {
 *   "slug": "couples-therapy",
 *   "title": "Couples Therapy",
 *   "description": "Short description",
 *   "content": "Full content...",
 *   "iconName": "Heart",
 *   "displayOrder": 1
 * }
 */
router.post("/service", async (req, res) => {
  try {
    const schema = z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string().optional(),
      content: z.string().optional(),
      iconName: z.string().optional(),
      displayOrder: z.number().optional().default(0),
    });

    const data = schema.parse(req.body);
    
    await db.createService({
      ...data,
      isActive: true,
    });

    res.status(201).json({ 
      success: true, 
      message: "Service created successfully",
      slug: data.slug 
    });
  } catch (error: any) {
    console.error("Webhook error (service):", error);
    res.status(400).json({ 
      error: "Failed to create service", 
      details: error.message 
    });
  }
});

/**
 * Webhook: Get all specialties (for reference when creating therapists)
 * GET /api/webhook/specialties
 */
router.get("/specialties", async (req, res) => {
  try {
    const specialties = await db.getAllSpecialties();
    res.json({ success: true, specialties });
  } catch (error: any) {
    console.error("Webhook error (specialties):", error);
    res.status(500).json({ 
      error: "Failed to fetch specialties", 
      details: error.message 
    });
  }
});

/**
 * Webhook: Get all blog categories (for reference when creating posts)
 * GET /api/webhook/blog-categories
 */
router.get("/blog-categories", async (req, res) => {
  try {
    const categories = await db.getAllBlogCategories();
    res.json({ success: true, categories });
  } catch (error: any) {
    console.error("Webhook error (blog-categories):", error);
    res.status(500).json({ 
      error: "Failed to fetch blog categories", 
      details: error.message 
    });
  }
});

export default router;
