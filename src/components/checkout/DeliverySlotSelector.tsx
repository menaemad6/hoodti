import React, { useEffect, useState } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Clock } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import Spinner from "@/components/ui/spinner";

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

  useEffect(() => {
    fetchAndGenerateSlots();
  }, []);

  const fetchAndGenerateSlots = async () => {
    try {
      // Fetch base time slots from the database
      const { data: timeSlots, error } = await supabase
        .from("delivery_slots")
        .select("*")
        .eq("available", true)
        .order("time_slot", { ascending: true });

      if (error) throw error;

      // Generate the next 7 days of slots
      const slots: DaySlots[] = [];
      const today = startOfToday();

      for (let i = 0; i < 7; i++) {
        const date = addDays(today, i);
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
      <h3 className="text-lg font-semibold mb-2">Delivery Time</h3>
      
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
