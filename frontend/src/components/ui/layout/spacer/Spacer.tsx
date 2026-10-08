import React from "react";

interface SpacerProps {
  /** Fixed size (uses Tailwind spacing scale) */
  size?: number;
  /** Axis for fixed size spacing */
  axis?: "horizontal" | "vertical";
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Spacer - Flexible space component for layouts.
 *
 * When used without props, acts as a flex spacer (flex-1).
 * When used with size prop, creates fixed spacing.
 *
 * Features:
 * - Flexible spacing (flex-1 behavior)
 * - Fixed size spacing
 * - Horizontal or vertical axis
 *
 * Usage:
 *   // Flexible spacer (pushes items apart in flex container)
 *   <Flex>
 *     <Logo />
 *     <Spacer />
 *     <Nav />
 *   </Flex>
 *
 *   // Fixed vertical space
 *   <Spacer size={8} axis="vertical" />
 *
 *   // Fixed horizontal space
 *   <Spacer size={4} axis="horizontal" />
 */
const Spacer: React.FC<SpacerProps> = ({
  size,
  axis = "vertical",
  className = "",
  dataHook,
}) => {
  // Flexible spacer (no size specified)
  if (size === undefined) {
    return (
      <div
        className={`flex-1 ${className}`}
        aria-hidden="true"
        data-hook={dataHook}
      />
    );
  }

  // Fixed size spacer
  const sizeClass = axis === "vertical" ? `h-${size}` : `w-${size}`;
  const shrinkClass = "flex-shrink-0";

  return (
    <div
      className={`${sizeClass} ${shrinkClass} ${className}`}
      aria-hidden="true"
      data-hook={dataHook}
    />
  );
};

export default Spacer;
