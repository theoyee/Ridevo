import { View } from "react-native";

import { Typography } from "@/components/ui/Typography";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function OnboardingProgress({
  currentStep,
  totalSteps = 3,
}: OnboardingProgressProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: totalSteps,
        now: currentStep,
      }}
      className="gap-3"
    >
      <View className="flex-row gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            className={[
              "h-1 flex-1 rounded-full",
              index + 1 <= currentStep ? "bg-primary" : "bg-border",
            ].join(" ")}
          />
        ))}
      </View>

      <Typography
        variant="caption"
        className="uppercase tracking-widest text-muted"
      >
        Step {currentStep} of {totalSteps}
      </Typography>
    </View>
  );
}
