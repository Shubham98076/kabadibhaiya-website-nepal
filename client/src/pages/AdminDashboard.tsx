import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { BarChart3, Users, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState<"bookings" | "partners" | "pricing">("bookings");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<string>("all");

  // Redirect if not admin
  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  // Queries
  const bookingsQuery = trpc.bookings.listAll.useQuery();
  const partnersQuery = trpc.partners.listAll.useQuery();
  const pricingQuery = trpc.pricing.list.useQuery();

  // Mutations
  const updateBookingStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking status updated");
      bookingsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update booking");
    },
  });

  const updatePartnerStatusMutation = trpc.partners.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Partner status updated");
      partnersQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update partner");
    },
  });

  const bookings = bookingsQuery.data || [];
  const partners = partnersQuery.data || [];
  const pricing = pricingQuery.data || [];

  const filteredBookings =
    bookingStatusFilter === "all" ? bookings : bookings.filter((b) => b.status === bookingStatusFilter);

  const filteredPartners =
    partnerStatusFilter === "all" ? partners : partners.filter((p) => p.status === partnerStatusFilter);

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      label: "Pending Bookings",
      value: bookings.filter((b) => b.status === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Partner Applications",
      value: partners.filter((p) => p.status === "pending").length,
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container py-6">
          <div className="mb-4 flex items-center gap-3">
            <img src="/logo.png" alt="Kabadibhaiya" className="h-10 w-10" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="mt-2 text-muted-foreground">Manage bookings, partners, and pricing</p>
        </div>
      </div>

      {/* Stats */}
      <div className="section-padding">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="card-elegant">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container">
        <div className="mb-8 flex gap-4 border-b border-border">
          {(["bookings", "partners", "pricing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`pb-4 px-4 font-medium transition-colors ${
                selectedTab === tab
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {selectedTab === "bookings" && (
          <div className="mb-12">
            <Card className="card-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Booking Requests</CardTitle>
                    <CardDescription>Manage customer scrap pickup bookings</CardDescription>
                  </div>
                  <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Scrap Type</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.customerName}</TableCell>
                            <TableCell>{booking.phone}</TableCell>
                            <TableCell>{booking.scrapType}</TableCell>
                            <TableCell>{booking.weight ? `${booking.weight} kg` : "N/A"}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                  booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "confirmed"
                                      ? "bg-blue-100 text-blue-800"
                                      : booking.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={booking.status}
                                onValueChange={(value) =>
                                  updateBookingStatusMutation.mutate({
                                    bookingId: booking.id,
                                    status: value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No bookings found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Partners Tab */}
        {selectedTab === "partners" && (
          <div className="mb-12">
            <Card className="card-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Partner Applications</CardTitle>
                    <CardDescription>Review and manage kabadi partner registrations</CardDescription>
                  </div>
                  <Select value={partnerStatusFilter} onValueChange={setPartnerStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shop Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPartners.length > 0 ? (
                        filteredPartners.map((partner) => (
                          <TableRow key={partner.id}>
                            <TableCell className="font-medium">{partner.shopName}</TableCell>
                            <TableCell>{partner.ownerName}</TableCell>
                            <TableCell>{partner.phone}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                  partner.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : partner.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {partner.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                  partner.verificationStatus === "verified"
                                    ? "bg-green-100 text-green-800"
                                    : partner.verificationStatus === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {partner.verificationStatus}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={partner.status}
                                onValueChange={(value) =>
                                  updatePartnerStatusMutation.mutate({
                                    partnerId: partner.id,
                                    status: value,
                                    verificationStatus:
                                      value === "approved" ? "verified" : partner.verificationStatus,
                                  })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="approved">Approve</SelectItem>
                                  <SelectItem value="rejected">Reject</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No partners found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Tab */}
        {selectedTab === "pricing" && (
          <div className="mb-12">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Live Pricing</CardTitle>
                <CardDescription>Current scrap prices by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {pricing.length > 0 ? (
                    pricing.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border p-6">
                        <h3 className="font-semibold text-foreground">{item.category}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Price Range (NPR/kg)</p>
                            <p className="text-2xl font-bold text-accent">
                              रु {item.minPrice / 100}–{item.maxPrice / 100}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 text-center text-muted-foreground">
                      No pricing data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
