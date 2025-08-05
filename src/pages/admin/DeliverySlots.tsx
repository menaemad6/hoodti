import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Switch } from "@/components/ui/switch";
import ModernCard from "@/components/ui/modern-card";
import { Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrentTenant } from "@/context/TenantContext";
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

interface DeliverySlot {
  id: string;
  time_slot: string;
  available: boolean;
  created_at: string;
}

interface SlotFormData {
  time_slot: string;
  available: boolean;
}

const DeliverySlots = () => {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);
  const [formData, setFormData] = useState<SlotFormData>({
    time_slot: "",
    available: true,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentTenant = useCurrentTenant();

  useEffect(() => {
    fetchSlots();
  }, [currentTenant]);

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_slots")
        .select("*")
        .eq('tenant_id', currentTenant.id)
        .order('time_slot', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (error: unknown) {
      const e = error as Error;
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load delivery slots",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateTimeSlot = (timeSlot: string): boolean => {
    // Check if the time slot follows the format "HH:MM AM/PM - HH:MM AM/PM"
    const regex = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s*(AM|PM)\s*-\s*(1[0-2]|0?[1-9]):[0-5][0-9]\s*(AM|PM)$/i;
    return regex.test(timeSlot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTimeSlot(formData.time_slot)) {
      toast({
        variant: "destructive",
        title: "Invalid Time Format",
        description: "Please use the format: HH:MM AM/PM - HH:MM AM/PM (e.g., 9:00 AM - 11:00 AM)",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingSlot) {
        const { error } = await supabase
          .from("delivery_slots")
          .update({
            time_slot: formData.time_slot,
            available: formData.available,
          } as any)
          .eq("id", editingSlot.id)
          .eq('tenant_id', currentTenant.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Time slot updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("delivery_slots")
          .insert([{
            time_slot: formData.time_slot,
            available: formData.available,
            tenant_id: currentTenant.id,
          } as any]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "New time slot created successfully",
        });
      }

      fetchSlots();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      const e = error as Error;
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("delivery_slots")
        .delete()
        .eq("id", id)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Delivery slot deleted successfully",
      });

      fetchSlots();
    } catch (error: unknown) {
      const e = error as Error;
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message,
      });
    }
  };

  const handleEdit = (slot: DeliverySlot) => {
    setEditingSlot(slot);
    setFormData({
      time_slot: slot.time_slot,
      available: slot.available,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSlot(null);
    setFormData({
      time_slot: "",
      available: true,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Delivery Time Slots</h1>
            <p className="text-muted-foreground mt-1">
              Manage your store's delivery time slots. These slots will be available for the next 7 days.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Time Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSlot ? "Edit Time Slot" : "Create Time Slot"}
                </DialogTitle>
                <DialogDescription>
                  Enter the time slot in the format: HH:MM AM/PM - HH:MM AM/PM
                  <br />
                  Example: 9:00 AM - 11:00 AM
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="time_slot">Time Slot</Label>
                  <Input
                    id="time_slot"
                    type="text"
                    value={formData.time_slot}
                    onChange={(e) =>
                      setFormData({ ...formData, time_slot: e.target.value })
                    }
                    placeholder="e.g., 9:00 AM - 11:00 AM"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, available: checked })
                    }
                  />
                  <Label htmlFor="available">Available</Label>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {editingSlot ? "Update Time Slot" : "Create Time Slot"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ModernCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">{slot.time_slot}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slot.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {slot.available ? "Available" : "Unavailable"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(slot)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this time slot? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(slot.id)}
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
              {slots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Clock className="h-8 w-8 mb-2" />
                      <p>No time slots found</p>
                      <p className="text-sm">Create your first time slot to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ModernCard>
      </div>
    </AdminLayout>
  );
};

export default DeliverySlots; 