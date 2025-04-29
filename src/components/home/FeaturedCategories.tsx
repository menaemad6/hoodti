
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ModernCategoryCard from "@/components/home/ModernCategoryCard";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { Category } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import Spinner from "@/components/ui/spinner";

const FeaturedCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        setCategories(data.map(category => ({
          id: category.id,
          name: category.name,
          image: category.image,
          description: category.description,
          created_at: category.created_at
        })));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <AnimatedWrapper animation="fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900">Categories</h2>
              <p className="text-muted-foreground mt-1">Browse our selection of fresh products</p>
            </div>
            <Link to="/categories" className="text-primary hover:underline flex items-center">
              View All Categories <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </AnimatedWrapper>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <ModernCategoryCard 
              key={category.id}
              category={category}
              delay={`${Math.min((index + 1) * 100, 500)}` as "100" | "200" | "300" | "400" | "500"}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
