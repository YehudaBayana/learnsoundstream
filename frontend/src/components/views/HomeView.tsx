"use client";

import React, { useEffect, useState } from "react";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/layout/Container";
import Flex from "@/components/ui/layout/Flex";
import Grid from "@/components/ui/layout/Grid";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Image from "@/components/ui/Image";
import ServerStatus from "@/components/ServerStatus";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/constants";
import { Playlist, PlaylistsApiResponse } from "@/types";
import { PlaylistCard } from "../PlaylistCard/PlaylistCard";

export default function HomeView() {
  const router = useRouter();
  const [popularPlaylists, setPopularPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(true);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);

  const fetchPopularPlaylists = async () => {
    setIsLoadingPlaylists(true);
    setPlaylistsError(null);
    try {
      const response = await fetch(`${apiUrl}/api/popular-playlists`);
      if (!response.ok) {
        throw new Error(
          `Failed to load popular playlists (${response.status})`,
        );
      }
      const data: PlaylistsApiResponse = await response.json();
      setPopularPlaylists(data.results || []);
    } catch (err: unknown) {
      console.error("Error fetching popular playlists:", err);
      setPlaylistsError(
        err instanceof Error
          ? err.message
          : "Unable to connect to backend server",
      );
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  useEffect(() => {
    fetchPopularPlaylists();
  }, []);

  const handlePlaylistClick = (playlist: Playlist) => {
    router.push(`/playlists/${playlist.id}`);
  };

  return (
    <Container className="px-6 py-8 max-w-[1200px] space-y-12">
      {/* Server Status Widget */}
      <ServerStatus />

      {/* Grid for Featured Showcase & Recently Played */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Tracks Showcase */}
        <Flex direction="col" gap={4}>
          <Flex align="center" justify="between" className="px-1">
            <Heading
              level={3}
              size="md"
              className="font-bold text-[var(--text-primary)]"
            >
              Featured Showcase
            </Heading>
            <Text variant="caption" color="muted">
              Handpicked Jams
            </Text>
          </Flex>
        </Flex>

        {/* Recently Played */}
        <Flex direction="col" gap={4}>
          <Flex align="center" justify="between" className="px-1">
            <Heading
              level={3}
              size="md"
              className="font-bold text-[var(--text-primary)]"
            >
              Recently Played
            </Heading>
            {/* {history1.length > 0 && (
              <Text variant="caption" color="muted">
                Your History1
              </Text>
            )} */}
          </Flex>

          {/* <Flex
            direction="col"
            gap={2}
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-4 rounded-2xl justify-center min-h-[220px]"
          >
            {history1.length === 0 ? (
              <Flex
                direction="col"
                align="center"
                justify="center"
                className="text-center py-8"
              >
                <span className="text-3xl mb-3 opacity-60">🕰️</span>
                <Text variant="body-sm" color="muted">
                  No playback history1 yet.
                </Text>
                <Text
                  variant="caption"
                  color="muted"
                  className="text-[11px] mt-1"
                >
                  Tracks you play will show up here.
                </Text>
              </Flex>
            ) : null}
          </Flex> */}
        </Flex>
      </div>

      {/* Popular Playlists Section */}
      <Flex direction="col" gap={4}>
        <Flex align="center" justify="between" className="px-1">
          <Flex align="center" gap={3}>
            <Heading
              level={3}
              size="md"
              className="font-bold text-[var(--text-primary)]"
            >
              Popular Playlists
            </Heading>
            <Badge variant="success" size="sm">
              Top 5
            </Badge>
          </Flex>
          <Text variant="caption" color="muted">
            Curated from YouTube
          </Text>
        </Flex>

        {isLoadingPlaylists ? (
          <Flex
            align="center"
            justify="center"
            gap={3}
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-12 rounded-2xl"
          >
            <Spinner size="md" variant="primary" />
            <Text variant="body-sm" color="muted">
              Loading popular playlists...
            </Text>
          </Flex>
        ) : playlistsError ? (
          <Flex
            direction="col"
            align="center"
            justify="center"
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-8 rounded-2xl text-center gap-3"
          >
            <Text variant="body-sm" color="danger">
              {playlistsError}
            </Text>
            <Button variant="outline" size="sm" onClick={fetchPopularPlaylists}>
              Retry
            </Button>
          </Flex>
        ) : popularPlaylists.length === 0 ? (
          <Flex
            direction="col"
            align="center"
            justify="center"
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-8 rounded-2xl text-center"
          >
            <Text variant="body-sm" color="muted">
              No popular playlists found.
            </Text>
          </Flex>
        ) : (
          <Grid cols={5} colsTablet={3} colsMobile={3} gap={4}>
            {popularPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} pl={pl} onClick={handlePlaylistClick} />
            ))}
          </Grid>
        )}
      </Flex>

      {/* Global Footer */}
      <Footer />
    </Container>
  );
}
