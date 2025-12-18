import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serviceCategories } from "@/data/categories";
import { Search, Star, MapPin, ArrowRight, Filter } from "lucide-react";

// Demo services data
const demoServices = [
  { id: "1", name: "أحمد محمد", category: "electrician", rating: 4.9, reviews: 127, location: "الرياض - حي النزهة", price: "150 ر.س/ساعة", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop" },
  { id: "2", name: "خالد العمري", category: "plumber", rating: 4.8, reviews: 89, location: "الرياض - حي الورود", price: "120 ر.س/ساعة", image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&h=200&fit=crop" },
  { id: "3", name: "صالون الأناقة", category: "barber", rating: 4.9, reviews: 234, location: "الرياض - حي الصحافة", price: "50 ر.س", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop" },
  { id: "4", name: "أ. سارة أحمد", category: "tutor", rating: 5.0, reviews: 67, location: "أونلاين", price: "100 ر.س/ساعة", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop" },
  { id: "5", name: "محمد الفهد", category: "painter", rating: 4.7, reviews: 45, location: "الرياض - حي الملقا", price: "200 ر.س/غرفة", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=200&h=200&fit=crop" },
  { id: "6", name: "ورشة السيارات المتقدمة", category: "mechanic", rating: 4.8, reviews: 156, location: "الرياض - حي السليمانية", price: "فحص مجاني", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&h=200&fit=crop" },
];

const Services = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = demoServices.filter((service) => {
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceCategories.find(c => c.id === service.category)?.name.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

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

        {/* Services Grid */}
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
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground">
                        {category?.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-medium">{service.rating}</span>
                        <span className="text-muted-foreground">({service.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      {service.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold">{service.price}</span>
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

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">لا توجد نتائج مطابقة لبحثك</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
