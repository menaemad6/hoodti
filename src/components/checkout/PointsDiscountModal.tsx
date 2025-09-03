import React, { useState, useEffect, useCallback } from 'react';
import { Star, Gift, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCurrentTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { getUserPoints } from '@/integrations/supabase/profiles.service';
import { getProductPoints } from '@/integrations/supabase/settings.service';
import { formatPrice } from '@/lib/utils';

interface PointsDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (discountAmount: number, pointsUsed: number) => void;
  subtotal: number;
}

interface DiscountTier {
  pointsRequired: number;
  discountPercent: number;
  discountAmount: number;
  isAvailable: boolean;
}

const PointsDiscountModal: React.FC<PointsDiscountModalProps> = ({
  isOpen,
  onClose,
  onApplyDiscount,
  subtotal,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const currentTenant = useCurrentTenant();
  const [userPoints, setUserPoints] = useState({ points: 0, redeemedPoints: 0 });
  const [productPoints, setProductPoints] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<DiscountTier | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load user points
      const points = await getUserPoints(user.id, currentTenant.id);
      setUserPoints(points);

      // Load product points setting
      const pointsPerProduct = await getProductPoints(currentTenant.id);
      setProductPoints(pointsPerProduct);
    } catch (error) {
      console.error('Error loading points data:', error);
      toast({
        title: "Error",
        description: "Failed to load points data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, currentTenant, toast]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Calculate discount tiers based on product points setting
  const calculateDiscountTiers = (): DiscountTier[] => {
    const tiers: DiscountTier[] = [];
    const basePoints = productPoints * 1; // Base tier at 100x product points
    
    // Create tiers: 100 points = 10%, 200 points = 15%, 300 points = 20%, etc.
    for (let i = 1; i <= 5; i++) {
      const pointsRequired = basePoints * i;
      const discountPercent = 5 + (i * 5); // 10%, 15%, 20%, 25%, 30%
      const discountAmount = (subtotal * discountPercent) / 100;
      
      tiers.push({
        pointsRequired,
        discountPercent,
        discountAmount,
        isAvailable: userPoints.points >= pointsRequired,
      });
    }
    
    return tiers;
  };

  const handleApplyDiscount = () => {
    if (!selectedTier) return;

    onApplyDiscount(selectedTier.discountAmount, selectedTier.pointsRequired);
    toast({
      title: "Discount Applied",
      description: `You've used ${selectedTier.pointsRequired} points for a ${selectedTier.discountPercent}% discount!`,
    });
    onClose();
  };

  const discountTiers = calculateDiscountTiers();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Use Points for Discount
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Points Display */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 p-6 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Your Available Points</p>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                  {userPoints.points.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Earn {productPoints} points per product purchase
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Star className="h-12 w-12 text-yellow-500" />
                {userPoints.redeemedPoints > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Redeemed</p>
                    <p className="text-sm font-medium text-green-600">
                      {userPoints.redeemedPoints.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Discount Tiers */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Available Discounts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discountTiers.map((tier, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-lg border cursor-pointer transition-all ${
                        tier.isAvailable
                          ? selectedTier?.pointsRequired === tier.pointsRequired
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50 hover:shadow-sm'
                          : 'border-muted bg-muted/50 cursor-not-allowed opacity-60'
                      }`}
                      onClick={() => tier.isAvailable && setSelectedTier(tier)}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedTier?.pointsRequired === tier.pointsRequired
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedTier?.pointsRequired === tier.pointsRequired && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-bold text-primary">{tier.discountPercent}%</span>
                            <span className="text-sm text-muted-foreground">OFF</span>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {tier.pointsRequired.toLocaleString()} points
                          </Badge>
                          <p className="text-lg font-semibold text-green-600">
                            Save {formatPrice(tier.discountAmount)}
                          </p>
                        </div>
                        <Gift className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* No Available Discounts */}
              {discountTiers.every(tier => !tier.isAvailable) && (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    You need at least {productPoints * 100} points to get a discount.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Keep shopping to earn more points!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1 h-12 text-base">
                  Cancel
                </Button>
                <Button 
                  onClick={handleApplyDiscount}
                  disabled={!selectedTier}
                  className="flex-1 h-12 text-base"
                >
                  {selectedTier ? `Apply ${selectedTier.discountPercent}% Discount` : 'Select a Discount'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsDiscountModal;
