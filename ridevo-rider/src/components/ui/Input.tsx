import { useState, type ComponentPropsWithRef, type ReactNode } from "react";

import { CircleAlert } from "lucide-react-native";
import { TextInput, View } from "react-native";

import { Typography } from "./Typography";

type InputProps = ComponentPropsWithRef<typeof TextInput> & {
  label?: string;
  error?: string;
  helperText?: string;
  optional?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Input({
  ref,
  label,
  error,
  helperText,
  optional = false,
  leftIcon,
  rightIcon,
  editable = true,
  onFocus,
  onBlur,
  className = "",
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error
    ? "border-error"
    : isFocused
      ? "border-primary"
      : "border-border";

  return (
    <View className="gap-2">
      {label ? (
        <View className="flex-row items-center justify-between">
          <Typography variant="bodyMedium">{label}</Typography>

          {optional ? (
            <Typography variant="caption" className="text-muted">
              Optional
            </Typography>
          ) : null}
        </View>
      ) : null}

      <View
        className={[
          "min-h-[58px] flex-row items-center gap-3 rounded-2xl border bg-background px-4",
          borderClass,
          !editable ? "opacity-60" : "",
        ].join(" ")}
      >
        {leftIcon}

        <TextInput
          placeholderTextColor="#98A2B3"
          selectionColor="#101820"
          autoCorrect={false}
          {...props}
          ref={ref}
          editable={editable}
          accessibilityLabel={props.accessibilityLabel ?? label}
          className={[
            "min-h-[56px] flex-1 font-regular text-base text-primary",
            className,
          ].join(" ")}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />

        {rightIcon}
      </View>

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
      ) : helperText ? (
        <Typography variant="caption" className="text-muted">
          {helperText}
        </Typography>
      ) : null}
    </View>
  );
}
