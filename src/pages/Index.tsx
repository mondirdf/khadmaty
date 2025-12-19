import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/SignOutButton";
import { serviceCategories } from "@/data/categories";
import { ArrowLeft, Star, Users, Clock, Shield, LogOut, User, Briefcase, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            supabase
              .from("profiles")
              .select("role, full_name")
              .eq("user_id", session.user.id)
              .single()
              .then(({ data }) => {
                setUserRole(data?.role ?? null);
                setUserName(data?.full_name ?? session.user.user_metadata?.full_name ?? null);
              });
          }, 0);
        } else {
          setUserRole(null);
          setUserName(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role, full_name")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            setUserRole(data?.role ?? null);
            setUserName(data?.full_name ?? session.user.user_metadata?.full_name ?? null);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const dashboardLink = userRole === "provider" ? "/provider/dashboard" : "/customer/dashboard";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </div>

      {/* Navigation */}
      <header>
        <nav className="fixed top-0 right-0 left-0 z-50 glass-nav" aria-label="القائمة الرئيسية">
          <div className="container flex items-center justify-between h-16 sm:h-18 px-4">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-gradient flex items-center gap-2" aria-label="خدمتي - الصفحة الرئيسية">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              خدمتي
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/services" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  الخدمات
                </Button>
              </Link>
              {!loading && (
                user ? (
                  <>
                    {userName && (
                      <span className="text-xs sm:text-sm text-muted-foreground hidden md:block">
                        مرحباً، {userName}
                      </span>
                    )}
                    <Link to={dashboardLink}>
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4 gap-1.5 glass-subtle border-primary/20 hover:border-primary/40 hover:bg-primary/10">
                        {userRole === "provider" ? (
                          <Briefcase className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">لوحة التحكم</span>
                      </Button>
                    </Link>
                    <SignOutButton onSignedOut={() => navigate("/")}>
                      <Button variant="ghost" size="icon" aria-label="تسجيل الخروج" className="hover:bg-destructive/10 hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </SignOutButton>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4 glass-subtle border-border/50 hover:border-primary/40">
                        الدخول
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup">
                      <Button variant="hero" size="sm" className="text-xs sm:text-sm px-2 sm:px-4 shadow-glow">
                        انضم
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="pt-24 sm:pt-36 pb-16 sm:pb-24 px-4 relative" aria-labelledby="hero-heading">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle text-sm text-muted-foreground mb-6 animate-fade-up">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>منصة الخدمات الأولى في المنطقة</span>
              </div>
              <h1 id="hero-heading" className="text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                خدمتي - احجز خدماتك
                <span className="block text-gradient mt-2 animate-glow">بكل سهولة وأمان</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 animate-fade-up px-2 leading-relaxed" style={{ animationDelay: "0.2s" }}>
                منصة خدمتي تجمع أفضل مقدمي الخدمات المنزلية والمهنية في منطقتك. 
                <br className="hidden sm:block" />
                سباكة، كهرباء، تنظيف، نجارة، حلاقة، ودروس خصوصية.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-up px-4" style={{ animationDelay: "0.3s" }}>
                {user ? (
                  userRole === "provider" ? (
                    <>
                      <Link to="/provider/dashboard" className="w-full sm:w-auto">
                        <Button variant="hero" size="lg" className="w-full sm:w-auto text-sm sm:text-base gap-2 shadow-glow hover:shadow-elevated transition-all duration-300">
                          <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                          لوحة التحكم
                        </Button>
                      </Link>
                      <Link to="/services" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base glass-subtle border-primary/20 hover:border-primary/40">
                          تصفح الخدمات
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/services" className="w-full sm:w-auto">
                        <Button variant="hero" size="lg" className="w-full sm:w-auto text-sm sm:text-base shadow-glow hover:shadow-elevated transition-all duration-300">
                          تصفح الخدمات
                          <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </Link>
                      <Link to="/customer/dashboard" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base gap-2 glass-subtle border-primary/20 hover:border-primary/40">
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                          حجوزاتي
                        </Button>
                      </Link>
                    </>
                  )
                ) : (
                  <>
                    <Link to="/services" className="w-full sm:w-auto">
                      <Button variant="hero" size="lg" className="w-full sm:w-auto text-sm sm:text-base shadow-glow hover:shadow-elevated transition-all duration-300">
                        تصفح الخدمات
                        <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup&role=provider" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base glass-subtle border-primary/20 hover:border-primary/40">
                        انضم كمقدم خدمة مجاناً
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 px-4" aria-label="إحصائيات المنصة">
          <div className="container">
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-border/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 stagger-children">
                {[
                  { icon: Users, value: "+500", label: "مقدم خدمة موثوق", color: "text-primary" },
                  { icon: Star, value: "4.9", label: "تقييم المستخدمين", color: "text-amber-500" },
                  { icon: Clock, value: "24/7", label: "دعم متواصل", color: "text-emerald-500" },
                  { icon: Shield, value: "100%", label: "حجوزات آمنة", color: "text-blue-500" },
                ].map((stat, index) => (
                  <article key={index} className="text-center group">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl glass-subtle flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                      <stat.icon className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 sm:py-20 px-4" aria-labelledby="categories-heading">
          <div className="container">
            <div className="text-center mb-10 sm:mb-14">
              <h2 id="categories-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                فئات الخدمات المتاحة
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                اختر نوع الخدمة التي تحتاجها واعثر على أفضل المتخصصين في منطقتك
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 stagger-children" role="list">
              {serviceCategories.map((category) => (
                <Link 
                  key={category.id} 
                  to={`/services?category=${category.id}`} 
                  className="group" 
                  role="listitem"
                >
                  <article className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 card-interactive hover:border-primary/30 min-h-[180px] sm:min-h-[200px]">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl gradient-hero flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300" aria-hidden="true">
                      <category.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">{category.name}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 leading-relaxed">{category.description}</p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-12 sm:py-20 px-4 relative" aria-labelledby="how-it-works-heading">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-secondary/50 to-secondary/30 -z-10" />
          <div className="container">
            <div className="text-center mb-10 sm:mb-14">
              <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                كيف تحجز خدمة على خدمتي؟
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                ثلاث خطوات بسيطة للحصول على الخدمة التي تحتاجها
              </p>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 max-w-4xl mx-auto list-none stagger-children">
              {[
                { step: "١", title: "اختر الخدمة المطلوبة", desc: "تصفح فئات الخدمات المتنوعة واختر نوع الخدمة التي تحتاجها" },
                { step: "٢", title: "اختر مقدم الخدمة المناسب", desc: "قارن بين المتخصصين المتاحين واختر الأنسب لك حسب التقييمات والأسعار" },
                { step: "٣", title: "احجز موعدك بسهولة", desc: "حدد الوقت المناسب وأكد حجزك بضغطة زر واحدة" },
              ].map((item, index) => (
                <li key={index} className="text-center relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4 sm:mb-5 text-2xl sm:text-3xl font-bold text-accent-foreground shadow-elevated group-hover:scale-105 transition-transform" aria-hidden="true">
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA Section - Only show for non-providers */}
        {(!user || userRole !== "provider") && (
          <section className="py-12 sm:py-20 px-4" aria-labelledby="cta-heading">
            <div className="container">
              <aside className="glass rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-14 text-center max-w-3xl mx-auto border border-primary/20 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h2 id="cta-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4">
                    هل أنت مقدم خدمة؟ انضم إلى خدمتي!
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                    انضم إلى منصة خدمتي واحصل على عملاء جدد. سجل خدماتك مجاناً وابدأ في استقبال الحجوزات اليوم.
                  </p>
                  <Link to="/auth?mode=signup&role=provider">
                    <Button variant="accent" size="lg" className="w-full sm:w-auto shadow-elevated hover:shadow-glow transition-all duration-300">
                      سجل كمقدم خدمة مجاناً
                    </Button>
                  </Link>
                </div>
              </aside>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 sm:py-14 border-t border-border/50 glass-subtle px-4" role="contentinfo">
        <div className="container">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="text-xl sm:text-2xl font-bold text-gradient flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              خدمتي - Khadmaty
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              منصة خدمتي لحجز الخدمات المنزلية والمهنية. سباكة، كهرباء، تنظيف، نجارة، حلاقة، ودروس خصوصية.
            </p>
            <nav className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground" aria-label="روابط التذييل">
              <Link to="/services" className="hover:text-primary transition-colors">جميع الخدمات</Link>
              <Link to="/auth" className="hover:text-primary transition-colors">تسجيل الدخول</Link>
              <Link to="/auth?mode=signup&role=provider" className="hover:text-primary transition-colors">انضم كمقدم خدمة</Link>
            </nav>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 خدمتي - Khadmaty. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;