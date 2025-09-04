import { useState, useEffect } from 'react';
import { useProductsService } from '@/integrations/supabase/products.service';
import { useCurrentTenant } from '@/context/TenantContext';
import { Product } from '@/integrations/supabase/types.service';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentTenant = useCurrentTenant();
  const productsService = useProductsService();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await productsService.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenant.id]);

  return {
    products,
    isLoading,
    error,
    refetch: () => {
      const fetchProducts = async () => {
        setIsLoading(true);
        try {
          const productsData = await productsService.getProducts();
          setProducts(productsData);
        } catch (error) {
          console.error("Error fetching products:", error);
          setError(error instanceof Error ? error.message : 'Failed to fetch products');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    }
  };
};
