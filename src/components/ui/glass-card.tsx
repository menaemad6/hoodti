
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle" | "bordered";
  hoverEffect?: boolean;
  contentClassName?: string;
  padding?: "none" | "small" | "medium" | "large";
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className,
  variant = "default",
  hoverEffect = true,
  contentClassName,
  padding = "medium",
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "elevated":
        return "backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 shadow-lg";
      case "subtle":
        return "backdrop-blur-sm bg-white/20 dark:bg-black/20 border border-white/10 dark:border-white/5 shadow-sm";
      case "bordered":
        return "backdrop-blur-md bg-white/10 dark:bg-black/10 border-2 border-white/20 dark:border-white/10 shadow-md";
      default:
        return "backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-lg";
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return "";
      case "small":
        return "p-3";
      case "large":
        return "p-6";
      default: // medium
        return "p-5";
    }
  };

  return (
    <div 
      className={cn(
        "rounded-xl transition-all duration-300",
        getVariantClasses(),
        hoverEffect && "hover:shadow-xl hover:bg-white/40 dark:hover:bg-black/40 hover:scale-[1.01]",
        className
      )}
      {...props}
    >
      <div className={cn(getPaddingClasses(), contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
