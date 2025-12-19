import { Badge } from "@/components/ui/badge";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: {
    label: "معلق",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  },
  confirmed: {
    label: "مؤكد",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  cancelled: {
    label: "ملغي",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
  completed: {
    label: "مكتمل",
    className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
};

export const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
