"use client";

import Text from "@/components/ui/Text";
import Box from "@/components/ui/layout/Box";

interface FooterProps {
  dataHook?: string;
}

export default function Footer({ dataHook = "dashboard-footer" }: FooterProps) {
  return (
    <Box
      as="footer"
      dataHook={dataHook}
      className="w-full py-12 px-6 border-t border-white/8 text-center bg-black/20"
    >
      <Text variant="caption" color="muted" className="text-sm">
        &copy; {new Date().getFullYear()} Soundstream. Built for learning backend engineering.
      </Text>
    </Box>
  );
}
