"use client";

import {
  Car,
  DollarSign,
  FileText,
  Home,
  Image,
  MapPin,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { SpotType, VehicleSize } from "@/lib/features/spot/types";
import type { PhotoFile } from "./photos-step";

const SPOT_TYPE_LABELS: Record<SpotType, string> = {
  driveway: "Driveway",
  garage: "Garage",
  lot: "Parking Lot",
  street: "Street",
};

const VEHICLE_SIZE_LABELS: Record<VehicleSize, string> = {
  compact: "Compact vehicles",
  standard: "Standard vehicles",
  large: "Large vehicles",
  oversized: "Oversized vehicles",
};

interface ReviewStepProps {
  spotType: SpotType | null;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  vehicleSize: VehicleSize | null;
  isCovered: boolean;
  hasEvCharging: boolean;
  hasSecurity: boolean;
  photos: PhotoFile[];
  hourlyRate: number | null;
  dailyRate: number | null;
  monthlyRate: number | null;
  onEditStep: (step: number) => void;
}

function ReviewSection({
  icon: Icon,
  title,
  children,
  onEdit,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="flex gap-4 p-4 border-b border-border last:border-b-0">
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
        <Icon size={20} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium">{title}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            startIcon={<Pencil size={14} />}
          >
            Edit
          </Button>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{children}</div>
      </div>
    </div>
  );
}

export function ReviewStep({
  spotType,
  title,
  description,
  address,
  city,
  state,
  vehicleSize,
  isCovered,
  hasEvCharging,
  hasSecurity,
  photos,
  hourlyRate,
  dailyRate,
  monthlyRate,
  onEditStep,
}: ReviewStepProps) {
  const amenities = [
    vehicleSize && VEHICLE_SIZE_LABELS[vehicleSize],
    isCovered && "Covered parking",
    hasEvCharging && "EV charging",
    hasSecurity && "Security",
  ].filter(Boolean);

  const rates = [
    hourlyRate !== null && `$${hourlyRate}/hour`,
    dailyRate !== null && `$${dailyRate}/day`,
    monthlyRate !== null && `$${monthlyRate}/month`,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h3">Review your listing</Typography>
        <p className="text-muted-foreground mt-1">
          Please review all the details before publishing.
        </p>
      </div>

      <div className="rounded-xl border border-border divide-y divide-border">
        {/* Location */}
        <ReviewSection
          icon={MapPin}
          title="Location"
          onEdit={() => onEditStep(1)}
        >
          <p>{address}</p>
          {city && state && (
            <p>
              {city}, {state}
            </p>
          )}
        </ReviewSection>

        {/* Spot Type */}
        <ReviewSection
          icon={Home}
          title="Spot type"
          onEdit={() => onEditStep(0)}
        >
          {spotType ? SPOT_TYPE_LABELS[spotType] : "Not selected"}
        </ReviewSection>

        {/* Title & Description */}
        <ReviewSection
          icon={FileText}
          title="Title & description"
          onEdit={() => onEditStep(0)}
        >
          <p className="font-medium text-foreground">{title || "No title"}</p>
          {description && <p className="mt-1 line-clamp-2">{description}</p>}
        </ReviewSection>

        {/* Details */}
        <ReviewSection icon={Car} title="Details" onEdit={() => onEditStep(2)}>
          {amenities.length > 0 ? (
            <ul className="list-disc list-inside">
              {amenities.map((amenity) => (
                <li key={String(amenity)}>{amenity}</li>
              ))}
            </ul>
          ) : (
            "No details added"
          )}
        </ReviewSection>

        {/* Photos */}
        <ReviewSection icon={Image} title="Photos" onEdit={() => onEditStep(3)}>
          {photos.length > 0 ? (
            <div className="flex gap-2 mt-2">
              {photos.slice(0, 4).map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative w-16 h-16 rounded-lg overflow-hidden bg-accent"
                >
                  {/* biome-ignore lint/performance/noImgElement: blob URLs cannot use Next Image */}
                  <img
                    src={photo.previewUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {photos.length > 4 && (
                <div className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center text-sm font-medium">
                  +{photos.length - 4}
                </div>
              )}
            </div>
          ) : (
            "No photos added"
          )}
        </ReviewSection>

        {/* Pricing */}
        <ReviewSection
          icon={DollarSign}
          title="Pricing"
          onEdit={() => onEditStep(4)}
        >
          {rates.length > 0 ? (
            <ul className="list-disc list-inside">
              {rates.map((rate) => (
                <li key={String(rate)}>{rate}</li>
              ))}
            </ul>
          ) : (
            "No rates set"
          )}
        </ReviewSection>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        By publishing, you agree to our Terms of Service and Host Guidelines.
      </p>
    </div>
  );
}
