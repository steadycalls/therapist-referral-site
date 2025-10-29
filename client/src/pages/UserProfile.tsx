import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Loader2, User, Heart, Activity, Settings } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function UserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: profile, isLoading: profileLoading, refetch } = 
    trpc.userProfile.getProfile.useQuery(undefined, { enabled: !!user });

  const { data: savedTherapists } = 
    trpc.userProfile.getSavedTherapists.useQuery(undefined, { enabled: !!user });

  const updateMutation = trpc.userProfile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    emailNotifications: profile?.emailNotifications === 1,
    smsNotifications: profile?.smsNotifications === 1,
  });

  // Update form when profile loads
  if (profile && !formData.name && profile.name) {
    setFormData({
      name: profile.name || "",
      bio: profile.bio || "",
      phone: profile.phone || "",
      location: profile.location || "",
      emailNotifications: profile.emailNotifications === 1,
      smsNotifications: profile.smsNotifications === 1,
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please log in to view your profile.</p>
            <Button asChild>
              <Link href="/">
                <a>Go Home</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">Leverage Therapy</a>
            </Link>
            <nav className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <a>Back to Home</a>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-12 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === "profile"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === "saved"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    Saved Therapists
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === "activity"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === "settings"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, State"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === "saved" && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Therapists</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedTherapists && savedTherapists.length > 0 ? (
                    <div className="space-y-4">
                      {savedTherapists.map((saved: any) => (
                        <div key={saved.id} className="border rounded-lg p-4">
                          <p className="font-semibold">Therapist ID: {saved.therapistId}</p>
                          {saved.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{saved.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Saved on {new Date(saved.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      You haven't saved any therapists yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates and recommendations via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important updates via text message
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={formData.smsNotifications}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, smsNotifications: checked })
                      }
                    />
                  </div>

                  <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "activity" && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your activity history will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
