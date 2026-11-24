import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

interface IconButtonProps extends PressableProps {
  children: ReactNode;
  className?: string;
  accessibilityLabel: string;
}

export function IconButton({
  children,
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      className={`
        h-12 w-12 items-center justify-center
        rounded-full border border-border
        bg-background active:bg-surface
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
    >
      {children}
    </Pressable>
  );
}
