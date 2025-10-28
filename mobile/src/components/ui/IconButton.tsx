import React from "react";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  "aria-label": string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}) => {
  const variantStyles = {
    primary: {
      background: "#2563EB",
      color: "white",
      hoverBg: "#1D4ED8",
    },
    secondary: {
      background: "#4B5563",
      color: "white",
      hoverBg: "#374151",
    },
    ghost: {
      background: "#374151",
      color: "white",
      hoverBg: "#4B5563",
    },
  };

  const sizeStyles = {
    sm: { width: "32px", height: "32px" },
    md: { width: "40px", height: "40px" },
    lg: { width: "48px", height: "48px" },
  };

  const iconSizeStyles = {
    sm: { width: "16px", height: "16px" },
    md: { width: "24px", height: "24px" },
    lg: { width: "32px", height: "32px" },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      className={`ion-flex ion-align-items-center ion-justify-content-center ${className}`}
      style={{
        borderRadius: "50%",
        transition: "all 0.3s",
        outline: "none",
        border: "none",
        cursor: "pointer",
        background: isHovered
          ? variantStyles[variant].hoverBg
          : variantStyles[variant].background,
        color: variantStyles[variant].color,
        ...sizeStyles[size],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <span style={iconSizeStyles[size]}>{icon}</span>
    </button>
  );
};

export default IconButton;
