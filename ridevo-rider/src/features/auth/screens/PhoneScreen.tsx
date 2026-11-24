import { useRef } from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { ArrowLeft, CircleAlert } from "lucide-react-native";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Typography } from "@/components/ui/Typography";

import { normalizePhoneNumber } from "@/utils/phone";

import { phoneSchema, type PhoneFormValues } from "../schemas/phone.schema";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { useSendOtp } from "../hooks/useSendOtp";
import { useAuthStore } from "../stores/auth.store";

export function PhoneScreen() {
  const router = useRouter();

  const sendOtp = useSendOtp();

  const submissionLock = useRef(false);

  const setChallenge = useAuthStore((state) => state.setChallenge);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: {
      phone: "",
    },
  });

  const isBusy = isSubmitting || sendOtp.isPending;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(auth)/welcome");
  }

  async function onSubmit(values: PhoneFormValues) {
    if (submissionLock.current) return;

    const phone = normalizePhoneNumber(values.phone);

    if (!phone) return;

    submissionLock.current = true;

    Keyboard.dismiss();

    try {
      const challenge = await sendOtp.mutateAsync({
        phone,
      });

      setChallenge(challenge);

      router.push("/(auth)/verify-otp");
    } catch {
      // TanStack Query exposes the error through
      // sendOtp.error, which is rendered below.
    } finally {
      submissionLock.current = false;
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4">
            <IconButton
              accessibilityLabel="Go back"
              onPress={handleBack}
              disabled={isBusy}
            >
              <ArrowLeft size={22} color="#101820" strokeWidth={2} />
            </IconButton>

            <BrandLogo width={100} height={36} />
          </View>

          {/* Main content */}
          <View className="flex-1 px-6 pt-10">
            <Typography variant="h1">What's your{"\n"}phone number?</Typography>

            <Typography variant="body" className="mt-3 text-muted">
              Enter your phone number to sign in or create your Ridevo account.
            </Typography>

            <View className="mt-8">
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <PhoneInput
                    ref={field.ref}
                    value={field.value}
                    editable={!isBusy}
                    onBlur={field.onBlur}
                    onChangeText={(value) => {
                      field.onChange(value);

                      if (sendOtp.isError) {
                        sendOtp.reset();
                      }
                    }}
                    error={errors.phone?.message}
                    returnKeyType="done"
                    onSubmitEditing={() =>
                      isValid && !isBusy ? handleSubmit(onSubmit) : undefined
                    }
                  />
                )}
              />

              <Typography variant="small" className="mt-3 text-muted">
                We'll send a verification code via SMS.
              </Typography>
            </View>

            {/* API error */}
            {sendOtp.isError && (
              <View
                accessibilityLiveRegion="polite"
                className="mt-5 flex-row items-start gap-3 rounded-2xl bg-error/5 p-4"
              >
                <CircleAlert size={20} color="#DC2626" />

                <Typography variant="small" className="flex-1 text-error">
                  {sendOtp.error.message ||
                    "Unable to send verification code. Please try again."}
                </Typography>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="gap-4 px-6 pb-4 pt-8">
            <Button
              title="Continue"
              disabled={!isValid || isBusy}
              loading={isBusy}
              onPress={() => handleSubmit(onSubmit)}
            />

            <View className="flex-row flex-wrap items-center justify-center">
              <Typography variant="caption" className="text-center text-muted">
                By continuing, you agree to our
              </Typography>
            </View>

            <View className="-mt-3 flex-row flex-wrap items-center justify-center gap-1">
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/legal/terms")}
              >
                <Typography variant="caption" className="font-medium underline">
                  Terms of Service
                </Typography>
              </Pressable>

              <Typography variant="caption" className="text-muted">
                and
              </Typography>

              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/legal/privacy")}
              >
                <Typography variant="caption" className="font-medium underline">
                  Privacy Policy.
                </Typography>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
