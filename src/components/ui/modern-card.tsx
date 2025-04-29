import React from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  padding?: "sm" | "md" | "lg" | "none";
  header?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  hoverEffect?: boolean;
  border?: boolean;
  shadow?: boolean;
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  title,
  description,
  footer,
  padding = "md",
  header,
  isActive = false,
  onClick,
  hoverEffect = false,
  border = true,
  shadow = true,
}) => {
  const getPadding = () => {
    switch (padding) {
      case "sm":
        return "p-2 sm:p-3";
      case "md":
        return "p-3 sm:p-4 md:p-5";
      case "lg":
        return "p-4 sm:p-5 md:p-7";
      case "none":
      default:
        return "";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg overflow-hidden transition-all duration-200",
        border && "border dark:border-gray-800",
        shadow && "shadow-sm dark:shadow-gray-900/10",
        isActive && "border-primary dark:border-primary bg-primary/5 dark:bg-primary/10",
        hoverEffect && 
          "hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md dark:hover:shadow-gray-900/20",
        getPadding(),
        onClick && "cursor-pointer",
        className
      )}
    >
      {header && <div className="mb-3 sm:mb-4">{header}</div>}
      {title && (
        <h3 className="font-medium text-base sm:text-lg mb-1 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">{description}</p>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t dark:border-gray-800">{footer}</div>
      )}
    </div>
  );
};

export default ModernCard;
