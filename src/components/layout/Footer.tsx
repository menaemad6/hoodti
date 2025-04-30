import React from "react";
import { ArrowRight, Facebook, Instagram, Twitter, MessageCircle, MapPin, Mail, Phone, ChevronRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND_NAME } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="mt-8 md:mt-12">
      {/* Newsletter Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-primary dark:from-primary/80 dark:to-primary/90 py-12 md:py-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Join our newsletter</h3>
              <p className="text-white/80 text-sm md:text-base">Stay updated with our latest offers, product releases and exclusive deals.</p>
            </div>
            
            <div className="w-full max-w-md">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 rounded-lg pl-4 pr-10 w-full focus-visible:ring-white/30"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                </div>
                <Button className="h-12 px-6 bg-white text-primary hover:bg-white/90 font-medium">
                  Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-white/60 text-xs mt-2">By subscribing you agree to our Privacy Policy.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="bg-background border-t border-border/40">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-4 md:col-span-2 flex flex-col">
              <div className="mb-4 flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mr-1">{BRAND_NAME}</span>
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">est. 2023</span>
              </div>
              
              <p className="text-muted-foreground mb-5 text-sm">
                Your premium destination for quality products with exceptional shopping experience and lightning-fast delivery.
              </p>
              
              <div className="mt-auto">
                <div className="flex items-center space-x-5 mb-5">
                  <a href="#" className="bg-muted hover:bg-muted/80 text-foreground rounded-full p-2.5 transition-colors duration-200">
                    <Facebook className="h-4 w-4" />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a href="#" className="bg-muted hover:bg-muted/80 text-foreground rounded-full p-2.5 transition-colors duration-200">
                    <Instagram className="h-4 w-4" />
                    <span className="sr-only">Instagram</span>
                  </a>
                  <a href="#" className="bg-muted hover:bg-muted/80 text-foreground rounded-full p-2.5 transition-colors duration-200">
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                  </a>
                </div>
                
                <div className="flex flex-col gap-3">
                  <a href="#" className="inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                    </div>
                    +1 (800) 123-4567
                  </a>
                  <a href="mailto:support@example.com" className="inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                    </div>
                    support@example.com
                  </a>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-foreground">Shop</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/categories" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/deals" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Deals & Offers
                  </Link>
                </li>
                <li>
                  <Link to="/new-arrivals" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link to="/bestsellers" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Best Sellers
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* About Links */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-foreground">About</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/about" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Press
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-foreground">Support</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/contact" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground text-sm hover:text-primary flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-primary" />
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* App Downloads */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-foreground">Mobile App</h3>
              <p className="text-muted-foreground text-sm mb-4">Download our app for the best experience</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="inline-block border border-border hover:border-primary rounded-lg transition-colors">
                  <img src="https://assets.stickpng.com/images/5a902dbf7f96951c82922875.png" alt="Download on App Store" className="h-10 w-auto" />
                </a>
                <a href="#" className="inline-block border border-border hover:border-primary rounded-lg transition-colors">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Get it on Google Play" className="h-10 w-auto" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer - Copyright and Payment */}
      <div className="bg-muted/40 border-t border-border/40 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">We accept:</span>
              <div className="flex space-x-2">
                {['visa', 'mastercard', 'amex', 'paypal', 'apple-pay'].map((card) => (
                  <div key={card} className="bg-background border border-border/60 rounded-md h-6 w-10 flex items-center justify-center">
                    <img 
                      src={`https://cdn.jsdelivr.net/gh/lipis/payment-icons@master/payment-icons/mono/xs/${card}.svg`} 
                      alt={card} 
                      className="h-4 w-auto opacity-70"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground">Made with</span>
              <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" />
              <span className="text-xs text-muted-foreground">in San Francisco</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
