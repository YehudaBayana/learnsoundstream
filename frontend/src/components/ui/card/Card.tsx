import React from "react";

/**
 * Card variant options.
 */
export type CardVariant = "default" | "elevated" | "outlined" | "ghost";

/**
 * Card padding options.
 */
export type CardPadding = "none" | "sm" | "md" | "lg";

// ----------------------------------------------------------------------------
// Card Header
// ----------------------------------------------------------------------------

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Header content */
  children: React.ReactNode;
  /** Action element (button, icon, etc.) to display on the right */
  action?: React.ReactNode;
  dataHook?: string;
}

/**
 * Card.Header - Header section of a Card.
 */
const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  action,
  dataHook,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`
        flex items-center justify-between
        px-4 py-3 sm:px-6
        border-b border-gray-100 dark:border-slate-700
        ${className}
      `}
      data-hook={dataHook}
      {...props}
    >
      <div className="font-semibold text-gray-900 dark:text-white">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Card Body
// ----------------------------------------------------------------------------

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Body content */
  children: React.ReactNode;
  /** Padding size */
  padding?: CardPadding;
  dataHook?: string;
}

/**
 * Get padding classes.
 */
const getPaddingClasses = (padding: CardPadding): string => {
  switch (padding) {
    case "none":
      return "";
    case "sm":
      return "p-3 sm:p-4";
    case "md":
      return "p-4 sm:p-6";
    case "lg":
      return "p-6 sm:p-8";
  }
};

/**
 * Card.Body - Main content area of a Card.
 */
const CardBody: React.FC<CardBodyProps> = ({
  children,
  padding = "md",
  dataHook,
  className = "",
  ...props
}) => {
  return (
    <div className={`${getPaddingClasses(padding)} ${className}`} data-hook={dataHook} {...props}>
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Card Footer
// ----------------------------------------------------------------------------

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Footer content */
  children: React.ReactNode;
  /** Justify content */
  justify?: "start" | "center" | "end" | "between";
  dataHook?: string;
}

/**
 * Get justify classes.
 */
const getJustifyClasses = (justify: CardFooterProps["justify"]): string => {
  switch (justify) {
    case "start":
      return "justify-start";
    case "center":
      return "justify-center";
    case "end":
      return "justify-end";
    case "between":
      return "justify-between";
    default:
      return "justify-end";
  }
};

/**
 * Card.Footer - Footer section of a Card (typically for actions).
 */
const CardFooter: React.FC<CardFooterProps> = ({
  children,
  justify = "end",
  dataHook,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`
        flex items-center gap-3 ${getJustifyClasses(justify)}
        px-4 py-3 sm:px-6
        border-t border-gray-100 dark:border-slate-700
        bg-gray-50 dark:bg-slate-800/50
        ${className}
      `}
      data-hook={dataHook}
      {...props}
    >
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Card
// ----------------------------------------------------------------------------

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Card content */
  children: React.ReactNode;
  /** Card style variant */
  variant?: CardVariant;
  /** Whether the card is clickable/interactive */
  hoverable?: boolean;
  /** Make the entire card a clickable button */
  clickable?: boolean;
  /** HTML element to render */
  as?: "div" | "article" | "section" | "button";
  /** Optional padding for the whole card (if not using Card.Body) */
  padding?: CardPadding;
  dataHook?: string;
}

/**
 * Get variant classes.
 */
const getVariantClasses = (variant: CardVariant): string => {
  switch (variant) {
    case "default":
      return `
        bg-white dark:bg-slate-800
        shadow-sm
        border border-gray-100 dark:border-slate-700
      `;
    case "elevated":
      return `
        bg-white dark:bg-slate-800
        shadow-lg
        border-0
      `;
    case "outlined":
      return `
        bg-transparent
        shadow-none
        border-2 border-gray-200 dark:border-slate-600
      `;
    case "ghost":
      return `
        bg-gray-50 dark:bg-slate-800/50
        shadow-none
        border-0
      `;
  }
};

/**
 * Card - Container component for grouped content.
 *
 * A compound component with Card.Header, Card.Body, and Card.Footer
 * subcomponents for flexible content organization.
 */
const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({
  children,
  variant = "default",
  hoverable = false,
  clickable = false,
  onClick,
  as,
  className = "",
  padding,
  dataHook,
  ...props
}) => {
  const Element = clickable ? "button" : as || "div";

  const hoverClasses = hoverable
    ? "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    : "";

  const classes = [
    "rounded-xl overflow-hidden",
    getVariantClasses(variant),
    hoverClasses,
    padding ? getPaddingClasses(padding) : "",
    clickable
      ? "w-full text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const elementProps: Record<string, unknown> = {
    className: classes,
    "data-hook": dataHook,
    onClick,
    ...props,
  };

  if (clickable) {
    elementProps.type = "button";
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return React.createElement(Element, elementProps as any, children);
};

// Attach subcomponents
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
