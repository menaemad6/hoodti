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
import { useCurrentTenant } from "@/context/TenantContext";
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
import { PRODUCT_TYPE_OPTIONS, SIZING_OPTIONS } from "@/lib/constants";

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
  images?: string[] | null;
  videos?: string[] | null;
  type?: string;
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
  label,
  sizingOptions
}: { 
  options: string[], 
  selectedValues: string[], 
  onChange: (values: string[]) => void,
  placeholder: string,
  label: string,
  sizingOptions?: { type: string }[]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const toggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(val => val !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };
  
  return (
    <div className="relative" ref={ref}>
      <div 
        className={cn(
          "flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "cursor-pointer"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1 overflow-hidden py-1">
          {selectedValues.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedValues.map(value => {
              const hasSizing = sizingOptions && sizingOptions.some(opt => opt.type === value);
              return (
                <Badge 
                  key={value} 
                  variant="secondary" 
                  className="px-2 py-0.5 text-xs flex items-center gap-1 my-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(value);
                  }}
                >
                  {value}
                  {sizingOptions && !hasSizing && (
                    <AlertCircle className="h-3 w-3 text-orange-500" title="No sizing settings for this type" />
                  )}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              );
            })
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 rounded-md border border-input bg-background shadow-md max-h-[200px] overflow-auto">
          <div className="p-2 space-y-1">
            {options.map(option => {
              const hasSizing = sizingOptions && sizingOptions.some(opt => opt.type === option);
              return (
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
                  <span className="truncate">{option}</span>
                  {sizingOptions && !hasSizing && (
                    <span className="ml-2 text-xs text-orange-500 flex items-center gap-1 flex-shrink-0">
                      <AlertCircle className="h-3 w-3" />
                      <span className="hidden sm:inline">No settings</span>
                    </span>
                  )}
                </div>
              );
            })}
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
  
  // Add MultiSelect for product type
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Add state for sizes per type
  const [selectedSizesByType, setSelectedSizesByType] = useState<Record<string, string[]>>({});
  
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
    gender: "",
    images: [],
    videos: [],
    type: ""
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentTenant = useCurrentTenant();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadInProgressRef = React.useRef<boolean>(false);
  
  // Add state for new images (not yet saved)
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  // Add state for videos
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  
  // Parse string arrays from Supabase
  const parseArrayField = (field: string | string[] | null | undefined): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch (e) {
      return [field];
    }
  };
  
  // Load categories and product data if editing
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq('tenant_id', currentTenant.id);
        
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
            unit: data.unit || "item",
          });
          
          // Parse colors and sizes arrays from the database
          const colors = parseArrayField(data.color);
          const sizes = parseArrayField(data.size);
          const videos = parseArrayField((data as any).videos);
          
          setSelectedColors(colors);
          setSelectedSizes(sizes);
          setVideoUrls(videos);
          
          if (data.image) {
            setImagePreview(data.image);
          }
          
          // When fetching product, parse types and sizes
          if ((data as any).type) {
            const types = parseArrayField((data as any).type);
            setSelectedTypes(types);
          }
          if (data.size) {
            try {
              const parsed = typeof data.size === 'string' ? JSON.parse(data.size) : data.size;
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                setSelectedSizesByType(parsed);
              } else if (Array.isArray(parsed)) {
                // fallback: flat array, assign to all types
                const sizesByType: Record<string, string[]> = {};
                (selectedTypes || []).forEach(type => { sizesByType[type] = parsed; });
                setSelectedSizesByType(sizesByType);
              }
            } catch {
              // fallback: treat as single value
              if (typeof data.size === 'string') {
                const sizesByType: Record<string, string[]> = {};
                (selectedTypes || []).forEach(type => { sizesByType[type] = [data.size]; });
                setSelectedSizesByType(sizesByType);
              }
            }
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
  }, [productId, toast, currentTenant.id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ProductFormData) => ({
      ...prev,
      [name]: name === "price" || name === "original_price" || name === "discount" 
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    // Reset file input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };
  
  // Video handling functions
  const addVideoUrl = () => {
    setVideoUrls(prev => [...prev, ""]);
  };
  
  const updateVideoUrl = (index: number, url: string) => {
    setVideoUrls(prev => prev.map((video, i) => i === index ? url : video));
  };
  
  const removeVideoUrl = (index: number) => {
    setVideoUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Helper function to extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
      // Upload new images and collect URLs
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        try {
          const url = await uploadProductImage(file);
          uploadedUrls.push(url);
        } catch (uploadError) {
          toast({
            variant: "destructive",
            title: "Image Upload Failed",
            description: "Failed to upload one or more product images.",
          });
        }
      }
      // Merge with existing images
      let allImages = (formData.images || []).concat(uploadedUrls);
      if (allImages.length === 0) {
        allImages = ["/placeholder.svg"];
      }
      // Save selected sizes and colors as JSON strings (optional)
      const colorsJson = selectedColors.length ? JSON.stringify(selectedColors) : null;
      // Save selected types as JSON string (optional)
      const typesJson = selectedTypes.length ? JSON.stringify(selectedTypes) : null;
      // Build the nested sizes object (optional)
      const sizesJson = Object.keys(selectedSizesByType || {}).length
        ? JSON.stringify(selectedSizesByType)
        : null;
      // Filter out empty video URLs and validate YouTube URLs
      const validVideos = videoUrls.filter(url => url.trim() !== "" && extractYouTubeId(url.trim()));
      // Prepare productData for insert/update
      const productData = {
        ...formData,
        images: allImages,
        videos: validVideos,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category_id: formData.category_id,
        tenant_id: currentTenant.id,
        unit: formData.unit || "item",
        featured: formData.featured || false,
        is_new: formData.is_new || false,
        discount: formData.discount,
        original_price: formData.original_price,
        size: sizesJson,
        color: colorsJson,
        material: formData.material && formData.material.trim() !== "" ? formData.material.trim() : null,
        brand: formData.brand && formData.brand.trim() !== "" ? formData.brand.trim() : null,
        gender: formData.gender && formData.gender.trim() !== "" ? formData.gender.trim() : null,
        type: typesJson
      } as any;
      // Save to DB
      if (productId) {
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
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select();
        if (error) {
          console.error("Supabase insert error:", error);
          throw new Error(error.message);
        }
        toast({
          title: "Product Created",
          description: "The product has been created successfully.",
        });
      }
      // Reset new images after save
      setNewImageFiles([]);
      setNewImagePreviews([]);
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
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
              
              {/* Product Type MultiSelect */}
              {currentTenant.productsOptions?.types !== false && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="type">Product Type Sizing Options</Label>
                <MultiSelect
                  options={PRODUCT_TYPE_OPTIONS}
                  selectedValues={selectedTypes}
                  onChange={setSelectedTypes}
                  placeholder="Select product types"
                  label="Product Types"
                  sizingOptions={SIZING_OPTIONS}
                />
              </div>
              )}

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {/* Sizes MultiSelect grouped by type - only show if sizes option is enabled */}
                {currentTenant.productsOptions?.sizes !== false && (
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="size">Available Sizes</Label>
                    {selectedTypes.length === 0 ? (
                      <div className="text-muted-foreground text-xs">Select product types to see size options.</div>
                    ) : (
                      selectedTypes.map((type) => {
                        const sizing = SIZING_OPTIONS.find(opt => opt.type === type) || SIZING_OPTIONS.find(opt => opt.type === 'Other');
                        if (!sizing) return null;
                        const isDefault = sizing.type === 'Other';
                        return (
                          <div key={type} className="mb-2">
                            <div className="font-semibold text-xs mb-1 text-primary flex flex-wrap items-center gap-2">
                              <span>{type}</span>
                              {isDefault && (
                                <span className="text-xs text-orange-500 bg-orange-50 rounded px-2 py-0.5">Default Sizing</span>
                              )}
                            </div>
                            <MultiSelect
                              options={sizing.sizes.map(s => s.size)}
                              selectedValues={selectedSizesByType[type] || []}
                              onChange={(values) => setSelectedSizesByType(prev => ({ ...prev, [type]: values }))}
                              placeholder={`Select sizes for ${type}`}
                              label={`Sizes for ${type}`}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
                
                {/* Colors MultiSelect - only show if colors option is enabled */}
                {currentTenant.productsOptions?.colors !== false && (
                  <div className="space-y-2">
                    <Label htmlFor="color">Available Colors</Label>
                    <MultiSelect
                      options={COLOR_OPTIONS}
                      selectedValues={selectedColors}
                      onChange={setSelectedColors}
                      placeholder="Select colors"
                      label="Colors"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid gap-4 grid-cols-2 mt-4">
                {/* Material input - only show if materials option is enabled */}
                {currentTenant.productsOptions?.materials !== false && (
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
                )}
                
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
              
              {/* Gender select - only show if gender option is enabled */}
              {currentTenant.productsOptions?.gender !== false && (
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
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Product Images</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                {(formData.images && formData.images.length > 0) || newImagePreviews.length > 0 ? (
                  <div className="flex flex-wrap gap-4 justify-center">
                    {/* Existing images (already saved) */}
                    {formData.images && formData.images.map((img, idx) => (
                      <div key={"existing-" + idx} className="relative">
                        <img
                          src={img}
                          alt={`Product preview ${idx + 1}`}
                          className="mx-auto max-h-32 rounded-lg object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {/* New images (not yet saved) */}
                    {newImagePreviews.map((preview, idx) => (
                      <div key={"new-" + idx} className="relative">
                        <img
                          src={preview}
                          alt={`New product preview ${idx + 1}`}
                          className="mx-auto max-h-32 rounded-lg object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center justify-center h-64"
                  >
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF up to 2MB each
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Product Videos Section */}
            <div className="space-y-2">
              <Label htmlFor="videos">Product Videos</Label>
              <p className="text-xs text-muted-foreground">
                Add YouTube video URLs to showcase your product
              </p>
              <div className="space-y-3">
                {videoUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => updateVideoUrl(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVideoUrl(index)}
                      className="shrink-0"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVideoUrl}
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Add Video
                </Button>
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
