"use client";

import { Toggle } from "@/components/ui/toggle";
import { Typography } from "@/components/ui/typography";

interface PricingStepProps {
  hourlyRate: number | null;
  dailyRate: number | null;
  monthlyRate: number | null;
  onHourlyRateChange: (rate: number | null) => void;
  onDailyRateChange: (rate: number | null) => void;
  onMonthlyRateChange: (rate: number | null) => void;
  errors?: {
    pricing?: string;
  };
}

function RateInput({
  label,
  description,
  rate,
  onRateChange,
  unit,
}: {
  label: string;
  description: string;
  rate: number | null;
  onRateChange: (rate: number | null) => void;
  unit: string;
}) {
  const isEnabled = rate !== null;

  return (
    <div className="p-4 rounded-xl border border-border space-y-3">
      <Toggle
        checked={isEnabled}
        onChange={(checked) => onRateChange(checked ? 0 : null)}
        label={label}
        description={description}
      />

      {isEnabled && (
        <div className="flex items-center gap-2 pl-14">
          <span className="text-lg font-medium">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={rate || ""}
            onChange={(e) => {
              const value = e.target.value;
              onRateChange(value === "" ? 0 : parseFloat(value));
            }}
            placeholder="0.00"
            className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-lg font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <span className="text-muted-foreground">/{unit}</span>
        </div>
      )}
    </div>
  );
}

export function PricingStep({
  hourlyRate,
  dailyRate,
  monthlyRate,
  onHourlyRateChange,
  onDailyRateChange,
  onMonthlyRateChange,
  errors,
}: PricingStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h3">Set your pricing</Typography>
        <p className="text-muted-foreground mt-1">
          You can offer hourly, daily, or monthly rates. Enable at least one.
        </p>
      </div>

      <div className="space-y-4">
        <RateInput
          label="Hourly rate"
          description="Great for short-term parking"
          rate={hourlyRate}
          onRateChange={onHourlyRateChange}
          unit="hour"
        />

        <RateInput
          label="Daily rate"
          description="For all-day parking needs"
          rate={dailyRate}
          onRateChange={onDailyRateChange}
          unit="day"
        />

        <RateInput
          label="Monthly rate"
          description="Perfect for commuters"
          rate={monthlyRate}
          onRateChange={onMonthlyRateChange}
          unit="month"
        />
      </div>

      {errors?.pricing && (
        <p className="text-sm text-destructive">{errors.pricing}</p>
      )}

      <div className="p-4 rounded-xl bg-accent/50">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Offering multiple
          rate options attracts more guests and gives you flexibility.
        </p>
      </div>
    </div>
  );
}
