import React from 'react';
import { Container, Heading, Stack, Box, Flex, Spinner } from './';
import Breadcrumb from './Breadcrumb';
import type { BreadcrumbItem } from './Breadcrumb';
import { useIsMobile } from '../../hooks';

interface PageShellProps {
  /** Page title */
  title?: React.ReactNode;
  /** Page content */
  children: React.ReactNode;
  /** Header actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Breadcrumb items */
  breadcrumb?: BreadcrumbItem[];
  /** Loading state */
  loading?: boolean;
  /** Whether to show the footer spacer for the player */
  footerSpacer?: boolean;
  /** Container size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional header content (e.g. description, metadata) */
  headerContent?: React.ReactNode;
  /** Background decoration for the header */
  headerDecoration?: React.ReactNode;
}

/**
 * PageShell - A standardized layout wrapper for all pages.
 * 
 * Provides consistent padding, headings, breadcrumbs, and 
 * spacing across the application.
 */
const PageShell: React.FC<PageShellProps> = ({
  title,
  children,
  actions,
  breadcrumb,
  loading = false,
  footerSpacer = true,
  size = 'xl',
  className = '',
  headerContent,
  headerDecoration,
}) => {
  const isMobile = useIsMobile();

  return (
    <Box className={`relative min-h-full ${className}`}>
      {/* Header Decoration (Gradients, Blurs, etc.) */}
      {headerDecoration && (
        <Box className="absolute top-0 left-0 right-0 h-64 overflow-hidden pointer-events-none -z-10">
          {headerDecoration}
        </Box>
      )}

      <Container size={size} className="pt-8 sm:pt-10 pb-8">
        <Stack gap={8}>
          {/* Header Section */}
          {(title || breadcrumb || actions) && (
            <Stack gap={4}>
              {/* Breadcrumb Navigation */}
              {breadcrumb && (
                <Breadcrumb items={breadcrumb} showHome />
              )}

              {/* Title and Actions Row */}
              {(title || actions) && (
                <Flex align="center" justify="between" wrap="wrap" gap={4}>
                  <Stack gap={1} className="min-w-0">
                    {typeof title === 'string' ? (
                      <Heading level={1} size="3xl" weight="bold" className="truncate">
                        {title}
                      </Heading>
                    ) : (
                      title
                    )}
                    {headerContent}
                  </Stack>
                  
                  {actions && (
                    <Flex align="center" gap={3}>
                      {actions}
                    </Flex>
                  )}
                </Flex>
              )}
            </Stack>
          )}

          {/* Main Content Area */}
          <Box className="relative">
            {loading ? (
              <Flex align="center" justify="center" className="py-20">
                <Spinner size="xl" variant="primary" />
              </Flex>
            ) : (
              children
            )}
          </Box>

          {/* Footer Spacer for Player */}
          {footerSpacer && (
            <Box className={`${isMobile ? 'h-32' : 'h-24'}`} />
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default PageShell;
