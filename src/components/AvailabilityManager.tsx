import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface DayAvailability {
  day_of_week: number;
  is_available: boolean;
  slots: TimeSlot[];
}

const DAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

interface AvailabilityManagerProps {
  serviceId: string;
  onSaved?: () => void;
}

export const AvailabilityManager = ({ serviceId, onSaved }: AvailabilityManagerProps) => {
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map((day) => ({
      day_of_week: day.value,
      is_available: false,
      slots: [{ start_time: "09:00", end_time: "17:00" }],
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [serviceId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("service_id", serviceId);

      if (error) throw error;

      if (data && data.length > 0) {
        const groupedByDay: Record<number, DayAvailability> = {};
        
        data.forEach((slot) => {
          if (!groupedByDay[slot.day_of_week]) {
            groupedByDay[slot.day_of_week] = {
              day_of_week: slot.day_of_week,
              is_available: slot.is_available ?? true,
              slots: [],
            };
          }
          groupedByDay[slot.day_of_week].slots.push({
            start_time: slot.start_time,
            end_time: slot.end_time,
          });
        });

        setAvailability((prev) =>
          prev.map((day) => groupedByDay[day.day_of_week] || day)
        );
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayOfWeek: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.day_of_week === dayOfWeek
          ? { ...day, is_available: !day.is_available }
          : day
      )
    );
  };

  const addSlot = (dayOfWeek: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.day_of_week === dayOfWeek
          ? {
              ...day,
              slots: [...day.slots, { start_time: "09:00", end_time: "17:00" }],
            }
          : day
      )
    );
  };

  const removeSlot = (dayOfWeek: number, slotIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.day_of_week === dayOfWeek
          ? {
              ...day,
              slots: day.slots.filter((_, i) => i !== slotIndex),
            }
          : day
      )
    );
  };

  const updateSlot = (
    dayOfWeek: number,
    slotIndex: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.day_of_week === dayOfWeek
          ? {
              ...day,
              slots: day.slots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : day
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing availability
      await supabase.from("availability").delete().eq("service_id", serviceId);

      // Insert new availability
      const records = availability
        .filter((day) => day.is_available && day.slots.length > 0)
        .flatMap((day) =>
          day.slots.map((slot) => ({
            service_id: serviceId,
            day_of_week: day.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: true,
          }))
        );

      if (records.length > 0) {
        const { error } = await supabase.from("availability").insert(records);
        if (error) throw error;
      }

      toast.success("تم حفظ أوقات العمل بنجاح");
      onSaved?.();
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("حدث خطأ أثناء حفظ أوقات العمل");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {DAYS.map((day) => {
        const dayData = availability.find((d) => d.day_of_week === day.value)!;
        
        return (
          <div
            key={day.value}
            className={`p-4 rounded-xl border transition-colors ${
              dayData.is_available
                ? "bg-card border-border/50"
                : "bg-secondary/30 border-transparent"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={dayData.is_available}
                  onCheckedChange={() => toggleDay(day.value)}
                />
                <Label className="font-medium">{day.label}</Label>
              </div>
              
              {dayData.is_available && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addSlot(day.value)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  إضافة فترة
                </Button>
              )}
            </div>

            {dayData.is_available && (
              <div className="space-y-2 mr-10">
                {dayData.slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) =>
                        updateSlot(day.value, index, "start_time", e.target.value)
                      }
                      className="w-32"
                      dir="ltr"
                    />
                    <span className="text-muted-foreground">إلى</span>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) =>
                        updateSlot(day.value, index, "end_time", e.target.value)
                      }
                      className="w-32"
                      dir="ltr"
                    />
                    {dayData.slots.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(day.value, index)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Button variant="hero" onClick={handleSave} disabled={saving} className="w-full mt-6">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
            جاري الحفظ...
          </>
        ) : (
          "حفظ أوقات العمل"
        )}
      </Button>
    </div>
  );
};
