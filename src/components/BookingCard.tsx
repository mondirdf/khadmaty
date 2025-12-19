import { Calendar, Clock, MapPin, Phone, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BookingCardProps {
  booking: {
    id: string;
    booking_date: string;
    start_time: string;
    end_time: string | null;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    customer_name: string;
    customer_phone: string;
    customer_location: string;
    notes: string | null;
    service?: {
      title: string;
      category: string;
      price_fixed: number | null;
      price_per_hour: number | null;
    };
    provider?: {
      full_name: string;
      phone: string | null;
    };
  };
  userType: "provider" | "customer";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onReview?: (id: string) => void;
  isLoading?: boolean;
}

export const BookingCard = ({
  booking,
  userType,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  onReview,
  isLoading,
}: BookingCardProps) => {
  const formattedDate = format(new Date(booking.booking_date), "EEEE، d MMMM yyyy", { locale: ar });
  
  const formatPrice = () => {
    if (booking.service?.price_fixed) return `${booking.service.price_fixed} د.ج`;
    if (booking.service?.price_per_hour) return `${booking.service.price_per_hour} د.ج/ساعة`;
    return "اتصل للسعر";
  };

  return (
    <div className="bg-card rounded-xl p-4 sm:p-5 shadow-soft border border-border/50 transition-all hover:shadow-card">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-base sm:text-lg">
            {booking.service?.title || "خدمة"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {userType === "provider" ? booking.customer_name : booking.provider?.full_name}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{booking.start_time.slice(0, 5)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{booking.customer_location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span dir="ltr">{booking.customer_phone}</span>
        </div>
      </div>

      {booking.notes && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4 p-3 bg-secondary/50 rounded-lg">
          <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{booking.notes}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="font-bold text-primary">{formatPrice()}</span>
        
        <div className="flex gap-2">
          {userType === "provider" && booking.status === "pending" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject?.(booking.id)}
                disabled={isLoading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                رفض
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => onAccept?.(booking.id)}
                disabled={isLoading}
              >
                قبول
              </Button>
            </>
          )}
          
          {userType === "provider" && booking.status === "confirmed" && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => onComplete?.(booking.id)}
              disabled={isLoading}
            >
              تم الإنجاز
            </Button>
          )}
          
          {userType === "customer" && booking.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel?.(booking.id)}
              disabled={isLoading}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              إلغاء
            </Button>
          )}
          
          {userType === "customer" && booking.status === "completed" && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => onReview?.(booking.id)}
              disabled={isLoading}
            >
              تقييم الخدمة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
