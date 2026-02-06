import Svg, { Path } from "react-native-svg";
import IconButton from "./IconButton";

interface CloseIconButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  className?: string;
}

export default function CloseIconButton({
  onPress,
  accessibilityLabel = "Close",
  className,
}: CloseIconButtonProps) {
  const closeIcon = (
    <Svg width={24} height={24} fill="none" stroke="white" strokeWidth={2}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </Svg>
  );

  return (
    <IconButton
      icon={closeIcon}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      className={className}
    />
  );
}
