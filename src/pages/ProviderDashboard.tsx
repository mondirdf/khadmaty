import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Calendar, Plus, Briefcase, LogOut, User as UserIcon, Settings, Clock, CheckCircle, XCircle } from "lucide-react";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "services">("bookings");

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
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground text-center mb-1">
                {userMeta?.full_name || "زائر"}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">مقدم خدمة</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">حجوزات</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">خدمات</div>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === "bookings" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  الحجوزات الواردة
                </button>
                <button 
                  onClick={() => setActiveTab("services")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === "services" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                  خدماتي
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
            {activeTab === "bookings" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-foreground">الحجوزات الواردة</h1>
                </div>

                {/* Empty State */}
                <div className="bg-card rounded-2xl p-12 shadow-soft border border-border/50 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد حجوزات</h3>
                  <p className="text-muted-foreground">
                    لم تتلقَ أي حجوزات بعد. أضف خدماتك لبدء استقبال العملاء.
                  </p>
                </div>
              </>
            )}

            {activeTab === "services" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-foreground">خدماتي</h1>
                  <Button variant="hero" className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة خدمة
                  </Button>
                </div>

                {/* Empty State */}
                <div className="bg-card rounded-2xl p-12 shadow-soft border border-border/50 text-center">
                  <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد خدمات</h3>
                  <p className="text-muted-foreground mb-6">
                    لم تضف أي خدمات بعد. أضف خدماتك لتظهر للعملاء المحتملين.
                  </p>
                  <Button variant="hero" size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    إضافة خدمة جديدة
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
