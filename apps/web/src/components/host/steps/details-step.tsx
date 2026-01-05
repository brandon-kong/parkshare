"use client";

import { Car, Caravan, Truck } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Typography } from "@/components/ui/typography";
import type { VehicleSize } from "@/lib/features/spot/types";

const VEHICLE_SIZES: {
  value: VehicleSize;
  label: string;
  icon: typeof Car;
  description: string;
}[] = [
  {
    value: "compact",
    label: "Compact",
    icon: Car,
    description: "Small cars, sedans",
  },
  {
    value: "standard",
    label: "Standard",
    icon: Car,
    description: "Most cars, small SUVs",
  },
  {
    value: "large",
    label: "Large",
    icon: Truck,
    description: "Full-size SUVs, trucks",
  },
  {
    value: "oversized",
    label: "Oversized",
    icon: Caravan,
    description: "RVs, boats, trailers",
  },
];

interface DetailsStepProps {
  vehicleSize: VehicleSize | null;
  isCovered: boolean;
  hasEvCharging: boolean;
  hasSecurity: boolean;
  accessInstructions: string;
  onVehicleSizeChange: (size: VehicleSize) => void;
  onIsCoveredChange: (value: boolean) => void;
  onHasEvChargingChange: (value: boolean) => void;
  onHasSecurityChange: (value: boolean) => void;
  onAccessInstructionsChange: (value: string) => void;
  errors?: {
    vehicleSize?: string;
  };
}

export function DetailsStep({
  vehicleSize,
  isCovered,
  hasEvCharging,
  hasSecurity,
  accessInstructions,
  onVehicleSizeChange,
  onIsCoveredChange,
  onHasEvChargingChange,
  onHasSecurityChange,
  onAccessInstructionsChange,
  errors,
}: DetailsStepProps) {
  return (
    <div className="space-y-8">
      {/* Vehicle Size Selector */}
      <div className="space-y-4">
        <Typography variant="h3">What size vehicles can park here?</Typography>

        <div
          role="radiogroup"
          aria-label="Select vehicle size"
          className="grid grid-cols-2 gap-3"
        >
          {VEHICLE_SIZES.map((size) => {
            const Icon = size.icon;
            const isSelected = vehicleSize === size.value;

            return (
              // biome-ignore lint/a11y/useSemanticElements: custom styled radio group
              <button
                key={size.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onVehicleSizeChange(size.value)}
                className={`
                  flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left
                  transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                  ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/30"
                  }
                `}
              >
                <Icon
                  size={24}
                  className={isSelected ? "text-primary" : "text-foreground"}
                />
                <div>
                  <p className="font-medium">{size.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {size.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {errors?.vehicleSize && (
          <p className="text-sm text-destructive">{errors.vehicleSize}</p>
        )}
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <Typography variant="h3">
          Does your spot have any of these features?
        </Typography>

        <div className="space-y-4">
          <Toggle
            checked={isCovered}
            onChange={onIsCoveredChange}
            label="Covered parking"
            description="Protected from weather"
          />
          <Toggle
            checked={hasEvCharging}
            onChange={onHasEvChargingChange}
            label="EV charging"
            description="Electric vehicle charging available"
          />
          <Toggle
            checked={hasSecurity}
            onChange={onHasSecurityChange}
            label="Security"
            description="Camera, gate, or attended"
          />
        </div>
      </div>

      {/* Access Instructions */}
      <Textarea
        label="Access instructions (optional)"
        placeholder="e.g., Gate code is 1234, park in spot #5"
        value={accessInstructions}
        onChange={(e) => onAccessInstructionsChange(e.target.value)}
        description="Help guests find and access your spot"
      />
    </div>
  );
}
