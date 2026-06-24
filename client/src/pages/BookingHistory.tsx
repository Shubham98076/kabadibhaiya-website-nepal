import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { MapPin, Phone, Calendar, Package, Leaf } from "lucide-react";

export default function BookingHistory() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const bookingsQuery = trpc.bookings.list.useQuery();
  const bookings = bookingsQuery.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
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
                <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
                <p className="mt-2 text-muted-foreground">Track your scrap pickup requests</p>
              </div>
            </div>
            <Button asChild>
              <a href="/">← Back to Home</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="section-padding">
        <div className="container max-w-4xl">
          {bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="card-elegant">
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Left side - Details */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Booking ID</p>
                          <p className="font-semibold text-foreground">#{booking.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Scrap Type</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Package className="h-4 w-4 text-accent" />
                            <p className="font-semibold text-foreground">{booking.scrapType}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="font-semibold text-foreground">{booking.weight ? `${booking.weight} kg` : "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <div className="mt-1 flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <p className="font-semibold text-foreground">{booking.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Status & Contact */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <span
                            className={`mt-1 inline-block rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Preferred Time</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-accent" />
                            <p className="font-semibold text-foreground">{booking.preferredTime}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-accent" />
                            <p className="font-semibold text-foreground">{booking.phone}</p>
                          </div>
                        </div>
                        {booking.estimatedPrice && (
                          <div>
                            <p className="text-sm text-muted-foreground">Estimated Price</p>
                            <p className="font-semibold text-accent">रु {booking.estimatedPrice / 100}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-6 border-t border-border pt-6">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="mt-2 text-foreground">{booking.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-elegant text-center">
              <CardContent className="pt-12 pb-12">
                <Leaf className="mx-auto h-12 w-12 text-accent/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No bookings yet</h3>
                <p className="mt-2 text-muted-foreground">Start by booking a scrap pickup on the home page</p>
                <Button asChild className="mt-6">
                  <a href="/#booking">Book a pickup</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
