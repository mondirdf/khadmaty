import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { serviceCategories } from "@/data/categories";
import { Loader2, Upload, X } from "lucide-react";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded: () => void;
}

export const AddServiceDialog = ({ open, onOpenChange, onServiceAdded }: AddServiceDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price_fixed: "",
    price_per_hour: "",
    location: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    setLoading(true);

    try {
      // Get current user's profile ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يرجى تسجيل الدخول أولاً");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        toast.error("لم يتم العثور على الملف الشخصي");
        console.error("Profile error:", profileError);
        return;
      }

      let imageUrl: string | null = null;

      // Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("service-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("حدث خطأ أثناء رفع الصورة");
          return;
        }

        const { data: publicUrl } = supabase.storage
          .from("service-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase.from("services").insert({
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim() || null,
        price_fixed: formData.price_fixed ? parseFloat(formData.price_fixed) : null,
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : null,
        location: formData.location.trim() || null,
        provider_id: profile.id,
        is_active: true,
        image_url: imageUrl,
      });

      if (error) {
        console.error("Insert error:", error);
        toast.error("حدث خطأ أثناء إضافة الخدمة");
        return;
      }

      toast.success("تمت إضافة الخدمة بنجاح");
      setFormData({
        title: "",
        category: "",
        description: "",
        price_fixed: "",
        price_per_hour: "",
        location: "",
      });
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
      onServiceAdded();
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة خدمة جديدة</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>صورة الخدمة</Label>
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">اضغط لرفع صورة</span>
                <span className="text-xs text-muted-foreground mt-1">PNG, JPG (أقصى 5 ميجابايت)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">اسم الخدمة *</Label>
            <Input
              id="title"
              placeholder="مثال: تمديدات كهربائية منزلية"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">الفئة *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف الخدمة</Label>
            <Textarea
              id="description"
              placeholder="اكتب وصفاً مختصراً لخدمتك..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price_fixed">السعر الثابت (ر.س)</Label>
              <Input
                id="price_fixed"
                type="number"
                min="0"
                step="0.01"
                placeholder="100"
                value={formData.price_fixed}
                onChange={(e) => setFormData({ ...formData, price_fixed: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_hour">سعر الساعة (ر.س)</Label>
              <Input
                id="price_per_hour"
                type="number"
                min="0"
                step="0.01"
                placeholder="50"
                value={formData.price_per_hour}
                onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">الموقع</Label>
            <Input
              id="location"
              placeholder="مثال: الرياض - حي النسيم"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                "إضافة الخدمة"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
