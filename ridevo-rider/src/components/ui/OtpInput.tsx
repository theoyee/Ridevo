import { useState, type ComponentPropsWithRef } from "react";

import { Platform, StyleSheet, TextInput, View } from "react-native";

import { Typography } from "./Typography";

type OtpInputProps = Omit<
  ComponentPropsWithRef<typeof TextInput>,
  "value" | "onChangeText"
> & {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  error?: boolean;
};

export function OtpInput({
  ref,
  value,
  onChangeText,
  length = 6,
  error = false,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: OtpInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View className="relative w-full">
      {/* Visual OTP cells */}
      <View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="flex-row gap-2"
      >
        {Array.from({ length }, (_, index) => {
          const digit = value[index];

          const isActive = isFocused && index === activeIndex;

          const borderClass = error
            ? "border-error"
            : isActive
              ? "border-primary"
              : "border-border";

          return (
            <View
              key={index}
              className={[
                "min-h-[58px] flex-1 items-center justify-center rounded-xl border",
                borderClass,
                digit ? "bg-surface" : "bg-background",
                !editable ? "opacity-60" : "",
              ].join(" ")}
            >
              {digit ? (
                <Typography variant="h2">{digit}</Typography>
              ) : isActive ? (
                <View className="h-6 w-0.5 rounded-full bg-primary" />
              ) : (
                <View className="h-1.5 w-1.5 rounded-full bg-border" />
              )}
            </View>
          );
        })}
      </View>

      {/* Single native input */}
      <TextInput
        {...props}
        ref={ref}
        value={value}
        editable={editable}
        onChangeText={(text) => {
          onChangeText(text.replace(/\D/g, "").slice(0, length));
        }}
        keyboardType="number-pad"
        inputMode="numeric"
        autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
        textContentType="oneTimeCode"
        autoCorrect={false}
        autoCapitalize="none"
        caretHidden
        selectionColor="transparent"
        accessibilityLabel={`${length}-digit verification code`}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        style={styles.input}
        // className="hidden"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    ...StyleSheet.absoluteFill,
    color: "transparent",
    backgroundColor: "transparent",
    fontSize: 20,
    opacity: 0,
  },
});
