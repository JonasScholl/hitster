import { Pressable, Text, type PressableProps } from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 active:bg-primary-700",
  secondary: "bg-gray-600 active:bg-gray-700",
  danger: "bg-red-600 active:bg-red-700",
  ghost: "bg-transparent active:bg-gray-700",
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: "py-2 px-4", text: "text-sm" },
  md: { container: "py-3 px-6", text: "text-base" },
  lg: { container: "py-4 px-8", text: "text-lg" },
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseContainer = "rounded-lg items-center justify-center";
  const disabledStyle = disabled ? "opacity-50" : "";

  return (
    <Pressable
      className={`${baseContainer} ${variantStyles[variant]} ${sizeStyles[size].container} ${disabledStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      <Text className={`font-bold text-white ${sizeStyles[size].text}`}>
        {children}
      </Text>
    </Pressable>
  );
}
