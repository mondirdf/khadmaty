import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, Star, MapPin, Clock, Phone, CheckCircle } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
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
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-gradient">
            خدماتك
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة للخدمات
        </Link>

        {step < 4 && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Provider Info */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border/50 sticky top-24">
                <img
                  src={demoProvider.image}
                  alt={demoProvider.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-5">
                  <h2 className="text-xl font-bold text-foreground mb-1">{demoProvider.name}</h2>
                  <p className="text-primary font-medium mb-3">{demoProvider.category}</p>
                  <div className="flex items-center gap-1 text-sm mb-2">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{demoProvider.rating}</span>
                    <span className="text-muted-foreground">({demoProvider.reviews} تقييم)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    {demoProvider.location}
                  </div>
                  <div className="pt-4 border-t border-border">
                    <span className="text-2xl font-bold text-primary">{demoProvider.price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Steps */}
            <div className="md:col-span-2">
              {/* Progress */}
              <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        s <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    <span className={`text-sm ${s <= step ? "text-foreground" : "text-muted-foreground"}`}>
                      {s === 1 ? "الموعد" : s === 2 ? "البيانات" : "التأكيد"}
                    </span>
                    {s < 3 && <div className="w-8 h-0.5 bg-border" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Date & Time */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-foreground mb-6">اختر الموعد المناسب</h3>
                  
                  {/* Date Selection */}
                  <div className="mb-8">
                    <Label className="mb-3 block">اليوم</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {dates.map((date) => (
                        <button
                          key={date.value}
                          onClick={() => setSelectedDate(date.value)}
                          className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
                            selectedDate === date.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          }`}
                        >
                          <div className="text-xs opacity-80">{date.day}</div>
                          <div className="text-lg font-bold">{date.date}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="mb-8">
                    <Label className="mb-3 block">الوقت</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {demoProvider.availability.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
                            selectedTime === time
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
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
                  <h3 className="text-xl font-bold text-foreground mb-6">معلومات الحجز</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <Input
                        id="name"
                        placeholder="أدخل اسمك"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">العنوان / الموقع</Label>
                      <Input
                        id="location"
                        placeholder="الحي، الشارع، رقم المبنى"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                      <Textarea
                        id="notes"
                        placeholder="اكتب أي تفاصيل إضافية عن الخدمة المطلوبة..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                      السابق
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1"
                      disabled={!formData.name || !formData.phone || !formData.location}
                      onClick={() => setStep(3)}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-foreground mb-6">تأكيد الحجز</h3>
                  
                  <div className="bg-secondary/50 rounded-2xl p-6 mb-6">
                    <h4 className="font-semibold text-foreground mb-4">تفاصيل الحجز</h4>
                    <div className="space-y-3 text-sm">
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
                        <span className="font-medium">{new Date(selectedDate).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الوقت:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">السعر المتوقع:</span>
                          <span className="font-bold text-primary">{demoProvider.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded-2xl p-6 mb-6">
                    <h4 className="font-semibold text-foreground mb-4">معلوماتك</h4>
                    <div className="space-y-3 text-sm">
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

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                      السابق
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1"
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
          <div className="text-center py-12 animate-scale-in">
            <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">تم إرسال طلب الحجز!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              سيتواصل معك {demoProvider.name} قريباً لتأكيد الموعد. يمكنك متابعة حالة الحجز من لوحة التحكم.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/services">
                <Button variant="outline" size="lg">
                  تصفح المزيد
                </Button>
              </Link>
              <Link to="/">
                <Button variant="hero" size="lg">
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
