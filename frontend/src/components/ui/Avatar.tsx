import React, { useState } from 'react';

/**
 * Avatar size options.
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Avatar status options for online indicator.
 */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

interface AvatarProps {
  /** Image source URL */
  src?: string | null;
  /** Alternative text for the image */
  alt?: string;
  /** User name for fallback initials */
  name?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Show status indicator */
  status?: AvatarStatus;
  /** Square shape instead of circle */
  square?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get size classes.
 */
const getSizeClasses = (size: AvatarSize): string => {
  switch (size) {
    case 'xs':
      return 'w-6 h-6 text-xs';
    case 'sm':
      return 'w-8 h-8 text-sm';
    case 'md':
      return 'w-10 h-10 text-base';
    case 'lg':
      return 'w-12 h-12 text-lg';
    case 'xl':
      return 'w-16 h-16 text-xl';
    case '2xl':
      return 'w-20 h-20 text-2xl';
  }
};

/**
 * Get status indicator size.
 */
const getStatusSize = (size: AvatarSize): string => {
  switch (size) {
    case 'xs':
      return 'w-1.5 h-1.5';
    case 'sm':
      return 'w-2 h-2';
    case 'md':
      return 'w-2.5 h-2.5';
    case 'lg':
      return 'w-3 h-3';
    case 'xl':
      return 'w-3.5 h-3.5';
    case '2xl':
      return 'w-4 h-4';
  }
};

/**
 * Get status color.
 */
const getStatusColor = (status: AvatarStatus): string => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'offline':
      return 'bg-gray-400';
    case 'away':
      return 'bg-amber-500';
    case 'busy':
      return 'bg-rose-500';
  }
};

/**
 * Get initials from name.
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Generate a consistent background color based on name.
 */
const getColorFromName = (name: string): string => {
  const colors = [
    'bg-rose-500',
    'bg-pink-500',
    'bg-fuchsia-500',
    'bg-purple-500',
    'bg-violet-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-sky-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-green-500',
    'bg-lime-500',
    'bg-yellow-500',
    'bg-amber-500',
    'bg-orange-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Avatar - User avatar component.
 *
 * Displays a user avatar with image, initials fallback, and optional status indicator.
 *
 * Features:
 * - Multiple sizes (xs, sm, md, lg, xl, 2xl)
 * - Image with automatic fallback to initials
 * - Status indicator (online, offline, away, busy)
 * - Consistent color generation from name
 * - Square or circular shape
 * - Dark mode support
 *
 * Usage:
 *   // With image
 *   <Avatar src="/path/to/image.jpg" alt="John Doe" />
 *
 *   // With fallback initials
 *   <Avatar name="John Doe" />
 *
 *   // With status
 *   <Avatar src="/path/to/image.jpg" name="John" status="online" />
 *
 *   // Different sizes
 *   <Avatar name="Jane" size="lg" />
 *   <Avatar name="Jane" size="xs" />
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = '',
  size = 'md',
  status,
  square = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const showImage = src && !imageError;
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : 'bg-gray-400';

  const baseClasses = `
    relative inline-flex items-center justify-center
    ${getSizeClasses(size)}
    ${square ? 'rounded-lg' : 'rounded-full'}
    overflow-hidden
    flex-shrink-0
  `;

  return (
    <div className={`${baseClasses} ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          data-testid="avatar-image"
        />
      ) : (
        <div
          data-testid="avatar-fallback"
          className={`
            w-full h-full
            flex items-center justify-center
            ${bgColor}
            text-white font-medium
          `}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${getStatusSize(size)}
            ${getStatusColor(status)}
            rounded-full
            ring-2 ring-white dark:ring-slate-900
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default Avatar;
