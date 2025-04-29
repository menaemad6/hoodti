
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Address } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: Omit<Address, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<Omit<Address, 'id'>>({
    defaultValues: {
      name: address?.name || '',
      line1: address?.line1 || '',
      line2: address?.line2 || '',
      city: address?.city || '',
      state: address?.state || '',
      postalCode: address?.postalCode || '',
      isDefault: address?.isDefault || false
    }
  });
  
  const isDefault = watch('isDefault');
  
  const onFormSubmit = async (data: Omit<Address, 'id'>) => {
    try {
      await onSubmit(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save address. Please try again."
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Address Name</Label>
        <Input
          id="name"
          placeholder="Home, Work, etc."
          {...register('name', { required: 'Address name is required' })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="line1">Address Line 1</Label>
        <Input
          id="line1"
          placeholder="Street address"
          {...register('line1', { required: 'Address line 1 is required' })}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="City"
            {...register('city', { required: 'City is required' })}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="State"
            {...register('state', { required: 'State is required' })}
          />
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          placeholder="Postal code"
          {...register('postalCode', { required: 'Postal code is required' })}
        />
        {errors.postalCode && (
          <p className="text-sm text-destructive">{errors.postalCode.message}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={isDefault}
          onCheckedChange={(checked) => setValue('isDefault', !!checked)}
        />
        <Label 
          htmlFor="isDefault" 
          className="cursor-pointer text-sm font-normal"
        >
          Set as default address
        </Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
