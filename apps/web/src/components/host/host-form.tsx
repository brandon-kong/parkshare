"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHostForm } from "@/hooks/use-host-form";
import { HostFormLayout } from "./host-form-layout";
import { BasicInfoStep } from "./steps/basic-info-step";
import { DetailsStep } from "./steps/details-step";
import { LocationStep } from "./steps/location-step";
import { PhotosStep } from "./steps/photos-step";
import { PricingStep } from "./steps/pricing-step";
import { ReviewStep } from "./steps/review-step";

export function HostForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    currentStep,
    currentStepIndex,
    formData,
    errors,
    isSubmitting,
    isFirstStep,
    isLastStep,
    totalSteps,
    goToStep,
    goBack,
    goNext,
    canProceed,
    updateFormData,
    submit,
  } = useHostForm();

  const handleNext = async () => {
    if (isLastStep) {
      setSubmitError(null);
      const result = await submit();
      if (result.success && result.spotId) {
        router.push(`/spots/${result.spotId}`);
      } else if (result.error) {
        setSubmitError(result.error);
      }
    } else {
      goNext();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "basic":
        return (
          <BasicInfoStep
            spotType={formData.spotType}
            title={formData.title}
            description={formData.description}
            onSpotTypeChange={(type) => updateFormData("spotType", type)}
            onTitleChange={(title) => updateFormData("title", title)}
            onDescriptionChange={(desc) => updateFormData("description", desc)}
            errors={{
              spotType: errors.spotType,
              title: errors.title,
              description: errors.description,
            }}
          />
        );

      case "location":
        return (
          <LocationStep
            location={{
              address: formData.address,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
              latitude: formData.latitude,
              longitude: formData.longitude,
            }}
            onLocationChange={(loc) => {
              updateFormData("address", loc.address);
              updateFormData("city", loc.city);
              updateFormData("state", loc.state);
              updateFormData("postalCode", loc.postalCode);
              updateFormData("country", loc.country);
              updateFormData("latitude", loc.latitude);
              updateFormData("longitude", loc.longitude);
            }}
            errors={{ address: errors.address }}
          />
        );

      case "details":
        return (
          <DetailsStep
            vehicleSize={formData.vehicleSize}
            isCovered={formData.isCovered}
            hasEvCharging={formData.hasEvCharging}
            hasSecurity={formData.hasSecurity}
            accessInstructions={formData.accessInstructions}
            onVehicleSizeChange={(size) => updateFormData("vehicleSize", size)}
            onIsCoveredChange={(val) => updateFormData("isCovered", val)}
            onHasEvChargingChange={(val) =>
              updateFormData("hasEvCharging", val)
            }
            onHasSecurityChange={(val) => updateFormData("hasSecurity", val)}
            onAccessInstructionsChange={(val) =>
              updateFormData("accessInstructions", val)
            }
            errors={{ vehicleSize: errors.vehicleSize }}
          />
        );

      case "photos":
        return (
          <PhotosStep
            photos={formData.photos}
            onPhotosChange={(photos) => updateFormData("photos", photos)}
            errors={{ photos: errors.photos }}
          />
        );

      case "pricing":
        return (
          <PricingStep
            hourlyRate={formData.hourlyRate}
            dailyRate={formData.dailyRate}
            monthlyRate={formData.monthlyRate}
            onHourlyRateChange={(rate) => updateFormData("hourlyRate", rate)}
            onDailyRateChange={(rate) => updateFormData("dailyRate", rate)}
            onMonthlyRateChange={(rate) => updateFormData("monthlyRate", rate)}
            errors={{ pricing: errors.pricing }}
          />
        );

      case "review":
        return (
          <ReviewStep
            spotType={formData.spotType}
            title={formData.title}
            description={formData.description}
            address={formData.address}
            city={formData.city}
            state={formData.state}
            vehicleSize={formData.vehicleSize}
            isCovered={formData.isCovered}
            hasEvCharging={formData.hasEvCharging}
            hasSecurity={formData.hasSecurity}
            photos={formData.photos}
            hourlyRate={formData.hourlyRate}
            dailyRate={formData.dailyRate}
            monthlyRate={formData.monthlyRate}
            onEditStep={goToStep}
          />
        );

      default:
        return null;
    }
  };

  return (
    <HostFormLayout
      currentStep={currentStepIndex + 1}
      totalSteps={totalSteps}
      onBack={goBack}
      onNext={handleNext}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      isSubmitting={isSubmitting}
      canProceed={canProceed()}
      error={submitError}
    >
      {renderStep()}
    </HostFormLayout>
  );
}
