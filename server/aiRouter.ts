import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

/**
 * AI Content Generation Router
 * Provides AI-powered writing and rewriting capabilities for therapist bios,
 * blog posts, service descriptions, and other text content.
 */

export const aiRouter = router({
  /**
   * Generate a therapist bio based on provided information
   */
  generateTherapistBio: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        credentials: z.string(),
        specialties: z.array(z.string()),
        yearsExperience: z.number().optional(),
        approach: z.string().optional(),
        additionalInfo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Write a professional, compassionate therapist bio for ${input.name}, ${input.credentials}.

Specialties: ${input.specialties.join(", ")}
${input.yearsExperience ? `Years of Experience: ${input.yearsExperience}` : ""}
${input.approach ? `Therapeutic Approach: ${input.approach}` : ""}
${input.additionalInfo ? `Additional Info: ${input.additionalInfo}` : ""}

Requirements:
- Write in first person ("I" perspective)
- 150-200 words
- Professional yet warm and approachable tone
- Emphasize compassion, expertise, and creating a safe space
- Include specific mention of specialties
- End with an invitation to connect or schedule a session
- Do not include any markdown formatting or special characters`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert therapist bio writer. Write professional, compassionate, and engaging therapist biographies that help clients feel comfortable reaching out.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const bio = typeof content === 'string' ? content : '';
      return { bio: bio.trim() };
    }),

  /**
   * Rewrite existing text to improve clarity, tone, or style
   */
  rewriteText: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        purpose: z.enum([
          "therapist_bio",
          "blog_post",
          "service_description",
          "general",
        ]),
        instructions: z.string().optional(),
        tone: z
          .enum(["professional", "warm", "casual", "academic", "empathetic"])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const purposeContext = {
        therapist_bio:
          "This is a therapist biography that should be professional, compassionate, and help clients feel comfortable.",
        blog_post:
          "This is a blog post about mental health that should be informative, engaging, and accessible.",
        service_description:
          "This is a service description that should be clear, concise, and highlight benefits.",
        general: "This is general content that should be well-written and clear.",
      };

      const toneGuidance = input.tone
        ? `Use a ${input.tone} tone.`
        : "Use an appropriate professional tone.";

      const prompt = `Rewrite the following text to improve its quality:

${purposeContext[input.purpose]}
${toneGuidance}
${input.instructions ? `Additional instructions: ${input.instructions}` : ""}

Original text:
${input.text}

Requirements:
- Maintain the core message and key information
- Improve clarity, flow, and readability
- Fix any grammar or spelling issues
- Keep approximately the same length
- Do not add markdown formatting
- Return only the rewritten text`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert content editor specializing in mental health and therapy content. Rewrite text to be clear, engaging, and professional.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const rewrittenText = typeof content === 'string' ? content : '';
      return { text: rewrittenText.trim() };
    }),

  /**
   * Generate a blog post outline or full content
   */
  generateBlogContent: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        keywords: z.array(z.string()).optional(),
        targetLength: z.enum(["short", "medium", "long"]).default("medium"),
        includeAffiliate: z.boolean().default(true),
        outlineOnly: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const lengthGuidance = {
        short: "500-700 words",
        medium: "1000-1500 words",
        long: "2000-2500 words",
      };

      const affiliateNote = input.includeAffiliate
        ? "\n- Include a natural call-to-action at the end mentioning BetterHelp for professional support"
        : "";

      if (input.outlineOnly) {
        const prompt = `Create a detailed outline for a blog post about: ${input.topic}

${input.keywords ? `Keywords to include: ${input.keywords.join(", ")}` : ""}

Requirements:
- Create 5-7 main sections with H2 headings
- Include 2-3 subsections under each main section
- Each section should have a brief description
- Focus on providing value and actionable advice
- Target audience: people seeking mental health information${affiliateNote}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert mental health content strategist. Create comprehensive, well-structured blog post outlines.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const responseContent = response.choices[0]?.message?.content;
        const outline = typeof responseContent === 'string' ? responseContent : '';
        return { content: outline.trim(), type: "outline" as const };
      } else {
        const prompt = `Write a comprehensive blog post about: ${input.topic}

${input.keywords ? `Keywords to naturally incorporate: ${input.keywords.join(", ")}` : ""}
Target length: ${lengthGuidance[input.targetLength]}

Requirements:
- Write in an informative, empathetic, and accessible style
- Use clear headings (H2, H3) to structure the content
- Include practical tips and actionable advice
- Cite general mental health best practices (no specific sources needed)
- Use markdown formatting for headings and lists
- Include an engaging introduction and conclusion${affiliateNote}
- Write for a general audience seeking mental health information`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert mental health writer. Create informative, compassionate, and evidence-based blog posts that help readers understand mental health topics.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const responseContent = response.choices[0]?.message?.content;
        const content = typeof responseContent === 'string' ? responseContent : '';
        return { content: content.trim(), type: "full" as const };
      }
    }),

  /**
   * Generate a service description
   */
  generateServiceDescription: protectedProcedure
    .input(
      z.object({
        serviceName: z.string(),
        benefits: z.array(z.string()).optional(),
        targetAudience: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Write a compelling service description for: ${input.serviceName}

${input.benefits ? `Key benefits: ${input.benefits.join(", ")}` : ""}
${input.targetAudience ? `Target audience: ${input.targetAudience}` : ""}

Requirements:
- 100-150 words
- Focus on benefits and outcomes
- Use clear, accessible language
- Emphasize how this service helps people
- Professional yet approachable tone
- Do not use markdown formatting`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert at writing compelling service descriptions for mental health services. Focus on benefits and outcomes.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const description = typeof content === 'string' ? content : '';
      return { description: description.trim() };
    }),

  /**
   * Improve existing content with specific suggestions
   */
  improveContent: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        improvementType: z.enum([
          "clarity",
          "engagement",
          "seo",
          "compassion",
          "professionalism",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      const improvementGuidance = {
        clarity:
          "Focus on making the text clearer and easier to understand. Simplify complex sentences and remove jargon.",
        engagement:
          "Make the text more engaging and compelling. Add hooks, improve flow, and make it more interesting to read.",
        seo: "Optimize for search engines while maintaining readability. Incorporate relevant keywords naturally and improve structure.",
        compassion:
          "Enhance the empathetic and compassionate tone. Make readers feel understood and supported.",
        professionalism:
          "Improve the professional tone while maintaining warmth. Ensure credibility and expertise shine through.",
      };

      const prompt = `Improve the following text with a focus on: ${input.improvementType}

Guidance: ${improvementGuidance[input.improvementType]}

Original text:
${input.text}

Provide:
1. The improved version of the text
2. A brief explanation of the key changes made

Format your response as:
IMPROVED TEXT:
[improved text here]

CHANGES:
[brief explanation]`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert content editor specializing in mental health content. Provide specific, actionable improvements.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const responseContent = response.choices[0]?.message?.content;
      const result = typeof responseContent === 'string' ? responseContent : '';
      
      // Parse the response
      const parts = result.split("CHANGES:");
      const improvedText = parts[0]
        ?.replace("IMPROVED TEXT:", "")
        .trim();
      const changes = parts[1]?.trim() || "Improvements applied.";

      return {
        improvedText,
        changes,
      };
    }),
});
