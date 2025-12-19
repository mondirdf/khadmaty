import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Calendar, Clock, MapPin, LogOut, User as UserIcon, Settings, Loader2 } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { BookingCard } from "@/components/BookingCard";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

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
  service: {
    title: string;
    category: string;
    price_fixed: number | null;
    price_per_hour: number | null;
  } | null;
  provider: {
    full_name: string;
    phone: string | null;
  } | null;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "completed">("all");
  
  // Review dialog state
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState<BookingWithDetails | null>(null);

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
    if (user) {
      fetchProfileAndBookings();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const fetchProfileAndBookings = async () => {
    if (!user) return;

    setBookingsLoading(true);
    try {
      // Get profile ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setProfileId(profile.id);

        // Fetch bookings
        const { data: bookingsData, error } = await supabase
          .from("bookings")
          .select(`
            *,
            service:services(title, category, price_fixed, price_per_hour),
            provider:profiles!bookings_provider_id_fkey(full_name, phone)
          `)
          .eq("customer_id", profile.id)
          .order("booking_date", { ascending: false });

        if (!error && bookingsData) {
          setBookings(bookingsData as unknown as BookingWithDetails[]);
        }
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("تم إلغاء الحجز بنجاح");
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b
      ));
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("حدث خطأ أثناء إلغاء الحجز");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setReviewingBooking(booking);
      setShowReviewDialog(true);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1">
                {userMeta?.full_name || "زائر"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 sm:mb-6">زبون</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">إجمالي</div>
                </div>
                <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">مكتمل</div>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-primary/10 text-primary font-medium text-sm">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  حجوزاتي
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">حجوزاتي</h1>
              <Link to="/services">
                <Button variant="hero" size="sm" className="text-sm">حجز جديد</Button>
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { value: "all", label: "الكل", count: stats.total },
                { value: "pending", label: "معلق", count: stats.pending },
                { value: "confirmed", label: "مؤكد", count: stats.confirmed },
                { value: "completed", label: "مكتمل", count: stats.completed },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as typeof activeTab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Bookings List */}
            {bookingsLoading ? (
              <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">جاري تحميل الحجوزات...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">لا توجد حجوزات</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  {activeTab === "all" 
                    ? "لم تقم بأي حجوزات بعد. تصفح الخدمات المتاحة واحجز موعدك الآن."
                    : "لا توجد حجوزات في هذه الفئة."}
                </p>
                <Link to="/services">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    تصفح الخدمات
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={{
                      ...booking,
                      service: booking.service || undefined,
                      provider: booking.provider || undefined,
                    }}
                    userType="customer"
                    onCancel={handleCancelBooking}
                    onReview={handleReview}
                    isLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {reviewingBooking && (
        <AddReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          bookingId={reviewingBooking.id}
          serviceId={reviewingBooking.service_id}
          providerId={reviewingBooking.provider_id}
          customerId={profileId!}
          serviceName={reviewingBooking.service?.title || "الخدمة"}
          onReviewAdded={fetchProfileAndBookings}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
