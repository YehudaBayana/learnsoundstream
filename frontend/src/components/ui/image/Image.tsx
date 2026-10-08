"use client";
import NextImage from "next/image";
import React, { useState, useRef, useEffect } from "react";

/**
 * Image fit options.
 */
export type ImageFit = "cover" | "contain" | "fill" | "none" | "scale-down";

interface ImageProps {
  /** Image source URL */
  src?: string | null;
  /** Alternative text */
  alt: string;
  /** Image width */
  width?: number | undefined;
  /** Image height */
  height?: number | undefined;
  /** Object fit behavior */
  fit?: ImageFit;
  /** Fallback image source */
  fallbackSrc?: string;
  /** Show loading skeleton */
  showSkeleton?: boolean;
  /** Lazy load the image */
  lazy?: boolean;
  /** Border radius */
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  /** Additional CSS classes */
  className?: string;
  dataHook?: string;
}

/**
 * Get object fit class.
 */
const getFitClass = (fit: ImageFit): string => {
  switch (fit) {
    case "cover":
      return "object-cover";
    case "contain":
      return "object-contain";
    case "fill":
      return "object-fill";
    case "none":
      return "object-none";
    case "scale-down":
      return "object-scale-down";
  }
};

/**
 * Get border radius class.
 */
const getRoundedClass = (rounded: ImageProps["rounded"]): string => {
  switch (rounded) {
    case "none":
      return "";
    case "sm":
      return "rounded-sm";
    case "md":
      return "rounded-md";
    case "lg":
      return "rounded-lg";
    case "xl":
      return "rounded-xl";
    case "full":
      return "rounded-full";
    default:
      return "";
  }
};

/**
 * Default fallback SVG placeholder.
 */
const DefaultFallback: React.FC<{ className?: string; dataHook?: string }> = ({
  className,
  dataHook,
}) => (
  <div
    data-hook={dataHook}
    className={`
      flex items-center justify-center
      bg-gray-200 dark:bg-slate-700
      text-gray-400 dark:text-slate-500
      ${className}
    `}
  >
    <svg className="w-1/3 h-1/3 max-w-12 max-h-12" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

/**
 * Image - Optimized image component.
 *
 * A feature-rich image component with lazy loading, fallback, and loading states.
 *
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Loading skeleton placeholder
 * - Fallback image on error
 * - Multiple object-fit options
 * - Border radius options
 * - Dark mode support
 *
 * Usage:
 *   // Basic image
 *   <Image src="/path/to/image.jpg" alt="Description" />
 *
 *   // With dimensions
 *   <Image src="/image.jpg" alt="Photo" width={300} height={200} />
 *
 *   // Cover fit with rounded corners
 *   <Image src="/image.jpg" alt="Cover" fit="cover" rounded="lg" />
 *
 *   // With fallback
 *   <Image
 *     src="/main.jpg"
 *     alt="Photo"
 *     fallbackSrc="/placeholder.jpg"
 *   />
 *
 *   // Lazy loaded with skeleton
 *   <Image src="/image.jpg" alt="Photo" lazy showSkeleton />
 */
const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  fit = "cover",
  fallbackSrc,
  showSkeleton = true,
  lazy = true,
  rounded = "none",
  className = "",
  dataHook,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const containerClasses = `
    relative overflow-hidden
    ${getRoundedClass(rounded)}
    ${className}
  `;

  // Show fallback on error
  if (hasError) {
    if (fallbackSrc) {
      return (
        <NextImage
          src={fallbackSrc}
          alt={alt}
          width={width || 50}
          height={height || 50}
          onLoad={handleLoad}
          onError={handleError}
          className={`${getFitClass(fit)} ${getRoundedClass(rounded)} ${className}`}
          data-hook={dataHook}
        />
      );
    }

    return <DefaultFallback dataHook={dataHook} className={`${containerClasses} ${className}`} />;
  }

  return (
    <div className={containerClasses} ref={imgRef} data-hook={dataHook}>
      {/* Skeleton placeholder */}
      {showSkeleton && !isLoaded && (
        <div
          data-hook={dataHook ? `${dataHook}-skeleton` : undefined}
          className="
            absolute inset-0
            bg-gray-200 dark:bg-slate-700
            animate-pulse
          "
        />
      )}

      {/* Actual image */}
      {shouldLoad && src && (
        <NextImage
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          width={width || 50}
          height={height || 50}
          className={`
            w-full h-full
            ${getFitClass(fit)}
            ${isLoaded ? "opacity-100" : "opacity-0"}
            transition-opacity duration-300
          `}
          data-hook={dataHook ? `${dataHook}-image` : undefined}
        />
      )}
    </div>
  );
};

export default Image;
