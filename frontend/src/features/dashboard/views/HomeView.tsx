"use client";

import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Container from "@/components/ui/layout/Container";
import Flex from "@/components/ui/layout/Flex";
import Badge from "@/components/ui/Badge";
import ServerStatus from "@/features/dashboard/components/ServerStatus";
import Footer from "@/features/dashboard/components/Footer";
import { Grid } from "@/components/ui/layout";

export default function HomeView() {
  return (
    <Container className="px-6 py-8 max-w-[1200px] space-y-12">
      {/* Server Status Widget */}
      <ServerStatus />

      {/* Grid for Featured Showcase & Recently Played */}
      <Grid gap={8} cols={2} colsMobile={1}>
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
      </Grid>

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

        {/* {isLoadingPopularPlaylists ? (
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
              {playlistsError.message}
            </Text>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </Flex>
        ) : popularPlaylists?.length === 0 ? (
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
            {popularPlaylists?.map((pl) => (
              <PlaylistCard key={pl.id} pl={pl} onClick={handlePlaylistClick} />
            ))}
          </Grid>
        )} */}
      </Flex>

      {/* Global Footer */}
      <Footer />
    </Container>
  );
}
