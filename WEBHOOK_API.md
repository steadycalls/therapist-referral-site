# Webhook API Documentation

This document describes the webhook endpoints available for programmatically adding content to TherapyConnect.

## Authentication

All webhook endpoints require an API key to be passed in the `X-API-Key` header.

```bash
X-API-Key: your-secret-api-key-here
```

To set your API key, add it to your environment variables:
```bash
WEBHOOK_API_KEY=your-secret-api-key-here
```

## Endpoints

### 1. Create Blog Post

**Endpoint:** `POST /api/webhook/blog-post`

**Description:** Creates a new blog post.

**Request Body:**
```json
{
  "slug": "understanding-anxiety",
  "title": "Understanding Anxiety: A Complete Guide",
  "excerpt": "Learn about anxiety disorders and how to manage them effectively.",
  "content": "# Understanding Anxiety\n\nAnxiety is a common mental health condition...",
  "featuredImageUrl": "https://example.com/image.jpg",
  "categoryId": 1,
  "isPublished": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "slug": "understanding-anxiety"
}
```

**Example cURL:**
```bash
curl -X POST https://your-domain.com/api/webhook/blog-post \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "slug": "understanding-anxiety",
    "title": "Understanding Anxiety: A Complete Guide",
    "excerpt": "Learn about anxiety disorders and how to manage them effectively.",
    "content": "# Understanding Anxiety\n\nAnxiety is a common mental health condition...",
    "featuredImageUrl": "https://example.com/image.jpg",
    "categoryId": 1,
    "isPublished": true
  }'
```

---

### 2. Create Therapist Listing

**Endpoint:** `POST /api/webhook/therapist`

**Description:** Creates a new therapist profile.

**Request Body:**
```json
{
  "slug": "jane-smith-lmft",
  "name": "Jane Smith",
  "credentials": "LMFT",
  "tagline": "Compassionate therapy for couples and families",
  "bio": "I am a licensed marriage and family therapist with 12 years of experience...",
  "photoUrl": "https://example.com/photo.jpg",
  "yearsExperience": 12,
  "gender": "female",
  "languagesSpoken": ["English", "French"],
  "licenseState": "New York",
  "licenseNumber": "LMFT-67890",
  "licenseExpiry": "June 2027",
  "npiNumber": "9876543210",
  "betterHelpAffiliateUrl": "https://www.betterhelp.com/get-started/?utm_source=therapyconnect",
  "specialtyIds": [1, 4, 6]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Therapist created successfully",
  "slug": "jane-smith-lmft",
  "id": 5
}
```

**Example cURL:**
```bash
curl -X POST https://your-domain.com/api/webhook/therapist \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "slug": "jane-smith-lmft",
    "name": "Jane Smith",
    "credentials": "LMFT",
    "tagline": "Compassionate therapy for couples and families",
    "bio": "I am a licensed marriage and family therapist...",
    "photoUrl": "https://example.com/photo.jpg",
    "yearsExperience": 12,
    "gender": "female",
    "languagesSpoken": ["English", "French"],
    "licenseState": "New York",
    "licenseNumber": "LMFT-67890",
    "licenseExpiry": "June 2027",
    "npiNumber": "9876543210",
    "betterHelpAffiliateUrl": "https://www.betterhelp.com/get-started/?utm_source=therapyconnect",
    "specialtyIds": [1, 4, 6]
  }'
```

---

### 3. Create Service

**Endpoint:** `POST /api/webhook/service`

**Description:** Creates a new service/resource page.

**Request Body:**
```json
{
  "slug": "group-therapy",
  "title": "Group Therapy",
  "description": "Connect with others facing similar challenges",
  "content": "Group therapy provides a supportive environment where you can share experiences...",
  "iconName": "Users",
  "displayOrder": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service created successfully",
  "slug": "group-therapy"
}
```

**Example cURL:**
```bash
curl -X POST https://your-domain.com/api/webhook/service \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "slug": "group-therapy",
    "title": "Group Therapy",
    "description": "Connect with others facing similar challenges",
    "content": "Group therapy provides a supportive environment...",
    "iconName": "Users",
    "displayOrder": 5
  }'
```

---

### 4. Get Specialties (Reference)

**Endpoint:** `GET /api/webhook/specialties`

**Description:** Retrieves all available specialties for use when creating therapist listings.

**Response:**
```json
{
  "success": true,
  "specialties": [
    {
      "id": 1,
      "name": "Anxiety",
      "slug": "anxiety",
      "description": "Treatment for anxiety disorders and panic attacks",
      "createdAt": "2024-10-28T12:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Depression",
      "slug": "depression",
      "description": "Support for depression and mood disorders",
      "createdAt": "2024-10-28T12:00:00.000Z"
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET https://your-domain.com/api/webhook/specialties \
  -H "X-API-Key: your-secret-api-key-here"
```

---

### 5. Get Blog Categories (Reference)

**Endpoint:** `GET /api/webhook/blog-categories`

**Description:** Retrieves all available blog categories for use when creating blog posts.

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Mental Health Tips",
      "slug": "mental-health-tips",
      "description": "Practical advice for mental wellness",
      "createdAt": "2024-10-28T12:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Therapy Insights",
      "slug": "therapy-insights",
      "description": "Understanding therapy and treatment",
      "createdAt": "2024-10-28T12:00:00.000Z"
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET https://your-domain.com/api/webhook/blog-categories \
  -H "X-API-Key: your-secret-api-key-here"
```

---

## Field Reference

### Therapist Gender Options
- `"male"`
- `"female"`
- `"non-binary"`
- `"other"`

### Icon Names (for Services)
Common Lucide icon names you can use:
- `"User"` - Individual therapy
- `"Heart"` - Couples therapy
- `"Users"` - Family/group therapy
- `"Smile"` - Teen counseling
- `"Brain"` - Cognitive therapy
- `"Activity"` - Wellness programs

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success (GET requests)
- `201` - Created successfully (POST requests)
- `400` - Bad request (invalid data)
- `401` - Unauthorized (invalid API key)
- `500` - Server error

**Error Response Format:**
```json
{
  "error": "Failed to create blog post",
  "details": "Detailed error message here"
}
```

---

## Notes

1. **Slugs must be unique** - Each slug must be unique within its content type (blog posts, therapists, services)
2. **Markdown support** - Blog post content and service content support Markdown formatting
3. **Image URLs** - All image URLs should be publicly accessible HTTPS URLs
4. **BetterHelp URLs** - Include your affiliate tracking parameters in the BetterHelp URLs
5. **Specialty IDs** - Use the `/api/webhook/specialties` endpoint to get valid specialty IDs before creating therapists
6. **Category IDs** - Use the `/api/webhook/blog-categories` endpoint to get valid category IDs before creating blog posts
