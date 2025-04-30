import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import MobileNavbar from "./MobileNavbar";
import Footer from "./Footer";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar when user scrolls past 90% of viewport height
      const scrollThreshold = window.innerHeight * 0.9;
      if (window.scrollY > scrollThreshold) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full m-0 p-0 overflow-x-hidden relative">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
        {/* Plus pattern - using currentColor for dark mode compatibility */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="plus-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" fill="currentColor" fillOpacity="0.2"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#plus-pattern)"></rect>
          </svg>
        </div>
        
        {/* Wavy pattern at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
            <path 
              fill="currentColor" 
              fillOpacity="0.05" 
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            </path>
          </svg>
        </div>
        
        {/* Wavy pattern at top */}
        <div className="absolute top-0 left-0 w-full h-32 transform rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
            <path 
              fill="currentColor" 
              fillOpacity="0.05" 
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            </path>
          </svg>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute left-[10%] top-[20%] w-64 h-64 rounded-full bg-primary opacity-5"></div>
        <div className="absolute right-[5%] top-[50%] w-96 h-96 rounded-full bg-primary opacity-5"></div>
        <div className="absolute left-[20%] bottom-[10%] w-80 h-80 rounded-full bg-primary opacity-5"></div>
      </div>

      {/* Scroll-activated desktop navbar (only appears after scrolling) */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 transform hidden md:block ${
          showNavbar 
            ? "translate-y-0 opacity-100" 
            : "translate-y-[-100%] opacity-0 pointer-events-none"
        } ${showNavbar ? "bg-black/80 backdrop-blur-md shadow-md" : ""}`}
      >
        <Navbar />
      </div>
      
      {/* Mobile Navbar that shows/hides based on scroll position */}
      <MobileNavbar isVisible={showNavbar} />
      
      {/* Main content with dynamic padding adjustment for mobile */}
      <main className={`flex-1 w-full p-0 m-0 transition-all duration-300 relative z-10 ${
        showNavbar ? "pt-0 pb-24 md:pb-0" : "pt-0 pb-0"
      }`}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default HomeLayout; 