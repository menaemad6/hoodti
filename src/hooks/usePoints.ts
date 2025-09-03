import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCurrentTenant } from '@/context/TenantContext';
import { getUserPoints } from '@/integrations/supabase/profiles.service';

export interface UserPoints {
  points: number;
  redeemedPoints: number;
  loading: boolean;
  error: string | null;
}

export function usePoints() {
  const { user } = useAuth();
  const currentTenant = useCurrentTenant();
  const [pointsData, setPointsData] = useState<UserPoints>({
    points: 0,
    redeemedPoints: 0,
    loading: true,
    error: null
  });

  const fetchPoints = useCallback(async () => {
    if (!user || !currentTenant) {
      setPointsData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setPointsData(prev => ({ ...prev, loading: true, error: null }));
      const points = await getUserPoints(user.id, currentTenant.id);
      setPointsData({
        points: points.points,
        redeemedPoints: points.redeemedPoints,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching user points:', error);
      setPointsData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load points'
      }));
    }
  }, [user, currentTenant]);

  useEffect(() => {
    fetchPoints();
  }, [user, currentTenant, fetchPoints]);

  return {
    ...pointsData,
    refetch: fetchPoints
  };
}
