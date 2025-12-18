import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Calendar, Clock, MapPin, LogOut, User as UserIcon, Settings } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">جاري التحميل...</div>
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
            خدماتك
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              مرحباً، {userMeta?.full_name || "زائر"}
            </span>
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
              
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-primary/10 text-primary font-medium text-sm">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  حجوزاتي
                </button>
                <button className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-secondary text-foreground transition-colors text-sm">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  الإعدادات
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">حجوزاتي</h1>
              <Link to="/services">
                <Button variant="hero" size="sm" className="text-sm">حجز جديد</Button>
              </Link>
            </div>

            {/* Empty State */}
            <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">لا توجد حجوزات</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                لم تقم بأي حجوزات بعد. تصفح الخدمات المتاحة واحجز موعدك الآن.
              </p>
              <Link to="/services">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  تصفح الخدمات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
