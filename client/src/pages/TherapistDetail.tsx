import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Star, MapPin, Globe, Award, Calendar, MessageCircle, Video, Phone, Mail } from "lucide-react";

export default function TherapistDetail() {
  const [, params] = useRoute("/therapist/:slug");
  const slug = params?.slug || "";

  const { data: therapist, isLoading } = trpc.therapists.bySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container py-4">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">Leverage Therapy</a>
            </Link>
          </div>
        </header>
        <div className="container py-12">
          <div className="animate-pulse">
            <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4" />
            <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container py-4">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">Leverage Therapy</a>
            </Link>
          </div>
        </header>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Therapist Not Found</h1>
          <Button asChild>
            <Link href="/therapists">
              <a>Browse All Therapists</a>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const languages = therapist.languagesSpoken ? JSON.parse(therapist.languagesSpoken) : [];

  return (
    <div className="min-h-screen bg-background">
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
              <Button asChild variant="secondary" size="sm">
                <a href={therapist.betterHelpAffiliateUrl || "https://www.betterhelp.com/get-started/?utm_source=leveragetherapy"} target="_blank" rel="noopener noreferrer">
                  Get Started
                </a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Disclosure Banner */}
      <div className="bg-muted/50 border-b">
        <div className="container py-3">
          <p className="text-sm text-center text-muted-foreground">
            Leverage Therapy is user-supported. If you buy through a link on the site, we earn a commission from BetterHelp at no cost to you.{" "}
            <Link href="/disclosure">
              <a className="text-primary hover:underline">Learn More</a>
            </Link>
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={therapist.photoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"}
                    alt={therapist.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/10 mx-auto md:mx-0"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-2">
                      {therapist.name}, {therapist.credentials}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">{therapist.tagline}</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{((therapist.rating || 0) / 10).toFixed(1)} stars</span>
                        <span className="text-muted-foreground">({therapist.reviewCount} reviews)</span>
                      </div>
                    </div>
                    <Button asChild variant="secondary" size="lg" className="w-full md:w-auto">
                      <a href={therapist.betterHelpAffiliateUrl || "https://www.betterhelp.com/get-started/?utm_source=leveragetherapy"} target="_blank" rel="noopener noreferrer">
                        Chat Now
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* At a Glance */}
            <Card>
              <CardHeader>
                <CardTitle>At a Glance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {therapist.name} is an experienced, licensed Mental Health Professional who specializes in affordable online therapy offered through our partner, BetterHelp.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Speaks {languages.join(", ")}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Video className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Offers Telehealth visits</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Licensed in {therapist.licenseState}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{therapist.yearsExperience} years experience</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* More About */}
            <Card>
              <CardHeader>
                <CardTitle>More About {therapist.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{therapist.yearsExperience} years' experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{therapist.gender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{therapist.credentials}</span>
                  </div>
                </div>
                <p className="text-muted-foreground whitespace-pre-line">{therapist.bio}</p>
              </CardContent>
            </Card>

            {/* Specialties */}
            {therapist.specialties && therapist.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specialties.map((specialty) => (
                      <Badge key={specialty.id} variant="secondary" className="text-sm">
                        {specialty.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Licenses */}
            <Card>
              <CardHeader>
                <CardTitle>Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {therapist.name}'s National Provider Identifier (NPI) is{" "}
                  <a href={`https://npiregistry.cms.hhs.gov/search?number=${therapist.npiNumber}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {therapist.npiNumber}
                  </a>
                  .
                </p>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Award className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {therapist.credentials} · {therapist.licenseState} · {therapist.licenseNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">Renews {therapist.licenseExpiry}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {therapist.reviews && therapist.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reviews for {therapist.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">All reviews have been submitted by clients after seeing the provider.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-1">{((therapist.rating || 0) / 10).toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">{therapist.reviewCount} reviews</div>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = therapist.reviews?.filter((r) => r.rating === rating).length || 0;
                        const percentage = therapist.reviewCount ? (count / therapist.reviewCount) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2 mb-1">
                            <span className="text-sm w-4">{rating}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {therapist.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-t pt-4">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{review.reviewText}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* CTA Card */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-4">Mental health conditions are real, common, and treatable.</h3>
                  <p className="mb-6 opacity-90">And recovery is possible.</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-lg">
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-sm font-medium">Messaging</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-lg">
                      <Mail className="w-6 h-6" />
                      <span className="text-sm font-medium">Live Chat</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-lg">
                      <Phone className="w-6 h-6" />
                      <span className="text-sm font-medium">Phone</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-lg">
                      <Video className="w-6 h-6" />
                      <span className="text-sm font-medium">Video</span>
                    </div>
                  </div>
                  <Button asChild variant="secondary" size="lg" className="w-full">
                    <a href={therapist.betterHelpAffiliateUrl || "https://www.betterhelp.com/get-started/?utm_source=leveragetherapy"} target="_blank" rel="noopener noreferrer">
                      Chat Now
                    </a>
                  </Button>
                  <p className="text-xs mt-4 opacity-75">
                    When you tap CHAT NOW a new window will open and you'll be directed to a simple form that will help start the conversation. Please note: It can take up to a few days to be matched to a therapist.
                  </p>
                </CardContent>
              </Card>

              {/* About Online Counseling */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About Online Counseling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Affordable.</h4>
                    <p className="text-muted-foreground">Pay a low flat fee.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Convenient.</h4>
                    <p className="text-muted-foreground">Do it at your own time and at your own pace. Communicate whenever you feel it's needed.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Available now.</h4>
                    <p className="text-muted-foreground">There is no waiting list and no calls to make. Simply fill out a short questionnaire and send your first message.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
