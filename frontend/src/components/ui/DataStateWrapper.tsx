import React from 'react';
import { Flex, Box } from './layout';
import Spinner from './Spinner';
import Alert from './Alert';
import Button from './Button';

interface DataStateWrapperProps {
  /** Whether the data is currently loading */
  loading: boolean;
  /** Whether there is an error */
  error?: string | null;
  /** Whether the data is empty */
  empty?: boolean;
  /** Message to show when empty */
  emptyMessage?: string;
  /** Component to show when empty */
  emptyComponent?: React.ReactNode;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Minimum height while loading/error/empty */
  minHeight?: string | number;
  /** The children to render when data is loaded and not empty */
  children: React.ReactNode;
  /** Optional skeleton to show while loading. If not provided, shows a Spinner. */
  skeleton?: React.ReactNode;
  /** 
   * Behavior when data is empty: 
   * - 'show-empty': Shows the emptyComponent (default)
   * - 'hide': Renders nothing
   */
  emptyBehavior?: 'show-empty' | 'hide';
  /** Container className */
  className?: string;
}

/**
 * DataStateWrapper - A resilient container that handles loading, error, and empty states.
 * 
 * Updated to be backward compatible with existing usage while adding new resilient features.
 */
const DataStateWrapper: React.FC<DataStateWrapperProps> = ({
  loading,
  error,
  empty,
  emptyMessage = 'No data available',
  emptyComponent,
  onRetry,
  minHeight,
  children,
  skeleton,
  emptyBehavior = 'show-empty',
  className = ''
}) => {
  const containerStyle = minHeight ? { minHeight } : {};

  // 1. Loading State
  if (loading) {
    return (
      <Box className={className} style={containerStyle}>
        {skeleton || (
          <Flex justify="center" align="center" className="py-20 h-full">
            <Spinner size="xl" variant="primary" />
          </Flex>
        )}
      </Box>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <Box className={className} style={containerStyle}>
        <Flex direction="col" justify="center" align="center" className="py-20 h-full text-center px-4">
          <Alert variant="error" className="mb-4 max-w-md">
            {error}
          </Alert>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </Flex>
      </Box>
    );
  }

  // 3. Empty State
  if (empty) {
    if (emptyBehavior === 'hide') return null;
    
    return (
      <Box className={className} style={containerStyle}>
        {emptyComponent || (
          <Flex justify="center" align="center" className="py-20 h-full text-center">
            <Box className="text-gray-500 dark:text-slate-400">
              {emptyMessage}
            </Box>
          </Flex>
        )}
      </Box>
    );
  }

  // 4. Success State
  return (
    <Box className={className} style={containerStyle}>
      {children}
    </Box>
  );
};

export default DataStateWrapper;
