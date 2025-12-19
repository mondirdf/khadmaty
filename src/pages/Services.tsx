import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { serviceCategories } from "@/data/categories";
import { supabase } from "@/integrations/supabase/client";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Star, MapPin, ArrowRight, Filter, Loader2, LogOut, User, Briefcase, Pencil, Eye, MessageSquare } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { wilayas, getWilayaName } from "@/data/wilayas";
import { StarRating } from "@/components/StarRating";
import { ServiceReviewsDialog } from "@/components/ServiceReviewsDialog";

interface ServiceWithProvider {
  id: string;
  title: string;
  category: string;
  description: string | null;
  price_fixed: number | null;
  price_per_hour: number | null;
  location: string | null;
  wilaya: string | null;
  is_online: boolean | null;
  image_url: string | null;
  provider_id: string;
  average_rating: number | null;
  total_reviews: number | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    wilaya: string | null;
  } | null;
}

const Services = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const [userWilaya, setUserWilaya] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedServiceForReviews, setSelectedServiceForReviews] = useState<ServiceWithProvider | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            supabase
              .from("profiles")
              .select("id, role, wilaya")
              .eq("user_id", session.user.id)
              .single()
              .then(({ data }) => {
                setUserRole(data?.role ?? null);
                setUserProfileId(data?.id ?? null);
                setUserWilaya(data?.wilaya ?? null);
                // Auto-select user's wilaya for filtering
                if (data?.wilaya) {
                  setSelectedWilaya(data.wilaya);
                }
              });
          }, 0);
        } else {
          setUserRole(null);
          setUserProfileId(null);
          setUserWilaya(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      
      if (session?.user) {
        supabase
          .from("profiles")
          .select("id, role, wilaya")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            setUserRole(data?.role ?? null);
            setUserProfileId(data?.id ?? null);
            setUserWilaya(data?.wilaya ?? null);
            if (data?.wilaya) {
              setSelectedWilaya(data.wilaya);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
          wilaya,
          is_online,
          image_url,
          provider_id,
          average_rating,
          total_reviews,
          profiles:provider_id (
            full_name,
            avatar_url,
            wilaya
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

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    const matchesWilaya = !selectedWilaya || selectedWilaya === "all" ||
      service.wilaya === selectedWilaya || 
      service.profiles?.wilaya === selectedWilaya;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      service.title.toLowerCase().includes(searchLower) ||
      service.profiles?.full_name.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower) ||
      service.location?.toLowerCase().includes(searchLower) ||
      serviceCategories.find(c => c.id === service.category)?.name.includes(searchQuery);
    return matchesCategory && matchesSearch && matchesWilaya;
  });

  // Sort services: same wilaya first, then others
  const sortedServices = [...filteredServices].sort((a, b) => {
    const aWilaya = a.wilaya || a.profiles?.wilaya;
    const bWilaya = b.wilaya || b.profiles?.wilaya;
    
    // If user has selected a wilaya, prioritize matching services
    if (selectedWilaya) {
      const aMatch = aWilaya === selectedWilaya;
      const bMatch = bWilaya === selectedWilaya;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }
    
    return 0;
  });

  const formatPrice = (service: ServiceWithProvider) => {
    if (service.price_fixed) return `${service.price_fixed} د.ج`;
    if (service.price_per_hour) return `${service.price_per_hour} د.ج/ساعة`;
    return "اتصل للسعر";
  };

  const getServiceImage = (category: string, imageUrl: string | null) => {
    if (imageUrl) return imageUrl;
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

  const isOwnService = (service: ServiceWithProvider) => {
    return userProfileId && service.provider_id === userProfileId;
  };

  const dashboardLink = userRole === "provider" ? "/provider/dashboard" : "/customer/dashboard";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-gradient">
            خدمتي
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {!authLoading && (
              user ? (
                <>
                  <Link to={dashboardLink}>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4 gap-1.5">
                      {userRole === "provider" ? (
                        <Briefcase className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">لوحة التحكم</span>
                    </Button>
                  </Link>
                  <SignOutButton onSignedOut={() => navigate("/")}>
                    <Button variant="ghost" size="icon" aria-label="تسجيل الخروج">
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

      <div className="container py-4 sm:py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">تصفح الخدمات</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="ابحث باسم الخدمة، مقدم الخدمة، الموقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 sm:h-12 pr-10 text-sm sm:text-base"
            />
          </div>
          <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
            <SelectTrigger className="h-11 sm:h-12 w-full sm:w-[200px]">
              <MapPin className="h-4 w-4 ml-2" />
              <SelectValue placeholder="كل الولايات" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">كل الولايات</SelectItem>
              {wilayas.map((w) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.code} - {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-4 mb-6 sm:mb-8 scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 sm:px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
              !selectedCategory
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            الكل
          </button>
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 sm:px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 text-sm font-medium ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <category.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تحميل الخدمات...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedWilaya ? (
                <>عثرنا على <span className="font-semibold text-foreground">{sortedServices.length}</span> نتيجة
                  {searchQuery && <> للبحث عن "<span className="text-primary">{searchQuery}</span>"</>}
                  {selectedWilaya && selectedWilaya !== "all" && <> في <span className="text-primary">{getWilayaName(selectedWilaya)}</span></>}
                </>
              ) : (
                <>يوجد <span className="font-semibold text-foreground">{sortedServices.length}</span> خدمة متاحة</>
              )}
            </p>
            {(searchQuery || (selectedWilaya && selectedWilaya !== "all")) && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setSelectedWilaya(""); }} className="text-xs">
                مسح الفلاتر
              </Button>
            )}
          </div>
        )}

        {/* Services Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedServices.map((service, index) => {
              const category = serviceCategories.find(c => c.id === service.category);
              const isOwn = isOwnService(service);
              const serviceWilaya = service.wilaya || service.profiles?.wilaya;
              
              return (
                <div
                  key={service.id}
                  className={`group animate-fade-up relative ${isOwn ? 'ring-2 ring-primary/50' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Own service badge */}
                  {isOwn && (
                    <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-md">
                      خدمتك
                    </div>
                  )}
                  
                  <div className="bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 border border-border/50 h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={getServiceImage(service.category, service.image_url)}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground">
                          {category?.name || service.category}
                        </span>
                      </div>
                      {service.is_online && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-primary/90 backdrop-blur-sm text-primary-foreground">
                            أونلاين
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">{service.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{service.profiles?.full_name}</p>
                        </div>
                      </div>
                      {/* Rating Section */}
                      <button
                        onClick={() => setSelectedServiceForReviews(service)}
                        className="flex items-center gap-2 mb-2 hover:bg-secondary/50 rounded-lg p-1.5 -m-1.5 transition-colors"
                      >
                        <StarRating rating={service.average_rating || 0} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          ({service.total_reviews || 0} تقييم)
                        </span>
                      </button>
                      {service.location && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">
                            {service.location}
                            {serviceWilaya && ` - ${getWilayaName(serviceWilaya)}`}
                          </span>
                        </div>
                      )}
                      {!service.location && serviceWilaya && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{getWilayaName(serviceWilaya)}</span>
                        </div>
                      )}
                      {service.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 flex-1">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                        <span className="text-primary font-bold text-sm sm:text-base">{formatPrice(service)}</span>
                        
                        {isOwn ? (
                          <Link to="/provider/dashboard">
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm gap-1.5">
                              <Pencil className="h-3.5 w-3.5" />
                              تعديل
                            </Button>
                          </Link>
                        ) : (
                          <Link to={`/booking/${service.id}`}>
                            <Button variant="hero" size="sm" className="text-xs sm:text-sm gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              احجز الآن
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد خدمات متاحة</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {services.length === 0 
                ? "كن أول من يقدم خدمة على منصة خدمتي!" 
                : "جرب تغيير معايير البحث أو اختيار فئة أخرى"}
            </p>
            {services.length === 0 && !user && (
              <Link to="/auth?mode=signup&role=provider">
                <Button variant="hero" size="lg" className="gap-2">
                  <Briefcase className="h-5 w-5" />
                  سجل كمقدم خدمة
                </Button>
              </Link>
            )}
            {services.length === 0 && user && userRole === "provider" && (
              <Link to="/provider/dashboard">
                <Button variant="hero" size="lg" className="gap-2">
                  <Briefcase className="h-5 w-5" />
                  أضف خدمتك الأولى
                </Button>
              </Link>
            )}
            {selectedCategory && (
              <Button variant="outline" onClick={() => setSelectedCategory(null)} className="mt-4">
                عرض كل الخدمات
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Reviews Dialog */}
      {selectedServiceForReviews && (
        <ServiceReviewsDialog
          open={!!selectedServiceForReviews}
          onOpenChange={(open) => !open && setSelectedServiceForReviews(null)}
          serviceId={selectedServiceForReviews.id}
          serviceName={selectedServiceForReviews.title}
          averageRating={selectedServiceForReviews.average_rating || 0}
          totalReviews={selectedServiceForReviews.total_reviews || 0}
        />
      )}
    </div>
  );
};

export default Services;