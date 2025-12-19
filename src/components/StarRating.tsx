import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export const StarRating = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= rating;
          const isHalf = starValue > rating && starValue - 0.5 <= rating;
          
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(starValue)}
              className={cn(
                "transition-transform",
                interactive && "cursor-pointer hover:scale-110 focus:outline-none focus:scale-110"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled || isHalf
                    ? "fill-accent text-accent"
                    : "fill-transparent text-muted-foreground/30"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground mr-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
