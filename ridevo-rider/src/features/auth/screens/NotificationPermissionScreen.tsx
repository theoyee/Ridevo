import { useRef, useState } from "react";

import { Pressable, ScrollView, View } from "react-native";

import { Redirect } from "expo-router";

import {
  BellRing,
  CarFront,
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
} from "lucide-react-native";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

import { NotificationIllustration } from "@/features/notifications/components/NotificationIllustration";
import { useNotificationPermission } from "@/features/notifications/hooks/useNotificationPermission";

import { OnboardingProgress } from "../components/OnboardingProgress";
import { useAuthStore } from "../stores/auth.store";
import { SessionExpiredError } from "../types/auth.errors";
import { getAuthenticatedRoute } from "../utils/auth-navigation";

const benefits = [
  {
    icon: CarFront,
    title: "Real-time ride updates",
    description: "Know when your driver is on the way.",
  },
  {
    icon: BellRing,
    title: "Timely arrival alerts",
    description: "Never miss your driver's arrival.",
  },
  {
    icon: ShieldCheck,
    title: "Important account updates",
    description: "Stay informed about your account.",
  },
];

export function NotificationPermissionScreen() {
  const status = useAuthStore((state) => state.status);

  const session = useAuthStore((state) => state.session);

  const setOnboardingStage = useAuthStore((state) => state.setOnboardingStage);

  const signOut = useAuthStore((state) => state.signOut);

  const { permission, requestPermission, openSettings } =
    useNotificationPermission();

  const operationLock = useRef(false);

  const [isBusy, setIsBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);

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
    session.onboardingStage !== "notifications"
  ) {
    return <Redirect href={getAuthenticatedRoute(session)} />;
  }

  const isGranted = permission?.granted === true;

  const isBlocked = permission?.status === "blocked";

  async function completeOnboarding() {
    await setOnboardingStage("completed");
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

  async function handleEnableNotifications() {
    if (operationLock.current) return;

    operationLock.current = true;
    setIsBusy(true);
    setError(null);

    try {
      if (isBlocked) {
        await openSettings();
        return;
      }

      const result = isGranted ? permission : await requestPermission();

      if (!result?.granted) {
        setError(
          result?.canAskAgain
            ? "Notifications are disabled. You can try again or continue without them."
            : "You can enable notifications in your device settings.",
        );

        return;
      }

      await completeOnboarding();
    } catch (cause) {
      await handleError(cause);
    } finally {
      operationLock.current = false;
      setIsBusy(false);
    }
  }

  async function handleSkip() {
    if (operationLock.current) return;

    operationLock.current = true;
    setIsBusy(true);
    setError(null);

    try {
      await completeOnboarding();
    } catch (cause) {
      await handleError(cause);
    } finally {
      operationLock.current = false;
      setIsBusy(false);
    }
  }

  const buttonTitle = isBlocked
    ? "Open settings"
    : isGranted
      ? "Continue"
      : "Enable notifications";

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="mx-auto w-full max-w-[480px] flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4">
            <Typography variant="small" className="text-muted">
              Account setup
            </Typography>

            <BrandLogo width={100} height={36} />
          </View>

          {/* Main content */}
          <View className="flex-1 px-6 pt-8">
            <OnboardingProgress currentStep={3} totalSteps={3} />

            <View className="mt-6">
              <NotificationIllustration active={!isBusy} />
            </View>

            <Typography variant="h1" className="mt-6">
              {"Never miss\na moment."}
            </Typography>

            <Typography variant="body" className="mt-3 text-muted">
              Stay informed from the moment you book until you reach your
              destination.
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

            {/* Permission granted */}
            {isGranted ? (
              <View className="mt-5 flex-row items-center gap-3 rounded-2xl bg-success/10 p-4">
                <CheckCircle2 size={22} color="#15803D" />

                <Typography variant="small" className="flex-1 text-success">
                  Notifications enabled.
                </Typography>
              </View>
            ) : null}

            {/* Error */}
            {error ? (
              <View
                accessibilityLiveRegion="polite"
                className="mt-5 flex-row items-start gap-3 rounded-2xl bg-error/5 p-4"
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
              onPress={() => void handleEnableNotifications()}
            />

            {!isGranted ? (
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={() => void handleSkip()}
                className="min-h-12 items-center justify-center"
              >
                <Typography variant="bodyMedium" className="text-muted">
                  Maybe later
                </Typography>
              </Pressable>
            ) : null}

            <View className="flex-row items-center justify-center gap-2">
              <ShieldCheck size={14} color="#667085" />

              <Typography variant="caption" className="text-muted">
                Manage notifications anytime.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
