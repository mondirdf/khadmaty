import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const Logo = ({ size = "md", showIcon = true }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      {showIcon && (
        <div className="relative">
          <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
            <Sparkles className={`${iconSizes[size]} text-primary-foreground`} />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
        </div>
      )}
      <span className={`${sizeClasses[size]} font-bold text-gradient`}>
        خدماتك
      </span>
    </Link>
  );
};

export default Logo;
