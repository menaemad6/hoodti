
import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import PromoSection from "@/components/home/PromoSection";
import NewArrivals from "@/components/home/NewArrivals";
import { getProducts } from "@/integrations/supabase/products.service";
import { Product } from "@/integrations/supabase/types.service";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Layout>
      <HeroBanner />
      <FeaturedCategories />
      <PromoSection />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <FeaturedProducts products={products} />
          <NewArrivals products={products} />
        </>
      )}
    </Layout>
  );
};

export default Index;
