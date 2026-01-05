"use client";

import { useCallback, useState } from "react";
import type { PhotoFile } from "@/components/host/steps/photos-step";
import { spotsClientApi } from "@/lib/features/spot";
import type { SpotType, VehicleSize } from "@/lib/features/spot/types";

export const STEPS = [
  "basic",
  "location",
  "details",
  "photos",
  "pricing",
  "review",
] as const;

export type Step = (typeof STEPS)[number];

export interface HostFormData {
  // Basic info
  spotType: SpotType | null;
  title: string;
  description: string;

  // Location
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;

  // Details
  vehicleSize: VehicleSize | null;
  isCovered: boolean;
  hasEvCharging: boolean;
  hasSecurity: boolean;
  accessInstructions: string;

  // Photos
  photos: PhotoFile[];

  // Pricing
  hourlyRate: number | null;
  dailyRate: number | null;
  monthlyRate: number | null;
}

export interface HostFormErrors {
  spotType?: string;
  title?: string;
  description?: string;
  address?: string;
  vehicleSize?: string;
  photos?: string;
  pricing?: string;
}

const initialFormData: HostFormData = {
  spotType: null,
  title: "",
  description: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  latitude: null,
  longitude: null,
  vehicleSize: null,
  isCovered: false,
  hasEvCharging: false,
  hasSecurity: false,
  accessInstructions: "",
  photos: [],
  hourlyRate: null,
  dailyRate: null,
  monthlyRate: null,
};

export function validateStep(step: Step, data: HostFormData): HostFormErrors {
  const errors: HostFormErrors = {};

  switch (step) {
    case "basic":
      if (!data.spotType) {
        errors.spotType = "Please select a spot type";
      }
      if (!data.title.trim()) {
        errors.title = "Title is required";
      } else if (data.title.length < 5) {
        errors.title = "Title must be at least 5 characters";
      } else if (data.title.length > 100) {
        errors.title = "Title must be under 100 characters";
      }
      break;

    case "location":
      if (!data.latitude || !data.longitude) {
        errors.address = "Please select a valid address from suggestions";
      }
      break;

    case "details":
      if (!data.vehicleSize) {
        errors.vehicleSize = "Please select a vehicle size";
      }
      break;

    case "photos":
      if (data.photos.length === 0) {
        errors.photos = "Please add at least one photo";
      }
      break;

    case "pricing": {
      const hasAtLeastOneRate =
        data.hourlyRate !== null ||
        data.dailyRate !== null ||
        data.monthlyRate !== null;
      if (!hasAtLeastOneRate) {
        errors.pricing = "Please set at least one rate";
      }
      break;
    }

    case "review":
      // Validate all steps
      return {
        ...validateStep("basic", data),
        ...validateStep("location", data),
        ...validateStep("details", data),
        ...validateStep("photos", data),
        ...validateStep("pricing", data),
      };
  }

  return errors;
}

export function useHostForm() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<HostFormData>(initialFormData);
  const [errors, setErrors] = useState<HostFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = STEPS[currentStepIndex] as Step;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const updateFormData = useCallback(
    <K extends keyof HostFormData>(field: K, value: HostFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when field is updated
      if (field in errors) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof HostFormErrors];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < STEPS.length) {
      setCurrentStepIndex(index);
      setErrors({});
    }
  }, []);

  const goBack = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
      setErrors({});
    }
  }, [isFirstStep]);

  const goNext = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return false;
    }

    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
      setErrors({});
    }

    return true;
  }, [currentStep, formData, isLastStep]);

  const canProceed = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, formData]);

  const submit = useCallback(async () => {
    const allErrors = validateStep("review", formData);

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return {
        success: false,
        error: "Please fix the errors before submitting",
      };
    }

    setIsSubmitting(true);

    try {
      // Create the spot
      const spot = await spotsClientApi.create({
        title: formData.title,
        description: formData.description || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state || undefined,
        postal_code: formData.postalCode || undefined,
        country: formData.country || undefined,
        latitude: formData.latitude as number,
        longitude: formData.longitude as number,
        spot_type: formData.spotType as SpotType,
        vehicle_size: formData.vehicleSize as VehicleSize,
        is_covered: formData.isCovered,
        has_ev_charging: formData.hasEvCharging,
        has_security: formData.hasSecurity,
        access_instructions: formData.accessInstructions || undefined,
        hourly_rate: formData.hourlyRate ?? undefined,
        daily_rate: formData.dailyRate ?? undefined,
        monthly_rate: formData.monthlyRate ?? undefined,
      });

      // Upload photos if any
      if (formData.photos.length > 0) {
        const files = formData.photos.map((p) => p.file);
        await spotsClientApi.uploadPhotos(spot.id, files);
      }

      return { success: true, spotId: spot.id };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create listing",
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStepIndex(0);
    setErrors({});
  }, []);

  return {
    // State
    currentStep,
    currentStepIndex,
    formData,
    errors,
    isSubmitting,

    // Navigation
    isFirstStep,
    isLastStep,
    totalSteps: STEPS.length,
    goToStep,
    goBack,
    goNext,
    canProceed,

    // Data
    updateFormData,
    submit,
    reset,
  };
}
