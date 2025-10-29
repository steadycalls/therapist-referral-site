import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Calendar, ArrowRight } from "lucide-react";

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery();
  const { data: categories } = trpc.blogCategories.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">Leverage Therapy</a>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/therapists">
                <a className="text-sm font-medium hover:text-primary transition-colors">Find a Therapist</a>
              </Link>
              <Link href="/services">
                <a className="text-sm font-medium hover:text-primary transition-colors">Services</a>
              </Link>
              <Link href="/blog">
                <a className="text-sm font-medium text-primary">Blog</a>
              </Link>
              <Button asChild variant="secondary" size="sm">
                <a href="https://www.betterhelp.com/get-started/?utm_source=leveragetherapy" target="_blank" rel="noopener noreferrer">
                  Get Started
                </a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Mental Health Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert insights, practical tips, and resources for your mental health journey
          </p>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <Button key={category.id} variant="outline" size="sm">
                {category.name}
              </Button>
            ))}
          </div>
        )}

        {/* Blog Posts */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <a>
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featuredImageUrl || "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=400&fit=crop"}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                      <div className="flex items-center gap-2 text-primary font-medium pt-2">
                        Read More <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardHeader>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No blog posts available yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-primary text-primary-foreground rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to take the next step?
          </h2>
          <p className="mb-6 opacity-90">
            Connect with a licensed therapist today and start your journey to better mental health.
          </p>
          <Button asChild size="lg" variant="secondary">
            <a href="https://www.betterhelp.com/get-started/?utm_source=leveragetherapy" target="_blank" rel="noopener noreferrer">
              Get Started Now
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
