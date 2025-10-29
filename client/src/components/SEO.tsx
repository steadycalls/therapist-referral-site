import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  schema?: object;
}

export function SEO({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = "https://leveragetherapy.com/og-image.jpg",
  article,
  schema,
}: SEOProps) {
  const siteName = "Leverage Therapy";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const url = canonical || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* LLM Optimization Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* AI Search Engine Hints */}
      <meta property="ai:title" content={title} />
      <meta property="ai:description" content={description} />
      <meta property="ai:type" content={ogType} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Article-specific OG tags */}
      {article && ogType === "article" && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

// Helper function to generate Organization schema
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Leverage Therapy",
    url: "https://leveragetherapy.com",
    logo: "https://leveragetherapy.com/logo.png",
    description: "Connect with licensed mental health professionals who specialize in your needs. Affordable, convenient, and confidential online therapy.",
    sameAs: [
      // Add social media profiles here when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English"],
    },
  };
}

// Helper function to generate WebSite schema
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Leverage Therapy",
    url: "https://leveragetherapy.com",
    description: "Find licensed therapists and mental health professionals",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://leveragetherapy.com/therapists?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// Helper function to generate Person/Therapist schema
export function getTherapistSchema(therapist: {
  name: string;
  credentials: string;
  bio: string;
  photoUrl?: string;
  yearsExperience?: number;
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: `${therapist.name}, ${therapist.credentials}`,
    description: therapist.bio,
    image: therapist.photoUrl,
    medicalSpecialty: therapist.specialties || [],
    url: `https://leveragetherapy.com/therapist/${therapist.slug}`,
    ...(therapist.rating && therapist.reviewCount && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (therapist.rating / 10).toFixed(1),
        bestRating: "5",
        worstRating: "1",
        ratingCount: therapist.reviewCount,
      },
    }),
  };
}

// Helper function to generate Article schema for blog posts
export function getArticleSchema(article: {
  title: string;
  description: string;
  content: string;
  publishedAt: Date;
  updatedAt?: Date;
  author?: string;
  featuredImageUrl?: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.featuredImageUrl || "https://leveragetherapy.com/og-image.jpg",
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt || article.publishedAt).toISOString(),
    author: {
      "@type": "Organization",
      name: article.author || "Leverage Therapy",
    },
    publisher: {
      "@type": "Organization",
      name: "Leverage Therapy",
      logo: {
        "@type": "ImageObject",
        url: "https://leveragetherapy.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://leveragetherapy.com/blog/${article.slug}`,
    },
  };
}

// Helper function to generate BreadcrumbList schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
