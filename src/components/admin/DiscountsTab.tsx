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
import { Discount, getAllDiscounts, createDiscount, updateDiscount, deleteDiscount } from "@/integrations/supabase/discounts.service";
import { PlusCircle, Pencil, Trash2, BadgePercent, Clock, PercentIcon, Tag, Check } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { format } from "date-fns";

interface DiscountFormData {
  code: string;
  description: string;
  discount_percent: number;
  max_uses: number;
  min_order_amount: number;
  active: boolean;
  start_date: string;
  end_date: string;
}

const DiscountsTab: React.FC = () => {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    description: '',
    discount_percent: 10,
    max_uses: 100,
    min_order_amount: 0,
    active: true,
    start_date: '',
    end_date: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DiscountFormData, string>>>({});

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    setIsLoading(true);
    try {
      const data = await getAllDiscounts();
      setDiscounts(data);
    } catch (error) {
      console.error('Error loading discounts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discounts."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error when the user types
    if (formErrors[name as keyof DiscountFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow empty string or valid numbers
    if (value === '' || !isNaN(Number(value))) {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
      
      // Clear the error when the user types
      if (formErrors[name as keyof DiscountFormData]) {
        setFormErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof DiscountFormData, string>> = {};
    
    if (!formData.code.trim()) {
      errors.code = "Discount code is required";
    } else if (!/^[A-Z0-9]+$/.test(formData.code.trim())) {
      errors.code = "Code must contain only uppercase letters and numbers";
    }
    
    if (formData.discount_percent === '' || isNaN(Number(formData.discount_percent))) {
      errors.discount_percent = "Discount percent is required";
    } else if (Number(formData.discount_percent) <= 0 || Number(formData.discount_percent) > 100) {
      errors.discount_percent = "Discount percent must be between 1 and 100";
    }
    
    if (formData.max_uses === '' || isNaN(Number(formData.max_uses))) {
      errors.max_uses = "Maximum uses is required";
    } else if (Number(formData.max_uses) <= 0) {
      errors.max_uses = "Maximum uses must be greater than 0";
    }
    
    if (formData.min_order_amount === '' || isNaN(Number(formData.min_order_amount))) {
      errors.min_order_amount = "Minimum order amount is required";
    } else if (Number(formData.min_order_amount) < 0) {
      errors.min_order_amount = "Minimum order amount cannot be negative";
    }
    
    // Validate dates if provided
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        errors.end_date = "End date must be after start date";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrUpdate = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Convert empty strings to null for dates
      const discountData = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };
      
      let result;
      
      if (selectedDiscount) {
        // Update existing discount
        result = await updateDiscount(selectedDiscount.id, discountData);
        if (result) {
          toast({
            title: "Discount updated",
            description: `Discount code ${result.code} has been updated successfully.`
          });
        }
      } else {
        // Create new discount
        result = await createDiscount(discountData);
        if (result) {
          toast({
            title: "Discount created",
            description: `Discount code ${result.code} has been created successfully.`
          });
        }
      }
      
      if (result) {
        setIsDialogOpen(false);
        loadDiscounts();
      } else {
        throw new Error("Operation failed");
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save discount code."
      });
    }
  };

  const openCreateDialog = () => {
    setSelectedDiscount(null);
    setFormData({
      code: '',
      description: '',
      discount_percent: 10,
      max_uses: 100,
      min_order_amount: 0,
      active: true,
      start_date: '',
      end_date: '',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (discount: Discount) => {
    setSelectedDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description || '',
      discount_percent: discount.discount_percent,
      max_uses: discount.max_uses,
      min_order_amount: discount.min_order_amount,
      active: discount.active,
      start_date: discount.start_date || '',
      end_date: discount.end_date || '',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDiscount) return;
    
    try {
      const success = await deleteDiscount(selectedDiscount.id);
      
      if (success) {
        toast({
          title: "Discount deleted",
          description: `Discount code ${selectedDiscount.code} has been deleted.`
        });
        loadDiscounts();
      } else {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete discount code."
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), 'MMM d, yyyy');
  };

  return (
    <GlassCard>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">Discounts</CardTitle>
          <CardDescription>
            Manage discount codes for your store
          </CardDescription>
        </div>
        <Button onClick={openCreateDialog} className="h-8 rounded-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Discount
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BadgePercent className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No discount codes yet</p>
            <p className="text-sm mt-1">Create your first discount code to offer special deals to your customers</p>
            <Button 
              variant="outline"
              onClick={openCreateDialog}
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Discount Code
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-mono font-medium">{discount.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <PercentIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      {discount.discount_percent}%
                      {discount.min_order_amount > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (min: ${discount.min_order_amount.toFixed(2)})
                        </span>
                      )}
                    </div>
                    {discount.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {discount.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={discount.current_uses >= discount.max_uses ? "text-destructive" : ""}>
                        {discount.current_uses} / {discount.max_uses}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          discount.current_uses >= discount.max_uses 
                            ? "bg-destructive" 
                            : discount.current_uses > discount.max_uses * 0.7
                              ? "bg-amber-500"
                              : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(discount.current_uses / discount.max_uses * 100, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={discount.active ? "default" : "outline"}
                      className={`${discount.active ? "bg-green-500/20 text-green-700 hover:bg-green-500/30" : ""}`}
                    >
                      {discount.active ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {discount.start_date || discount.end_date ? (
                      <div className="text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {discount.start_date ? formatDate(discount.start_date) : 'Anytime'} 
                          {discount.end_date && (
                            <>
                              <span className="mx-1">-</span>
                              {formatDate(discount.end_date)}
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No expiration</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(discount)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(discount)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Create/Edit Discount Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDiscount ? "Edit Discount" : "Create Discount"}
            </DialogTitle>
            <DialogDescription>
              {selectedDiscount 
                ? "Update the details of this discount code" 
                : "Create a new discount code for your customers"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">
                Discount Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="SUMMER2023"
                className="font-mono"
              />
              {formErrors.code && (
                <p className="text-sm text-destructive">{formErrors.code}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Only uppercase letters and numbers are allowed. This will be displayed to customers during checkout.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Summer sale discount"
                className="min-h-[60px]"
              />
              <p className="text-xs text-muted-foreground">
                Optional description for internal reference.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discount_percent">
                  Discount Percent <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="discount_percent"
                    name="discount_percent"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percent}
                    onChange={handleNumberChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <PercentIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                {formErrors.discount_percent && (
                  <p className="text-sm text-destructive">{formErrors.discount_percent}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="min_order_amount">Minimum Order Amount</Label>
                <div className="relative">
                  <Input
                    id="min_order_amount"
                    name="min_order_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_order_amount}
                    onChange={handleNumberChange}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-muted-foreground">$</span>
                  </div>
                </div>
                {formErrors.min_order_amount && (
                  <p className="text-sm text-destructive">{formErrors.min_order_amount}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="max_uses">
                  Maximum Uses <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="max_uses"
                  name="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={handleNumberChange}
                />
                {formErrors.max_uses && (
                  <p className="text-sm text-destructive">{formErrors.max_uses}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <h3 className="font-medium">Validity Period (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
                {formErrors.end_date && (
                  <p className="text-sm text-destructive">{formErrors.end_date}</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {selectedDiscount ? "Update Discount" : "Create Discount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the discount code{' '}
              <span className="font-mono font-bold">{selectedDiscount?.code}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GlassCard>
  );
};

export default DiscountsTab; 