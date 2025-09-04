import { useState, useEffect, useCallback } from 'react';
import { getCategories } from '@/integrations/supabase/categories.service';
import { useCurrentTenant } from '@/context/TenantContext';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image: string;
  created_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentTenant = useCurrentTenant();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categoriesData = await getCategories(currentTenant.id);
      const normalizedCategories = categoriesData.map(cat => ({ 
        ...cat, 
        image: Array.isArray(cat.image) ? cat.image[0] : cat.image 
      }));
      setCategories(normalizedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant.id]);

  useEffect(() => {
    if (currentTenant.id) {
      fetchCategories();
    }
  }, [currentTenant.id, fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories
  };
};
