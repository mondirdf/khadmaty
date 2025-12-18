import { forwardRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SignOutButtonProps {
  children: React.ReactNode;
  onSignedOut?: () => void;
}

export const SignOutButton = forwardRef<HTMLDivElement, SignOutButtonProps>(
  ({ children, onSignedOut }, ref) => {
    const [loading, setLoading] = useState(false);

    const handleConfirmSignOut = async () => {
      if (loading) return;
      setLoading(true);

      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Sign out error:", error);
          toast.error("تعذر تسجيل الخروج");
          return;
        }
        toast.success("تم تسجيل الخروج");
        onSignedOut?.();
      } finally {
        setLoading(false);
      }
    };

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div ref={ref}>{children}</div>
        </AlertDialogTrigger>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد تسجيل الخروج؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSignOut} disabled={loading}>
              {loading ? "..." : "تسجيل الخروج"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

SignOutButton.displayName = "SignOutButton";
