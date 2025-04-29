
import React from "react";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  className?: string;
  rows?: number;
  hasImage?: boolean;
  imageSize?: "sm" | "md" | "lg" | "full";
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className,
  rows = 3,
  hasImage = false,
  imageSize = "md"
}) => {
  const getImageSizeClasses = () => {
    switch (imageSize) {
      case "sm":
        return "h-20 w-20";
      case "lg":
        return "h-40 w-full";
      case "full":
        return "aspect-square w-full";
      default: // md
        return "h-32 w-full";
    }
  };
  
  return (
    <div className={cn(
      "rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white/50 backdrop-blur-sm animate-pulse",
      "dark:bg-gray-800/50 dark:border-gray-700/50 dark:backdrop-blur-md",
      className
    )}>
      {hasImage && (
        <div className={cn("bg-gray-200 dark:bg-gray-700", getImageSizeClasses())}></div>
      )}
      
      <div className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-4"></div>
        
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={cn(
            "h-4 bg-gray-200 dark:bg-gray-700 rounded-md", 
            index === rows - 1 ? "w-1/2" : "w-full", 
            "mt-3"
          )}></div>
        ))}
        
        <div className="flex justify-between items-center mt-5">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
