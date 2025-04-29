import React, { useState } from "react";
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
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Omit<Address, 'id'>>({
    defaultValues: {
      name: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: false
    }
  });
  
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
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  // Function to handle closing the modal
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpenState) => {
      // If we're closing, ensure we prevent any form submission
      if (open && !newOpenState) {
        // This timeout ensures the event has time to propagate first
        setTimeout(() => onOpenChange(false), 0);
        return;
      }
      onOpenChange(newOpenState);
    }}>
      <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>
        
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
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                {...register('city', { required: "City is required" })}
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="State"
                {...register('state', { required: "State is required" })}
                className={errors.state ? "border-destructive" : ""}
              />
              {errors.state && (
                <p className="text-sm text-destructive">{errors.state.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                placeholder="Postal code"
                {...register('postalCode', { required: "Postal code is required" })}
                className={errors.postalCode ? "border-destructive" : ""}
              />
              {errors.postalCode && (
                <p className="text-sm text-destructive">{errors.postalCode.message}</p>
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
          
          <div className="flex items-center space-x-2 mt-2 border-t pt-3">
            <Checkbox
              id="saveForLater"
              checked={saveAddress}
              onCheckedChange={(checked) => {
                setSaveAddress(!!checked);
              }}
            />
            <Label 
              htmlFor="saveForLater" 
              className="cursor-pointer text-sm font-normal"
            >
              Save this address for future orders
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(onSubmit)(e);
            }}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : "Add Address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
