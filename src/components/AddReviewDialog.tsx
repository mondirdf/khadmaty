import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  serviceId: string;
  providerId: string;
  customerId: string;
  serviceName: string;
  onReviewAdded: () => void;
}

export const AddReviewDialog = ({
  open,
  onOpenChange,
  bookingId,
  serviceId,
  providerId,
  customerId,
  serviceName,
  onReviewAdded,
}: AddReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("يرجى اختيار تقييم");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        service_id: serviceId,
        provider_id: providerId,
        customer_id: customerId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success("تم إضافة التقييم بنجاح!");
      onReviewAdded();
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("حدث خطأ أثناء إضافة التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تقييم الخدمة</DialogTitle>
          <DialogDescription>
            شاركنا رأيك في خدمة "{serviceName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>التقييم</Label>
            <div className="flex justify-center py-2">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">تعليقك (اختياري)</Label>
            <Textarea
              id="comment"
              placeholder="اكتب تجربتك مع هذه الخدمة..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-left">
              {comment.length}/500
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1"
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
