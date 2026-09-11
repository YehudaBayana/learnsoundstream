'use client';

import Text from '@/components/ui/Text';
import Box from '@/components/ui/layout/Box';

export default function Footer() {
  return (
    <Box as="footer" className="w-full py-12 px-6 border-t border-white/8 text-center bg-black/20">
      <Text variant="caption" color="muted" className="text-sm">
        &copy; {new Date().getFullYear()} Soundstream. Built for learning backend engineering.
      </Text>
    </Box>
  );
}
