import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getBanners } from "@/integrations/supabase/banners.service";
import { BannerRow } from "@/integrations/supabase/types.service";
import { useCurrentTenant } from "@/context/TenantContext";
import { useToast } from "@/hooks/use-toast";

interface BannersModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseDelay?: number; // Auto-close after this many seconds (0 = no auto-close)
}

const BannersModal: React.FC<BannersModalProps> = ({ 
  isOpen, 
  onClose, 
  autoCloseDelay = 0 
}) => {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentTenant = useCurrentTenant();
  const { toast } = useToast();

  // Filter banners to show only active ones
  const activeBanners = banners.filter(banner => {
    if (!banner.is_active) return false;
    
    const now = new Date();
    const startDate = banner.start_date ? new Date(banner.start_date) : null;
    const endDate = banner.end_date ? new Date(banner.end_date) : null;
    
    // Check if banner is within date range
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  });

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getBanners(currentTenant.id);
        setBanners(data);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Failed to load banners");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load promotional banners",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchBanners();
    }
  }, [isOpen, currentTenant.id, toast]);

  // Auto-close functionality - cycle through all images then close
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0 && activeBanners.length > 0) {
      const totalBanners = activeBanners.length;
      const timePerBanner = autoCloseDelay * 1000 / totalBanners; // Distribute time across all banners
      
      let currentBannerIndex = 0;
      
      const cycleTimer = setInterval(() => {
        currentBannerIndex++;
        
        if (currentBannerIndex < totalBanners) {
          // Move to next banner
          setCurrentIndex(currentBannerIndex);
        } else {
          // All banners shown, close modal
          clearInterval(cycleTimer);
          onClose();
        }
      }, timePerBanner);

      return () => clearInterval(cycleTimer);
    }
  }, [isOpen, autoCloseDelay, onClose, activeBanners.length]);

  // Auto-advance carousel (only when auto-close is disabled)
  useEffect(() => {
    if (isOpen && activeBanners.length > 1 && autoCloseDelay === 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(timer);
    }
  }, [isOpen, activeBanners.length, autoCloseDelay]);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? activeBanners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleBannerClick = (banner: BannerRow) => {
    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Don't render if no active banners
  if (!isOpen || activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none shadow-none">
        <div className="relative bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl">
          {/* Close Button */}
          <Button
            variant="default"
            size="icon"
            className="absolute top-4 right-4 z-10  rounded-full shadow-lg"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center h-64 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {/* Banners Carousel */}
          {!isLoading && !error && activeBanners.length > 0 && (
            <div className="relative">
              {/* Main Banner Image */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleBannerClick(currentBanner)}
              >
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  className="w-full h-auto max-h-[60vh] object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                
                {/* Hover Overlay */}
                {currentBanner.link_url && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                      Click to view
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {activeBanners.length > 1 && (
                <>
                  <Button
                    variant="default"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2  rounded-full shadow-lg z-10"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="default"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2  rounded-full shadow-lg z-10"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Dots Indicator */}
              {activeBanners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                  {activeBanners.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
              )}


            </div>
          )}

          {/* Auto-close Progress Bar */}
          {autoCloseDelay > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{
                  width: '100%',
                  animation: `shrink ${autoCloseDelay}s linear forwards`
                }}
              />
              {/* Banner counter */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white bg-black/70 px-2 py-1 rounded">
                {currentIndex + 1} / {activeBanners.length}
              </div>
            </div>
          )}
        </div>

        {/* CSS for progress bar animation */}
        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default BannersModal;
