import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { CircleAlert } from "lucide-react-native";

import { Typography } from "./Typography";

interface PhoneInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function PhoneInput({
  label = "Phone number",
  error,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: PhoneInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "border-error"
    : focused
      ? "border-primary"
      : "border-border";

  return (
    <View className="gap-2">
      <Typography variant="bodyMedium">{label}</Typography>

      <View
        className={`
          min-h-[60px] flex-row items-center
          rounded-2xl border bg-background px-4
          ${borderColor}
          ${!editable ? "opacity-60" : ""}
        `}
      >
        <View className="flex-row items-center gap-2">
          <Typography variant="h3">🇳🇬</Typography>

          <Typography variant="bodyMedium">+234</Typography>
        </View>

        <View className="mx-3 h-6 w-px bg-border" />

        <TextInput
          {...props}
          editable={editable}
          accessibilityLabel={label}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="800 000 0000"
          placeholderTextColor="#98A2B3"
          maxLength={24}
          selectionColor="#101820"
          className="min-h-[58px] flex-1 font-medium text-lg text-primary"
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
      </View>

      {error ? (
        <View
          className="flex-row items-center gap-2"
          accessibilityLiveRegion="polite"
        >
          <CircleAlert size={14} color="#DC2626" />

          <Typography variant="caption" className="flex-1 text-error">
            {error}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}
