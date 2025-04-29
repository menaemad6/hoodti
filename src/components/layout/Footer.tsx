import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-8 md:mt-12 glass py-4 md:py-8 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">(Brand)</h3>
            <p className="text-sm text-muted-foreground">
              Premium grocery delivery service with the freshest produce and pantry essentials 
              delivered right to your doorstep.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/categories" className="text-sm hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-sm hover:text-primary transition-colors">
                  Deals &amp; Offers
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="text-sm hover:text-primary transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/bestsellers" className="text-sm hover:text-primary transition-colors">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm hover:text-primary transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-sm hover:text-primary transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm hover:text-primary transition-colors">
                  Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-primary transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} (Brand). All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
