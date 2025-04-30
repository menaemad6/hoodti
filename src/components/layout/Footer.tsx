import React from "react";
import { Link } from "react-router-dom";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight,
  Heart
} from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="pt-16 pb-24 md:pb-8 bg-background">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {BRAND_NAME}
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Discover curated fashion collections that blend timeless elegance with contemporary trends. 
              From everyday essentials to statement pieces, we're dedicated to quality craftsmanship 
              and sustainable style that empowers your personal expression.
            </p>
            <div className="flex items-center space-x-1.5 mb-8">
              <Button size="icon" variant="outline" className="rounded-full w-9 h-9 text-foreground/80 hover:text-primary hover:border-primary">
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button size="icon" variant="outline" className="rounded-full w-9 h-9 text-foreground/80 hover:text-primary hover:border-primary">
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button size="icon" variant="outline" className="rounded-full w-9 h-9 text-foreground/80 hover:text-primary hover:border-primary">
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-3 md:ml-auto">
            <h3 className="text-base font-semibold tracking-wide mb-4 uppercase text-foreground/90">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  Deals & Offers
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="md:col-span-2">
            <h3 className="text-base font-semibold tracking-wide mb-4 uppercase text-foreground/90">Help</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-2">
            <h3 className="text-base font-semibold tracking-wide mb-4 uppercase text-foreground/90">Contact</h3>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-primary/70 mt-0.5" />
                  <span className="text-muted-foreground">
                    123 Fashion St.<br />
                    New York, NY 10001
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary/70" />
                  <span className="text-muted-foreground">(800) 123-4567</span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-primary/70" />
                  <span className="text-muted-foreground">support@{BRAND_NAME.toLowerCase()}.com</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-border/40 pt-6">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0 text-center md:text-left">
            &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center text-sm text-muted-foreground">
            Developed by 
            <a 
              href="https://mina-emad.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-1 font-medium hover:text-primary/80 text-xl text-primary transition-colors"
            >
              Mina Emad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
