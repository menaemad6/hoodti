
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PromoSection = () => {
  // Get category IDs for meal kits and organic products
  // These should be replaced with actual category IDs from your database
  const mealKitsCategoryId = "d7a6df66-e44f-493d-a6c5-a7be9e7dac8b"; // Example ID - replace with a real one
  const organicCategoryId = "9ba76e2b-9c1d-4c82-b7b1-5edc3938b1b4"; // Example ID - replace with a real one

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Meal Kits Card */}
          <div className="relative overflow-hidden rounded-xl h-80 bg-gradient-to-r from-amber-500 to-orange-600 group">
            <div className="absolute inset-0 bg-black/10 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?w=800"
              alt="Meal Kits" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="relative h-full flex flex-col justify-end p-8 z-20">
              <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-md">Explore Meal Kits</h3>
              <p className="text-white/90 mb-6 max-w-xs drop-shadow-md">
                Delicious recipes with pre-portioned ingredients delivered to your door.
              </p>
              <Button asChild className="w-fit rounded-full">
                <Link to="/shop" className="group">
                  Browse Meal Kits
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Organic Products Card */}
          <div className="relative overflow-hidden rounded-xl h-80 bg-gradient-to-r from-green-500 to-emerald-600 group">
            <div className="absolute inset-0 bg-black/10 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
              alt="Organic Products" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="relative h-full flex flex-col justify-end p-8 z-20">
              <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-md">Shop Organic</h3>
              <p className="text-white/90 mb-6 max-w-xs drop-shadow-md">
                Fresh, certified organic produce and groceries for a healthy lifestyle.
              </p>
              <Button asChild className="w-fit rounded-full">
                <Link to="/shop" className="group">
                  Browse Organic
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
