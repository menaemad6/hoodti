import React from "react";
import ModernCard from "@/components/ui/modern-card";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  sales: number;
  percentChange: number;
  image?: string;
  price?: number;
  category?: string;
  // Clothing-specific attributes
  color?: string;
  size?: string;
  brand?: string;
  gender?: string;
  images?: string[];
}

interface TopSellingProductsProps {
  products: Product[];
}

export const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ products }) => {
  // Calculate the max sales for the progress bar
  const maxSales = Math.max(...products.map(product => product.sales));
  
  return (
    <ModernCard className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-lg">Top Selling Products</h3>
      </div>
      
      <div className="space-y-6">
        {products.map((product) => (
          <div key={product.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                {Array.isArray(product.images) && product.images.length > 0 ? (
                  <div className="h-10 w-10 rounded-md overflow-hidden border flex-shrink-0 bg-muted">
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
                  <div className="h-10 w-10 rounded-md flex-shrink-0 bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-xs text-primary">{product.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{product.name}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {product.category && (
                      <span className="text-xs text-muted-foreground">{product.category}</span>
                    )}
                    {product.color && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="inline-block w-2 h-2 rounded-full mr-1" 
                          style={{ 
                            backgroundColor: 
                              ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                .includes(product.color.toLowerCase()) 
                                ? product.color.toLowerCase()
                                : '#888' 
                          }}
                        ></span>
                        <span>{product.color}</span>
                      </div>
                    )}
                    {product.size && (
                      <span className="text-xs px-1 rounded bg-muted text-muted-foreground">{product.size}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{product.sales}</span>
                  <span className="text-xs text-muted-foreground">units</span>
                </div>
                {product.price && (
                  <span className="text-xs font-medium">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Progress value={(product.sales / maxSales) * 100} className="h-2" />
              <span className={cn(
                "text-xs flex items-center font-medium",
                product.percentChange >= 0 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {product.percentChange >= 0 
                  ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> 
                  : <ArrowDownRight className="h-3 w-3 mr-0.5" />
                }
                {Math.abs(product.percentChange)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </ModernCard>
  );
};

export default TopSellingProducts;
