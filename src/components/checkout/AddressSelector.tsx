import React, { useState } from "react";
import { Check, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/glass-card";
import { Address } from "@/types";
import AddressModal from "@/components/checkout/AddressModal";

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (addressId: string) => void;
  onAddNewAddress: (address: Address) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddNewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Delivery Address</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddNewClick}
          type="button"
          className="flex items-center gap-1 rounded-full"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div 
              key={address.id}
              className="relative transition-all duration-300"
              onClick={() => onSelectAddress(address.id)}
            >
              <GlassCard 
                className={`cursor-pointer transition-all duration-300 ${
                  selectedAddressId === address.id 
                    ? 'ring-2 ring-primary border-primary transform scale-[1.02]' 
                    : 'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{address.name}</h4>
                      {address.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {address.line1}
                      {address.line2 && `, ${address.line2}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                  </div>
                </div>
                
                {selectedAddressId === address.id && (
                  <div className="absolute top-3 right-3">
                    <Check className="h-5 w-5 text-primary animate-scale-in" />
                  </div>
                )}
              </GlassCard>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <GlassCard className="flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
              <h4 className="font-medium mb-2">No Saved Addresses</h4>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any saved addresses yet. Add a new address to continue.
              </p>
              <Button 
                onClick={handleAddNewClick}
                type="button"
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </GlassCard>
          </div>
        )}
      </div>
      
      <AddressModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSuccess={onAddNewAddress}
      />
    </div>
  );
};

export default AddressSelector;
