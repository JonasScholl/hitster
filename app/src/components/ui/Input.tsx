import { Text, TextInput, View, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  const inputBaseStyle =
    "w-full px-3 py-3 bg-gray-600 text-white rounded-lg text-base";
  const errorStyle = error ? "border border-red-500" : "";

  return (
    <View className="gap-1">
      {label && (
        <Text className="text-sm font-medium text-gray-300">{label}</Text>
      )}
      <TextInput
        className={`${inputBaseStyle} ${errorStyle} ${className}`}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      {error && <Text className="text-sm text-red-400">{error}</Text>}
    </View>
  );
}
