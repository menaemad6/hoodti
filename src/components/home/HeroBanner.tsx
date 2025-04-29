
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/glass-card";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { ArrowRight, ShoppingBag, Tag } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl mb-16">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent mix-blend-overlay"></div>
      
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-left z-10">
            <AnimatedWrapper animation="fade-in">
              <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-6">
                Freshest Products Delivered Daily
              </span>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-primary">Fresh</span> Groceries <br />
                To Your Doorstep
              </h1>
              
              <p className="text-lg text-gray-700 mb-8 max-w-lg">
                Experience hassle-free shopping with our premium selection of fresh groceries. 
                From farm-fresh produce to pantry essentials.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button className="rounded-full text-base h-12 px-6 gap-2 group" size="lg" asChild>
                  <Link to="/shop">
                    <ShoppingBag className="w-5 h-5" />
                    Shop Now
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                
                <Button className="rounded-full text-base h-12 px-6" variant="outline" size="lg" asChild>
                  <Link to="/deals">
                    <Tag className="w-5 h-5 mr-2" />
                    Today's Deals
                  </Link>
                </Button>
              </div>
            </AnimatedWrapper>
            
            <AnimatedWrapper animation="fade-in" delay="300" className="mt-10">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                      <img 
                        src={`https://randomuser.me/api/portraits/men/${num + 20}.jpg`} 
                        alt="Customer" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">From 2,000+ happy customers</p>
                </div>
              </div>
            </AnimatedWrapper>
          </div>
          
          <div className="relative z-10">
            <AnimatedWrapper animation="scale-in">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1506617420156-8e4536971650?q=80&w=2670&auto=format&fit=crop"
                  alt="Fresh groceries"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                
                <GlassCard variant="elevated" className="absolute -bottom-6 -right-6 max-w-xs">
                  <div className="p-4 flex items-center gap-4">
                    <div className="bg-green-500/20 rounded-full p-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Free Delivery</p>
                      <p className="text-sm text-gray-600">On orders over $50</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </AnimatedWrapper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
