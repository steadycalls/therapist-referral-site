import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, Users, Smile, Brain, Activity, Shield } from "lucide-react";

const iconMap: Record<string, any> = {
  Heart,
  Users,
  Smile,
  Brain,
  Activity,
  Shield,
};

export default function Services() {
  const { data: services, isLoading } = trpc.services.list.useQuery();

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
                <a className="text-sm font-medium text-primary">Services</a>
              </Link>
              <Link href="/blog">
                <a className="text-sm font-medium hover:text-primary transition-colors">Blog</a>
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
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive mental health services tailored to your needs
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-muted mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = service.iconName && iconMap[service.iconName] ? iconMap[service.iconName] : Heart;
              return (
                <Link key={service.id} href={`/service/${service.slug}`}>
                  <a>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription className="line-clamp-3">{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full">
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No services available yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-primary text-primary-foreground rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Get started with online therapy today
          </h2>
          <p className="mb-6 opacity-90">
            Take the first step towards better mental health. Connect with a licensed therapist in minutes.
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
