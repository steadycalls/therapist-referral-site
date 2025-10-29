import { getDb } from "./server/db";
import { therapists, specialties, therapistSpecialties, blogPosts, blogCategories, services } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  console.log("Seeding database...");

  // Seed specialties
  const specialtiesData = [
    { name: "Anxiety", slug: "anxiety", description: "Treatment for anxiety disorders and panic attacks" },
    { name: "Depression", slug: "depression", description: "Support for depression and mood disorders" },
    { name: "Trauma and PTSD", slug: "trauma-ptsd", description: "Healing from traumatic experiences" },
    { name: "Relationship Issues", slug: "relationship-issues", description: "Couples and relationship counseling" },
    { name: "Stress Management", slug: "stress-management", description: "Coping with stress and burnout" },
    { name: "Grief and Loss", slug: "grief-loss", description: "Support through bereavement" },
    { name: "Addiction", slug: "addiction", description: "Recovery from substance abuse" },
    { name: "Eating Disorders", slug: "eating-disorders", description: "Treatment for eating disorders" },
    { name: "LGBTQ+ Issues", slug: "lgbtq-issues", description: "Affirming therapy for LGBTQ+ individuals" },
    { name: "Family Conflicts", slug: "family-conflicts", description: "Family therapy and mediation" },
    { name: "Career Difficulties", slug: "career-difficulties", description: "Career counseling and work-life balance" },
    { name: "Bipolar Disorder", slug: "bipolar-disorder", description: "Management of bipolar disorder" },
  ];

  for (const specialty of specialtiesData) {
    await db.insert(specialties).values(specialty).onDuplicateKeyUpdate({ set: { name: specialty.name } });
  }
  console.log("✓ Specialties seeded");

  // Seed therapists
  const therapistsData = [
    {
      slug: "sarah-johnson-lcsw",
      name: "Sarah Johnson",
      credentials: "LCSW",
      tagline: "Compassionate support for anxiety and depression",
      bio: "I am a licensed clinical social worker with over 15 years of experience helping individuals navigate anxiety, depression, and life transitions. My approach combines cognitive-behavioral therapy with mindfulness techniques to help clients develop practical coping strategies. I believe in creating a warm, non-judgmental space where clients feel safe to explore their thoughts and feelings.",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      yearsExperience: 15,
      gender: "female",
      languagesSpoken: JSON.stringify(["English", "Spanish"]),
      licenseState: "California",
      licenseNumber: "LCSW-12345",
      licenseExpiry: "December 2026",
      npiNumber: "1234567890",
      rating: 48,
      reviewCount: 24,
      betterHelpAffiliateUrl: "https://www.betterhelp.com/get-started/?utm_source=leveragetherapy",
      isActive: true,
    },
    {
      slug: "michael-chen-phd",
      name: "Michael Chen",
      credentials: "PhD",
      tagline: "Evidence-based therapy for trauma and PTSD",
      bio: "As a clinical psychologist specializing in trauma, I work with individuals who have experienced various forms of trauma including childhood abuse, military combat, and accidents. I utilize evidence-based approaches such as EMDR and trauma-focused CBT to help clients process traumatic memories and reclaim their lives. My goal is to provide a safe therapeutic relationship where healing can occur.",
      photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
      yearsExperience: 12,
      gender: "male",
      languagesSpoken: JSON.stringify(["English", "Mandarin"]),
      licenseState: "New York",
      licenseNumber: "PSY-67890",
      licenseExpiry: "June 2027",
      npiNumber: "0987654321",
      rating: 50,
      reviewCount: 18,
      betterHelpAffiliateUrl: "https://www.betterhelp.com/get-started/?utm_source=leveragetherapy",
      isActive: true,
    },
    {
      slug: "emily-rodriguez-lmft",
      name: "Emily Rodriguez",
      credentials: "LMFT",
      tagline: "Strengthening relationships and family bonds",
      bio: "I am a licensed marriage and family therapist dedicated to helping couples and families improve their communication and strengthen their relationships. Whether you're dealing with conflict, infidelity, or simply feeling disconnected, I can help you rebuild trust and intimacy. I use emotionally-focused therapy and the Gottman method to create lasting positive change.",
      photoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
      yearsExperience: 10,
      gender: "female",
      languagesSpoken: JSON.stringify(["English", "Spanish"]),
      licenseState: "Texas",
      licenseNumber: "LMFT-45678",
      licenseExpiry: "March 2028",
      npiNumber: "1122334455",
      rating: 46,
      reviewCount: 31,
      betterHelpAffiliateUrl: "https://www.betterhelp.com/get-started/?utm_source=leveragetherapy",
      isActive: true,
    },
    {
      slug: "david-williams-lpc",
      name: "David Williams",
      credentials: "LPC",
      tagline: "Supporting LGBTQ+ individuals and couples",
      bio: "I provide affirming therapy for LGBTQ+ individuals and couples, helping them navigate identity, coming out, relationship challenges, and discrimination. As a member of the LGBTQ+ community myself, I understand the unique challenges you may face. My practice is a safe space where you can be your authentic self without fear of judgment.",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      yearsExperience: 8,
      gender: "male",
      languagesSpoken: JSON.stringify(["English"]),
      licenseState: "Washington",
      licenseNumber: "LPC-98765",
      licenseExpiry: "September 2026",
      npiNumber: "5566778899",
      rating: 49,
      reviewCount: 15,
      betterHelpAffiliateUrl: "https://www.betterhelp.com/get-started/?utm_source=leveragetherapy",
      isActive: true,
    },
  ];

  
  for (const therapist of therapistsData) {
    const result = await db.insert(therapists).values(therapist);
    
  }
  console.log("✓ Therapists seeded");

  // Link therapists to specialties
  const therapistSpecialtyLinks = [
    { therapistSlug: "sarah-johnson-lcsw", specialtySlugs: ["anxiety", "depression", "stress-management"] },
    { therapistSlug: "michael-chen-phd", specialtySlugs: ["trauma-ptsd", "anxiety", "depression"] },
    { therapistSlug: "emily-rodriguez-lmft", specialtySlugs: ["relationship-issues", "family-conflicts", "grief-loss"] },
    { therapistSlug: "david-williams-lpc", specialtySlugs: ["lgbtq-issues", "relationship-issues", "anxiety"] },
  ];

  const allSpecialties = await db.select().from(specialties);
  
  for (const link of therapistSpecialtyLinks) {
    const therapist = (await db.select().from(therapists).where(eq(therapists.slug, link.therapistSlug)).limit(1))[0];
    if (!therapist) continue;

    for (const specialtySlug of link.specialtySlugs) {
      const specialty = allSpecialties.find(s => s.slug === specialtySlug);
      if (specialty) {
        await db.insert(therapistSpecialties).values({
          therapistId: therapist.id,
          specialtyId: specialty.id,
        });
      }
    }
  }
  console.log("✓ Therapist-specialty relationships created");

  // Seed blog categories
  const categoriesData = [
    { name: "Mental Health Tips", slug: "mental-health-tips", description: "Practical advice for mental wellness" },
    { name: "Therapy Insights", slug: "therapy-insights", description: "Understanding therapy and treatment" },
    { name: "Self-Care", slug: "self-care", description: "Taking care of your mental health" },
    { name: "Relationships", slug: "relationships", description: "Building healthy relationships" },
  ];

  for (const category of categoriesData) {
    await db.insert(blogCategories).values(category).onDuplicateKeyUpdate({ set: { name: category.name } });
  }
  console.log("✓ Blog categories seeded");

  // Seed blog posts
  const blogPostsData = [
    {
      slug: "5-ways-to-manage-anxiety",
      title: "5 Effective Ways to Manage Anxiety in Daily Life",
      excerpt: "Discover practical strategies to reduce anxiety and regain control of your thoughts and emotions.",
      content: `# 5 Effective Ways to Manage Anxiety in Daily Life

Anxiety is one of the most common mental health challenges, affecting millions of people worldwide. While it's normal to feel anxious occasionally, chronic anxiety can significantly impact your quality of life. Here are five evidence-based strategies to help you manage anxiety effectively.

## 1. Practice Deep Breathing

Deep breathing exercises activate your parasympathetic nervous system, which helps calm your body's stress response. Try the 4-7-8 technique: breathe in for 4 counts, hold for 7, and exhale for 8.

## 2. Challenge Negative Thoughts

Anxiety often stems from catastrophic thinking. When you notice anxious thoughts, ask yourself: "Is this thought based on facts or feelings?" Learning to identify and challenge cognitive distortions can significantly reduce anxiety.

## 3. Establish a Regular Sleep Schedule

Poor sleep and anxiety create a vicious cycle. Aim for 7-9 hours of sleep per night and maintain consistent sleep and wake times, even on weekends.

## 4. Limit Caffeine and Alcohol

Both substances can worsen anxiety symptoms. Caffeine is a stimulant that can trigger anxiety, while alcohol may provide temporary relief but ultimately increases anxiety levels.

## 5. Seek Professional Support

If anxiety is interfering with your daily life, consider working with a licensed therapist. Cognitive-behavioral therapy (CBT) has been proven highly effective for anxiety disorders.

**Ready to take the next step?** Connect with a licensed therapist who specializes in anxiety treatment through our partner, BetterHelp.`,
      featuredImageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=400&fit=crop",
      categoryId: 1,
      isPublished: true,
      publishedAt: new Date("2024-10-15"),
      viewCount: 245,
    },
    {
      slug: "understanding-depression",
      title: "Understanding Depression: More Than Just Feeling Sad",
      excerpt: "Learn about the signs, symptoms, and treatment options for depression.",
      content: `# Understanding Depression: More Than Just Feeling Sad

Depression is more than just feeling sad or going through a rough patch. It's a serious mental health condition that requires understanding and medical care. Left untreated, depression can be devastating for those who have it and their families.

## What is Depression?

Depression (major depressive disorder) is a common and serious medical illness that negatively affects how you feel, the way you think, and how you act. It causes feelings of sadness and/or a loss of interest in activities you once enjoyed.

## Common Symptoms

- Persistent sad, anxious, or "empty" mood
- Feelings of hopelessness or pessimism
- Irritability
- Loss of interest in hobbies and activities
- Decreased energy or fatigue
- Difficulty concentrating
- Changes in appetite or weight
- Thoughts of death or suicide

## Treatment Options

The good news is that depression is treatable. Most people with depression respond well to treatment, which typically includes:

- **Psychotherapy**: Talk therapy, particularly cognitive-behavioral therapy (CBT), has proven highly effective
- **Medication**: Antidepressants can help correct chemical imbalances
- **Lifestyle Changes**: Exercise, nutrition, and sleep improvements support recovery
- **Support Groups**: Connecting with others who understand can be healing

## When to Seek Help

If you've experienced several depression symptoms for more than two weeks, it's time to seek professional help. Don't wait until symptoms become severe.

**Take the first step today.** Our partner, BetterHelp, can match you with a licensed therapist who specializes in depression treatment.`,
      featuredImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
      categoryId: 1,
      isPublished: true,
      publishedAt: new Date("2024-10-20"),
      viewCount: 189,
    },
    {
      slug: "benefits-of-online-therapy",
      title: "The Benefits of Online Therapy: Is It Right for You?",
      excerpt: "Explore how online therapy works and whether it might be a good fit for your needs.",
      content: `# The Benefits of Online Therapy: Is It Right for You?

Online therapy, also known as teletherapy or e-therapy, has become increasingly popular, especially in recent years. But is it as effective as traditional in-person therapy? Research says yes.

## What is Online Therapy?

Online therapy delivers mental health services through digital platforms. You can connect with your therapist via:

- Video calls
- Phone calls
- Text messaging
- Live chat

## Key Benefits

### 1. Accessibility
Online therapy breaks down geographical barriers. You can access quality mental health care regardless of where you live.

### 2. Convenience
No commute time means therapy fits more easily into busy schedules. Sessions can happen from the comfort of your home.

### 3. Affordability
Online therapy is often more affordable than traditional in-person sessions, making mental health care accessible to more people.

### 4. Comfort
Some people feel more comfortable opening up from their own space, leading to more productive sessions.

### 5. Flexibility
Many online platforms offer messaging between sessions, providing continuous support when you need it most.

## Is It Effective?

Multiple studies have shown that online therapy is just as effective as in-person therapy for treating conditions like:

- Depression
- Anxiety
- PTSD
- Relationship issues
- Stress management

## Getting Started

Ready to try online therapy? Our partner, BetterHelp, offers a simple matching process to connect you with a licensed therapist who meets your needs. You can switch therapists anytime at no additional cost.`,
      featuredImageUrl: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&h=400&fit=crop",
      categoryId: 2,
      isPublished: true,
      publishedAt: new Date("2024-10-25"),
      viewCount: 312,
    },
  ];

  for (const post of blogPostsData) {
    await db.insert(blogPosts).values(post);
  }
  console.log("✓ Blog posts seeded");

  // Seed services
  const servicesData = [
    {
      slug: "individual-therapy",
      title: "Individual Therapy",
      description: "One-on-one counseling for personal growth and mental health",
      content: "Individual therapy provides a safe, confidential space to work through personal challenges with a licensed mental health professional. Whether you're dealing with anxiety, depression, trauma, or life transitions, our therapists can help you develop coping strategies and achieve your goals.",
      iconName: "User",
      displayOrder: 1,
      isActive: true,
    },
    {
      slug: "couples-therapy",
      title: "Couples Therapy",
      description: "Strengthen your relationship and improve communication",
      content: "Couples therapy helps partners improve their relationship through better communication, conflict resolution, and emotional connection. Our therapists use evidence-based approaches to help you rebuild trust, navigate challenges, and create a stronger partnership.",
      iconName: "Heart",
      displayOrder: 2,
      isActive: true,
    },
    {
      slug: "family-therapy",
      title: "Family Therapy",
      description: "Resolve family conflicts and build stronger bonds",
      content: "Family therapy addresses issues affecting the psychological health of a family and its individual members. Our therapists help families improve communication, resolve conflicts, and strengthen relationships across generations.",
      iconName: "Users",
      displayOrder: 3,
      isActive: true,
    },
    {
      slug: "teen-counseling",
      title: "Teen Counseling",
      description: "Support for adolescents navigating mental health challenges",
      content: "Teen counseling provides age-appropriate support for adolescents dealing with anxiety, depression, peer pressure, academic stress, and identity issues. Our therapists create a safe space where teens can express themselves and develop healthy coping skills.",
      iconName: "Smile",
      displayOrder: 4,
      isActive: true,
    },
  ];

  for (const service of servicesData) {
    await db.insert(services).values(service);
  }
  console.log("✓ Services seeded");

  console.log("\n✅ Database seeded successfully!");
}

seed().catch(console.error);
