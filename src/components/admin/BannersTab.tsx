import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "@/components/ui/glass-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  getBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner,
  uploadBannerImage,
  BannerInput
} from "@/integrations/supabase/banners.service";
import { BannerRow } from "@/integrations/supabase/types.service";
import { PlusCircle, Pencil, Trash2, Image, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { format } from "date-fns";
import { useCurrentTenant } from "@/context/TenantContext";

interface BannerFormData {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  position: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  imageFile?: File | null;
}

const BannersTab: React.FC = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Banner modal state
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerFormData | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    position: 0,
    is_active: true,
    start_date: "",
    end_date: "",
    imageFile: null
  });
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const currentTenant = useCurrentTenant();

  const fetchBanners = async () => {
    console.log('Fetching banners...');
    setIsLoading(true);
    try {
      const data = await getBanners(currentTenant.id);
      console.log('Banners fetched successfully:', data);
      setBanners(data);
    } catch (error: unknown) {
      console.error("Error fetching banners:", error);
      if (!isLoading) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (error as Error)?.message || "Failed to load banners.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentTenant.id]);

  const handleDeleteBanner = async (bannerId: string) => {
    console.log(`Attempting to delete banner with ID: ${bannerId}`);
    try {
      await deleteBanner(bannerId);
      console.log(`Banner ${bannerId} deleted successfully`);
      
      // Update local state
      setBanners(prev => {
        const filtered = prev.filter((banner) => banner.id !== bannerId);
        console.log('Updated banners after deletion:', filtered);
        return filtered;
      });
      
      toast({
        title: "Banner Deleted",
        description: "The banner has been deleted successfully.",
      });
    } catch (error: unknown) {
      console.error("Error deleting banner:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error)?.message || "Failed to delete banner.",
      });
    }
  };
  
  const openBannerModal = (banner?: BannerRow) => {
    if (banner) {
      // Editing an existing banner
      setEditingBanner({
        id: banner.id,
        title: banner.title,
        description: banner.description || "",
        image_url: banner.image_url,
        link_url: banner.link_url || "",
        position: banner.position || 0,
        is_active: banner.is_active,
        start_date: banner.start_date ? format(new Date(banner.start_date), 'yyyy-MM-dd') : "",
        end_date: banner.end_date ? format(new Date(banner.end_date), 'yyyy-MM-dd') : "",
      });
      setFormData({
        id: banner.id,
        title: banner.title,
        description: banner.description || "",
        image_url: banner.image_url,
        link_url: banner.link_url || "",
        position: banner.position || 0,
        is_active: banner.is_active,
        start_date: banner.start_date ? format(new Date(banner.start_date), 'yyyy-MM-dd') : "",
        end_date: banner.end_date ? format(new Date(banner.end_date), 'yyyy-MM-dd') : "",
        imageFile: null
      });
      setImagePreview(banner.image_url);
    } else {
      // Adding a new banner
      setEditingBanner(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        link_url: "",
        position: banners.length,
        is_active: true,
        start_date: "",
        end_date: "",
        imageFile: null
      });
      setImagePreview(null);
    }
    setBannerModalOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
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
  
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate the form data
      if (!formData.title.trim()) {
        throw new Error('Banner title is required');
      }
      
      let imageUrl = formData.image_url;
      
      // Upload image if a new file was selected
      if (formData.imageFile) {
        try {
          imageUrl = await uploadBannerImage(formData.imageFile);
        } catch (uploadError: unknown) {
          console.error('Image upload error:', uploadError);
          const msg = uploadError instanceof Error ? uploadError.message : 'Unknown error';
          throw new Error(`Image upload failed: ${msg}`);
        }
      }
      
      const bannerData: BannerInput = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        link_url: formData.link_url,
        position: formData.position,
        is_active: formData.is_active,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        tenant_id: currentTenant.id,
      };
      
      if (editingBanner?.id) {
        // Update existing banner
        try {
          console.log(`Updating banner ${editingBanner.id} with data:`, bannerData);
          const updatedBanner = await updateBanner(editingBanner.id, bannerData);
          console.log('Banner updated successfully:', updatedBanner);
          
          // Update the banners state with the new data
          setBanners(prev => {
            const updatedList = prev.map(banner => 
              banner.id === updatedBanner.id ? updatedBanner : banner
            );
            console.log('Updated banners list:', updatedList);
            return updatedList;
          });
          
          toast({
            title: "Banner Updated",
            description: "The banner has been updated successfully.",
          });
          
          // Close modal and reset form
          setBannerModalOpen(false);
          setEditingBanner(null);
          setFormData({
            title: "",
            description: "",
            image_url: "",
            link_url: "",
            position: 0,
            is_active: true,
            start_date: "",
            end_date: "",
            imageFile: null
          });
          setImagePreview(null);
          
          // Refresh banners list
          fetchBanners();
          
        } catch (updateError: unknown) {
          console.error('Update banner error:', updateError);
          const msg = updateError instanceof Error ? updateError.message : 'Unknown error';
          throw new Error(`Failed to update banner: ${msg}`);
        }
      } else {
        // Create new banner
        try {
          console.log('Creating new banner with data:', bannerData);
          const newBanner = await createBanner(bannerData);
          console.log('Banner created successfully:', newBanner);
          
          setBanners(prev => [...prev, newBanner]);
          
          toast({
            title: "Banner Created",
            description: "The new banner has been created successfully.",
          });
          
          // Close modal and reset form
          setBannerModalOpen(false);
          setEditingBanner(null);
          setFormData({
            title: "",
            description: "",
            image_url: "",
            link_url: "",
            position: 0,
            is_active: true,
            start_date: "",
            end_date: "",
            imageFile: null
          });
          setImagePreview(null);
          
          // Refresh banners list
          fetchBanners();
          
        } catch (createError: unknown) {
          console.error('Create banner error:', createError);
          const msg = createError instanceof Error ? createError.message : 'Unknown error';
          throw new Error(`Failed to create banner: ${msg}`);
        }
      }
    } catch (error: unknown) {
      console.error("Error saving banner:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error)?.message || "Failed to save banner due to an unknown error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (banner: BannerRow) => {
    const now = new Date();
    const startDate = banner.start_date ? new Date(banner.start_date) : null;
    const endDate = banner.end_date ? new Date(banner.end_date) : null;
    
    if (!banner.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (startDate && now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    
    if (endDate && now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Banners</h2>
          <p className="text-muted-foreground">Manage promotional banners for your store.</p>
        </div>
        <Button onClick={() => openBannerModal()} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <GlassCard>
        <CardContent className="p-0">
          {banners.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No banners yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Create your first promotional banner to showcase special offers, new products, or announcements.
              </p>
              <Button onClick={() => openBannerModal()}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create First Banner
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="h-12 w-20 rounded-md overflow-hidden">
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{banner.title}</div>
                        {banner.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {banner.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(banner)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{banner.position}</Badge>
                    </TableCell>
                    <TableCell>
                      {banner.link_url ? (
                        <a 
                          href={banner.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      ) : (
                        <span className="text-muted-foreground">No link</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(banner.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openBannerModal(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete banner</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this banner? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </GlassCard>
      
      {/* Banner Add/Edit Modal */}
      <Dialog 
        open={bannerModalOpen} 
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            console.log('Closing banner modal');
            setBannerModalOpen(false);
            // Reset form when closing
            if (!isSubmitting) {
              setEditingBanner(null);
              setFormData({
                title: "",
                description: "",
                image_url: "",
                link_url: "",
                position: 0,
                is_active: true,
                start_date: "",
                end_date: "",
                imageFile: null
              });
              setImagePreview(null);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
            <DialogDescription>
              {editingBanner 
                ? "Update the details of this promotional banner." 
                : "Create a new promotional banner for your store."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBannerSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="required">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Banner title"
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
                  placeholder="Banner description"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative w-full max-w-[200px] aspect-[16/9] rounded-md overflow-hidden border border-input bg-muted/40">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Banner preview"
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
                      Recommended size: 1200x400px. Max file size: 5MB.
                    </p>
                    {formData.image_url && !formData.imageFile && (
                      <p className="text-xs text-muted-foreground">
                        Current image: <a href={formData.image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="link_url">Link URL (Optional)</Label>
                <Input
                  id="link_url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date (Optional)</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    type="date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    type="date"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  console.log('Cancel button clicked');
                  setBannerModalOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannersTab;
