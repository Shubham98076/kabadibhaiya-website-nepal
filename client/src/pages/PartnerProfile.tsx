import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Store, User, Phone, MapPin, Star } from "lucide-react";

export default function PartnerProfile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    coveredAreas: "",
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const partnerQuery = trpc.partners.getProfile.useQuery();
  const registerMutation = trpc.partners.register.useMutation({
    onSuccess: () => {
      toast.success("Partner registration submitted! We'll review your application.");
      setFormData({ shopName: "", ownerName: "", phone: "", coveredAreas: "" });
      partnerQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to register as partner");
    },
  });

  const partner = partnerQuery.data;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Kabadibhaiya" className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Partner Profile</h1>
                <p className="mt-2 text-muted-foreground">Manage your kabadi business</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <a href="/">← Back to Home</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-padding">
        <div className="container max-w-2xl">
          {partner ? (
            // Existing Partner Profile
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Your Partner Profile</CardTitle>
                <CardDescription>Your registered kabadi business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Shop Name</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Store className="h-5 w-5 text-accent" />
                      <p className="font-semibold text-foreground">{partner.shopName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Owner Name</p>
                    <div className="mt-2 flex items-center gap-2">
                      <User className="h-5 w-5 text-accent" />
                      <p className="font-semibold text-foreground">{partner.ownerName}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-accent" />
                      <p className="font-semibold text-foreground">{partner.phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Areas</p>
                    <div className="mt-2 flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <p className="font-semibold text-foreground">{partner.coveredAreas}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Application Status</p>
                      <span
                        className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
                          partner.status
                        )}`}
                      >
                        {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Status</p>
                      <span
                        className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-semibold ${getVerificationColor(
                          partner.verificationStatus
                        )}`}
                      >
                        {partner.verificationStatus.charAt(0).toUpperCase() +
                          partner.verificationStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {partner.status === "approved" && (
                  <div className="border-t border-border pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Pickups</p>
                        <p className="mt-2 text-2xl font-bold text-accent">{partner.totalPickups}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <p className="text-2xl font-bold text-foreground">
                            {partner.rating ? (partner.rating / 100).toFixed(1) : "0"}/5
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Registration Form
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Become a Kabadi Partner</CardTitle>
                <CardDescription>Join our network of verified scrap collection partners</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="shop-name">Shop Name</Label>
                      <Input
                        id="shop-name"
                        placeholder="e.g., Shree Kabadi Traders"
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner-name">Owner Name</Label>
                      <Input
                        id="owner-name"
                        placeholder="e.g., Ram Karki"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areas">Service Areas</Label>
                      <Input
                        id="areas"
                        placeholder="Wards/locations you can serve"
                        value={formData.coveredAreas}
                        onChange={(e) => setFormData({ ...formData, coveredAreas: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-accent/5 p-4">
                    <p className="text-sm text-muted-foreground">
                      By registering, you agree to our partner terms and conditions. Our team will review your
                      application and contact you within 24 hours.
                    </p>
                  </div>

                  <Button type="submit" className="btn-elegant w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Registering..." : "Register as Partner"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
