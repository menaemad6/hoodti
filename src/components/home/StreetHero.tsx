import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, ChevronDown } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";

const StreetHero: React.FC = () => {
  const [activeBackground, setActiveBackground] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [showUnlockMessage, setShowUnlockMessage] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // GIF sources
  const backgrounds = [
    "/hero-sectio-gif-1.gif",
    "/hero-sectio-gif-2.gif"
  ];
  
  // Dynamic viewport height adjustment to handle mobile browser UI
  useEffect(() => {
    const updateViewportHeight = () => {
      // For mobile devices, use a smaller fixed height to account for browser chrome
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Use visual viewport height if available (accounts for browser UI)
        const vvh = window.visualViewport?.height || window.innerHeight;
        setViewportHeight(vvh);
        
        // Apply the height directly to avoid delays
        if (sectionRef.current) {
          sectionRef.current.style.height = `${vvh}px`;
        }
      } else {
        // For desktop, use regular 100vh
        setViewportHeight(window.innerHeight);
        
        if (sectionRef.current) {
          sectionRef.current.style.height = `100vh`;
        }
      }
    };
    
    // Update on mount
    updateViewportHeight();
    
    // Set up event listeners for orientation changes and resize
    window.visualViewport?.addEventListener('resize', updateViewportHeight);
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    // Clean up
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);
  
  // On mount, fix the top space issue and initialize overlay position
  useEffect(() => {
    // Force document to start at top with no margin/padding
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Force scroll to absolute top
    window.scrollTo(0, 0);
    
    // Initialize overlay position
    if (overlayRef.current) {
      overlayRef.current.style.transform = 'translateY(0%)';
    }
    
    return () => {
      // Clean up
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);
  
  // Switch background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveBackground((prev) => (prev === 0 ? 1 : 0));
        setIsTransitioning(false);
      }, 1000); // 1 second for fade transition
    }, 5000); // 5 seconds between switches
    
    return () => clearInterval(interval);
  }, []);

  // Initial setup - force page to top and prevent scrolling
  useEffect(() => {
    if (isLocked) {
      // Force scroll to top
      window.scrollTo(0, 0);
      
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup - always re-enable scrolling when component unmounts
      document.body.style.overflow = '';
    };
  }, [isLocked]);
  
  // Detect device type and handle mobile differently
  useEffect(() => {
    // Function to detect if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobileDevice(isMobile);
    
    if (isMobile) {
      // For mobile devices, make the unlock button more visible but smaller
      const skipButton = document.querySelector('.skip-button');
      if (skipButton) {
        (skipButton as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
        (skipButton as HTMLElement).style.padding = '8px 16px';
        (skipButton as HTMLElement).style.borderRadius = '16px';
      }
      
      // Automatically unlock after a small timeout for mobile
      setTimeout(() => {
        unlockScrolling();
        setScrollProgress(100);
      }, 1500);
    }
  }, []);
  
  // Desktop scroll handling - only add for non-mobile
  useEffect(() => {
    if (isMobileDevice || !isLocked) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (!isLocked) return;
      
      e.preventDefault();
      updateScrollProgress(e.deltaY);
    };
    
    // Add event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isLocked, scrollProgress, isMobileDevice]);
  
  // Shared function to update scroll progress for desktop
  const updateScrollProgress = (deltaY: number) => {
    if (!isLocked) return;
    
    const totalRequired = window.innerHeight * 1.5;
    
    // Only count downward scrolls
    if (deltaY > 0) {
      // Calculate progress (0-100%)
      const increment = deltaY;
      const newProgress = Math.min(100, scrollProgress + (increment / totalRequired) * 100);
      setScrollProgress(newProgress);
      
      // Update the overlay with vertical reveal effect - move from top to bottom
      if (overlayRef.current) {
        // Start at 0% (positioned at the top) and move down as progress increases
        const translateY = `${newProgress}%`;
        overlayRef.current.style.transform = `translateY(${translateY})`;
        
        // When fully revealed (100% progress), hide it completely
        if (newProgress >= 100) {
          setTimeout(() => {
            if (overlayRef.current) {
              overlayRef.current.style.display = 'none';
            }
          }, 300);
        }
      }
      
      // Check for unlock threshold
      if (newProgress >= 100) {
        unlockScrolling();
      }
    }
  };

  // Function to properly unlock scrolling
  const unlockScrolling = () => {
    setIsLocked(false);
    
    // Ensure overlay is moved completely off screen
    if (overlayRef.current) {
      overlayRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.style.display = 'none';
        }
      }, 500);
    }
    
    // Show unlock message
    setShowUnlockMessage(true);
    setTimeout(() => {
      setShowUnlockMessage(false);
    }, 2000);
  };

  // Skip function - bypasses the scroll requirement
  const handleSkip = () => {
    unlockScrolling();
    setScrollProgress(100);
    
    // After a short delay, scroll down to the next section
    setTimeout(() => {
      if (sectionRef.current) {
        window.scrollTo({
          top: sectionRef.current.offsetHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };
  
  return (
    <>
      {/* Full-screen overlay that moves down with scroll progress */}
      <div 
        ref={overlayRef}
        className="fixed top-0 left-0 w-full z-[60]" // Reduced z-index to be below the button
        style={{ 
          height: `${viewportHeight}px`,
          transform: 'translateY(0%)',
          transition: 'transform 0.3s ease',
          willChange: 'transform',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.2))'
        }}
      />
      
      <section 
        ref={sectionRef} 
        className="relative w-full overflow-hidden m-0 p-0"
        style={{ 
          margin: 0,
          padding: 0,
          height: `${viewportHeight}px`,
          maxHeight: `${viewportHeight}px`,
        }}
      >
        {/* Background GIFs */}
        {backgrounds.map((bg, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              activeBackground === index
                ? "opacity-100 z-10"
                : "opacity-0 z-0"
            } ${isTransitioning && activeBackground === index ? "opacity-0" : ""}`}
          >
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center'
              }}
            />
          </div>
        ))}
        
        {/* Dark overlay for better text readability */}
        <div 
          className="absolute inset-0 z-20"
          style={{ 
            background: `linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.2), rgba(0,0,0,0.3))`
          }}
        />
        
        {/* Content */}
        <div className="relative z-30 h-full w-full flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl px-4">
            {/* Badge */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
              LIMITED DROP
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl md:text-[8rem] font-black mb-4 leading-none tracking-tight text-white">
              <span className="block">{BRAND_NAME.toUpperCase()}</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg sm:text-2xl text-white/80 mb-10 max-w-lg mx-auto font-medium">
              {/* Authentic urban apparel for those who define their own path. 
              Express yourself without limits. */}
            </p>
            
            {/* CTA Button */}
            <Button 
              className="h-12 sm:h-14 px-6 sm:px-8 rounded-none text-base group border-2 border-white 
                       hover:bg-primary/20 hover:border-primary bg-transparent text-white 
                       transition-all duration-300 overflow-hidden relative"
              size="lg" 
              asChild
            >
              <Link to="/shop" className="relative z-10 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-3" />
                SHOP NOW
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          {/* Skip button with higher z-index to be above overlay */}
          <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-[70]">
            {/* Label - Now above progress bar */}
            <button 
              onClick={handleSkip}
              className="skip-button flex flex-col items-center cursor-pointer bg-transparent border-0 focus:outline-none mb-3 px-4 py-2 hover:bg-white/10 rounded-full transition-all"
            >
              <span className={`text-white/70 ${isMobileDevice ? 'text-xs' : 'text-sm'} font-medium uppercase tracking-widest flex items-center mb-1`}>
                {isMobileDevice 
                  ? (isLocked ? `Tap to continue` : 'Continue')
                  : (isLocked ? `Scroll down (${Math.floor(scrollProgress)}%) or tap to skip` : 'Continue')}
              </span>
              <ChevronDown className={`text-white/70 w-5 h-5 ${isLocked ? 'animate-bounce' : ''}`} />
            </button>
            
            {/* Horizontal progress bar */}
            {isLocked && (
              <div className="relative w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Unlock Message - appears when page unlocks */}
        <div 
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101]
                     bg-black/80 backdrop-blur-md border border-primary/50 text-white 
                     px-8 py-4 rounded-lg transition-all duration-500
                     ${showUnlockMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
        >
          <div className="text-center">
            <span className="text-primary font-bold">Unlocked!</span>
            <p className="text-white/80 text-sm">Continue scrolling to explore</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default StreetHero;