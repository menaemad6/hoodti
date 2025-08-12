import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GlassCard from "@/components/ui/glass-card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Plus, Edit, Trash2, Image, LayoutGrid, GalleryVerticalEnd, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/admin/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  uploadCategoryImage,
  CategoryInput
} from "@/integrations/supabase/categories.service";
import { CategoryRow } from "@/integrations/supabase/types.service";
import { useCurrentTenant } from "@/context/TenantContext";
import SEOHead from "@/components/seo/SEOHead";
import { useSEOConfig } from "@/lib/seo-config";

interface CategoryFormData {
  id?: string;
  name: string;
  description: string;
  image: string;
  imageFile?: File | null;
}

const ContentPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFormData | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    image: "",
    imageFile: null
  });
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const currentTenant = useCurrentTenant();
  const seoConfig = useSEOConfig('adminContent');

  const fetchCategories = async () => {
    console.log('Fetching categories...');
    setIsLoading(true);
    try {
      const data = await getCategories(currentTenant.id);
      console.log('Categories fetched successfully:', data);
      setCategories(data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      // Only show the toast if it's not the initial load
      if (!isLoading) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load categories.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab, currentTenant]);

  const handleDeleteCategory = async (categoryId: string) => {
    console.log(`Attempting to delete category with ID: ${categoryId}`);
    try {
      await deleteCategory(categoryId);
      console.log(`Category ${categoryId} deleted successfully`);
      
      // Update local state
      setCategories(prev => {
        const filtered = prev.filter((category) => category.id !== categoryId);
        console.log('Updated categories after deletion:', filtered);
        return filtered;
      });
      
      toast({
        title: "Category Deleted",
        description: "The category has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete category. It may be in use by products.",
      });
    }
  };
  
  const openCategoryModal = (category?: CategoryRow) => {
    if (category) {
      // Editing an existing category
      setEditingCategory({
        id: category.id,
        name: category.name,
        description: category.description || "",
        image: category.image || "",
      });
      setFormData({
        id: category.id,
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        imageFile: null
      });
      setImagePreview(category.image || null);
    } else {
      // Adding a new category
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        image: "",
        imageFile: null
      });
      setImagePreview(null);
    }
    setCategoryModalOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate the form data
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }
      
      let imageUrl = formData.image;
      
      // Upload image if a new file was selected
      if (formData.imageFile) {
        try {
          imageUrl = await uploadCategoryImage(formData.imageFile);
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          throw new Error(`Image upload failed: ${uploadError.message || 'Unknown error'}`);
        }
      }
      
      const categoryData: CategoryInput = {
        name: formData.name,
        description: formData.description,
        image: imageUrl
      };
      
      if (editingCategory?.id) {
        // Update existing category
        try {
          console.log(`Updating category ${editingCategory.id} with data:`, categoryData);
          const updatedCategory = await updateCategory(editingCategory.id, categoryData);
          console.log('Category updated successfully:', updatedCategory);
          
          // Update the categories state with the new data
          setCategories(prev => {
            const updatedList = prev.map(cat => 
              cat.id === updatedCategory.id ? updatedCategory : cat
            );
            console.log('Updated categories list:', updatedList);
            return updatedList;
          });
          
          toast({
            title: "Category Updated",
            description: "The category has been updated successfully.",
          });
          
          // Close modal and reset form
          setCategoryModalOpen(false);
          setEditingCategory(null);
          setFormData({
            name: "",
            description: "",
            image: "",
            imageFile: null
          });
          setImagePreview(null);
          
          // Refresh categories list
          fetchCategories();
          
        } catch (updateError: any) {
          console.error('Update category error:', updateError);
          throw new Error(`Failed to update category: ${updateError.message || 'Unknown error'}`);
        }
      } else {
        // Create new category
        try {
          console.log('Creating new category with data:', categoryData);
          const newCategory = await createCategory(categoryData);
          console.log('Category created successfully:', newCategory);
          
          setCategories(prev => [...prev, newCategory]);
          
          toast({
            title: "Category Created",
            description: "The new category has been created successfully.",
          });
          
          // Close modal and reset form
          setCategoryModalOpen(false);
          setEditingCategory(null);
          setFormData({
            name: "",
            description: "",
            image: "",
            imageFile: null
          });
          setImagePreview(null);
          
          // Refresh categories list
          fetchCategories();
          
        } catch (createError: any) {
          console.error('Create category error:', createError);
          throw new Error(`Failed to create category: ${createError.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save category due to an unknown error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryColumns = [
    {
      id: "image",
      header: "Image",
      cell: ({ row }: { row: any }) => (
        <div className="h-10 w-10 rounded-md overflow-hidden">
          <img
            src={row.original.image}
            alt={row.original.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
      ),
    },
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: ({ row }: { row: any }) => (
        <div className="max-w-xs truncate">{row.original.description}</div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: any }) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => openCategoryModal(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this category? This action cannot be undone.
                  Products in this category will be unassigned.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteCategory(row.original.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={["admin", "super_admin"]}>
      <AdminLayout>
        <SEOHead {...seoConfig} />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Content Management</h1>
            <div className="flex flex-wrap gap-2">
              {activeTab === "categories" && (
                <Button className="gap-2" onClick={() => openCategoryModal()}>
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              )}
              {activeTab === "banners" && (
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Banner
                </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
              <TabsTrigger value="categories" className="flex items-center gap-1">
                <LayoutGrid className="h-4 w-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="banners" className="flex items-center gap-1">
                <GalleryVerticalEnd className="h-4 w-4" />
                Banners
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <GlassCard>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage product categories in your store.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={categories}
                    columns={categoryColumns}
                    isLoading={isLoading}
                    searchable={true}
                    searchPlaceholder="Search categories..."
                  />
                </CardContent>
              </GlassCard>
            </TabsContent>

            <TabsContent value="banners">
              <GlassCard>
                <CardHeader>
                  <CardTitle>Banners</CardTitle>
                  <CardDescription>Manage promotional banners for your store.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Banners Coming Soon</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Banner management will be available in a future update. Check back soon for this feature.
                    </p>
                  </div>
                </CardContent>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Category Add/Edit Modal */}
        <Dialog 
          open={categoryModalOpen} 
          onOpenChange={(open) => {
            if (!open && !isSubmitting) {
              console.log('Closing category modal');
              setCategoryModalOpen(false);
              // Reset form when closing
              if (!isSubmitting) {
                setEditingCategory(null);
                setFormData({
                  name: "",
                  description: "",
                  image: "",
                  imageFile: null
                });
                setImagePreview(null);
              }
            }
          }}
        >
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? "Update the details of this product category." 
                  : "Create a new product category for your store."}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="required">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Category name"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Category description"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="relative w-full max-w-[140px] aspect-square rounded-md overflow-hidden border border-input bg-muted/40">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted/40">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 500x500px. Max file size: 2MB.
                      </p>
                      {formData.image && !formData.imageFile && (
                        <p className="text-xs text-muted-foreground">
                          Current image: <a href={formData.image} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    console.log('Cancel button clicked');
                    setCategoryModalOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default ContentPage;
