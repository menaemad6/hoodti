
import React from "react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/glass-card";
import { Address } from "@/types";
import { MapPin, Edit, Trash2, Check, Home } from "lucide-react";
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

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ 
  addresses, 
  onEdit, 
  onDelete, 
  onSetDefault 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <div key={address.id} className="relative">
          <GlassCard className={`h-full ${address.isDefault ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">{address.name}</h3>
              </div>
              
              {address.isDefault && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Default
                </span>
              )}
            </div>
            
            <div className="space-y-1 text-sm mb-4">
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>{address.city}, {address.state} {address.postalCode}</p>
            </div>
            
            <div className="flex justify-between items-center mt-auto pt-2 border-t">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(address)}
                  className="px-2 h-8"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2 h-8"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete address</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this address? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(address.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              {!address.isDefault && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSetDefault(address.id)}
                  className="px-3 h-8"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Set as Default
                </Button>
              )}
            </div>
          </GlassCard>
        </div>
      ))}
    </div>
  );
};

export default AddressList;
