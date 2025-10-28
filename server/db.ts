import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  therapists, 
  specialties, 
  therapistSpecialties,
  reviews,
  blogPosts,
  blogCategories,
  services,
  type Therapist,
  type InsertTherapist,
  type Specialty,
  type InsertSpecialty,
  type Review,
  type InsertReview,
  type BlogPost,
  type InsertBlogPost,
  type BlogCategory,
  type InsertBlogCategory,
  type Service,
  type InsertService,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// Therapist queries
export async function getAllTherapists(filters?: { specialtyId?: number; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(therapists);
  
  const conditions = [];
  if (filters?.isActive !== undefined) {
    conditions.push(eq(therapists.isActive, filters.isActive));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const results = await query.orderBy(desc(therapists.rating));
  
  // Filter by specialty if provided
  if (filters?.specialtyId) {
    const therapistIds = await db
      .select({ therapistId: therapistSpecialties.therapistId })
      .from(therapistSpecialties)
      .where(eq(therapistSpecialties.specialtyId, filters.specialtyId));
    
    const ids = therapistIds.map(t => t.therapistId);
    return results.filter(t => ids.includes(t.id));
  }
  
  return results;
}

export async function getTherapistBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(therapists).where(eq(therapists.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTherapistById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(therapists).where(eq(therapists.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTherapist(data: InsertTherapist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(therapists).values(data);
  return result;
}

export async function updateTherapist(id: number, data: Partial<InsertTherapist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(therapists).set(data).where(eq(therapists.id, id));
}

export async function deleteTherapist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(therapists).where(eq(therapists.id, id));
}

// Specialty queries
export async function getAllSpecialties() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(specialties).orderBy(specialties.name);
}

export async function getSpecialtyById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(specialties).where(eq(specialties.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createSpecialty(data: InsertSpecialty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(specialties).values(data);
  return result;
}

// Therapist-Specialty relationship
export async function getTherapistSpecialties(therapistId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      specialty: specialties,
    })
    .from(therapistSpecialties)
    .innerJoin(specialties, eq(therapistSpecialties.specialtyId, specialties.id))
    .where(eq(therapistSpecialties.therapistId, therapistId));

  return results.map(r => r.specialty);
}

export async function addTherapistSpecialty(therapistId: number, specialtyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(therapistSpecialties).values({ therapistId, specialtyId });
}

export async function removeTherapistSpecialty(therapistId: number, specialtyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(therapistSpecialties)
    .where(and(
      eq(therapistSpecialties.therapistId, therapistId),
      eq(therapistSpecialties.specialtyId, specialtyId)
    ));
}

// Review queries
export async function getTherapistReviews(therapistId: number, approvedOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(reviews.therapistId, therapistId)];
  
  if (approvedOnly) {
    conditions.push(eq(reviews.isApproved, true));
  }

  return await db.select().from(reviews).where(and(...conditions)).orderBy(desc(reviews.createdAt));
}

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(data);
  
  // Update therapist rating and review count
  await updateTherapistRating(data.therapistId);
  
  return result;
}

export async function updateReviewApproval(reviewId: number, isApproved: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set({ isApproved }).where(eq(reviews.id, reviewId));
  
  // Get therapist ID and update rating
  const review = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (review.length > 0) {
    await updateTherapistRating(review[0].therapistId);
  }
}

async function updateTherapistRating(therapistId: number) {
  const db = await getDb();
  if (!db) return;

  const approvedReviews = await db
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.therapistId, therapistId),
      eq(reviews.isApproved, true)
    ));

  const reviewCount = approvedReviews.length;
  const avgRating = reviewCount > 0
    ? Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10)
    : 0;

  await db.update(therapists)
    .set({ rating: avgRating, reviewCount })
    .where(eq(therapists.id, therapistId));
}

// Blog queries
export async function getAllBlogPosts(publishedOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(blogPosts);
  
  if (publishedOnly) {
    query = query.where(eq(blogPosts.isPublished, true)) as any;
  }

  return await query.orderBy(desc(blogPosts.publishedAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  
  if (result.length > 0) {
    // Increment view count
    await db.update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, result[0].id));
    
    return result[0];
  }
  
  return null;
}

export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blogPosts).values(data);
  return result;
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// Blog category queries
export async function getAllBlogCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(blogCategories).orderBy(blogCategories.name);
}

export async function createBlogCategory(data: InsertBlogCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blogCategories).values(data);
  return result;
}

// Service queries
export async function getAllServices(activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(services);
  
  if (activeOnly) {
    query = query.where(eq(services.isActive, true)) as any;
  }

  return await query.orderBy(services.displayOrder);
}

export async function getServiceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(services).values(data);
  return result;
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(services).set(data).where(eq(services.id, id));
}
