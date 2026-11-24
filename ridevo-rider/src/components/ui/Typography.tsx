import { Text, type TextProps } from "react-native";

const variants = {
  display: "text-[40px] leading-[48px] font-bold",
  h1: "text-[32px] leading-[40px] font-bold",
  h2: "text-2xl leading-8 font-semibold",
  h3: "text-xl leading-7 font-semibold",
  body: "text-base leading-6 font-regular",
  bodyMedium: "text-base leading-6 font-medium",
  small: "text-sm leading-5 font-regular",
  caption: "text-xs leading-4 font-regular",
} as const;

interface TypographyProps extends TextProps {
  variant?: keyof typeof variants;
  className?: string;
}

export function Typography({
  variant = "body",
  className = "",
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      {...props}
      className={`text-primary ${variants[variant]} ${className}`}
    >
      {children}
    </Text>
  );
}
