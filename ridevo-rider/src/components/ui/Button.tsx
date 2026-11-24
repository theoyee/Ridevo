import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";

import { Typography } from "./Typography";

const variants = {
  primary: {
    container: "bg-primary",
    text: "text-white",
    spinner: "#FFFFFF",
  },
  accent: {
    container: "bg-accent",
    text: "text-primary",
    spinner: "#101820",
  },
  secondary: {
    container: "bg-surface",
    text: "text-primary",
    spinner: "#101820",
  },
  outline: {
    container: "border border-border bg-transparent",
    text: "text-primary",
    spinner: "#101820",
  },
  danger: {
    container: "bg-error",
    text: "text-white",
    spinner: "#FFFFFF",
  },
} as const;

interface ButtonProps extends Omit<PressableProps, "children"> {
  title: string;
  variant?: keyof typeof variants;
  loading?: boolean;
  className?: string;
}

export function Button({
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...props
}: ButtonProps) {
  const styles = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      className={`
        min-h-14 flex-row items-center
        justify-center rounded-full px-6 py-3
        ${styles.container}
        ${isDisabled ? "opacity-50" : "active:opacity-80"}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator size="small" color={styles.spinner} />
      ) : (
        <Typography
          variant="bodyMedium"
          className={`text-center ${styles.text}`}
        >
          {title}
        </Typography>
      )}
    </Pressable>
  );
}
