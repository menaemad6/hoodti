import React, { useState } from "react";
import { Check, MapPin, Plus, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/glass-card";
import { Address } from "@/types";
import AddressModal from "@/components/checkout/AddressModal";
import { Badge } from "@/components/ui/badge";

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
            <GlassCard className="relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent" />
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-10">
                <div className="w-16 h-16 rounded-full bg-primary/20" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-10">
                <div className="w-12 h-12 rounded-full bg-primary/20" />
              </div>
              
              <div className="relative flex flex-col items-center justify-center p-8 text-center">
                {/* Main icon with gradient background */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-xl" />
                  <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-full border border-primary/20">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    No Saved Addresses
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    You don't have any saved addresses yet. Add a new address to continue with your order.
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <Button 
                    onClick={handleAddNewClick}
                    type="button"
                    className="flex-1 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
                
                {/* Quick address suggestions */}
                <div className="mt-6 pt-6 border-t border-border/50 w-full">
                  <p className="text-xs text-muted-foreground mb-3">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-background/50">
                      <Home className="h-3 w-3 mr-1" />
                      Home
                    </Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-background/50">
                      <Building2 className="h-3 w-3 mr-1" />
                      Work
                    </Badge>
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-background/50">
                      <MapPin className="h-3 w-3 mr-1" />
                      Other
                    </Badge>
                  </div>
                </div>
              </div>
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
