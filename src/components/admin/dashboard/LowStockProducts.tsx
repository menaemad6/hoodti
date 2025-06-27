import React from "react";
import ModernCard from "@/components/ui/modern-card";

interface Product {
  id: string;
  name: string;
  stock: number;
  images?: string[];
}

interface LowStockProductsProps {
  products: Product[];
}

export const LowStockProducts: React.FC<LowStockProductsProps> = ({ products }) => {
  return (
    <ModernCard title="Low Stock Products" className="h-full">
      {products.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {Array.isArray(product.images) && product.images.length > 0 ? (
                  <div className="h-8 w-8 rounded overflow-hidden border flex-shrink-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded overflow-hidden border flex-shrink-0">
                    <img src="/placeholder.svg" alt={product.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <span className="font-medium truncate">{product.name}</span>
              </div>
              <div className="flex items-center flex-shrink-0">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  product.stock === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                  product.stock < 5 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {product.stock} in stock
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 sm:py-6 text-muted-foreground">
          <p>No low stock products at the moment.</p>
        </div>
      )}
    </ModernCard>
  );
};

export default LowStockProducts;
