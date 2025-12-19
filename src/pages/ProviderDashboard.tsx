import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Calendar, Plus, Briefcase, LogOut, Settings, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AddServiceDialog } from "@/components/AddServiceDialog";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import { SignOutButton } from "@/components/SignOutButton";
import { Tables } from "@/integrations/supabase/types";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "services">("bookings");
  const [showAddService, setShowAddService] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [editingService, setEditingService] = useState<Tables<"services"> | null>(null);
  const [services, setServices] = useState<Tables<"services">[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingService, setDeletingService] = useState<Tables<"services"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = async () => {
    if (!user) return;
    
    setServicesLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("provider_id", profile.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setServices(data);
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", deletingService.id);

      if (error) throw error;

      toast.success("تم حذف الخدمة بنجاح");
      setServices(services.filter(s => s.id !== deletingService.id));
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("حدث خطأ أثناء حذف الخدمة");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingService(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

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
            خدمتي
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1">
                {userMeta?.full_name || "زائر"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 sm:mb-6">مقدم خدمة</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">حجوزات</div>
                </div>
                <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground">خدمات</div>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors text-sm ${
                    activeTab === "bookings" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  الحجوزات الواردة
                </button>
                <button 
                  onClick={() => setActiveTab("services")}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors text-sm ${
                    activeTab === "services" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                  خدماتي
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
            {activeTab === "bookings" && (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">الحجوزات الواردة</h1>
                </div>

                {/* Empty State */}
                <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                  <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">لا توجد حجوزات</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    لم تتلقَ أي حجوزات بعد. أضف خدماتك لبدء استقبال العملاء.
                  </p>
                </div>
              </>
            )}

            {activeTab === "services" && (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">خدماتي</h1>
                  <Button variant="hero" className="gap-2 text-sm" onClick={() => setShowAddService(true)}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">إضافة خدمة</span>
                    <span className="sm:hidden">إضافة</span>
                  </Button>
                </div>

                {servicesLoading ? (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                    <div className="text-muted-foreground">جاري التحميل...</div>
                  </div>
                ) : services.length === 0 ? (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-soft border border-border/50 text-center">
                    <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">لا توجد خدمات</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                      لم تضف أي خدمات بعد. أضف خدماتك لتظهر للعملاء.
                    </p>
                    <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto" onClick={() => setShowAddService(true)}>
                      <Plus className="h-5 w-5" />
                      إضافة خدمة جديدة
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50">
                        <div className="flex items-start gap-4">
                          {service.image_url && (
                            <img 
                              src={service.image_url} 
                              alt={service.title}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {service.price_fixed && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                      {service.price_fixed} ر.س
                                    </span>
                                  )}
                                  {service.price_per_hour && (
                                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                                      {service.price_per_hour} ر.س/ساعة
                                    </span>
                                  )}
                                  {service.location && (
                                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full">
                                      {service.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingService(service);
                                    setShowEditService(true);
                                  }}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setDeletingService(service);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <span className={`text-xs px-2 py-1 rounded-full ${service.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                  {service.is_active ? 'نشط' : 'غير نشط'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AddServiceDialog 
        open={showAddService} 
        onOpenChange={setShowAddService} 
        onServiceAdded={fetchServices}
      />

      <EditServiceDialog
        open={showEditService}
        onOpenChange={setShowEditService}
        onServiceUpdated={fetchServices}
        service={editingService}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الخدمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف خدمة "{deletingService?.title}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "جاري الحذف..." : "حذف الخدمة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProviderDashboard;
