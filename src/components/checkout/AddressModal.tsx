import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Address } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { addAddress } from "@/integrations/supabase/address.service";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/ui/spinner";
import { getGovernmentShippingFees, GovernmentShippingFee } from "@/integrations/supabase/settings.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (address: Address) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ 
  open, 
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [governmentFees, setGovernmentFees] = useState<GovernmentShippingFee[]>([]);
  const [isLoadingGovernments, setIsLoadingGovernments] = useState(true);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Omit<Address, 'id'>>({
    defaultValues: {
      name: '',
      line1: '',
      line2: '',
      city: '',
      isDefault: false
    }
  });
  
  const selectedCity = watch('city');
  
  const loadGovernmentFees = useCallback(async () => {
    try {
      const fees = await getGovernmentShippingFees();
      setGovernmentFees(fees);
    } catch (error) {
      console.error("Error loading government fees:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load available cities."
      });
    } finally {
      setIsLoadingGovernments(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (open) {
      loadGovernmentFees();
    }
  }, [open, loadGovernmentFees]);
  
  const onSubmit = async (data: Omit<Address, 'id'>, e?: React.BaseSyntheticEvent) => {
    // Prevent form submission from propagating to parent form
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add an address",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (saveAddress) {
        // Save to database
        const newAddress = await addAddress(user.id, data);
        onSuccess(newAddress);
        toast({
          title: "Address saved",
          description: "Your address has been saved for future use"
        });
      } else {
        // Create a temporary address with a generated ID (not saved to DB)
        const tempAddress: Address = {
          ...data,
          id: `temp-${Date.now()}`
        };
        onSuccess(tempAddress);
      }
      
      // Close the modal and reset form
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error adding address:", error);
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Address Name *</Label>
                <Input
                  id="name"
                  placeholder="Home, Work, etc."
                  {...register('name', { required: "Address name is required" })}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="line1">Address Line 1 *</Label>
                <Input
                  id="line1"
                  placeholder="Street address"
                  {...register('line1', { required: "Address is required" })}
                  className={errors.line1 ? "border-destructive" : ""}
                />
                {errors.line1 && (
                  <p className="text-sm text-destructive">{errors.line1.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                <Input
                  id="line2"
                  placeholder="Apartment, suite, unit, etc."
                  {...register('line2')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City/Government *</Label>
                {isLoadingGovernments ? (
                  <div className="h-10 bg-muted animate-pulse rounded-md flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Loading cities...</span>
                  </div>
                ) : (
                  <Select
                    value={selectedCity}
                    onValueChange={(value) => setValue('city', value, { shouldValidate: true })}
                    {...register('city', { required: "City/Government is required" })}
                  >
                    <SelectTrigger className={errors.city ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a city/government" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {governmentFees.map((government) => (
                        <SelectItem key={government.name} value={government.name} className="py-3">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{government.name}</span>
                            <span className={`text-sm ml-2 ${
                              government.shipping_fee === 0 
                                ? 'text-green-600 font-semibold' 
                                : 'text-muted-foreground'
                            }`}>
                              {government.shipping_fee === 0 
                                ? 'Free Shipping' 
                                : `${government.shipping_fee.toFixed(2)} EGP`
                              }
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
                {selectedCity && !errors.city && (
                  <p className="text-sm text-muted-foreground">
                    Shipping fee: {governmentFees.find(g => g.name === selectedCity)?.shipping_fee === 0 
                      ? 'Free' 
                      : `${governmentFees.find(g => g.name === selectedCity)?.shipping_fee.toFixed(2) || '0.00'} EGP`
                    }
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="isDefault"
                {...register('isDefault')}
                onCheckedChange={() => {}} // Prevent propagation with empty handler
              />
              <Label 
                htmlFor="isDefault" 
                className="cursor-pointer text-sm font-normal"
              >
                Set as default address
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveAddress"
                checked={saveAddress}
                onCheckedChange={(checked) => setSaveAddress(!!checked)}
              />
              <Label 
                htmlFor="saveAddress" 
                className="cursor-pointer text-sm font-normal"
              >
                Save this address for future use
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" size="sm" />
                  Adding...
                </>
              ) : (
                'Add Address'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
