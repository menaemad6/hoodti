import React from "react";
import { Link } from "react-router-dom";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { ArrowRight } from "lucide-react";

interface ModernCategoryCardProps {
  category: Category;
  className?: string;
  delay?: "none" | "100" | "150" | "200" | "300" | "400" | "500";
  variant?: "default" | "minimal" | "featured";
}

const ModernCategoryCard: React.FC<ModernCategoryCardProps> = ({
  category,
  className,
  delay = "none",
  variant = "default"
}) => {
  // Minimal variant (used in grid)
  if (variant === "minimal") {
    return (
      <AnimatedWrapper animation="fade-in" delay={delay}>
        <Link 
          to={`/shop?category=${category.id}`}
          className={cn(
            "block rounded-xl overflow-hidden relative h-40 group",
            "ring-1 ring-black/5 dark:ring-white/5",
            "transition duration-300 ease-out",
            "hover:ring-2 hover:ring-primary/50",
            className
          )}
        >
          <img 
            src={category.image} 
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <h3 className="text-white font-semibold text-lg group-hover:translate-x-1 transition-transform duration-300">{category.name}</h3>
            <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white/80 text-sm mt-1 line-clamp-2">{category.description}</p>
            </div>
          </div>
        </Link>
      </AnimatedWrapper>
    );
  }
  
  // Featured variant (larger cards)
  if (variant === "featured") {
    return (
      <AnimatedWrapper animation="scale-in" delay={delay}>
        <Link 
          to={`/shop?category=${category.id}`}
          className={cn(
            "group block overflow-hidden rounded-2xl relative",
            "bg-gradient-to-br from-white/90 to-white/40 dark:from-gray-900/90 dark:to-gray-900/40",
            "backdrop-blur-md border border-white/20 dark:border-white/10",
            "shadow-lg transition-all duration-300",
            "hover:shadow-xl hover:border-primary/20 hover:translate-y-[-5px]",
            className
          )}
        >
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all duration-300">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <ArrowRight className="text-primary/50 w-6 h-6 transform translate-x-4 group-hover:translate-x-6 transition-transform duration-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-primary transition-colors duration-300">
              {category.name}
            </h3>
            <p className="text-muted-foreground text-lg line-clamp-2 mb-4">
              {category.description}
            </p>
            <div className="inline-flex items-center text-primary font-medium">
              <span className="mr-2">Explore Category</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </AnimatedWrapper>
    );
  }
  
  // Default variant
  return (
    <AnimatedWrapper animation="fade-in" delay={delay}>
      <Link
        to={`/shop?category=${category.id}`}
        className={cn(
          "group block overflow-hidden rounded-xl",
          "bg-white dark:bg-gray-800/50 backdrop-blur-sm",
          "border border-black/5 dark:border-white/10",
          "shadow-sm transition-all duration-300",
          "hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/60 hover:scale-[1.02]",
          className
        )}
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-300">
            {category.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
            {category.description}
          </p>
        </div>
      </Link>
    </AnimatedWrapper>
  );
};

export default ModernCategoryCard;
