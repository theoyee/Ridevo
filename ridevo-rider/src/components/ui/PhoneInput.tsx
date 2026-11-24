import { CircleAlert } from "lucide-react-native";
import { useState, type ComponentPropsWithRef } from "react";
import { TextInput, View } from "react-native";

import { Typography } from "@/components/ui/Typography";

type PhoneInputProps = ComponentPropsWithRef<typeof TextInput> & {
  label?: string;
  error?: string;
};

export function PhoneInput({
  ref,
  label = "Phone number",
  error,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error
    ? "border-error"
    : isFocused
      ? "border-primary"
      : "border-border";

  return (
    <View className="gap-2">
      <Typography variant="bodyMedium">{label}</Typography>

      <View
        className={[
          "min-h-[60px] flex-row items-center rounded-2xl",
          "border bg-background px-4",
          borderClass,
          !editable ? "opacity-60" : "",
        ].join(" ")}
      >
        {/* Country code */}
        <View className="flex-row items-center gap-2">
          <Typography variant="body">🇳🇬</Typography>

          <Typography variant="bodyMedium">+234</Typography>
        </View>

        {/* Divider */}
        <View className="mx-3 h-6 w-px bg-border" />

        {/* Native phone input */}
        <TextInput
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="800 000 0000"
          placeholderTextColor="#98A2B3"
          selectionColor="#101820"
          maxLength={24}
          className="min-h-[58px] flex-1 font-medium text-lg text-primary"
          {...props}
          ref={ref}
          editable={editable}
          accessibilityLabel={label}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />
      </View>

      {/* Validation error */}
      {error ? (
        <View
          accessibilityLiveRegion="polite"
          className="flex-row items-center gap-2"
        >
          <CircleAlert size={14} color="#DC2626" strokeWidth={2} />

          <Typography variant="caption" className="flex-1 text-error">
            {error}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}
