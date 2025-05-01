import React from "react";
import Navbar from "./Navbar";
import MobileNavbar from "./MobileNavbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky navbar container */}
      <div className="sticky top-0 z-50 w-full">
        {/* Desktop Navbar - hidden on mobile */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        
        {/* Mobile Navbar - visible only on mobile */}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      </div>
      
      {/* Main content with padding adjustment for mobile bottom navbar */}
      <main className="flex-1 container mx-auto px-4 pb-24 md:pb-6 mt-10 md:mt-0">{children}</main>
      
      <Footer />
    </div>
  );
};

export default Layout;
