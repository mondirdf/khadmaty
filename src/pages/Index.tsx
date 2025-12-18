import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@/data/categories";
import { ArrowLeft, Star, Users, Clock, Shield } from "lucide-react";
const Index = () => {
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-gradient">
            خدماتك
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/services">
              <Button variant="ghost" size="sm">
                الخدمات
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="sm">
                انضم الآن
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 gradient-soft">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up">احجز خدماتك
بكل سهولة<span className="block text-gradient mt-2">بكل سهولة</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-up" style={{
            animationDelay: "0.1s"
          }}>
              منصة واحدة تجمع أفضل مقدمي الخدمات في منطقتك. كهربائي، سباك، حلاق، ومعلمين خصوصيين - كل ما تحتاجه في مكان واحد.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{
            animationDelay: "0.2s"
          }}>
              <Link to="/services">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  تصفح الخدمات
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup&role=provider">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  انضم كمقدم خدمة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              تصفح حسب الفئة
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اختر نوع الخدمة التي تبحث عنها واعثر على أفضل المتخصصين في منطقتك
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {serviceCategories.map((category, index) => <Link key={category.id} to={`/services?category=${category.id}`} className="group animate-fade-up" style={{
            animationDelay: `${index * 0.05}s`
          }}>
                <div className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 border border-border/50">
                  <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <category.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              كيف يعمل؟
            </h2>
            <p className="text-muted-foreground">
              ثلاث خطوات بسيطة للحصول على الخدمة
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
                <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-accent-foreground">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-elevated text-center max-w-3xl mx-auto border border-border/50">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              هل أنت مقدم خدمة؟
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              انضم إلى منصتنا واحصل على عملاء جدد. سجل خدماتك وابدأ في استقبال الحجوزات اليوم.
            </p>
            <Link to="/auth?mode=signup&role=provider">
              <Button variant="accent" size="xl">
                سجل كمقدم خدمة مجاناً
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-secondary/20">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold text-gradient">خدماتك</div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/services" className="hover:text-foreground transition-colors">الخدمات</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">تسجيل الدخول</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 خدماتك. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;