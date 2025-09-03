import React from 'react';
import { Star, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PointsDisplayProps {
  points: number;
  redeemedPoints: number;
  className?: string;
}

export default function PointsDisplay({ points, redeemedPoints, className = '' }: PointsDisplayProps) {
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-yellow-500" />
          Loyalty Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available Points</span>
          <span className="font-semibold text-lg">{points}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Redeemed Points</span>
          <span className="font-semibold text-lg text-green-600">{redeemedPoints}</span>
        </div>
        {points > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="h-4 w-4" />
              <span>Use points for discounts at checkout</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
