import { HostFormNavigation } from "./host-form-navigation";
import { HostFormProgress } from "./host-form-progress";

interface HostFormLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  canProceed: boolean;
}

export function HostFormLayout({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
  canProceed,
}: HostFormLayoutProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-8">{children}</div>
      </div>

      {/* Fixed bottom section */}
      <div className="shrink-0 border-t border-border bg-background">
        <HostFormProgress current={currentStep} total={totalSteps} />
        <HostFormNavigation
          onBack={onBack}
          onNext={onNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          canProceed={canProceed}
        />
      </div>
    </div>
  );
}
