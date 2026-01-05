"use client";

import { Home, ParkingSquare, Route, Warehouse } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import type { SpotType } from "@/lib/features/spot/types";

const SPOT_TYPES: {
  value: SpotType;
  label: string;
  icon: typeof Home;
  description: string;
}[] = [
  {
    value: "driveway",
    label: "Driveway",
    icon: Home,
    description: "Private residential driveway",
  },
  {
    value: "garage",
    label: "Garage",
    icon: Warehouse,
    description: "Indoor garage space",
  },
  {
    value: "lot",
    label: "Parking Lot",
    icon: ParkingSquare,
    description: "Commercial parking lot",
  },
  {
    value: "street",
    label: "Street",
    icon: Route,
    description: "Street-side parking",
  },
];

interface BasicInfoStepProps {
  spotType: SpotType | null;
  title: string;
  description: string;
  onSpotTypeChange: (type: SpotType) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  errors?: {
    spotType?: string;
    title?: string;
    description?: string;
  };
}

export function BasicInfoStep({
  spotType,
  title,
  description,
  onSpotTypeChange,
  onTitleChange,
  onDescriptionChange,
  errors,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-8">
      {/* Spot Type Selector */}
      <div className="space-y-4">
        <Typography variant="h3">
          What type of parking spot are you listing?
        </Typography>

        <div
          role="radiogroup"
          aria-label="Select spot type"
          className="grid grid-cols-2 gap-3"
        >
          {SPOT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = spotType === type.value;

            return (
              // biome-ignore lint/a11y/useSemanticElements: custom styled radio group
              <button
                key={type.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSpotTypeChange(type.value)}
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
                  <p className="font-medium">{type.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {errors?.spotType && (
          <p className="text-sm text-destructive">{errors.spotType}</p>
        )}
      </div>

      {/* Title */}
      <Input
        label="Give your spot a title"
        placeholder="e.g., Covered garage near downtown"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        error={errors?.title}
        description="A catchy title helps your listing stand out"
      />

      {/* Description */}
      <Textarea
        label="Describe your spot (optional)"
        placeholder="Tell guests what makes your spot special..."
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        error={errors?.description}
        description="Include details like access instructions, nearby landmarks, etc."
      />
    </div>
  );
}
