import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Calendar, ArrowLeft, MessageCircle, Video, Phone, Mail } from "lucide-react";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const { data: post, isLoading } = trpc.blog.bySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container py-4">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">TherapyConnect</a>
            </Link>
          </div>
        </header>
        <div className="container py-12">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-1/4 mb-8" />
            <div className="aspect-video bg-muted rounded-lg mb-8" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container py-4">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">TherapyConnect</a>
            </Link>
          </div>
        </header>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <Button asChild>
            <Link href="/blog">
              <a>Back to Blog</a>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">TherapyConnect</a>
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
                <a href="https://www.betterhelp.com/get-started/?utm_source=therapyconnect" target="_blank" rel="noopener noreferrer">
                  Get Started
                </a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/blog">
              <a className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </a>
            </Link>
          </Button>

          <article>
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </header>

            {post.featuredImageUrl && (
              <div className="aspect-video overflow-hidden rounded-lg mb-8">
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {post.excerpt && (
              <div className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {post.excerpt}
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <Streamdown>{post.content}</Streamdown>
            </div>
          </article>

          {/* CTA Section */}
          <Card className="mt-12 bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to start therapy?</h3>
              <p className="mb-6 opacity-90">
                Connect with a licensed therapist through our partner, BetterHelp. Affordable, convenient, and confidential.
              </p>
              <div className="grid sm:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg">
                  <MessageCircle className="w-8 h-8" />
                  <span className="font-medium">Messaging</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg">
                  <Mail className="w-8 h-8" />
                  <span className="font-medium">Live Chat</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg">
                  <Phone className="w-8 h-8" />
                  <span className="font-medium">Phone</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg">
                  <Video className="w-8 h-8" />
                  <span className="font-medium">Video</span>
                </div>
              </div>
              <Button asChild size="lg" variant="secondary" className="px-12">
                <a href="https://www.betterhelp.com/get-started/?utm_source=therapyconnect" target="_blank" rel="noopener noreferrer">
                  Get Started Now
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
