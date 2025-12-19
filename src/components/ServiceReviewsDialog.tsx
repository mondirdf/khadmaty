import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "./StarRating";
import { ReviewCard } from "./ReviewCard";
import { supabase } from "@/integrations/supabase/client";
import { wilayas, getWilayaName } from "@/data/wilayas";
import { Loader2, MapPin, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer?: {
    full_name: string;
    avatar_url: string | null;
    wilaya: string | null;
  };
}

interface ServiceReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceName: string;
  averageRating: number;
  totalReviews: number;
}

export const ServiceReviewsDialog = ({
  open,
  onOpenChange,
  serviceId,
  serviceName,
  averageRating,
  totalReviews,
}: ServiceReviewsDialogProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWilaya, setSelectedWilaya] = useState<string>("all");

  useEffect(() => {
    if (open) {
      fetchReviews();
    }
  }, [open, serviceId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          customer:profiles!reviews_customer_id_fkey (
            full_name,
            avatar_url,
            wilaya
          )
        `)
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (selectedWilaya === "all") return true;
    return review.customer?.wilaya === selectedWilaya;
  });

  // Get unique wilayas from reviews
  const reviewWilayas = [...new Set(reviews.map(r => r.customer?.wilaya).filter(Boolean))];

  // Calculate stats per wilaya
  const wilayaStats = reviewWilayas.reduce((acc, wilaya) => {
    const wilayaReviews = reviews.filter(r => r.customer?.wilaya === wilaya);
    acc[wilaya!] = {
      count: wilayaReviews.length,
      avgRating: wilayaReviews.reduce((sum, r) => sum + r.rating, 0) / wilayaReviews.length,
    };
    return acc;
  }, {} as Record<string, { count: number; avgRating: number }>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">تقييمات "{serviceName}"</DialogTitle>
        </DialogHeader>

        {/* Overall Rating */}
        <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} size="sm" />
          </div>
          <div className="flex-1 border-r border-border pr-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{totalReviews} تقييم</span>
            </div>
          </div>
        </div>

        {/* Wilaya Filter */}
        {reviewWilayas.length > 0 && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="كل الولايات" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <SelectItem value="all">كل الولايات ({reviews.length})</SelectItem>
                {reviewWilayas.map((wilaya) => (
                  <SelectItem key={wilaya} value={wilaya!}>
                    {getWilayaName(wilaya!)} ({wilayaStats[wilaya!]?.count} - ⭐ {wilayaStats[wilaya!]?.avgRating.toFixed(1)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reviews List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {selectedWilaya !== "all" 
                  ? `لا توجد تقييمات من ${getWilayaName(selectedWilaya)}`
                  : "لا توجد تقييمات بعد"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
