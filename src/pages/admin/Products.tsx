import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import GlassCard from "@/components/ui/glass-card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload,
  Filter,
  ArrowUpDown,
  Check,
  Star,
  TagIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrentTenant } from "@/context/TenantContext";
import { getCategories } from "@/integrations/supabase/categories.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";
import { formatPrice } from "../../lib/utils";

interface DataColumn {
  id: string;
  header: string | (() => React.ReactNode);
  accessorFn: ((row: any) => React.ReactNode) | string;
}

// Add utility function to parse array fields
const parseArrayField = (field: string | string[] | null | undefined): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    // If it's a JSON string, parse it
    const parsed = JSON.parse(field as string);
    return Array.isArray(parsed) ? parsed : [field as string];
  } catch (e) {
    // If it can't be parsed as JSON, treat it as a single value
    return [field as string];
  }
};

// Parse sizes from JSON object with style types
const parseSizesWithStyles = (sizesField: string | null | undefined): { style: string; sizes: string[] }[] => {
  if (!sizesField) return [];
  try {
    const sizesObj = JSON.parse(sizesField as string);
    if (typeof sizesObj === 'object' && !Array.isArray(sizesObj)) {
      return Object.entries(sizesObj).map(([style, sizes]) => ({
        style,
        sizes: Array.isArray(sizes) ? sizes : []
      }));
    }
    // If it's just an array, return it as a single style
    if (Array.isArray(sizesObj)) {
      return [{ style: 'Default', sizes: sizesObj }];
    }
  } catch (e) {
    // If parsing fails, check if it's already an array
    if (Array.isArray(sizesField)) {
      return [{ style: 'Default', sizes: sizesField }];
    }
    // Return as a single value
    return [{ style: 'Default', sizes: [sizesField as string] }];
  }
  return [];
};

// Add constants for predefined options, matching ProductForm
const COLOR_OPTIONS = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", 
  "Gray", "Purple", "Pink", "Brown", "Orange", "Navy"
];

const SIZE_OPTIONS = [
  "XS", "S", "M", "L", "XL", "XXL", "XXXL", 
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "One Size"
];

const ProductsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentTenant = useCurrentTenant();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    price: "",
    size: "",
    color: "",
    gender: ""
  });
  const seoConfig = useSEOConfig('adminProducts');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Use tenant-aware query
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories(currentTenant.id);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentTenant]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      setProducts(products.filter((product) => product.id !== productId));
      
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product. Please try again.",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", selectedProducts);

      if (error) throw error;

      setProducts(products.filter((product) => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      
      toast({
        title: "Products Deleted",
        description: `Successfully deleted ${selectedProducts.length} products.`,
      });
    } catch (error: any) {
      console.error("Error deleting products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete products. Please try again.",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      status: "",
      price: "",
      size: "",
      color: "",
      gender: ""
    });
  };

  const handleRowClick = (row: any) => {
    navigate(`/admin/products/edit/${row.id}`);
  };

  const columns: Column<any>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedProducts.length === products.length && products.length > 0}
          onCheckedChange={toggleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedProducts.includes(row.original.id)}
          onCheckedChange={() => toggleSelectProduct(row.original.id)}
          aria-label={`Select ${row.original.name}`}
        />
      ),
    },
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
            <img
              src={Array.isArray(row.original.images) && row.original.images.length > 0 ? row.original.images[0] : "/placeholder.svg"}
              alt={row.original.name}
              className="h-full w-full object-cover transition-all duration-300 hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">{row.original.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.original.category?.name || "Uncategorized"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(row.original.price)}</div>
          {row.original.original_price && (
            <span className="text-xs text-red-500 dark:text-red-400 line-through">
              {formatPrice(row.original.original_price)}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "clothing_details",
      header: "Product Details",
      cell: ({ row }) => {
        // Parse sizes with styles and colors as arrays
        const sizeStyles = parseSizesWithStyles(row.original.size);
        const colors = parseArrayField(row.original.color);
        
        return (
          <div className="text-left">
            <div className="flex flex-col gap-1 mb-1">
              {sizeStyles.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sizes:</span>
                  {sizeStyles.map((styleItem, styleIndex) => (
                    <div key={styleIndex} className="flex flex-wrap items-center gap-1 ml-1">
                      {styleItem.style !== 'Default' && (
                        <span className="text-xs text-gray-600 dark:text-gray-300 italic mr-1">
                          {styleItem.style}:
                        </span>
                      )}
                      {styleItem.sizes.map((size, sizeIndex) => (
                        <Badge 
                          key={sizeIndex}
                          variant="outline" 
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-xs px-1.5 py-0.5"
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-1 mb-1">
              {colors.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Colors:</span>
                  <div className="flex flex-wrap items-center gap-1 ml-1">
                    {colors.map((color, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="flex items-center bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 text-xs px-1.5 py-0.5"
                      >
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-1" 
                          style={{ 
                            backgroundColor: 
                              ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray']
                                .includes(color.toLowerCase()) 
                                ? color.toLowerCase()
                                : '#888' 
                          }}
                        ></span>
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-1 mb-1">
              {row.original.gender && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gender:</span>
                  <div className="flex flex-wrap items-center gap-1 ml-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                      {row.original.gender}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              {row.original.brand && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Brand:</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 ml-1">
                    {row.original.brand}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant={row.original.stock > 10 ? "outline" : "destructive"} className={row.original.stock > 10 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"}>
            {row.original.stock} {row.original.unit}
          </Badge>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.featured && (
            <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-none shadow-sm">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
          {row.original.is_new && (
            <Badge variant="default" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none shadow-sm">
              New
            </Badge>
          )}
          {row.original.discount && (
            <Badge variant="default" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-none shadow-sm">
              <TagIcon className="h-3 w-3 mr-1" /> {row.original.discount}% Off
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] p-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg backdrop-blur-sm">
              <DropdownMenuItem onClick={() => navigate(`/products/${row.original.id}`)} className="cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                <Eye className="mr-2 h-4 w-4 text-blue-500" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/admin/products/edit/${row.original.id}`)} className="cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                <Edit className="mr-2 h-4 w-4 text-amber-500" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-gray-200 dark:border-gray-700" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl text-gray-900 dark:text-gray-100">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                      This action cannot be undone. This will permanently delete the
                      product from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteProduct(row.original.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={["admin", "super_admin"]}>
      <AdminLayout>
        <SEOHead {...seoConfig} />
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 p-3 sm:p-4 md:p-6 backdrop-blur-sm border border-white/10 dark:border-gray-800/40 shadow-lg">
            <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 bg-[size:var(--grid-size)_var(--grid-size)] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 relative">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">Products</h1>
              <div className="flex w-full sm:w-auto justify-center sm:justify-end gap-2">
                <Button 
                  onClick={() => navigate("/admin/products/new")} 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>
          </div>

          <GlassCard className="mt-8 overflow-hidden backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/20 dark:border-gray-800/30 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white/60 dark:from-gray-900/70 dark:to-gray-900/40 border-b border-gray-100 dark:border-gray-800/30">
              <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">Product Management</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">View and manage your store's products.</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-3 pb-3 sm:pb-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/30 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                      <SelectTrigger className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="discounted">Discounted</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filters.price}
                      onValueChange={(value) => setFilters({ ...filters, price: value })}
                    >
                      <SelectTrigger className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                        <SelectValue placeholder="Price" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <SelectItem value="default">Default Sorting</SelectItem>
                        <SelectItem value="low">Price: Low to High</SelectItem>
                        <SelectItem value="high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                
                    <Select
                      value={filters.size}
                      onValueChange={(value) => setFilters({ ...filters, size: value })}
                    >
                      <SelectTrigger className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <SelectItem value="all">All Sizes</SelectItem>
                        {SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.color}
                      onValueChange={(value) => setFilters({ ...filters, color: value })}
                    >
                      <SelectTrigger className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <SelectItem value="all">All Colors</SelectItem>
                        {COLOR_OPTIONS.map((color) => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.gender}
                      onValueChange={(value) => setFilters({ ...filters, gender: value })}
                    >
                      <SelectTrigger className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="kids">Kids</SelectItem>
                        <SelectItem value="unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center sm:justify-end mt-2">
                    <Button 
                      variant="outline" 
                      className="whitespace-nowrap w-full sm:w-auto bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                      onClick={resetFilters}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Reset Filters
                    </Button>
                  </div>
                </div>
                
                {selectedProducts.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 p-4 rounded-xl backdrop-blur-sm border border-blue-200/30 dark:border-blue-500/20 flex items-center justify-between mb-4 shadow-sm">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                    </p>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl text-gray-900 dark:text-gray-100">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                              This action cannot be undone. This will permanently delete
                              {selectedProducts.length === 1
                                ? " the selected product"
                                : ` all ${selectedProducts.length} selected products`}
                              from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleBulkDelete}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
                
                <DataTable
                  data={products}
                  columns={columns}
                  isLoading={isLoading}
                  onRowClick={handleRowClick}
                  pagination={{
                    pageIndex: currentPage,
                    pageSize,
                    pageCount: totalPages,
                    onPageChange: setCurrentPage,
                    onPageSizeChange: setPageSize,
                  }}
                  searchable={true}
                  searchPlaceholder="Search products..."
                  tableClassName="border-separate border-spacing-0 rounded-xl overflow-hidden shadow-sm"
                  tableHeaderClassName="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
                  tableRowClassName="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-150"
                  paginationClassName="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-b-xl border-t border-gray-200 dark:border-gray-700"
                  searchInputClassName="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                />
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default ProductsPage;
