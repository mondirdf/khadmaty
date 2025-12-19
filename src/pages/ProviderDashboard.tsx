import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Calendar, Plus, Briefcase, LogOut, Settings, Pencil, Trash2, Clock, Loader2, BarChart3 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AddServiceDialog } from "@/components/AddServiceDialog";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import { SignOutButton } from "@/components/SignOutButton";
import { BookingCard } from "@/components/BookingCard";
import { AvailabilityManager } from "@/components/AvailabilityManager";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarRating } from "@/components/StarRating";
import { Tables } from "@/integrations/supabase/types";

interface BookingWithDetails {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  notes: string | null;
  service_id: string;
  provider_id: string;
  customer_id: string;
  service: {
    title: string;
    category: string;
    price_fixed: number | null;
    price_per_hour: number | null;
  } | null;
}

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "services" | "availability" | "stats">("bookings");
  const [showAddService, setShowAddService] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [editingService, setEditingService] = useState<Tables<"services"> | null>(null);
  const [services, setServices] = useState<Tables<"services">[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingService, setDeletingService] = useState<Tables<"services"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedServiceForAvailability, setSelectedServiceForAvailability] = useState<string | null>(null);
  
  // Bookings state
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all");

  const fetchServices = async () => {
    if (!user) return;
    
    setServicesLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setProfileId(profile.id);
        
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("provider_id", profile.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setServices(data);
          if (data.length > 0 && !selectedServiceForAvailability) {
            setSelectedServiceForAvailability(data[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!profileId) return;
    
    setBookingsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          service:services(title, category, price_fixed, price_per_hour)
        `)
        .eq("provider_id", profileId)
        .order("booking_date", { ascending: false });

      if (!error && data) {
        setBookings(data as unknown as BookingWithDetails[]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", deletingService.id);

      if (error) throw error;

      toast.success("تم حذف الخدمة بنجاح");
      setServices(services.filter(s => s.id !== deletingService.id));
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("حدث خطأ أثناء حذف الخدمة");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingService(null);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("تم قبول الحجز بنجاح");
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: "confirmed" as const } : b
      ));

      // Create notification for customer
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await supabase.from("notifications").insert({
          user_id: booking.customer_id,
          title: "تم قبول حجزك",
          message: `تم قبول حجزك لخدمة "${booking.service?.title}"`,
          type: "booking",
          reference_id: bookingId,
        });
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("حدث خطأ أثناء قبول الحجز");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("تم رفض الحجز");
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b
      ));

      // Create notification for customer
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await supabase.from("notifications").insert({
          user_id: booking.customer_id,
          title: "تم رفض حجزك",
          message: `للأسف تم رفض حجزك لخدمة "${booking.service?.title}"`,
          type: "booking",
          reference_id: bookingId,
        });
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error("حدث خطأ أثناء رفض الحجز");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("تم إكمال الحجز بنجاح");
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: "completed" as const } : b
      ));

      // Create notification for customer
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await supabase.from("notifications").insert({
          user_id: booking.customer_id,
          title: "تمت الخدمة بنجاح",
          message: `تم إكمال خدمة "${booking.service?.title}". شاركنا رأيك!`,
          type: "booking",
          reference_id: bookingId,
        });
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      toast.error("حدث خطأ");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  useEffect(() => {
    if (profileId) {
      fetchBookings();
    }
  }, [profileId]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const filteredBookings = bookings.filter(booking => {
    if (bookingFilter === "all") return true;
    return booking.status === bookingFilter;
  });

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === "pending").length,
    confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    completedBookings: bookings.filter(b => b.status === "completed").length,
    totalServices: services.length,
    totalRevenue: bookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + (b.service?.price_fixed || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userMeta = user?.user_metadata;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-gradient">
            خدمتي
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              مرحباً، {userMeta?.full_name || "زائر"}
            </span>
            {profileId && <NotificationBell userId={profileId} />}
            <ThemeToggle />
            <SignOutButton onSignedOut={() => navigate("/")}>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </SignOutButton>
          </div>
        </div>
      </nav>

      <div className="container py-4 sm:py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1">
                {userMeta?.full_name || "زائر"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 sm:mb-6">مقدم خدمة</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.pendingBookings}</div>
                  <div className="text-xs text-muted-foreground">حجوزات معلقة</div>
                </div>
                <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalServices}</div>
                  <div className="text-xs text-muted-foreground">خدمات</div>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors text-sm ${
                    activeTab === "bookings" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  الحجوزات الواردة
                </button>
                <button 
                  onClick={() => setActiveTab("services")}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors text-sm ${
                    activeTab === "services" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                  خدماتي
                </button>
                <button 
                  onClick={() => setActiveTab("availability")}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors text-sm ${
                    activeTab === "availability" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  أوقات العمل
                </button>
                <button 
                  onClick={() => setActiveTab("stats")}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors text-sm ${
                    activeTab === "stats" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  الإحصائيات
                </button>
                <Link to="/settings" className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-secondary text-foreground transition-colors text-sm">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  الإعدادات
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">الحجوزات الواردة</h1>
                </div>

                {/* Booking Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {[
                    { value: "all", label: "الكل", count: stats.totalBookings },
                    { value: "pending", label: "معلق", count: stats.pendingBookings },
                    { value: "confirmed", label: "مؤكد", count: stats.confirmedBookings },
                    { value: "completed", label: "مكتمل", count: stats.completedBookings },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setBookingFilter(tab.value as typeof bookingFilter)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        bookingFilter === tab.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                {bookingsLoading ? (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري تحميل الحجوزات...</p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                    <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">لا توجد حجوزات</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {bookingFilter === "all" 
                        ? "لم تتلقَ أي حجوزات بعد. أضف خدماتك لبدء استقبال العملاء."
                        : "لا توجد حجوزات في هذه الفئة."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={{
                          ...booking,
                          service: booking.service || undefined,
                        }}
                        userType="provider"
                        onAccept={handleAcceptBooking}
                        onReject={handleRejectBooking}
                        onComplete={handleCompleteBooking}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">خدماتي</h1>
                  <Button variant="hero" className="gap-2 text-sm" onClick={() => setShowAddService(true)}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">إضافة خدمة</span>
                    <span className="sm:hidden">إضافة</span>
                  </Button>
                </div>

                {servicesLoading ? (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري التحميل...</p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                    <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">لا توجد خدمات</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                      لم تضف أي خدمات بعد. أضف خدماتك لتظهر للعملاء.
                    </p>
                    <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto" onClick={() => setShowAddService(true)}>
                      <Plus className="h-5 w-5" />
                      إضافة خدمة جديدة
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50">
                        <div className="flex items-start gap-4">
                          {service.image_url && (
                            <img 
                              src={service.image_url} 
                              alt={service.title}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                                  {(service.average_rating ?? 0) > 0 && (
                                    <div className="flex items-center gap-1">
                                      <StarRating rating={Number(service.average_rating) || 0} size="sm" />
                                      <span className="text-xs text-muted-foreground">
                                        ({service.total_reviews})
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {service.price_fixed && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                      {service.price_fixed} د.ج
                                    </span>
                                  )}
                                  {service.price_per_hour && (
                                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                                      {service.price_per_hour} د.ج/ساعة
                                    </span>
                                  )}
                                  {service.location && (
                                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full">
                                      {service.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingService(service);
                                    setShowEditService(true);
                                  }}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setDeletingService(service);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <span className={`text-xs px-2 py-1 rounded-full ${service.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                                  {service.is_active ? 'نشط' : 'غير نشط'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Availability Tab */}
            {activeTab === "availability" && (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">أوقات العمل</h1>
                </div>

                {services.length === 0 ? (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                    <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">لا توجد خدمات</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      أضف خدمة أولاً لتتمكن من إدارة أوقات العمل.
                    </p>
                  </div>
                ) : (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
                    {/* Service Selector */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-foreground mb-2 block">اختر الخدمة</label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {services.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => setSelectedServiceForAvailability(service.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                              selectedServiceForAvailability === service.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {service.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedServiceForAvailability && (
                      <AvailabilityManager serviceId={selectedServiceForAvailability} />
                    )}
                  </div>
                )}
              </>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">الإحصائيات</h1>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50">
                    <div className="text-3xl font-bold text-primary mb-1">{stats.totalBookings}</div>
                    <div className="text-sm text-muted-foreground">إجمالي الحجوزات</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.completedBookings}</div>
                    <div className="text-sm text-muted-foreground">حجوزات مكتملة</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50">
                    <div className="text-3xl font-bold text-accent mb-1">{stats.totalServices}</div>
                    <div className="text-sm text-muted-foreground">خدمات نشطة</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50">
                    <div className="text-3xl font-bold text-foreground mb-1">{stats.totalRevenue}</div>
                    <div className="text-sm text-muted-foreground">الإيرادات (د.ج)</div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50">
                  <h3 className="font-semibold text-foreground mb-4">ملخص الأداء</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">معدل القبول</span>
                      <span className="font-medium">
                        {stats.totalBookings > 0 
                          ? Math.round(((stats.confirmedBookings + stats.completedBookings) / stats.totalBookings) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">معدل الإكمال</span>
                      <span className="font-medium">
                        {(stats.confirmedBookings + stats.completedBookings) > 0 
                          ? Math.round((stats.completedBookings / (stats.confirmedBookings + stats.completedBookings)) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AddServiceDialog 
        open={showAddService} 
        onOpenChange={setShowAddService} 
        onServiceAdded={fetchServices}
      />

      <EditServiceDialog
        open={showEditService}
        onOpenChange={setShowEditService}
        onServiceUpdated={fetchServices}
        service={editingService}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الخدمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف خدمة "{deletingService?.title}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "جاري الحذف..." : "حذف الخدمة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProviderDashboard;
