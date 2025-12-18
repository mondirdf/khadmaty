import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, Star, MapPin, Clock, Phone, CheckCircle } from "lucide-react";
import { z } from "zod";

// Validation schema for booking form
const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" })
    .max(100, { message: "الاسم يجب ألا يتجاوز 100 حرف" })
    .regex(/^[\u0600-\u06FF\s\w]+$/, { message: "الاسم يحتوي على أحرف غير صالحة" }),
  phone: z
    .string()
    .trim()
    .regex(/^05\d{8}$/, { message: "رقم الهاتف يجب أن يكون بصيغة 05xxxxxxxx" }),
  location: z
    .string()
    .trim()
    .min(5, { message: "العنوان يجب أن يكون 5 أحرف على الأقل" })
    .max(200, { message: "العنوان يجب ألا يتجاوز 200 حرف" }),
  notes: z
    .string()
    .trim()
    .max(500, { message: "الملاحظات يجب ألا تتجاوز 500 حرف" })
    .optional()
    .transform(val => val || ""),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Demo provider data
const demoProvider = {
  id: "1",
  name: "أحمد محمد",
  category: "كهربائي",
  rating: 4.9,
  reviews: 127,
  location: "الرياض - حي النزهة",
  price: "150 ر.س/ساعة",
  image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop",
  bio: "خبرة أكثر من 10 سنوات في أعمال الكهرباء المنزلية والتجارية. متخصص في التمديدات والصيانة وحل المشاكل الكهربائية.",
  services: ["تمديدات كهربائية", "صيانة دورية", "إصلاح أعطال", "تركيب إضاءة"],
  availability: ["09:00 - 12:00", "14:00 - 18:00", "19:00 - 21:00"],
};

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof BookingFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof BookingFormData;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call - in production this would insert to database with server-side validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("تم إرسال طلب الحجز بنجاح!");
    setStep(4);
    setIsSubmitting(false);
  };

  // Generate dates for next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("ar-SA", { weekday: "short" }),
      date: date.getDate(),
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-gradient">
            خدماتك
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container py-4 sm:py-8 px-4 max-w-4xl">
        {/* Back Button */}
        <Link to="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base">
          <ArrowRight className="h-4 w-4" />
          العودة للخدمات
        </Link>

        {step < 4 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Provider Info - Hidden on mobile during booking steps, shown at top */}
            <div className="md:col-span-1 order-first md:order-none">
              <div className="bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-soft border border-border/50 md:sticky md:top-24">
                <img
                  src={demoProvider.image}
                  alt={demoProvider.name}
                  className="w-full aspect-video sm:aspect-square object-cover"
                />
                <div className="p-4 sm:p-5">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">{demoProvider.name}</h2>
                  <p className="text-primary font-medium mb-2 sm:mb-3 text-sm sm:text-base">{demoProvider.category}</p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm mb-2">
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-accent text-accent" />
                    <span className="font-medium">{demoProvider.rating}</span>
                    <span className="text-muted-foreground">({demoProvider.reviews} تقييم)</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {demoProvider.location}
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-border">
                    <span className="text-xl sm:text-2xl font-bold text-primary">{demoProvider.price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Steps */}
            <div className="md:col-span-2">
              {/* Progress */}
              <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                        s <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    <span className={`text-xs sm:text-sm whitespace-nowrap ${s <= step ? "text-foreground" : "text-muted-foreground"}`}>
                      {s === 1 ? "الموعد" : s === 2 ? "البيانات" : "التأكيد"}
                    </span>
                    {s < 3 && <div className="w-4 sm:w-8 h-0.5 bg-border" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Date & Time */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">اختر الموعد المناسب</h3>
                  
                  {/* Date Selection */}
                  <div className="mb-6 sm:mb-8">
                    <Label className="mb-2 sm:mb-3 block text-sm sm:text-base">اليوم</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                      {dates.map((date) => (
                        <button
                          key={date.value}
                          onClick={() => setSelectedDate(date.value)}
                          className={`flex-shrink-0 w-14 sm:w-16 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-center transition-all ${
                            selectedDate === date.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          }`}
                        >
                          <div className="text-xs opacity-80">{date.day}</div>
                          <div className="text-base sm:text-lg font-bold">{date.date}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="mb-6 sm:mb-8">
                    <Label className="mb-2 sm:mb-3 block text-sm sm:text-base">الوقت</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {demoProvider.availability.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                            selectedTime === time
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mx-auto mb-1" />
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(2)}
                  >
                    التالي
                  </Button>
                </div>
              )}

              {/* Step 2: Customer Info */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">معلومات الحجز</h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="name" className="text-sm sm:text-base">الاسم الكامل</Label>
                      <Input
                        id="name"
                        placeholder="أدخل اسمك"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                        }}
                        className={`h-11 sm:h-12 ${formErrors.name ? 'border-destructive' : ''}`}
                        maxLength={100}
                      />
                      {formErrors.name && (
                        <p className="text-xs text-destructive">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="phone" className="text-sm sm:text-base">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: value });
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                        }}
                        className={`h-11 sm:h-12 ${formErrors.phone ? 'border-destructive' : ''}`}
                        dir="ltr"
                        maxLength={10}
                      />
                      {formErrors.phone && (
                        <p className="text-xs text-destructive">{formErrors.phone}</p>
                      )}
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="location" className="text-sm sm:text-base">العنوان / الموقع</Label>
                      <Input
                        id="location"
                        placeholder="الحي، الشارع، رقم المبنى"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          if (formErrors.location) setFormErrors({ ...formErrors, location: undefined });
                        }}
                        className={`h-11 sm:h-12 ${formErrors.location ? 'border-destructive' : ''}`}
                        maxLength={200}
                      />
                      {formErrors.location && (
                        <p className="text-xs text-destructive">{formErrors.location}</p>
                      )}
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="notes" className="text-sm sm:text-base">ملاحظات إضافية (اختياري)</Label>
                      <Textarea
                        id="notes"
                        placeholder="اكتب أي تفاصيل إضافية..."
                        value={formData.notes}
                        onChange={(e) => {
                          setFormData({ ...formData, notes: e.target.value });
                          if (formErrors.notes) setFormErrors({ ...formErrors, notes: undefined });
                        }}
                        className={formErrors.notes ? 'border-destructive' : ''}
                        rows={3}
                        maxLength={500}
                      />
                      {formErrors.notes && (
                        <p className="text-xs text-destructive">{formErrors.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)} className="text-sm sm:text-base">
                      السابق
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1 text-sm sm:text-base"
                      disabled={!formData.name || !formData.phone || !formData.location}
                      onClick={handleNextStep}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">تأكيد الحجز</h3>
                  
                  <div className="bg-secondary/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">تفاصيل الحجز</h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مقدم الخدمة:</span>
                        <span className="font-medium">{demoProvider.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الخدمة:</span>
                        <span className="font-medium">{demoProvider.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">التاريخ:</span>
                        <span className="font-medium text-left" dir="rtl">{new Date(selectedDate).toLocaleDateString("ar-SA", { weekday: "long", month: "long", day: "numeric" })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الوقت:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="pt-2 sm:pt-3 border-t border-border">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">السعر المتوقع:</span>
                          <span className="font-bold text-primary">{demoProvider.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">معلوماتك</h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الاسم:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الهاتف:</span>
                        <span className="font-medium" dir="ltr">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الموقع:</span>
                        <span className="font-medium">{formData.location}</span>
                      </div>
                      {formData.notes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ملاحظات:</span>
                          <span className="font-medium">{formData.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)} className="text-sm sm:text-base">
                      السابق
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1 text-sm sm:text-base"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "جاري الإرسال..." : "تأكيد الحجز"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-8 sm:py-12 animate-scale-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">تم إرسال طلب الحجز!</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto px-4">
              سيتواصل معك {demoProvider.name} قريباً لتأكيد الموعد.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
              <Link to="/services" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  تصفح المزيد
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="w-full">
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
