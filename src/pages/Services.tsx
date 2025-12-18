import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serviceCategories } from "@/data/categories";
import { supabase } from "@/integrations/supabase/client";
import { Search, Star, MapPin, ArrowRight, Filter, Loader2 } from "lucide-react";

interface ServiceWithProvider {
  id: string;
  title: string;
  category: string;
  description: string | null;
  price_fixed: number | null;
  price_per_hour: number | null;
  location: string | null;
  is_online: boolean | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

const Services = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          id,
          title,
          category,
          description,
          price_fixed,
          price_per_hour,
          location,
          is_online,
          profiles:provider_id (
            full_name,
            avatar_url
          )
        `)
        .eq("is_active", true);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceCategories.find(c => c.id === service.category)?.name.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (service: ServiceWithProvider) => {
    if (service.price_fixed) return `${service.price_fixed} ر.س`;
    if (service.price_per_hour) return `${service.price_per_hour} ر.س/ساعة`;
    return "اتصل للسعر";
  };

  const getServiceImage = (category: string) => {
    const images: Record<string, string> = {
      electrician: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
      plumber: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=300&fit=crop",
      barber: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
      tutor: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
      painter: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop",
      mechanic: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop",
      cleaner: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      carpenter: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop",
    };
    return images[category] || "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-gradient">
            خدماتك
          </Link>
          <div className="flex items-center gap-3">
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

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">تصفح الخدمات</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن خدمة أو مقدم خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pr-10"
            />
          </div>
          <Button variant="outline" className="h-12 gap-2">
            <Filter className="h-4 w-4" />
            تصفية
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            الكل
          </button>
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Services Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => {
              const category = serviceCategories.find(c => c.id === service.category);
              return (
                <Link
                  key={service.id}
                  to={`/booking/${service.id}`}
                  className="group animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 border border-border/50">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={service.profiles?.avatar_url || getServiceImage(service.category)}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground">
                          {category?.name || service.category}
                        </span>
                      </div>
                      {service.is_online && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/90 backdrop-blur-sm text-primary-foreground">
                            أونلاين
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{service.title}</h3>
                          <p className="text-sm text-muted-foreground">{service.profiles?.full_name}</p>
                        </div>
                      </div>
                      {service.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          {service.location}
                        </div>
                      )}
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold">{formatPrice(service)}</span>
                        <Button variant="hero" size="sm">
                          احجز الآن
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">لا توجد خدمات متاحة حالياً</p>
            <p className="text-sm text-muted-foreground">
              {services.length === 0 
                ? "كن أول من يقدم خدمة على المنصة!" 
                : "جرب تغيير معايير البحث"}
            </p>
            {services.length === 0 && (
              <Link to="/auth?mode=signup">
                <Button variant="hero" className="mt-4">
                  سجل كمقدم خدمة
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
