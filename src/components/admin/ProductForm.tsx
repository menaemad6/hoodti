import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, Image as ImageIcon, X, Trash2, AlertCircle, Plus, ChevronDown, Check } from "lucide-react";
import { Product, Category } from "@/integrations/supabase/types.service";
import { uploadProductImage } from "@/integrations/supabase/storage.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  category_id: string;
  stock: number;
  unit: string;
  featured: boolean;
  discount: number | null;
  is_new: boolean;
  image?: string | null;
  size?: string[] | string;
  color?: string[] | string;
  material?: string;
  brand?: string;
  gender?: string;
}

// Predefined options for sizes and colors
const COLOR_OPTIONS = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", 
  "Gray", "Purple", "Pink", "Brown", "Orange", "Navy"
];

const SIZE_OPTIONS = [
  "XS", "S", "M", "L", "XL", "XXL", "XXXL", 
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "One Size"
];

// Custom MultiSelect component for sizes and colors
const MultiSelect = ({ 
  options, 
  selectedValues, 
  onChange, 
  placeholder,
  label
}: { 
  options: string[], 
  selectedValues: string[], 
  onChange: (values: string[]) => void,
  placeholder: string,
  label: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(val => val !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };
  
  return (
    <div className="relative">
      <div 
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "cursor-pointer"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
          {selectedValues.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedValues.map(value => (
              <Badge 
                key={value} 
                variant="secondary" 
                className="px-2 py-0.5 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(value);
                }}
              >
                {value}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 rounded-md border border-input bg-background shadow-md max-h-[200px] overflow-auto">
          <div className="p-2 space-y-1">
            {options.map(option => (
              <div 
                key={option} 
                className={cn(
                  "flex items-center space-x-2 text-sm rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent",
                  selectedValues.includes(option) ? "bg-accent/50" : ""
                )}
                onClick={() => toggleOption(option)}
              >
                <div className="flex-shrink-0 w-4 h-4 border rounded-sm flex items-center justify-center border-primary">
                  {selectedValues.includes(option) && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductForm: React.FC<ProductFormProps> = ({ productId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Selected sizes and colors for multi-select
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    original_price: null,
    category_id: "",
    stock: 0,
    unit: "item",
    featured: false,
    discount: null,
    is_new: false,
    size: [],
    color: [],
    material: "",
    brand: "",
    gender: ""
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadInProgressRef = React.useRef<boolean>(false);
  
  // Parse string arrays from Supabase
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
  
  // Load categories and product data if editing
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*");
        
        if (error) throw error;
        setCategories(data || []);
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Error fetching categories:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories. Please try again.",
        });
      }
    };
    
    const fetchProduct = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setFormData({
            ...data,
          });
          
          // Parse colors and sizes arrays from the database
          const colors = parseArrayField(data.color);
          const sizes = parseArrayField(data.size);
          
          setSelectedColors(colors);
          setSelectedSizes(sizes);
          
          if (data.image) {
            setImagePreview(data.image);
          }
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Error fetching product:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ProductFormData) => ({
      ...prev,
      [name]: name === "price" || name === "stock" || name === "original_price" || name === "discount" 
        ? value === "" ? null : Number(value)
        : value,
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev: ProductFormData) => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: ProductFormData) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image || null;
    
    // Prevent duplicate uploads in StrictMode
    if (uploadInProgressRef.current) {
      console.log("Upload already in progress, ignoring duplicate request");
      // Wait for the first upload to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      // If we have a URL stored, return it (the first upload should have succeeded)
      if (imagePreview && imagePreview.startsWith('http')) {
        return imagePreview;
      }
      return formData.image || null;
    }
    
    uploadInProgressRef.current = true;
    console.log("Starting image upload...");
    
    try {
      // Generate a unique filename
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `product_${Date.now()}.${fileExt}`;
      
      console.log(`Uploading file ${fileName} to products bucket`);
      
      // First, check if the products bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log("Available buckets:", buckets);
      
      // Create the products bucket if it doesn't exist
      if (!buckets?.some(bucket => bucket.name === "products")) {
        console.log("Products bucket not found, attempting to create it");
        try {
          const { data, error } = await supabase.storage.createBucket("products", {
            public: true
          });
          if (error) throw error;
          console.log("Created products bucket:", data);
        } catch (bucketError) {
          console.log("Could not create bucket, will try to upload anyway:", bucketError);
        }
      }
      
      // Direct approach to upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("products")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: true,
        });
      
      if (error) {
        console.error("Upload error details:", error);
        
        if (error.message.includes("row-level security") || error.message.includes("403")) {
          throw new Error("Permission denied. Please ensure your Supabase storage bucket has the correct RLS policies.");
        }
        
        throw error;
      }
      
      if (!data?.path) {
        throw new Error("Upload succeeded but no file path was returned");
      }
      
      // Get the correct public URL that works
      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(data.path);
      
      let publicUrl = publicUrlData.publicUrl;
      
      // Fix for "render/image" vs "object/public" URL issue
      if (publicUrl.includes("/render/image/")) {
        publicUrl = publicUrl.replace("/render/image/", "/object/");
      }
      
      console.log("Successfully uploaded image with URL:", publicUrl);
      return publicUrl;
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error uploading image:", err);
      throw new Error(`Failed to upload product image: ${err.message}`);
    } finally {
      // Reset the upload in progress flag
      uploadInProgressRef.current = false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category_id) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Upload image if selected
      let imageUrl = formData.image;
      if (imageFile) {
        try {
          imageUrl = await uploadImage();
          console.log("Image uploaded successfully with URL:", imageUrl);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast({
            variant: "destructive",
            title: "Image Upload Failed",
            description: "Failed to upload product image, but you can continue without an image.",
          });
          // Continue without image - will use default instead
        }
      }
      
      // Default placeholder image if no image is uploaded
      const defaultImageUrl = "/placeholder.svg";
      
      // Ensure the image URL is properly formatted
      // Fix the bucket not found issue by ensuring URLs use object/public format
      if (imageUrl && imageUrl.includes("/render/image/")) {
        imageUrl = imageUrl.replace("/render/image/", "/object/public/");
        console.log("Fixed image URL format:", imageUrl);
      }
      
      // Save selected sizes and colors as JSON strings
      const sizesJson = selectedSizes.length ? JSON.stringify(selectedSizes) : null;
      const colorsJson = selectedColors.length ? JSON.stringify(selectedColors) : null;
      
      // Create the product data object with required fields
      const productData = {
        ...formData,
        // Ensure all required fields have values
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category_id: formData.category_id,
        unit: formData.unit || "item",
        image: imageUrl || defaultImageUrl, // Use default placeholder if no image
        // Optional fields with proper default values
        featured: formData.featured || false,
        is_new: formData.is_new || false,
        discount: formData.discount,
        original_price: formData.original_price,
        // Clothing-specific fields with multi-select values
        size: sizesJson,
        color: colorsJson,
        material: formData.material,
        brand: formData.brand,
        gender: formData.gender
      };
      
      console.log("Saving product data:", productData);
      console.log("Final image URL to be saved:", productData.image);
      
      if (productId) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);
        
        if (error) {
          console.error("Supabase update error:", error);
          throw new Error(error.message);
        }
        
        toast({
          title: "Product Updated",
          description: "The product has been updated successfully.",
        });
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select();
        
        if (error) {
          console.error("Supabase insert error:", error);
          throw new Error(error.message);
        }
        
        console.log("Created product with data:", data);
        
        toast({
          title: "Product Created",
          description: "The product has been created successfully.",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/admin/products");
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error saving product:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save product. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteProduct = async () => {
    if (!productId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (error) throw error;
      
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      });
      
      navigate("/admin/products");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error deleting product:", err);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "Failed to delete product. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                required
                placeholder="Enter product description"
                className="min-h-[120px]"
              />
            </div>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ""}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price (USD)</Label>
                <Input
                  id="original_price"
                  name="original_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.original_price || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock || ""}
                  onChange={handleChange}
                  required
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit || "item"}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="pair">Pair</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={formData.category_id || ""}
                onValueChange={(value) => handleSelectChange("category_id", value)}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                name="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount || ""}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            {/* Clothing-specific fields */}
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Product Details</h3>
              <Separator className="mb-4" />
              
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="size">Available Sizes</Label>
                  <MultiSelect
                    options={SIZE_OPTIONS}
                    selectedValues={selectedSizes}
                    onChange={setSelectedSizes}
                    placeholder="Select sizes"
                    label="Sizes"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">Available Colors</Label>
                  <MultiSelect
                    options={COLOR_OPTIONS}
                    selectedValues={selectedColors}
                    onChange={setSelectedColors}
                    placeholder="Select colors"
                    label="Colors"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    name="material"
                    value={formData.material || ""}
                    onChange={handleChange}
                    placeholder="Cotton, Polyester, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand || ""}
                    onChange={handleChange}
                    placeholder="Brand name"
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="mx-auto max-h-64 rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center justify-center h-64"
                  >
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured">Featured Product</Label>
                  <p className="text-xs text-muted-foreground">
                    Display this product on the featured section.
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured || false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("featured", checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_new">New Product</Label>
                  <p className="text-xs text-muted-foreground">
                    Mark this product as new.
                  </p>
                </div>
                <Switch
                  id="is_new"
                  checked={formData.is_new || false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_new", checked)
                  }
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
      
      {/* Danger Zone - Only show for existing products */}
      {productId && (
        <div className="mt-12">
          <Separator className="my-6" />
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                <CardTitle className="text-destructive text-lg">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Actions in this area can lead to permanent data loss. Please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
                  <div>
                    <p className="font-medium">Delete this product</p>
                    <p className="text-sm text-muted-foreground">
                      Once deleted, this product will be permanently removed from your inventory.
                      This action cannot be undone.
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isDeleting}
                    className="shrink-0 ml-4"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Product
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteProduct()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                "Delete"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductForm;
