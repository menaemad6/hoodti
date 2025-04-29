
import React from "react";
import { Link } from "react-router-dom";
import { Category } from "@/types";
import GlassCard from "../ui/glass-card";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link to={`/categories/${category.id}`}>
      <GlassCard className="h-full transition-all duration-300 hover:-translate-y-1 group">
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
            <img 
              src={category.image} 
              alt={category.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
            />
          </div>
          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {category.description}
          </p>
        </div>
      </GlassCard>
    </Link>
  );
};

export default CategoryCard;
