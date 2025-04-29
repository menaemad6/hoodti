import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import ModernCard from "@/components/ui/modern-card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ArrowLeft, Loader2, Eye } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const ProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  // Early check if this is a new product
  const isNewProduct = !id || id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [productExists, setProductExists] = useState<boolean>(isNewProduct); // Default to true for new products
  const [isLoading, setIsLoading] = useState<boolean>(!isNewProduct); // Only start loading if editing
  const [productName, setProductName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch product details if it's an existing product
    if (!isNewProduct) {
      const checkProduct = async () => {
        try {
          const { data, error } = await supabase
            .from("products")
            .select("id, name")
            .eq("id", id)
            .single();
          
          if (error || !data) {
            setProductExists(false);
            setError("The product you're trying to edit doesn't exist.");
            toast({
              variant: "destructive",
              title: "Product Not Found",
              description: "The product you're trying to edit doesn't exist.",
            });
          } else {
            setProductName(data.name || "");
            setProductExists(true);
          }
        } catch (error) {
          console.error("Error checking product:", error);
          setProductExists(false);
          setError("An error occurred while checking if the product exists.");
        } finally {
          setIsLoading(false);
        }
      };
      
      checkProduct();
    }
    // No need for an else block as we've already set the appropriate states for new products
  }, [id, isNewProduct, toast]);

  const handleSuccess = () => {
    toast({
      title: `Product ${isNewProduct ? 'created' : 'updated'} successfully`,
      description: `The product has been ${isNewProduct ? 'added to' : 'updated in'} your inventory.`,
    });
    navigate("/admin/products");
  };

  // Show loading indicator while checking if an existing product exists
  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <AdminLayout>
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading product information...</p>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // Only show product not found for edit attempts on non-existent products
  if (!isNewProduct && !productExists) {
    return (
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <AdminLayout>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Product Not Found</h1>
            </div>
            
            <ModernCard className="py-16">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">This product doesn't exist</h2>
                <p className="text-muted-foreground mb-6">
                  {error || "The product you're trying to access could not be found."}
                </p>
                <Button onClick={() => navigate("/admin/products")}>
                  Back to Products
                </Button>
              </div>
            </ModernCard>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // Render form for new product or existing product that exists
  return (
    <ProtectedRoute requiredRole={["admin", "super_admin"]}>
      <AdminLayout>
        <div className="flex flex-col gap-6">
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">{isNewProduct ? "Create Product" : productName}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">
                {isNewProduct ? "Create Product" : `Edit ${productName}`}
              </h1>
            </div>
            
            {!isNewProduct && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/product/${id}`)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Product
                </Button>
              </div>
            )}
          </div>
          
          <ModernCard 
            title={isNewProduct ? "Create a New Product" : "Edit Product Details"}
            description={isNewProduct 
              ? "Add a new product to your inventory." 
              : "Update the details of this product."}
            className="bg-card/50 backdrop-blur-sm border-muted/80 dark:border-muted/30"
          >
            <ProductForm 
              productId={isNewProduct ? undefined : id} 
              onSuccess={handleSuccess} 
            />
          </ModernCard>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default ProductEditPage;
