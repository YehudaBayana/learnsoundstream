"use client";

import { useState } from "react";
import Text from "@/components/ui/Text";
import Heading from "@/components/ui/Heading";
import IconButton from "@/components/ui/IconButton";
import Flex from "@/components/ui/layout/Flex";
import Box from "@/components/ui/layout/Box";
import Modal from "@/components/ui/Modal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useGetCurrentUser, useLogout } from "@/features/auth/query/useAuth";

interface SidebarProps {
  dataHook?: string;
}

export default function Sidebar({ dataHook = "dashboard-sidebar" }: SidebarProps) {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();
  const { data: currentUser } = useGetCurrentUser(); // Ensure user data is fetched to determine if logged in

  // Create playlist modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/search", label: "Search", icon: "🔍" },
    { href: "/auth/playlists", label: "Playlists", icon: "" },
    { href: "/auth/history", label: "History", icon: "" },
    { href: "/auth/liked", label: "Liked", icon: "" },
  ];

  return (
    <Flex
      direction="col"
      className="w-64 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-default)] backdrop-blur-2xl flex-shrink-0 relative overflow-hidden select-none transition-colors duration-300"
      dataHook={dataHook}
    >
      {/* Brand Header */}
      <Flex
        align="center"
        gap={3}
        className="p-6 border-b border-[var(--border-default)]"
      >
        <Flex
          align="center"
          justify="center"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-lg text-white"
        >
          <span>🎵</span>
        </Flex>
        <Flex direction="col">
          <Heading
            level={1}
            size="md"
            className="font-extrabold tracking-wide text-[var(--text-primary)]"
          >
            SOUNDSTREAM
          </Heading>
          <Text
            variant="caption"
            className="text-[10px] tracking-wider text-emerald-400 font-semibold -mt-0.5"
          >
            HI-FI STREAMING
          </Text>
        </Flex>
      </Flex>

      {/* Navigation */}
      <Flex
        direction="col"
        gap={1}
        className="px-3 py-4 border-b border-[var(--border-default)]"
      >
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-hook={`${dataHook}-nav-${index}`}
              className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[var(--bg-surface-active)] text-emerald-400 shadow-[inset_0_1px_0_var(--border-default)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </Flex>

      {/* Playlists section */}
      <Flex direction="col" className="flex-1 min-h-0 py-4 px-3">
        <Flex align="center" justify="between" className="px-4 mb-2">
          <Text
            variant="caption"
            weight="bold"
            color="muted"
            className="tracking-wider uppercase text-[10px]"
          >
            My Playlists
          </Text>
          <IconButton
            size="xs"
            variant="ghost"
            onClick={() => setIsModalOpen(true)}
            aria-label="Create playlist"
            dataHook={`${dataHook}-create-playlist`}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-full"
            icon={<span>＋</span>}
          />
        </Flex>

        {/* Playlists List */}
        <Box className="flex-1 overflow-y-auto pr-1 space-y-1">
          <Box className="px-4 py-3 text-center rounded-xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)]">
            <Text variant="caption" color="muted" className="text-[11px]">
              Create a playlist to start collecting.
            </Text>
          </Box>
          {currentUser?.user ? (
            <Button onClick={() => logout()}>Logout</Button>
          ) : (
            <Link href="/auth" className="w-full" data-hook={`${dataHook}-login`}>
              Login
            </Link>
          )}
        </Box>
      </Flex>

      {/* Bottom Profile/Watermark */}
      <Box className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-surface)] select-none">
        <Flex align="center" gap={3}>
          <Flex
            align="center"
            justify="center"
            className="w-8 h-8 rounded-full bg-slate-700 border border-[var(--border-subtle)] font-bold text-xs text-white"
          >
            YB
          </Flex>
          <Flex direction="col" className="min-w-0 flex-1">
            <Text
              variant="body-sm"
              weight="semibold"
              truncate
              className="text-[var(--text-primary)] text-xs"
            >
              Yehuda Bayana
            </Text>
            <Text variant="caption" color="muted" className="text-[10px]">
              Developer Mode
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* Create Playlist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        dataHook={`${dataHook}-create-modal`}
      >
        <Modal.Header onClose={() => setIsModalOpen(false)}>
          Create New Playlist
        </Modal.Header>
      </Modal>
    </Flex>
  );
}
