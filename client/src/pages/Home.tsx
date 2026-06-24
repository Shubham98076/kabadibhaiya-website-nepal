import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { Leaf, Truck, MapPin, Clock, Zap, Award } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [bookingData, setBookingData] = useState({
    customerName: "",
    phone: "",
    address: "",
    ward: "",
    scrapType: "Plastic",
    weight: "",
    preferredTime: "Morning (8–11)",
    notes: "",
  });

  const pricingQuery = trpc.pricing.list.useQuery();
  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Booking submitted! We'll call you to confirm.");
      setBookingData({
        customerName: "",
        phone: "",
        address: "",
        ward: "",
        scrapType: "Plastic",
        weight: "",
        preferredTime: "Morning (8–11)",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create booking");
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    createBookingMutation.mutate({
      customerName: bookingData.customerName,
      phone: bookingData.phone,
      address: bookingData.address,
      ward: bookingData.ward,
      scrapType: bookingData.scrapType,
      weight: bookingData.weight ? parseInt(bookingData.weight) : undefined,
      preferredTime: bookingData.preferredTime,
      notes: bookingData.notes,
    });
  };

  const pricingData = pricingQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Kabadibhaiya" className="h-10 w-10" />
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How it works
            </a>
            {isAuthenticated ? (
              <Button variant="outline" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="mb-6 flex items-center gap-3">
                <img src="/logo.png" alt="Kabadibhaiya" className="h-16 w-16" />
              </div>
              <h1 className="text-5xl font-bold leading-tight text-foreground sm:text-6xl">
                Sell scrap in minutes. Fair prices. Doorstep pickup.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Kabadibhaiya connects households and businesses with verified kabadi partners across Kathmandu for transparent, fast, and fair scrap collection.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="btn-elegant">
                  Book a pickup
                </Button>
                <Button size="lg" variant="outline">
                  Become a partner
                </Button>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Zap className="h-6 w-6 text-accent" />
                  <p className="text-sm font-semibold text-foreground">Instant Quotes</p>
                  <p className="text-xs text-muted-foreground">Get fair prices in seconds</p>
                </div>
                <div className="space-y-2">
                  <Truck className="h-6 w-6 text-accent" />
                  <p className="text-sm font-semibold text-foreground">Free Pickup</p>
                  <p className="text-xs text-muted-foreground">We come to your door</p>
                </div>
                <div className="space-y-2">
                  <Award className="h-6 w-6 text-accent" />
                  <p className="text-sm font-semibold text-foreground">Verified Partners</p>
                  <p className="text-xs text-muted-foreground">Trusted professionals</p>
                </div>
              </div>
            </div>

            {/* Pricing Preview */}
            <div className="animate-slide-in-left">
              <Card className="card-elegant border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-xl">Live pricing (NPR/kg)</CardTitle>
                  <CardDescription>Current market rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pricingData.length > 0 ? (
                    pricingData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-accent/5 p-4">
                        <div>
                          <p className="font-semibold text-foreground">{item.category}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-accent">
                            रु {item.minPrice / 100}–{item.maxPrice / 100}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between rounded-lg bg-accent/5 p-4">
                        <div>
                          <p className="font-semibold text-foreground">Plastic (Mixed)</p>
                          <p className="text-sm text-muted-foreground">PET/HDPE better rates</p>
                        </div>
                        <p className="text-lg font-bold text-accent">रु 15–30</p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-accent/5 p-4">
                        <div>
                          <p className="font-semibold text-foreground">Paper/Cardboard</p>
                          <p className="text-sm text-muted-foreground">Dry cardboard pays more</p>
                        </div>
                        <p className="text-lg font-bold text-accent">रु 12–25</p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-accent/5 p-4">
                        <div>
                          <p className="font-semibold text-foreground">Mixed Metals</p>
                          <p className="text-sm text-muted-foreground">Aluminum/copper premium</p>
                        </div>
                        <p className="text-lg font-bold text-accent">रु 40–90</p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-accent/5 p-4">
                        <div>
                          <p className="font-semibold text-foreground">Glass Bottles</p>
                          <p className="text-sm text-muted-foreground">Clean, sorted only</p>
                        </div>
                        <p className="text-lg font-bold text-accent">रु 2–6</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking" className="section-padding bg-gradient-accent">
        <div className="container max-w-2xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-foreground">Book a pickup</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Fill in your details and we'll connect you with a verified kabadi partner
            </p>
          </div>

          <Card className="card-elegant">
            <CardContent className="pt-6">
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sagar Thapa"
                      value={bookingData.customerName}
                      onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      placeholder="98XXXXXXXX"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Street, landmark"
                      value={bookingData.address}
                      onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ward">Ward number</Label>
                    <Input
                      id="ward"
                      placeholder="Ward no."
                      value={bookingData.ward}
                      onChange={(e) => setBookingData({ ...bookingData, ward: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scrap-type">Scrap type</Label>
                    <Select value={bookingData.scrapType} onValueChange={(value) => setBookingData({ ...bookingData, scrapType: value })}>
                      <SelectTrigger id="scrap-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plastic">Plastic</SelectItem>
                        <SelectItem value="Paper/Cardboard">Paper/Cardboard</SelectItem>
                        <SelectItem value="Metal">Metal</SelectItem>
                        <SelectItem value="Glass">Glass</SelectItem>
                        <SelectItem value="E-waste">E-waste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Approx. weight (kg)</Label>
                    <Input
                      id="weight"
                      placeholder="~ kg"
                      type="number"
                      value={bookingData.weight}
                      onChange={(e) => setBookingData({ ...bookingData, weight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Gate info, floor, special items…"
                    rows={3}
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred time</Label>
                    <Select value={bookingData.preferredTime} onValueChange={(value) => setBookingData({ ...bookingData, preferredTime: value })}>
                      <SelectTrigger id="time">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning (8–11)">Morning (8–11)</SelectItem>
                        <SelectItem value="Afternoon (12–3)">Afternoon (12–3)</SelectItem>
                        <SelectItem value="Evening (4–7)">Evening (4–7)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="btn-elegant w-full" disabled={createBookingMutation.isPending}>
                      {createBookingMutation.isPending ? "Booking..." : "Confirm booking"}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  *Rates vary by quality, quantity, and market. Final offer confirmed by partner.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-foreground">How it works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Simple, transparent, and fair</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "Request pickup",
                description: "Book online or call/WhatsApp; upload photos for faster quotes.",
              },
              {
                icon: Truck,
                title: "We collect & weigh",
                description: "Verified kabadi partner arrives, weighs on digital scale, pays fair price.",
              },
              {
                icon: Leaf,
                title: "Recycle & track",
                description: "Material goes to recyclers; get digital receipt & impact stats.",
              },
            ].map((item, index) => (
              <Card key={index} className="card-elegant text-center">
                <CardContent className="pt-6">
                  <item.icon className="mx-auto h-12 w-12 text-accent" />
                  <h3 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding bg-gradient-accent">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-foreground">Live pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Current scrap rates in Kathmandu (NPR/kg)</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingData.length > 0 ? (
              pricingData.map((item) => (
                <Card key={item.id} className="card-elegant">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground">{item.category}</h3>
                    <p className="mt-2 text-3xl font-bold text-accent">
                      रु {item.minPrice / 100}–{item.maxPrice / 100}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="card-elegant">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground">Plastic (Mixed)</h3>
                    <p className="mt-2 text-3xl font-bold text-accent">रु 15–30</p>
                    <p className="mt-2 text-sm text-muted-foreground">Clean & sorted pays more</p>
                  </CardContent>
                </Card>
                <Card className="card-elegant">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground">Paper/Cardboard</h3>
                    <p className="mt-2 text-3xl font-bold text-accent">रु 12–25</p>
                    <p className="mt-2 text-sm text-muted-foreground">Dry cardboard &gt; mixed paper</p>
                  </CardContent>
                </Card>
                <Card className="card-elegant">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground">Mixed Metals</h3>
                    <p className="mt-2 text-3xl font-bold text-accent">रु 40–90</p>
                    <p className="mt-2 text-sm text-muted-foreground">Alu/Cu fetch premium</p>
                  </CardContent>
                </Card>
                <Card className="card-elegant">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground">Glass Bottles</h3>
                    <p className="mt-2 text-3xl font-bold text-accent">रु 2–6</p>
                    <p className="mt-2 text-sm text-muted-foreground">Clean, sorted only</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="section-padding bg-accent">
        <div className="container">
          <div className="rounded-2xl bg-accent-foreground p-12 text-center">
            <h2 className="text-4xl font-bold text-accent">Kabadi partners — grow with us</h2>
            <p className="mt-4 text-lg text-accent/80">
              Steady leads, transparent pricing, and faster payments for verified kabadi partners
            </p>
            <Button size="lg" variant="outline" className="mt-8 border-accent text-accent hover:bg-accent/10">
              Join as a partner
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-accent" />
              <span className="font-semibold text-foreground">Kabadibhaiya</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#booking" className="hover:text-foreground">
                Book pickup
              </a>
              <a href="#how-it-works" className="hover:text-foreground">
                How it works
              </a>
              <a href="#pricing" className="hover:text-foreground">
                Pricing
              </a>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Kabadibhaiya • Kathmandu</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
