
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="text-9xl font-bold tracking-tighter text-primary">404</div>
              <div className="absolute -top-2 -right-4">
                <span className="text-lg font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Page not found
                </span>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-3">Oops! We couldn't find that page</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="gap-2">
              <Link to="/">
                <Home size={16} />
                Go to Homepage
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="gap-2">
              <Link to="/shop">
                <Search size={16} />
                Browse Products
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
