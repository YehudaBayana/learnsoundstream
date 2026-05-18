import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Tooltip placement options.
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Element that triggers the tooltip */
  children: React.ReactNode;
  /** Tooltip placement relative to trigger */
  placement?: TooltipPlacement;
  /** Delay before showing (ms) */
  delay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Disable the tooltip */
  disabled?: boolean;
  /** Additional CSS classes for tooltip */
  className?: string;
}

/**
 * Calculate tooltip position based on trigger element and placement.
 */
const calculatePosition = (
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  placement: TooltipPlacement,
  offset: number = 8
): { top: number; left: number } => {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  switch (placement) {
    case 'top':
      return {
        top: triggerRect.top + scrollY - tooltipRect.height - offset,
        left: triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2,
      };
    case 'bottom':
      return {
        top: triggerRect.bottom + scrollY + offset,
        left: triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2,
      };
    case 'left':
      return {
        top: triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2,
        left: triggerRect.left + scrollX - tooltipRect.width - offset,
      };
    case 'right':
      return {
        top: triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2,
        left: triggerRect.right + scrollX + offset,
      };
  }
};

/**
 * Tooltip - Hover tooltip component.
 *
 * Displays additional information on hover.
 *
 * Features:
 * - Multiple placements (top, bottom, left, right)
 * - Configurable show/hide delays
 * - Portal rendering for proper stacking
 * - Smooth animations
 * - Dark mode support
 *
 * Usage:
 *   // Basic tooltip
 *   <Tooltip content="This is a tooltip">
 *     <button>Hover me</button>
 *   </Tooltip>
 *
 *   // Different placement
 *   <Tooltip content="Appears on the right" placement="right">
 *     <span>Hover</span>
 *   </Tooltip>
 *
 *   // With delay
 *   <Tooltip content="Delayed tooltip" delay={500}>
 *     <button>Hover (500ms delay)</button>
 *   </Tooltip>
 *
 *   // Disabled
 *   <Tooltip content="Won't show" disabled>
 *     <button>Hover</button>
 *   </Tooltip>
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 0,
  hideDelay = 0,
  disabled = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const newPosition = calculatePosition(triggerRect, tooltipRect, placement);
      setPosition(newPosition);
    }
  }, [placement]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (delay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    } else {
      setIsVisible(false);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  const tooltip = isVisible
    ? createPortal(
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`
            fixed z-[1800]
            px-2 py-1
            text-xs font-medium
            text-white dark:text-slate-900
            bg-gray-900 dark:bg-slate-100
            rounded-lg
            shadow-lg
            pointer-events-none
            animate-in fade-in zoom-in-95 duration-150
            ${className}
          `}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-describedby={isVisible ? 'tooltip' : undefined}
        className="inline-block"
      >
        {children}
      </span>
      {tooltip}
    </>
  );
};

export default Tooltip;
