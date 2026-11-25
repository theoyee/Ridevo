import { useRef, useState, type ComponentRef } from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { Redirect, useRouter } from "expo-router";

import {
  CheckCircle2,
  CircleAlert,
  Lock,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Screen } from "@/components/layout/Screen";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";

import { formatPhoneNumber } from "@/utils/phone";

import { OnboardingProgress } from "../components/OnboardingProgress";
import { useCompleteProfile } from "../hooks/useCompleteProfile";
import { useAuthStore } from "../stores/auth.store";

import {
  profileSchema,
  type ProfileFormValues,
} from "../schemas/profile.schema";
import { SessionExpiredError } from "../types/auth.errors";

export function ProfileSetupScreen() {
  const session = useAuthStore((state) => state.session);

  const status = useAuthStore((state) => state.status);

  const completeProfile = useAuthStore((state) => state.completeProfile);

  const mutation = useCompleteProfile();

  const submissionLock = useRef(false);

  const lastNameRef = useRef<ComponentRef<typeof TextInput>>(null);

  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const router = useRouter();

  const signOut = useAuthStore((state) => state.signOut);

  const [isSigningOut, setIsSigningOut] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",

    defaultValues: {
      firstName: session?.user.firstName ?? "",
      lastName: session?.user.lastName ?? "",
      email: session?.user.email ?? "",
    },
  });

  const isBusy = isSubmitting || mutation.isPending || isSigningOut;

  if (status === "initializing") {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (session.user.profileCompleted) {
    return <Redirect href="/" />;
  }

  async function onSubmit(values: ProfileFormValues) {
    if (submissionLock.current) return;

    submissionLock.current = true;
    setSubmissionError(null);

    Keyboard.dismiss();

    try {
      const user = await mutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim() || undefined,
      });

      await completeProfile(user);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        await handleSignOut();
        return;
      }

      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Unable to complete your profile. Please try again.",
      );
    } finally {
      submissionLock.current = false;
    }
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    Keyboard.dismiss();

    try {
      await signOut();

      router.replace("/(auth)/phone");
    } catch {
      setSubmissionError("Unable to clear your session. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  function handleContinue() {
    if (!isValid || isBusy || submissionLock.current) {
      return;
    }

    void handleSubmit(onSubmit)();
  }

  function clearError() {
    if (submissionError) {
      setSubmissionError(null);
    }

    if (mutation.isError) {
      mutation.reset();
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

            {/* Main content */}
            <View className="flex-1 px-6 pt-8">
              <OnboardingProgress currentStep={1} totalSteps={3} />

              <View className="mb-6 mt-8 h-[60px] w-[60px] items-center justify-center rounded-2xl bg-accent/20">
                <UserRound size={30} color="#101820" strokeWidth={1.8} />
              </View>

              <Typography variant="h1">{"Let's get to\nknow you."}</Typography>

              <Typography variant="body" className="mt-3 text-muted">
                Tell us a little about yourself to personalize your Ridevo
                experience.
              </Typography>

              {/* Profile form */}
              <View className="mt-8 gap-5">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <Input
                      ref={field.ref}
                      label="First name"
                      placeholder="Enter your first name"
                      value={field.value}
                      editable={!isBusy}
                      autoComplete="given-name"
                      textContentType="givenName"
                      autoCapitalize="words"
                      maxLength={50}
                      returnKeyType="next"
                      submitBehavior="submit"
                      error={errors.firstName?.message}
                      onBlur={field.onBlur}
                      onChangeText={(value) => {
                        field.onChange(value);
                        clearError();
                      }}
                      onSubmitEditing={() => {
                        lastNameRef.current?.focus();
                      }}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <Input
                      ref={(instance) => {
                        lastNameRef.current = instance;
                        field.ref(instance);
                      }}
                      label="Last name"
                      placeholder="Enter your last name"
                      value={field.value}
                      editable={!isBusy}
                      autoComplete="family-name"
                      textContentType="familyName"
                      autoCapitalize="words"
                      maxLength={50}
                      returnKeyType="next"
                      submitBehavior="submit"
                      error={errors.lastName?.message}
                      onBlur={field.onBlur}
                      onChangeText={(value) => {
                        field.onChange(value);
                        clearError();
                      }}
                      onSubmitEditing={() => {
                        emailRef.current?.focus();
                      }}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      ref={(instance) => {
                        emailRef.current = instance;
                        field.ref(instance);
                      }}
                      label="Email address"
                      placeholder="you@example.com"
                      optional
                      value={field.value}
                      editable={!isBusy}
                      keyboardType="email-address"
                      autoComplete="email"
                      textContentType="emailAddress"
                      autoCapitalize="none"
                      maxLength={254}
                      returnKeyType="done"
                      error={errors.email?.message}
                      helperText="For trip receipts and important account updates."
                      onBlur={field.onBlur}
                      onChangeText={(value) => {
                        field.onChange(value);
                        clearError();
                      }}
                      onSubmitEditing={handleContinue}
                    />
                  )}
                />
              </View>

              {/* Verified phone number */}
              <View className="mt-6 flex-row items-center gap-3 rounded-2xl bg-surface p-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-success/10">
                  <ShieldCheck size={22} color="#15803D" strokeWidth={1.8} />
                </View>

                <View className="flex-1 gap-1">
                  <Typography variant="bodyMedium">
                    Phone number verified
                  </Typography>

                  <Typography variant="small" className="text-muted">
                    {formatPhoneNumber(session.user.phone)}
                  </Typography>
                </View>

                <CheckCircle2 size={20} color="#15803D" />
              </View>

              {/* Submission error */}
              {submissionError ? (
                <View
                  accessibilityLiveRegion="polite"
                  className="mt-5 flex-row items-start gap-3 rounded-2xl bg-error/5 p-4"
                >
                  <CircleAlert size={20} color="#DC2626" />

                  <Typography variant="small" className="flex-1 text-error">
                    {submissionError}
                  </Typography>
                </View>
              ) : null}
            </View>

            {/* Footer */}

            <View className="gap-4 px-6 pb-4 pt-8">
              <Button
                title="Continue"
                variant="primary"
                disabled={!isValid || isBusy}
                loading={isSubmitting || mutation.isPending}
                onPress={handleContinue}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign in with another account"
                disabled={isBusy}
                onPress={() => void handleSignOut()}
                className="min-h-12 items-center justify-center"
              >
                <Typography
                  variant="small"
                  className="text-center text-muted underline"
                >
                  {isSigningOut
                    ? "Signing out..."
                    : "Sign in with another account"}
                </Typography>
              </Pressable>

              <View className="flex-row items-center justify-center gap-2">
                <Lock size={14} color="#667085" strokeWidth={1.8} />

                <Typography variant="caption" className="text-muted">
                  Your information is protected.
                </Typography>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
