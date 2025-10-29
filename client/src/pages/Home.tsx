import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Star, MessageCircle, Video, Phone, Mail, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: therapists, isLoading: therapistsLoading } = trpc.therapists.list.useQuery();
  const { data: blogPosts, isLoading: blogLoading } = trpc.blog.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();

  const featuredTherapists = therapists?.slice(0, 3) || [];
  const latestPosts = blogPosts?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
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
                <a className="text-sm font-medium hover:text-primary transition-colors">Blog</a>
              </Link>
              <Link href="/about">
                <a className="text-sm font-medium hover:text-primary transition-colors">About</a>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Find Your Perfect Therapist
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Connect with licensed mental health professionals who specialize in your needs. 
              Affordable, convenient, and confidential online therapy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/therapists">
                  <a>Browse Therapists</a>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <a href="https://www.betterhelp.com/get-started/?utm_source=leveragetherapy" target="_blank" rel="noopener noreferrer">
                  Start Online Therapy
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Disclosure Banner */}
      <div className="bg-muted/50 border-b">
        <div className="container py-3">
          <p className="text-sm text-muted-foreground mb-2">
            Leverage Therapy is user-supported. If you buy through a link on the site, we earn a commission from BetterHelp at no cost to you.{" "}
            <Link href="/disclosure">
              <a className="underline hover:text-primary">Learn More</a>
            </Link>
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Online Therapy?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Convenient</CardTitle>
                <CardDescription>
                  Access therapy from the comfort of your home. No commute, no waiting rooms.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Flexible</CardTitle>
                <CardDescription>
                  Choose from messaging, phone, or video sessions based on your preference and schedule.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Affordable</CardTitle>
                <CardDescription>
                  More affordable than traditional therapy, with plans starting at a fraction of the cost.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Featured Therapists</h2>
            <Button asChild variant="ghost">
              <Link href="/therapists">
                <a className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </Button>
          </div>
          
          {therapistsLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredTherapists.map((therapist) => (
                <Link key={therapist.id} href={`/therapist/${therapist.slug}`}>
                  <a>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <img
                            src={therapist.photoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"}
                            alt={therapist.name}
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/10"
                          />
                          <h3 className="text-xl font-semibold mb-1">
                            {therapist.name}, {therapist.credentials}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">{therapist.tagline}</p>
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{((therapist.rating || 0) / 10).toFixed(1)}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({therapist.reviewCount} reviews)
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                            <span>{therapist.yearsExperience} years exp.</span>
                            <span>•</span>
                            <span>{therapist.licenseState}</span>
                          </div>
                          <Button variant="secondary" className="w-full">
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mental health conditions are real, common, and treatable.
            </h2>
            <p className="text-lg mb-8 opacity-90">
              And recovery is possible. Take the first step today.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            <Button asChild size="lg" variant="secondary" className="text-lg px-12">
              <a href="https://www.betterhelp.com/get-started/?utm_source=leveragetherapy" target="_blank" rel="noopener noreferrer">
                Get Started Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Latest from Our Blog</h2>
            <Button asChild variant="ghost">
              <Link href="/blog">
                <a className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </Button>
          </div>
          
          {blogLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
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
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                      </CardHeader>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Leverage Therapy</h3>
              <p className="text-sm text-muted-foreground">
                Connecting you with licensed mental health professionals for affordable, convenient online therapy.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/therapists"><a className="text-muted-foreground hover:text-primary">Find a Therapist</a></Link></li>
                <li><Link href="/services"><a className="text-muted-foreground hover:text-primary">Services</a></Link></li>
                <li><Link href="/blog"><a className="text-muted-foreground hover:text-primary">Blog</a></Link></li>
                <li><Link href="/about"><a className="text-muted-foreground hover:text-primary">About Us</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq"><a className="text-muted-foreground hover:text-primary">FAQ</a></Link></li>
                <li><Link href="/contact"><a className="text-muted-foreground hover:text-primary">Contact</a></Link></li>
                <li><Link href="/privacy"><a className="text-muted-foreground hover:text-primary">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="text-muted-foreground hover:text-primary">Terms of Service</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Help Now</h4>
              <p className="text-sm text-muted-foreground mb-4">
                If you're in crisis, call the National Suicide Prevention Lifeline at 988.
              </p>
              <Button asChild variant="secondary" className="w-full">
                <a href="https://www.betterhelp.com/get-started/?utm_source=leveragetherapy" target="_blank" rel="noopener noreferrer">
                  Start Therapy
                </a>
              </Button>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Leverage Therapy. All rights reserved.</p>
            <p className="mt-2">
              We earn a commission from BetterHelp at no cost to you when you sign up through our links.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
