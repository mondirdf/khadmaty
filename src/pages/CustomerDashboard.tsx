import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, LogOut, User as UserIcon, Settings } from "lucide-react";

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/");
  };

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
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-gradient">
            خدماتك
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              مرحباً، {userMeta?.full_name || "زائر"}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground text-center mb-1">
                {userMeta?.full_name || "زائر"}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">زبون</p>
              
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium">
                  <Calendar className="h-5 w-5" />
                  حجوزاتي
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-foreground transition-colors">
                  <Settings className="h-5 w-5" />
                  الإعدادات
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">حجوزاتي</h1>
              <Link to="/services">
                <Button variant="hero">حجز جديد</Button>
              </Link>
            </div>

            {/* Empty State */}
            <div className="bg-card rounded-2xl p-12 shadow-soft border border-border/50 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد حجوزات</h3>
              <p className="text-muted-foreground mb-6">
                لم تقم بأي حجوزات بعد. تصفح الخدمات المتاحة واحجز موعدك الآن.
              </p>
              <Link to="/services">
                <Button variant="hero" size="lg">
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
