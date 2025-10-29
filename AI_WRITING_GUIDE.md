# AI Writing Assistant Guide

## Overview

Leverage Therapy now includes an AI-powered writing assistant that helps generate and improve content throughout the site. This feature uses OpenAI's API to assist with therapist bios, blog posts, service descriptions, and more.

---

## Features

### 1. **Generate Therapist Bios**
Automatically create professional, compassionate therapist biographies based on provided information.

**API Endpoint:** `trpc.ai.generateTherapistBio`

**Input:**
```typescript
{
  name: string;
  credentials: string;
  specialties: string[];
  yearsExperience?: number;
  approach?: string;
  additionalInfo?: string;
}
```

**Output:**
```typescript
{
  bio: string; // 150-200 word professional bio
}
```

---

### 2. **Rewrite Text**
Improve existing text with specific tone and style adjustments.

**API Endpoint:** `trpc.ai.rewriteText`

**Input:**
```typescript
{
  text: string;
  purpose: "therapist_bio" | "blog_post" | "service_description" | "general";
  instructions?: string;
  tone?: "professional" | "warm" | "casual" | "academic" | "empathetic";
}
```

**Output:**
```typescript
{
  text: string; // Rewritten version
}
```

---

### 3. **Generate Blog Content**
Create blog post outlines or full articles on mental health topics.

**API Endpoint:** `trpc.ai.generateBlogContent`

**Input:**
```typescript
{
  topic: string;
  keywords?: string[];
  targetLength: "short" | "medium" | "long";
  includeAffiliate: boolean;
  outlineOnly: boolean;
}
```

**Output:**
```typescript
{
  content: string;
  type: "outline" | "full";
}
```

**Length Guidelines:**
- Short: 500-700 words
- Medium: 1000-1500 words
- Long: 2000-2500 words

---

### 4. **Generate Service Descriptions**
Create compelling descriptions for therapy services.

**API Endpoint:** `trpc.ai.generateServiceDescription`

**Input:**
```typescript
{
  serviceName: string;
  benefits?: string[];
  targetAudience?: string;
}
```

**Output:**
```typescript
{
  description: string; // 100-150 words
}
```

---

### 5. **Improve Content**
Enhance existing content with specific improvement focus.

**API Endpoint:** `trpc.ai.improveContent`

**Input:**
```typescript
{
  text: string;
  improvementType: "clarity" | "engagement" | "seo" | "compassion" | "professionalism";
}
```

**Output:**
```typescript
{
  improvedText: string;
  changes: string; // Explanation of improvements
}
```

---

## Using the AI Writing Assistant Component

The `AIWritingAssistant` component provides a user-friendly interface for AI-powered text editing.

### Basic Usage

```tsx
import { AIWritingAssistant } from "@/components/AIWritingAssistant";

function MyForm() {
  const [bio, setBio] = useState("");

  return (
    <AIWritingAssistant
      value={bio}
      onChange={setBio}
      purpose="therapist_bio"
      label="Therapist Bio"
      placeholder="Enter therapist biography..."
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Current text value |
| `onChange` | `(value: string) => void` | required | Callback when text changes |
| `purpose` | `"therapist_bio" \| "blog_post" \| "service_description" \| "general"` | `"general"` | Context for AI assistance |
| `placeholder` | `string` | `undefined` | Textarea placeholder |
| `label` | `string` | `undefined` | Label for the textarea |
| `className` | `string` | `undefined` | Additional CSS classes |

### Features

- **AI Rewrite Button**: Opens dialog for custom rewrite with tone selection
- **Quick Improve Buttons**: One-click improvements for clarity, engagement, SEO, etc.
- **Loading States**: Visual feedback during AI processing
- **Toast Notifications**: Success/error messages

---

## Example Use Cases

### 1. Creating a New Therapist Profile

```tsx
const generateBioMutation = trpc.ai.generateTherapistBio.useMutation();

const handleGenerateBio = async () => {
  const result = await generateBioMutation.mutateAsync({
    name: "Dr. Jane Smith",
    credentials: "PhD, LMFT",
    specialties: ["Anxiety", "Depression", "Trauma"],
    yearsExperience: 15,
    approach: "Cognitive Behavioral Therapy and mindfulness-based approaches",
  });
  
  setBio(result.bio);
};
```

### 2. Writing a Blog Post

```tsx
const generateBlogMutation = trpc.ai.generateBlogContent.useMutation();

const handleGenerateBlog = async () => {
  const result = await generateBlogMutation.mutateAsync({
    topic: "Managing Anxiety in the Workplace",
    keywords: ["workplace anxiety", "stress management", "coping strategies"],
    targetLength: "medium",
    includeAffiliate: true,
    outlineOnly: false,
  });
  
  setContent(result.content);
};
```

### 3. Improving Existing Content

```tsx
const improveMutation = trpc.ai.improveContent.useMutation();

const handleImprove = async () => {
  const result = await improveMutation.mutateAsync({
    text: currentBio,
    improvementType: "compassion",
  });
  
  setBio(result.improvedText);
  console.log("Changes made:", result.changes);
};
```

---

## Best Practices

### 1. **Review AI-Generated Content**
Always review and edit AI-generated content before publishing. The AI provides a strong starting point, but human oversight ensures accuracy and appropriateness.

### 2. **Provide Context**
When using the rewrite function, provide specific instructions for best results:
- ✅ "Make this more concise and focus on the benefits"
- ✅ "Add more empathy and warmth"
- ❌ "Make it better" (too vague)

### 3. **Use Appropriate Tone**
Select the tone that matches your content purpose:
- **Professional**: Therapist credentials, formal content
- **Warm**: Client-facing content, welcome messages
- **Empathetic**: Mental health topics, support content
- **Academic**: Research-based articles
- **Casual**: Blog posts, social media

### 4. **Iterate**
Don't expect perfect results on the first try. Use the improve functions multiple times with different focus areas.

### 5. **Combine with Human Expertise**
AI is a tool to enhance your writing, not replace it. Combine AI assistance with your professional knowledge and judgment.

---

## API Key Configuration

The AI features use the built-in LLM integration which requires no additional configuration. The API key is automatically provided by the Manus platform.

If deploying externally, ensure the following environment variables are set:
- `BUILT_IN_FORGE_API_KEY` - Your Manus API key
- `BUILT_IN_FORGE_API_URL` - Manus API endpoint

---

## Rate Limits & Costs

- AI requests are processed through the Manus platform
- Costs are included in your Manus subscription
- No additional API keys or billing required

---

## Troubleshooting

### "Failed to rewrite" Error
- Check that you're logged in (AI features require authentication)
- Ensure text is not empty
- Verify API keys are configured correctly

### Slow Response Times
- AI generation can take 5-30 seconds depending on content length
- Loading indicators show progress
- Don't submit multiple requests simultaneously

### Content Quality Issues
- Provide more specific instructions
- Try different tone settings
- Use the improve function with different focus areas
- Review and edit the output

---

## Future Enhancements

Planned features:
- Bulk content generation for multiple therapists
- SEO keyword optimization
- Content translation
- Style guide enforcement
- A/B testing suggestions

---

## Support

For issues or questions about AI writing features, refer to the main project documentation or contact support.
