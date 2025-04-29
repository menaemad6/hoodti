import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ProfileRow } from "@/integrations/supabase/types.service";
import { Separator } from "@/components/ui/separator";
import { updateProfile } from "@/integrations/supabase/profiles.service";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileRow | null;
  onProfileUpdated: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onOpenChange,
  profile,
  onProfileUpdated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [phoneError, setPhoneError] = useState("");

  // Update the form fields when profile changes
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAvatar(profile.avatar || "");
      setPhoneNumber(profile.phone_number || "");
      setPhoneError("");
    }
  }, [profile]);

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return true; // Phone is optional
    const regex = /^01\d{9}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate phone number if provided
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setPhoneError("Phone number must be 11 digits and start with 01");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Use the updateProfile function instead of direct Supabase call
      const success = await updateProfile(user.id, {
        name,
        avatar,
        phone_number: phoneNumber ? String(phoneNumber) : null,
      });
      
      if (!success) {
        throw new Error("Failed to update profile");
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      onProfileUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Required Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
              <p className="text-xs text-muted-foreground">
                Your name will be used for shipping and receipts
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="text" 
                inputMode="tel"
                value={phoneNumber}
                onChange={(e) => {
                  // Ensure it's stored as a string
                  setPhoneNumber(e.target.value);
                  setPhoneError("");
                }}
                placeholder="01XXXXXXXXX"
                className={phoneError ? "border-red-500" : ""}
              />
              {phoneError && (
                <p className="text-sm text-red-500">{phoneError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be 11 digits and start with 01
              </p>
            </div>
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Optional Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-muted-foreground flex items-center">
                <span>Avatar URL</span>
                <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Optional</span>
              </Label>
              <Input
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="border-dashed"
              />
              <p className="text-xs text-muted-foreground">
                Provide a direct link to an image to personalize your profile
              </p>
              {avatar && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
