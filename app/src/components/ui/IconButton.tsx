import { Pressable, type PressableProps, View } from "react-native";

type IconButtonVariant = "primary" | "secondary" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends PressableProps {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary: "bg-primary-600 active:bg-primary-700",
  secondary: "bg-gray-600 active:bg-gray-700",
  ghost: "bg-gray-700 active:bg-gray-600",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

export default function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  const baseStyle = "rounded-full items-center justify-center";

  return (
    <Pressable
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <View className="items-center justify-center">{icon}</View>
    </Pressable>
  );
}
