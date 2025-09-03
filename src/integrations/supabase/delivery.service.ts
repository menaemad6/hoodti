import { supabase } from "./client";
import { addDays, format, startOfToday } from "date-fns";
import { getDeliveryDelay } from "./settings.service";

export interface DeliveryTimeSlot {
  id: string;
  time_slot: string;
  available: boolean;
  created_at?: string;
}

export interface WeeklySlot {
  id: string;
  date: Date;
  time_slot: string;
  available: boolean;
}

export async function getBaseTimeSlots(tenantId?: string): Promise<DeliveryTimeSlot[]> {
  try {
    // Get tenant ID from parameter or localStorage if not provided
    const tenant_id = tenantId || localStorage.getItem('tenantId');
    
    if (!tenant_id) {
      console.error("No tenant ID available for fetching delivery slots");
      return [];
    }
    
    const { data, error } = await supabase
      .from('delivery_slots')
      .select('*')
      .eq('available', true)
      .eq('tenant_id', tenant_id)
      .order('time_slot', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching delivery slots:", error);
    return [];
  }
}

export async function generateWeeklySlots(tenantId?: string): Promise<WeeklySlot[]> {
  try {
    // Get tenant ID from parameter or localStorage if not provided
    const tenant_id = tenantId || localStorage.getItem('tenantId');
    
    if (!tenant_id) {
      console.error("No tenant ID available for generating weekly slots");
      return [];
    }
    
    const timeSlots = await getBaseTimeSlots(tenant_id);
    const slots: WeeklySlot[] = [];
    
    // Only generate slots if there are actual time slots configured
    if (timeSlots && timeSlots.length > 0) {
      const today = startOfToday();
      
      // Get the delivery delay from settings
      const deliveryDelay = await getDeliveryDelay(tenant_id);
      console.log("Using delivery delay:", deliveryDelay, "days");

      // Generate slots starting from the delay date (e.g., if delay is 2, start from day 2)
      const startDate = addDays(today, deliveryDelay);
      
      // Generate slots for the next 7 days starting from the delay date
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
        const dateStr = format(date, "yyyy-MM-dd");
        
        // Add all available time slots for this day
        timeSlots.forEach(slot => {
          slots.push({
            id: `${dateStr}_${slot.time_slot}`,
            date,
            time_slot: slot.time_slot,
            available: slot.available
          });
        });
      }
    }

    return slots;
  } catch (error) {
    console.error("Error generating weekly slots:", error);
    return [];
  }
}

export async function getDeliverySlotByDateAndTime(slotId: string): Promise<WeeklySlot | null> {
  try {
    // Parse the composite ID to get the date and time slot
    const [dateStr, timeSlot] = slotId.split('_');
    
    if (!dateStr || !timeSlot) {
      throw new Error('Invalid slot ID format');
    }

    // Return a slot with the provided date and time slot
    return {
      id: slotId,
      date: new Date(dateStr),
      time_slot: timeSlot,
      available: true // Assume available since it was selected
    };
  } catch (error) {
    console.error("Error fetching delivery slot:", error);
    return null;
  }
}

export async function getAvailableDeliverySlots(tenantId?: string): Promise<WeeklySlot[]> {
  try {
    const slots = await generateWeeklySlots(tenantId);
    return slots.filter(slot => slot.available);
  } catch (error) {
    console.error("Error fetching available delivery slots:", error);
    return [];
  }
}

// Helper function to get the date from a slot ID
export function getDeliveryDate(slotId: string): string | null {
  const [dateStr] = slotId.split('_');
  return dateStr || null;
}

// Helper function to get the minimum delivery date based on current delay setting
export async function getMinimumDeliveryDate(): Promise<Date> {
  try {
    const deliveryDelay = await getDeliveryDelay();
    const today = startOfToday();
    return addDays(today, deliveryDelay);
  } catch (error) {
    console.error("Error getting minimum delivery date:", error);
    return startOfToday(); // Fallback to today
  }
}
