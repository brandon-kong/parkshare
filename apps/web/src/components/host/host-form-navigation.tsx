import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HostFormNavigationProps {
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  canProceed: boolean;
}

export function HostFormNavigation({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
  canProceed,
}: HostFormNavigationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      {!isFirstStep ? (
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          startIcon={<ChevronLeft size={18} />}
        >
          Back
        </Button>
      ) : (
        <div />
      )}

      <Button
        variant="primary"
        onClick={onNext}
        disabled={!canProceed}
        loading={isSubmitting}
      >
        {isLastStep ? "Publish" : "Next"}
      </Button>
    </div>
  );
}
