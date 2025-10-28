import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Star, Search } from "lucide-react";
import { useState } from "react";

export default function Therapists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | undefined>();
  
  const { data: therapists, isLoading } = trpc.therapists.list.useQuery({
    specialtyId: selectedSpecialty,
  });
  const { data: specialties } = trpc.specialties.list.useQuery();

  const filteredTherapists = therapists?.filter((therapist) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      therapist.name.toLowerCase().includes(query) ||
      therapist.bio?.toLowerCase().includes(query) ||
      therapist.tagline?.toLowerCase().includes(query)
    );
  });

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
                <a className="text-sm font-medium text-primary">Find a Therapist</a>
              </Link>
              <Link href="/services">
                <a className="text-sm font-medium hover:text-primary transition-colors">Services</a>
              </Link>
              <Link href="/blog">
                <a className="text-sm font-medium hover:text-primary transition-colors">Blog</a>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Therapist</h1>
          <p className="text-lg text-muted-foreground">
            Browse our directory of licensed mental health professionals
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, specialty, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSpecialty === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty(undefined)}
            >
              All Specialties
            </Button>
            {specialties?.map((specialty) => (
              <Button
                key={specialty.id}
                variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty.id)}
              >
                {specialty.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredTherapists?.length || 0} therapists found
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTherapists && filteredTherapists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTherapists.map((therapist) => (
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
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {therapist.tagline}
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {((therapist.rating || 0) / 10).toFixed(1)}
                            </span>
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
                        <Button variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No therapists found matching your criteria. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-16 bg-primary text-primary-foreground rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to start your therapy journey?
          </h2>
          <p className="mb-6 opacity-90">
            Get matched with a licensed therapist in minutes through our partner, BetterHelp.
          </p>
          <Button asChild size="lg" variant="secondary">
            <a href="https://www.betterhelp.com/get-started/?utm_source=therapyconnect" target="_blank" rel="noopener noreferrer">
              Get Started Now
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
