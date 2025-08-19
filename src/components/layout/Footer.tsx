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
import { useCurrentTenant } from "@/context/TenantContext";
import { Button } from "@/components/ui/button";
import PolicyModal from "@/components/policies/PolicyModal";

const Footer = () => {
  const tenant = useCurrentTenant();
  const [policyOpen, setPolicyOpen] = React.useState(false);
  const [policyTab, setPolicyTab] = React.useState<"shipping" | "terms">("shipping");
  return (
    <footer className="pt-16 pb-24 md:pb-8 bg-background">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {BRAND_NAME}
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              {tenant.footerDescription ||
                "Discover curated fashion collections that blend timeless elegance with contemporary trends. From everyday essentials to statement pieces, we're dedicated to quality craftsmanship and sustainable style that empowers your personal expression."}
            </p>
            <div className="flex items-center space-x-1.5 mb-8">
              {tenant.socialMedia?.facebook && (
                <Button asChild size="icon" variant="outline" className="rounded-full w-9 h-9 text-foreground/80 hover:text-primary hover:border-primary">
                  <a href={tenant.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook size={18} />
                    <span className="sr-only">Facebook</span>
                  </a>
                </Button>
              )}
              {tenant.socialMedia?.instagram && (
                <Button asChild size="icon" variant="outline" className="rounded-full w-9 h-9 text-foreground/80 hover:text-primary hover:border-primary">
                  <a href={tenant.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram size={18} />
                    <span className="sr-only">Instagram</span>
                  </a>
                </Button>
              )}
              {tenant.socialMedia?.twitter && (
                <Button asChild size="icon" variant="outline" className="rounded-full w-9 h-9 text-foreground/80 hover:text-primary hover:border-primary">
                  <a href={tenant.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter size={18} />
                    <span className="sr-only">Twitter</span>
                  </a>
                </Button>
              )}
              {tenant.socialMedia?.youtube && (
                <Button asChild size="icon" variant="outline" className="rounded-full w-9 h-9 text-foreground/80 hover:text-primary hover:border-primary">
                  <a href={tenant.socialMedia.youtube} target="_blank" rel="noopener noreferrer">
                    <span className="sr-only">YouTube</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="sm:col-span-1 lg:col-span-3 lg:ml-auto">
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
          <div className="sm:col-span-1 lg:col-span-2">
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
                <button
                  type="button"
                  className="text-left w-full text-muted-foreground hover:text-primary transition-colors flex items-center"
                  onClick={() => { setPolicyTab("shipping"); setPolicyOpen(true); }}
                >
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-left w-full text-muted-foreground hover:text-primary transition-colors flex items-center"
                  onClick={() => { setPolicyTab("terms"); setPolicyOpen(true); }}
                >
                  <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary/50" />
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-base font-semibold tracking-wide mb-4 uppercase text-foreground/90">Contact</h3>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-primary/70 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground break-words">
                    {tenant.address}
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary/70 flex-shrink-0" />
                  <span className="text-muted-foreground break-all">{tenant.contactPhone}</span>
                </div>
              </li>
              <li>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 text-primary/70 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground break-all leading-relaxed">
                    {tenant.contactEmail}
                  </span>
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
              href="https://mina-emad.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-1 font-medium hover:text-primary/80 text-xl text-primary transition-colors"
            >
              Mina Emad
            </a>
          </div>
        </div>
      </div>
      <PolicyModal open={policyOpen} onOpenChange={setPolicyOpen} defaultTab={policyTab} />
    </footer>
  );
};

export default Footer;
