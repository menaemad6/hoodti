import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { Category } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import Spinner from "@/components/ui/spinner";
import GlassCard from "@/components/ui/glass-card";
import { Layers, Grid3X3, ArrowRight, ShoppingBag, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Categories = () => {
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
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">All Categories</h1>
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Modern hero section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/10 pt-16 pb-20 mt-8 rounded-xl mx-4">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text content */}
            <AnimatedWrapper animation="fade-in" delay="100">
              <div className="space-y-6 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full border border-muted mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-sm font-medium text-foreground/80">{categories.length} Categories Available</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">Browse</span>
                  <span className="block mt-1">Categories</span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-md">
                  Find what you're looking for by browsing our carefully curated product categories
                </p>
              </div>
            </AnimatedWrapper>
            
            {/* Right: Visual elements */}
            <AnimatedWrapper animation="fade-in" delay="300" className="hidden lg:block">
              <div className="relative h-72">
                {/* Featured category cards */}
                {categories.slice(0, 3).map((category, index) => (
                  <GlassCard 
                    key={category.id}
                    className={`absolute w-64 shadow-lg transform transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                      index === 0 ? 'right-0 top-0 rotate-3 z-30' :
                      index === 1 ? 'right-16 top-24 -rotate-2 z-20' :
                      'left-0 bottom-0 rotate-6 z-10'
                    }`}
                    variant={index === 0 ? "elevated" : index === 1 ? "default" : "bordered"}
                    hoverEffect={true}
                  >
                    <div className="relative h-36 overflow-hidden rounded-t-lg">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f5f5f5/cccccc?text=Category";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <h3 className="absolute bottom-2 left-3 text-white font-medium">{category.name}</h3>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </AnimatedWrapper>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <Grid3X3 className="mr-2 h-5 w-5 text-primary" />
          All Categories
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <AnimatedWrapper 
              key={category.id}
              animation="fade-in"
              delay={`${Math.min((index % 4) * 100, 500)}` as "100" | "200" | "300" | "400" | "500"}
            >
              <Link to={`/categories/${category.id}`}>
                <GlassCard 
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl h-64"
                  variant="subtle"
                  hoverEffect={true}
                >
                  {/* Badge */}
                  <Badge className="absolute top-3 left-3 z-30 bg-background/70 hover:bg-background/70 backdrop-blur-md text-foreground">
                    <Package className="h-3 w-3 mr-1" />
                    Category
                  </Badge>
                  
                  {/* Image Container */}
                  <div className="absolute inset-0 z-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5 z-20 opacity-80 group-hover:opacity-70 transition-opacity" />
                    <img 
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Content Container */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 z-30">
                    <h3 className="text-xl font-semibold text-white group-hover:text-white transition-colors">
                      {category.name}
                    </h3>
                    
                    <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300 mt-2">
                      <p className="text-sm text-white/90 mb-3 line-clamp-2">{category.description}</p>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="w-full mt-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
                      >
                        Explore 
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </div>
                    
                    <div className="h-8 group-hover:h-0 overflow-hidden transition-all duration-300 opacity-70 group-hover:opacity-0">
                      <ArrowRight className="h-5 w-5 text-white mt-2" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
