import React, { useEffect, useState } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Clock, Info } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { getDeliveryDelay } from "@/integrations/supabase/settings.service";
import Spinner from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

interface DeliveryTimeSlot {
  id: string;
  time_slot: string;
  available: boolean;
}

interface DaySlots {
  date: Date;
  formattedDate: string;
  slots: Array<{
    id: string;
    time: string;
    available: boolean;
  }>;
}

interface DeliverySlotSelectorProps {
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
  availableSlots?: any[];
}

const DeliverySlotSelector: React.FC<DeliverySlotSelectorProps> = ({
  selectedSlotId,
  onSelectSlot,
}) => {
  const [loading, setLoading] = useState(true);
  const [weeklySlots, setWeeklySlots] = useState<DaySlots[]>([]);
  const [deliveryDelay, setDeliveryDelay] = useState<number>(0);

  useEffect(() => {
    fetchAndGenerateSlots();
  }, []);

  const fetchAndGenerateSlots = async () => {
    try {
      // Get delivery delay from settings
      const delay = await getDeliveryDelay();
      setDeliveryDelay(delay);
      
      // Fetch base time slots from the database
      const { data: timeSlots, error } = await supabase
        .from("delivery_slots")
        .select("*")
        .eq("available", true)
        .order("time_slot", { ascending: true });

      if (error) throw error;

      // Generate the next 7 days of slots starting from the delay date
      const slots: DaySlots[] = [];
      const today = startOfToday();
      const startDate = addDays(today, delay); // Start from delay days from today

      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const formattedDate = format(date, "EEEE, MMMM d");

        // Add all available time slots for this day
        const daySlots = timeSlots.map(slot => ({
          id: `${dateStr}_${slot.time_slot}`,
          time: slot.time_slot,
          available: slot.available
        }));

        // Sort time slots by their start time
        daySlots.sort((a, b) => {
          const timeA = a.time.split(" - ")[0];
          const timeB = b.time.split(" - ")[0];
          return timeA.localeCompare(timeB);
        });

        slots.push({
          date,
          formattedDate,
          slots: daySlots
        });
      }

      setWeeklySlots(slots);

      // Auto-select first available slot if none selected
      if (!selectedSlotId && slots.length > 0 && slots[0].slots.length > 0) {
        const firstAvailableSlot = slots[0].slots.find(slot => slot.available);
        if (firstAvailableSlot) {
          onSelectSlot(firstAvailableSlot.id);
        }
      }
    } catch (error) {
      console.error("Error fetching delivery slots:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h3 className="text-lg font-semibold mb-2">Delivery Time</h3>
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Delivery Time</h3>
        {deliveryDelay > 0 && (
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {deliveryDelay === 1 ? '1 day' : `${deliveryDelay} days`} processing time
            </Badge>
          </div>
        )}
      </div>
      
      {deliveryDelay > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Orders require {deliveryDelay === 1 ? '1 day' : `${deliveryDelay} days`} processing time. 
            The earliest available delivery date is {format(addDays(startOfToday(), deliveryDelay), "EEEE, MMMM d")}.
          </p>
        </div>
      )}
      
      {weeklySlots.length === 0 ? (
        <GlassCard className="p-4 text-center">
          <p className="text-muted-foreground">No delivery slots available.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {weeklySlots.map((day) => (
            <div key={day.formattedDate} className="space-y-2">
              <h4 className="font-medium">{day.formattedDate}</h4>
              
              <div className="grid gap-2">
                {day.slots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  
                  return (
                    <div
                      key={slot.id}
                      onClick={() => slot.available && onSelectSlot(slot.id)}
                      className="relative"
                    >
                      <GlassCard 
                        className={`transition-all duration-200 ${
                          !slot.available
                            ? 'opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'ring-2 ring-primary cursor-pointer'
                            : 'cursor-pointer hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{slot.time}</span>
                        </div>
                      </GlassCard>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliverySlotSelector;
