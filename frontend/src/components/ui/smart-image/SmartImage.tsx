import React from "react";
import { FaMusic, FaUser, FaList } from "react-icons/fa";
import Image from "../image/Image";

/**
 * Entity types for standardized fallback icons.
 */
export type EntityType = "song" | "playlist" | "user" | "category" | "generic";

/**
 * Aspect ratio presets for common use  cases.
 */
export type AspectRatio = "1/1" | "16/9" | "4/3" | "3/2" | "2/3";

interface SmartImageProps {
  /** Image source URL */
  src?: string | null;
  /** Alternative text */
  alt: string;
  /** Entity type for fallback icon */
  entityType?: EntityType;
  /** Aspect ratio (maintains layout integrity) */
  aspectRatio?: AspectRatio;
  /** Border radius */
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  /** Additional CSS classes */
  className?: string;
  /** Custom fallback content */
  fallbackContent?: React.ReactNode;
  dataHook?: string;
}

/**
 * Get aspect ratio class.
 */
const getAspectRatioClass = (ratio: AspectRatio): string => {
  switch (ratio) {
    case "1/1":
      return "aspect-square";
    case "16/9":
      return "aspect-video";
    case "4/3":
      return "aspect-[4/3]";
    case "3/2":
      return "aspect-[3/2]";
    case "2/3":
      return "aspect-[2/3]";
  }
};

/**
 * Get fallback icon based on entity type.
 */
const getFallbackIcon = (entityType: EntityType): React.ReactNode => {
  const iconClass = "w-1/3 h-1/3 max-w-12 max-h-12";

  switch (entityType) {
    case "song":
      return <FaMusic className={iconClass} />;
    case "playlist":
      return <FaList className={iconClass} />;
    case "user":
      return <FaUser className={iconClass} />;
    case "category":
      return <FaMusic className={iconClass} />;
    case "generic":
    default:
      return <FaMusic className={iconClass} />;
  }
};

/**
 * SmartImage - Resilient image component with fixed aspect ratios.
 *
 * Prevents layout jumps and handles missing images gracefully with
 * standardized fallback icons for different entity types.
 *
 * Features:
 * - Fixed aspect-ratio containers (no layout shift)
 * - Standardized fallback icons per entity type
 * - Lazy loading with skeleton
 * - Dark mode support
 *
 * Usage:
 *   // Song/Video thumbnail
 *   <SmartImage
 *     src={song.thumbnail}
 *     alt={song.title}
 *     entityType="song"
 *     aspectRatio="16/9"
 *   />
 *
 *   // User avatar
 *   <SmartImage
 *     src={user.avatarUrl}
 *     alt={user.username}
 *     entityType="user"
 *     aspectRatio="1/1"
 *     rounded="full"
 *   />
 *
 *   // Playlist cover
 *   <SmartImage
 *     src={playlist.coverArtUrl}
 *     alt={playlist.name}
 *     entityType="playlist"
 *     aspectRatio="1/1"
 *   />
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  entityType = "generic",
  aspectRatio = "1/1",
  rounded = "none",
  className = "",
  fallbackContent,
  dataHook,
}) => {
  const containerClasses = `
    ${getAspectRatioClass(aspectRatio)}
    ${className}
  `;

  // If no src, show fallback immediately
  if (!src) {
    return (
      <div
        data-hook={dataHook}
        className={`${containerClasses} flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 overflow-hidden`}
      >
        {fallbackContent || getFallbackIcon(entityType)}
      </div>
    );
  }

  // Otherwise use the Image component with fallback
  return (
    <div className={containerClasses} data-hook={dataHook}>
      <Image
        dataHook={dataHook ? `${dataHook}-image` : undefined}
        src={src}
        alt={alt}
        rounded={rounded}
        fit="cover"
        showSkeleton
        lazy
        className="w-full h-full"
        fallbackSrc={undefined}
      />
    </div>
  );
};

export default SmartImage;
