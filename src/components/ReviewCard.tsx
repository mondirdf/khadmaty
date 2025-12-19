import { StarRating } from "./StarRating";
import { User } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    customer?: {
      full_name: string;
      avatar_url: string | null;
    };
  };
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const formattedDate = format(new Date(review.created_at), "d MMMM yyyy", { locale: ar });

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {review.customer?.avatar_url ? (
            <img
              src={review.customer.avatar_url}
              alt={review.customer.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm">
            {review.customer?.full_name || "عميل"}
          </h4>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
};
