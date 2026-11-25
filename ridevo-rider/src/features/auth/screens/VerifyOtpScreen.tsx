import { useRef, useState } from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Redirect, useRouter } from "expo-router";

import { ArrowLeft, CircleAlert, Lock, ShieldCheck } from "lucide-react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { OtpInput } from "@/components/ui/OtpInput";
import { Typography } from "@/components/ui/Typography";

import { formatPhoneNumber } from "@/utils/phone";

import { useOtpCountdown } from "../hooks/useOtpCountdown";
import { useResendOtp } from "../hooks/useResendOtp";
import { useVerifyOtp } from "../hooks/useVerifyOtp";

import {
  OTP_LENGTH,
  otpSchema,
  type OtpFormValues,
} from "../schemas/otp.schema";

import { useAuthStore } from "../stores/auth.store";

export function VerifyOtpScreen() {
  const router = useRouter();

  const challenge = useAuthStore((state) => state.challenge);

  const session = useAuthStore((state) => state.session);

  const setChallenge = useAuthStore((state) => state.setChallenge);

  const setSession = useAuthStore((state) => state.setSession);

  const clearChallenge = useAuthStore((state) => state.clearChallenge);

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const operationLock = useRef(false);

  const [sessionError, setSessionError] = useState<string | null>(null);

  const resendCountdown = useOtpCountdown(challenge?.resendAvailableAt);

  const expiryCountdown = useOtpCountdown(challenge?.expiresAt);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
    },
  });

  const isBusy = isSubmitting || verifyOtp.isPending || resendOtp.isPending;

  const canResend = resendCountdown.isFinished && !isBusy;

  const canVerify = isValid && !isBusy && !expiryCountdown.isFinished;

  const errorMessage =
    sessionError || verifyOtp.error?.message || resendOtp.error?.message;

  if (session) {
    return (
      <Redirect
        href={
          session.user.profileCompleted ? "/(tabs)" : "/(auth)/profile-setup"
        }
      />
    );
  }

  if (!challenge) {
    return <Redirect href="/(auth)/phone" />;
  }

  function handleEditPhone() {
    if (operationLock.current) return;

    Keyboard.dismiss();

    clearChallenge();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(auth)/phone");
  }

  async function onSubmit(values: OtpFormValues) {
    if (
      !challenge ||
      operationLock.current ||
      Date.parse(challenge.expiresAt) <= Date.now()
    ) {
      return;
    }

    operationLock.current = true;

    setSessionError(null);

    Keyboard.dismiss();

    try {
      const authenticatedSession = await verifyOtp.mutateAsync({
        challengeId: challenge.challengeId,
        code: values.code,
      });

      try {
        await setSession(authenticatedSession);
      } catch {
        setSessionError(
          "Unable to save your session. Return to the phone screen and try again.",
        );
      }
    } catch {
      // Verification errors are rendered below.
    } finally {
      operationLock.current = false;
    }
  }

  function handleVerify() {
    if (!canVerify || operationLock.current) return;

    void handleSubmit(onSubmit)();
  }

  async function handleResend() {
    if (
      !challenge ||
      !canResend ||
      operationLock.current ||
      Date.parse(challenge.resendAvailableAt) > Date.now()
    ) {
      return;
    }

    operationLock.current = true;

    verifyOtp.reset();
    setSessionError(null);

    try {
      const newChallenge = await resendOtp.mutateAsync({
        challengeId: challenge.challengeId,
      });

      setChallenge(newChallenge);

      reset({ code: "" });
    } catch {
      // Resend errors are rendered below.
    } finally {
      operationLock.current = false;
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="mx-auto w-full max-w-[480px] flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-4">
              <IconButton
                accessibilityLabel="Go back"
                onPress={handleEditPhone}
                disabled={isBusy}
              >
                <ArrowLeft size={22} color="#101820" strokeWidth={2} />
              </IconButton>

              <BrandLogo width={100} height={36} />
            </View>

            {/* Main content */}
            <View className="flex-1 px-6 pt-10">
              <View className="mb-6 h-[60px] w-[60px] items-center justify-center rounded-2xl bg-accent/20">
                <ShieldCheck size={30} color="#101820" strokeWidth={1.8} />
              </View>

              <Typography variant="h1">
                {"Verify your\nphone number"}
              </Typography>

              <Typography variant="body" className="mt-3 text-muted">
                Enter the 6-digit verification code sent to your phone number.
              </Typography>

              {/* Phone number */}
              <View className="mt-3 flex-row items-center gap-3">
                <Typography variant="bodyMedium">
                  {formatPhoneNumber(challenge.phone)}
                </Typography>

                <Pressable
                  disabled={isBusy}
                  onPress={handleEditPhone}
                  accessibilityRole="button"
                  accessibilityLabel="Edit phone number"
                  className="min-h-12 justify-center px-2"
                >
                  <Typography variant="small" className="font-medium underline">
                    Edit
                  </Typography>
                </Pressable>
              </View>

              {/* OTP field */}
              <View className="mt-6">
                <Controller
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <OtpInput
                      ref={field.ref}
                      value={field.value}
                      length={OTP_LENGTH}
                      editable={!isBusy}
                      autoFocus
                      error={Boolean(errorMessage)}
                      onBlur={field.onBlur}
                      onChangeText={(value) => {
                        field.onChange(value);

                        if (verifyOtp.isError) {
                          verifyOtp.reset();
                        }

                        if (resendOtp.isError) {
                          resendOtp.reset();
                        }
                      }}
                      onSubmitEditing={handleVerify}
                    />
                  )}
                />

                <Typography
                  variant="caption"
                  className={
                    expiryCountdown.isFinished
                      ? "mt-3 text-error"
                      : "mt-3 text-muted"
                  }
                >
                  {expiryCountdown.isFinished
                    ? "Your verification code has expired."
                    : `Code expires in ${expiryCountdown.formatted}`}
                </Typography>
              </View>

              {/* Error feedback */}
              {errorMessage ? (
                <View
                  accessibilityLiveRegion="polite"
                  className="mt-5 flex-row items-start gap-3 rounded-2xl bg-error/5 p-4"
                >
                  <CircleAlert size={20} color="#DC2626" />

                  <Typography variant="small" className="flex-1 text-error">
                    {errorMessage}
                  </Typography>
                </View>
              ) : null}

              {/* Resend verification code */}
              <View className="mt-8 items-center">
                <Typography variant="small" className="text-muted">
                  Didn't receive the code?
                </Typography>

                <Pressable
                  accessibilityRole="button"
                  disabled={!canResend}
                  onPress={handleResend}
                  className="mt-1 min-h-12 items-center justify-center px-4"
                >
                  <Typography
                    variant="bodyMedium"
                    className={
                      canResend ? "text-primary underline" : "text-muted"
                    }
                  >
                    {resendOtp.isPending
                      ? "Sending code..."
                      : resendCountdown.isFinished
                        ? "Resend code"
                        : `Resend code in ${resendCountdown.formatted}`}
                  </Typography>
                </Pressable>
              </View>

              {/* Development-only hint */}
              {__DEV__ && (
                <View className="mt-4 rounded-xl bg-surface p-3">
                  <Typography
                    variant="caption"
                    className="text-center text-muted"
                  >
                    Development code: 123456
                  </Typography>
                </View>
              )}
            </View>

            {/* Footer */}
            <View className="gap-4 px-6 pb-4 pt-8">
              <Button
                title="Verify and continue"
                variant="primary"
                disabled={!canVerify}
                loading={verifyOtp.isPending || isSubmitting}
                onPress={handleVerify}
              />

              <View className="flex-row items-center justify-center gap-2">
                <Lock size={14} color="#667085" strokeWidth={1.8} />

                <Typography variant="caption" className="text-muted">
                  Secure verification
                </Typography>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
