# Reviews & AI Summary System Guide

## Overview

Leverage Therapy includes a comprehensive reviews and ratings system with AI-powered review summaries. This system helps build trust with potential clients by showcasing authentic feedback and providing intelligent insights.

---

## Features

### 1. **Reviews & Ratings Display**
- Star ratings (1-5 stars)
- Written reviews with reviewer names
- Rating distribution visualization
- Average rating calculation
- Review submission form
- Helpful vote tracking

### 2. **AI-Powered Review Summaries**
- Automatic analysis of all reviews for a therapist
- Highlights key strengths and concerns
- Identifies who the therapist is best suited for
- Cached for 7 days to reduce API costs
- Configurable prompts for customization

### 3. **Admin Controls**
- Review moderation (approve/reject)
- AI prompt configuration
- Prompt testing interface
- Cache management

---

## For Site Administrators

### Accessing the AI Prompt Tester

Navigate to: **`/admin/ai-prompt-tester`**

This interface allows you to:
1. View and edit the current AI prompt template
2. Test prompts with real review data
3. Save new prompt configurations
4. Clear cached summaries

### Configuring AI Prompts

The AI prompt template uses a simple placeholder system:

```
{{reviews}} - Replaced with actual review data
```

**Example Prompt:**
```
You are analyzing reviews for a mental health therapist.

Given the following reviews, provide:
1. A brief overall impression (2-3 sentences)
2. Key strengths mentioned across reviews
3. Any common concerns or areas for improvement
4. Who this therapist might be best suited for

Reviews:
{{reviews}}

Provide a professional, empathetic summary.
```

### Testing Prompts

1. Select a therapist from the dropdown
2. Edit the prompt template
3. Click "Test Prompt"
4. Review the generated summary
5. Iterate until satisfied
6. Click "Save Configuration"

### Best Practices for Prompts

✅ **Do:**
- Be specific about what you want analyzed
- Use professional, empathetic language
- Include structure (numbered lists, sections)
- Test with multiple therapists
- Keep the mental health context in mind

❌ **Don't:**
- Make prompts too vague ("summarize these")
- Use overly technical language
- Forget to include the `{{reviews}}` placeholder
- Make assumptions about review quality

---

## API Reference

### Get Review Summary

**Endpoint:** `trpc.aiReview.getReviewSummary`

**Input:**
```typescript
{
  therapistId: number;
  forceRefresh?: boolean; // Skip cache
}
```

**Output:**
```typescript
{
  summary: string | null;
  reviewCount: number;
  cached: boolean;
  cachedAt?: Date;
}
```

**Example:**
```typescript
const { data } = trpc.aiReview.getReviewSummary.useQuery({
  therapistId: 1,
  forceRefresh: false,
});
```

---

### Submit Review

**Endpoint:** `trpc.therapists.submitReview`

**Input:**
```typescript
{
  therapistId: number;
  rating: number; // 1-5
  reviewText: string;
  reviewerName: string;
}
```

**Example:**
```typescript
const mutation = trpc.therapists.submitReview.useMutation({
  onSuccess: () => {
    toast.success("Review submitted!");
  },
});

mutation.mutate({
  therapistId: 1,
  rating: 5,
  reviewText: "Excellent therapist!",
  reviewerName: "John D.",
});
```

---

### Get Therapist Reviews

**Endpoint:** `trpc.therapists.reviews`

**Input:**
```typescript
{
  therapistId: number;
}
```

**Output:**
```typescript
Array<{
  id: number;
  therapistId: number;
  rating: number;
  reviewText: string;
  reviewerName: string;
  helpfulCount: number;
  isApproved: boolean;
  createdAt: Date;
}>
```

---

### Update Prompt Configuration (Admin Only)

**Endpoint:** `trpc.aiReview.updatePromptConfig`

**Input:**
```typescript
{
  name: string; // "review_summary"
  description?: string;
  promptTemplate: string;
  systemMessage?: string;
}
```

**Example:**
```typescript
const mutation = trpc.aiReview.updatePromptConfig.useMutation();

mutation.mutate({
  name: "review_summary",
  promptTemplate: "Your custom prompt with {{reviews}}",
  systemMessage: "You are a helpful assistant...",
});
```

---

### Test Prompt (Admin Only)

**Endpoint:** `trpc.aiReview.testPrompt`

**Input:**
```typescript
{
  promptTemplate: string;
  systemMessage?: string;
  therapistId: number;
}
```

**Output:**
```typescript
{
  summary: string;
  reviewCount: number;
  inputPreview: string;
}
```

---

### Clear Cache (Admin Only)

**Endpoint:** `trpc.aiReview.clearCache`

**Input:**
```typescript
{
  therapistId: number;
}
```

---

## Using the ReviewsSection Component

The `ReviewsSection` component provides a complete reviews interface:

```tsx
import { ReviewsSection } from "@/components/ReviewsSection";

function TherapistProfile() {
  return (
    <div>
      {/* Other profile content */}
      
      <ReviewsSection
        therapistId={therapist.id}
        therapistName={therapist.name}
      />
    </div>
  );
}
```

**Features Included:**
- Overall rating display
- Rating distribution chart
- AI-generated summary (if available)
- Individual review cards
- Review submission dialog
- Loading states and error handling

---

## Database Schema

### `reviews` Table
```sql
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  therapist_id INT NOT NULL,
  rating INT NOT NULL,
  review_text TEXT,
  reviewer_name VARCHAR(255),
  helpful_count INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `ai_prompts` Table
```sql
CREATE TABLE ai_prompts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  system_message TEXT,
  is_active INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `ai_summary_cache` Table
```sql
CREATE TABLE ai_summary_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  prompt_name VARCHAR(100) NOT NULL,
  summary TEXT NOT NULL,
  input_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

---

## Caching Strategy

### How It Works
1. When a review summary is requested, the system checks the cache
2. If a valid cached summary exists (not expired, same input hash), it's returned
3. Otherwise, a new summary is generated via AI
4. The new summary is cached with a 7-day expiration

### Cache Invalidation
- Automatically expires after 7 days
- Can be manually cleared via admin interface
- Input hash changes when reviews are added/modified

### Benefits
- Reduces API costs
- Improves response times
- Maintains consistency

---

## Review Moderation

### Approval Workflow
1. User submits a review
2. Review is created with `isApproved = false`
3. Admin reviews and approves/rejects
4. Only approved reviews appear publicly

### Approving Reviews

```typescript
const approveMutation = trpc.reviews.approve.useMutation();

approveMutation.mutate({
  reviewId: 123,
  isApproved: true,
});
```

---

## Troubleshooting

### AI Summary Not Appearing
- Check if therapist has approved reviews
- Verify AI prompt configuration exists
- Check browser console for errors
- Try clearing the cache

### Prompt Test Failing
- Ensure selected therapist has reviews
- Check prompt template includes `{{reviews}}`
- Verify API keys are configured
- Check server logs for errors

### Reviews Not Saving
- Verify database connection
- Check required fields are provided
- Ensure therapist ID is valid
- Check server logs for errors

---

## Performance Considerations

### Optimization Tips
1. **Cache Duration**: 7 days balances freshness and cost
2. **Lazy Loading**: AI summaries load separately from reviews
3. **Pagination**: Consider paginating reviews for therapists with many reviews
4. **Index**: Add database indexes on `therapist_id` and `is_approved`

### Recommended Indexes
```sql
CREATE INDEX idx_reviews_therapist ON reviews(therapist_id, is_approved);
CREATE INDEX idx_cache_lookup ON ai_summary_cache(entity_type, entity_id, input_hash);
```

---

## Future Enhancements

Potential features to add:
- Review voting (helpful/not helpful)
- Review responses from therapists
- Sentiment analysis
- Review verification
- Photo/video reviews
- Review filtering (by rating, date, etc.)
- Bulk AI summary generation
- A/B testing for prompts

---

## Support

For issues or questions:
1. Check server logs: `pnpm dev` output
2. Check browser console for client errors
3. Test with AI Prompt Tester interface
4. Review this documentation

---

## Quick Reference

| Task | URL/Command |
|------|-------------|
| View reviews | Visit therapist profile page |
| Submit review | Click "Write a Review" button |
| Test AI prompts | `/admin/ai-prompt-tester` |
| Approve reviews | Use admin dashboard |
| Clear cache | AI Prompt Tester → "Clear Cache" |
| Check logs | `pnpm dev` in terminal |

---

## Example Workflow

### Adding a New Therapist with Reviews

1. **Create therapist** (via webhook or admin interface)
2. **Add initial reviews** (seed data or manual submission)
3. **Approve reviews** (admin dashboard)
4. **Generate AI summary** (automatic on first page load)
5. **Test summary** (AI Prompt Tester if needed)
6. **Publish** (therapist profile is live)

### Updating AI Prompt

1. Navigate to `/admin/ai-prompt-tester`
2. Edit prompt template
3. Select a therapist for testing
4. Click "Test Prompt"
5. Review generated summary
6. Iterate until satisfied
7. Click "Save Configuration"
8. Clear caches for immediate effect

---

This system provides a robust foundation for building trust through authentic reviews and intelligent AI-powered insights.
