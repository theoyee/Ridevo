import { useRef, useState } from "react";

import { Pressable, ScrollView, View } from "react-native";

import { Redirect } from "expo-router";

import {
  CheckCircle2,
  CircleAlert,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

import { LocationIllustration } from "@/features/location/components/LocationIllustration";
import { useCurrentLocation } from "@/features/location/hooks/useCurrentLocation";
import { useLocationPermission } from "@/features/location/hooks/useLocationPermission";

import { OnboardingProgress } from "../components/OnboardingProgress";
import { useAuthStore } from "../stores/auth.store";
import { SessionExpiredError } from "../types/auth.errors";
import { getAuthenticatedRoute } from "../utils/auth-navigation";

const benefits = [
  {
    icon: MapPin,
    title: "Accurate pickup points",
    description: "Help your driver find you easily.",
  },
  {
    icon: Navigation,
    title: "Find nearby rides",
    description: "Get matched with drivers around you.",
  },
  {
    icon: ShieldCheck,
    title: "You're in control",
    description: "Manage location access anytime.",
  },
];

export function LocationPermissionScreen() {
  const status = useAuthStore((state) => state.status);

  const session = useAuthStore((state) => state.session);

  const setOnboardingStage = useAuthStore((state) => state.setOnboardingStage);

  const signOut = useAuthStore((state) => state.signOut);

  const { permission, servicesEnabled, requestPermission, openSettings } =
    useLocationPermission();

  const { getCurrentLocation, isLocating } = useCurrentLocation();

  const operationLock = useRef(false);

  const [isBusy, setIsBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [locationWarning, setLocationWarning] = useState<string | null>(null);

  if (status === "initializing") {
    return null;
  }

  if (status === "error") {
    return <Redirect href="/" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (
    !session.user.profileCompleted ||
    session.onboardingStage !== "location"
  ) {
    return <Redirect href={getAuthenticatedRoute(session)} />;
  }

  const isBlocked = permission?.status === "blocked";

  const isGranted = permission?.granted === true;

  async function advanceOnboarding() {
    await setOnboardingStage("notifications");
  }

  async function handleError(cause: unknown) {
    if (cause instanceof SessionExpiredError) {
      try {
        await signOut();
      } catch {
        setError("Unable to clear your session. Please try again.");
      }

      return;
    }

    setError(
      cause instanceof Error
        ? cause.message
        : "Something went wrong. Please try again.",
    );
  }

  async function handleEnableLocation() {
    if (operationLock.current) return;

    operationLock.current = true;

    setIsBusy(true);
    setError(null);
    setLocationWarning(null);

    try {
      if (isBlocked) {
        await openSettings();
        return;
      }

      const result = isGranted ? permission : await requestPermission();

      if (!result?.granted) {
        setError(
          result?.canAskAgain
            ? "Location access was denied. Try again or continue without it."
            : "Enable location access in your device settings.",
        );

        return;
      }

      // GPS acquisition is optional for onboarding.
      // A granted permission does not guarantee a fix.
      try {
        await getCurrentLocation();
      } catch {
        setLocationWarning(
          "Location is currently unavailable. You can choose your pickup manually.",
        );

        return;
      }

      await advanceOnboarding();
    } catch (cause) {
      await handleError(cause);
    } finally {
      operationLock.current = false;
      setIsBusy(false);
    }
  }

  async function handleContinueWithoutLocation() {
    if (operationLock.current) return;

    operationLock.current = true;

    setIsBusy(true);
    setError(null);

    try {
      await advanceOnboarding();
    } catch (cause) {
      await handleError(cause);
    } finally {
      operationLock.current = false;
      setIsBusy(false);
    }
  }

  const buttonTitle = isLocating
    ? "Finding your location..."
    : isBlocked
      ? "Open settings"
      : isGranted
        ? "Continue"
        : "Enable location";

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View className="mx-auto w-full max-w-[480px] flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4">
            <Typography variant="small" className="text-muted">
              Account setup
            </Typography>

            <BrandLogo width={100} height={36} />
          </View>

          {/* Content */}
          <View className="flex-1 px-6 pt-8">
            <OnboardingProgress currentStep={2} totalSteps={3} />

            <View className="mt-6">
              <LocationIllustration active={!isBusy} />
            </View>

            <Typography variant="h1" className="mt-6">
              {"Great rides start\nright where you are."}
            </Typography>

            <Typography variant="body" className="mt-3 text-muted">
              Enable your location to find nearby drivers and make pickups
              faster and more accurate.
            </Typography>

            {/* Benefits */}
            <View className="mt-6 gap-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <View
                    key={benefit.title}
                    className="flex-row items-center gap-3"
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface">
                      <Icon size={22} color="#101820" strokeWidth={1.8} />
                    </View>

                    <View className="flex-1 gap-1">
                      <Typography variant="bodyMedium">
                        {benefit.title}
                      </Typography>

                      <Typography variant="small" className="text-muted">
                        {benefit.description}
                      </Typography>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Granted status */}
            {isGranted ? (
              <View className="mt-5 flex-row items-center gap-3 rounded-2xl bg-success/10 p-4">
                <CheckCircle2 size={22} color="#15803D" />

                <Typography variant="small" className="flex-1 text-success">
                  Location access enabled.
                </Typography>
              </View>
            ) : null}

            {/* Disabled device location */}
            {isGranted && servicesEnabled === false ? (
              <View className="mt-4 rounded-2xl bg-warning/10 p-4">
                <Typography variant="small" className="text-warning">
                  Your device location services are turned off. Enable them or
                  continue without GPS.
                </Typography>
              </View>
            ) : null}

            {/* Location warning */}
            {locationWarning ? (
              <View
                accessibilityLiveRegion="polite"
                className="mt-4 rounded-2xl bg-warning/10 p-4"
              >
                <Typography variant="small" className="text-warning">
                  {locationWarning}
                </Typography>
              </View>
            ) : null}

            {/* Error state */}
            {error ? (
              <View
                accessibilityLiveRegion="polite"
                className="mt-4 flex-row items-start gap-3 rounded-2xl bg-error/5 p-4"
              >
                <CircleAlert size={20} color="#DC2626" />

                <Typography variant="small" className="flex-1 text-error">
                  {error}
                </Typography>
              </View>
            ) : null}
          </View>

          {/* Footer */}
          <View className="gap-3 px-6 pb-4 pt-8">
            <Button
              title={buttonTitle}
              loading={isBusy}
              disabled={isBusy}
              onPress={() => {
                if (
                  isGranted &&
                  (locationWarning || servicesEnabled === false)
                ) {
                  void handleContinueWithoutLocation();
                  return;
                }

                void handleEnableLocation();
              }}
            />

            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => void handleContinueWithoutLocation()}
              className="min-h-12 items-center justify-center"
            >
              <Typography variant="bodyMedium" className="text-muted">
                {isGranted ? "Continue without GPS" : "Maybe later"}
              </Typography>
            </Pressable>

            <View className="flex-row items-center justify-center gap-2">
              <ShieldCheck size={14} color="#667085" />

              <Typography variant="caption" className="text-muted">
                Location access is always your choice.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
