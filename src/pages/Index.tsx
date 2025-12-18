import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/SignOutButton";
import { serviceCategories } from "@/data/categories";
import { ArrowLeft, Star, Users, Clock, Shield, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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
              .select("role")
              .eq("user_id", session.user.id)
              .single()
              .then(({ data }) => {
                setUserRole(data?.role ?? null);
              });
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            setUserRole(data?.role ?? null);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const dashboardLink = userRole === "provider" ? "/provider/dashboard" : "/customer/dashboard";


  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-gradient">
            خدماتك
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/services" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                الخدمات
              </Button>
            </Link>
            {!loading && (
              user ? (
                <>
                  <Link to={dashboardLink}>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                      لوحة التحكم
                    </Button>
                  </Link>
                  <SignOutButton>
                    <Button variant="ghost" size="icon">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </SignOutButton>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                      الدخول
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button variant="hero" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                      انضم
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 gradient-soft">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6 animate-fade-up">
              احجز خدماتك
              <span className="block text-gradient mt-2">بكل سهولة</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 animate-fade-up px-2" style={{
            animationDelay: "0.1s"
          }}>
              منصة واحدة تجمع أفضل مقدمي الخدمات في منطقتك. كهربائي، سباك، حلاق، ومعلمين خصوصيين.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-up px-4" style={{
            animationDelay: "0.2s"
          }}>
              <Link to="/services" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  تصفح الخدمات
                  <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup&role=provider" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  انضم كمقدم خدمة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 border-b border-border px-4">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[{
            icon: Users,
            value: "+500",
            label: "مقدم خدمة"
          }, {
            icon: Star,
            value: "4.9",
            label: "تقييم المستخدمين"
          }, {
            icon: Clock,
            value: "24/7",
            label: "دعم متواصل"
          }, {
            icon: Shield,
            value: "100%",
            label: "حجوزات آمنة"
          }].map((stat, index) => <div key={index} className="text-center animate-fade-up" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-primary" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              تصفح حسب الفئة
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              اختر نوع الخدمة التي تبحث عنها واعثر على أفضل المتخصصين
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {serviceCategories.map((category, index) => <Link key={category.id} to={`/services?category=${category.id}`} className="group animate-fade-up" style={{
            animationDelay: `${index * 0.05}s`
          }}>
                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 border border-border/50">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl gradient-hero flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <category.icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 sm:py-20 bg-secondary/30 px-4">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              كيف يعمل؟
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              ثلاث خطوات بسيطة للحصول على الخدمة
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[{
            step: "١",
            title: "اختر الخدمة",
            desc: "تصفح الفئات واختر نوع الخدمة التي تحتاجها"
          }, {
            step: "٢",
            title: "اختر مقدم الخدمة",
            desc: "قارن بين المتخصصين واختر الأنسب لك"
          }, {
            step: "٣",
            title: "احجز موعدك",
            desc: "حدد الوقت المناسب وأكد حجزك بسهولة"
          }].map((item, index) => <div key={index} className="text-center animate-fade-up" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full gradient-warm flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl font-bold text-accent-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{item.desc}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container">
          <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-elevated text-center max-w-3xl mx-auto border border-border/50">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              هل أنت مقدم خدمة؟
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto">
              انضم إلى منصتنا واحصل على عملاء جدد. سجل خدماتك وابدأ في استقبال الحجوزات.
            </p>
            <Link to="/auth?mode=signup&role=provider">
              <Button variant="accent" size="lg" className="w-full sm:w-auto">
                سجل كمقدم خدمة مجاناً
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border bg-secondary/20 px-4">
        <div className="container">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-gradient">خدماتك</div>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link to="/services" className="hover:text-foreground transition-colors">الخدمات</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">تسجيل الدخول</Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 خدماتك. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;