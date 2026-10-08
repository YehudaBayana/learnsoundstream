"use client";

import React, { useState } from "react";
import Flex from "@/components/ui/layout/Flex";
import Box from "@/components/ui/layout/Box";
import IconButton from "@/components/ui/IconButton";
import Text from "@/components/ui/Text";
import Sidebar from "@/features/dashboard/components/Sidebar";
import { usePathname } from "next/navigation";
import { useTheme } from "@/shared/context/ThemeContext";
import Button from "@/components/ui/Button";

interface DashboardShellProps {
  children: React.ReactNode;
  dataHook?: string;
}

export default function DashboardShell({
  children,
  dataHook = "dashboard-shell",
}: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { themeDefinition, toggleTheme } = useTheme();

  // Helper to resolve title in the top bar
  const getHeaderTitle = () => {
    if (pathname === "/") return "Home";
    if (pathname === "/search") return "Search Tracks";
    if (pathname === "/playlists") return "Playlists";
    if (pathname?.startsWith("/playlists/")) return "Playlist";
    if (pathname === "/auth/liked") return "Liked Tracks";
    return "Soundstream";
  };

  return (
    <Flex
      dataHook={dataHook}
      className="w-screen h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden relative transition-colors duration-300"
    >
      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <Box
          className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Positioned fixed on mobile, static on desktop */}
      <Box
        className={`fixed md:static inset-y-0 left-0 z-50 transform md:transform-none transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Flex direction="col" className="flex-1 min-w-0 h-full relative">
        {/* Top Header Navigation */}
        <Flex
          align="center"
          justify="between"
          className="w-full h-16 px-6 border-b border-[var(--border-default)] bg-[var(--bg-secondary)] backdrop-blur-md z-30 flex-shrink-0 transition-colors duration-300"
        >
          {/* Left: Mobile Toggle & View Title */}
          <Flex align="center" gap={3}>
            <IconButton
              size="sm"
              variant="ghost"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open menu"
              dataHook={`${dataHook}-open-menu`}
              className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-lg"
              icon={<span>☰</span>}
            />
            <Text
              variant="body"
              weight="bold"
              className="text-[var(--text-primary)] text-base font-semibold md:text-lg select-none"
            >
              {getHeaderTitle()}
            </Text>
          </Flex>

          {/* Right: Theme Toggle + Server indicator badge */}
          <Flex align="center" gap={3}>
            {/* Theme Toggle Button */}
            <Button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-subtle)] transition-all duration-200 cursor-pointer select-none group"
              aria-label={`Switch theme (current: ${themeDefinition.label})`}
              title={`Switch to next theme`}
              dataHook={`${dataHook}-theme-toggle`}
            >
              <span className="text-sm transition-transform duration-300 group-hover:rotate-45">
                {themeDefinition.icon}
              </span>
              <Text
                variant="small"
                weight="medium"
                className="text-[11px] text-[var(--text-secondary)]"
              >
                {themeDefinition.label}
              </Text>
            </Button>

            {/* Server indicator badge */}
            <Flex
              align="center"
              gap={2}
              className="select-none bg-[var(--bg-surface)] border border-[var(--border-default)] px-3 py-1.5 rounded-full"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <Text
                variant="small"
                weight="medium"
                color="default"
                className="text-[11px] text-[var(--text-secondary)]"
              >
                Live Connection
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Dynamic Scrollable Content Pane */}
        <Box className="flex-1 overflow-y-auto pb-32" dataHook={`${dataHook}-content`}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
