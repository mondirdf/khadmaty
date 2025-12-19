import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { StarRating } from "./StarRating";

export interface FilterOptions {
  priceMin: number;
  priceMax: number;
  minRating: number;
  onlineOnly: boolean;
  sortBy: "newest" | "price_asc" | "price_desc" | "rating";
}

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
}

export const defaultFilters: FilterOptions = {
  priceMin: 0,
  priceMax: 10000,
  minRating: 0,
  onlineOnly: false,
  sortBy: "newest",
};

export const FilterSheet = ({
  open,
  onOpenChange,
  filters,
  onApply,
  onReset,
}: FilterSheetProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onReset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md" dir="rtl">
        <SheetHeader>
          <SheetTitle>تصفية الخدمات</SheetTitle>
          <SheetDescription>
            حدد معايير البحث لعرض الخدمات المناسبة
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label>نطاق السعر (د.ج)</Label>
            <div className="px-2">
              <Slider
                value={[localFilters.priceMin, localFilters.priceMax]}
                onValueChange={([min, max]) =>
                  setLocalFilters({ ...localFilters, priceMin: min, priceMax: max })
                }
                min={0}
                max={10000}
                step={100}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{localFilters.priceMin} د.ج</span>
              <span>{localFilters.priceMax} د.ج</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-3">
            <Label>الحد الأدنى للتقييم</Label>
            <div className="flex items-center gap-4">
              <StarRating
                rating={localFilters.minRating}
                size="md"
                interactive
                onChange={(rating) =>
                  setLocalFilters({ ...localFilters, minRating: rating })
                }
              />
              <span className="text-sm text-muted-foreground">
                {localFilters.minRating > 0
                  ? `${localFilters.minRating}+ نجوم`
                  : "الكل"}
              </span>
            </div>
          </div>

          {/* Online Only */}
          <div className="flex items-center justify-between">
            <Label htmlFor="online-only">الخدمات الأونلاين فقط</Label>
            <Switch
              id="online-only"
              checked={localFilters.onlineOnly}
              onCheckedChange={(checked) =>
                setLocalFilters({ ...localFilters, onlineOnly: checked })
              }
            />
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <Label>ترتيب حسب</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "newest", label: "الأحدث" },
                { value: "rating", label: "الأعلى تقييماً" },
                { value: "price_asc", label: "الأرخص" },
                { value: "price_desc", label: "الأغلى" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      sortBy: option.value as FilterOptions["sortBy"],
                    })
                  }
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.sortBy === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            إعادة تعيين
          </Button>
          <Button variant="hero" onClick={handleApply} className="flex-1">
            تطبيق
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
