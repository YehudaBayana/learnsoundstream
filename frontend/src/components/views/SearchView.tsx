'use client';

import React, { useState } from 'react';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import Container from '@/components/ui/layout/Container';
import TrackItem from '@/components/TrackItem';
import { usePlayback, TRACK_DATABASE } from '@/context/PlaybackContext';

export default function SearchView() {
  const { searchQuery, setSearchQuery } = usePlayback();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    setSearchQuery(val);
  };

  const filteredTracks = TRACK_DATABASE.filter((track) => {
    const query = localQuery.toLowerCase().trim();
    if (!query) return true; // Show all if query is empty
    return (
      track.title.toLowerCase().includes(query) ||
      track.desc.toLowerCase().includes(query) ||
      track.category.toLowerCase().includes(query)
    );
  });

  // Unique categories for recommendation widgets
  const categories = Array.from(new Set(TRACK_DATABASE.map((t) => t.category)));

  return (
    <Container className="px-6 py-8 max-w-[1000px] space-y-8 animate-[fadeIn_0.4s_ease_forwards]">
      {/* Search Header Container */}
      <Box className="w-full bg-white/[0.015] border border-white/5 p-6 rounded-2xl">
        <Flex direction="col" gap={3}>
          <Heading level={2} size="md" className="font-semibold text-white">
            Search songs, categories or moods
          </Heading>
          <Box className="relative w-full">
            <Input
              type="text"
              placeholder="What do you want to listen to? (e.g. Synthwave, Lofi, Pop...)"
              value={localQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border-slate-700 text-white rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
            />
            {/* Search Icon */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg select-none pointer-events-none">
              🔍
            </span>
            {localQuery && (
              <button
                onClick={() => {
                  setLocalQuery('');
                  setSearchQuery('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </Box>
        </Flex>
      </Box>

      {/* Results View */}
      <Flex direction="col" gap={4}>
        <Heading level={3} size="sm" className="font-semibold text-white px-1">
          {localQuery ? `Search Results (${filteredTracks.length})` : 'All Available Tracks'}
        </Heading>

        {filteredTracks.length === 0 ? (
          <Box className="w-full text-center py-16 rounded-2xl bg-white/[0.01] border border-dashed border-white/5">
            <span className="text-4xl mb-4 block">🎧</span>
            <Heading level={4} size="sm" className="text-white font-semibold mb-1">
              No results found for &quot;{localQuery}&quot;
            </Heading>
            <Text variant="body-sm" color="muted">
              Try checking the spelling or searching for another keyword.
            </Text>
          </Box>
        ) : (
          <Flex direction="col" gap={2} className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
            {filteredTracks.map((track, idx) => (
              <TrackItem
                key={track.videoId}
                track={track}
                index={idx}
                contextQueue={filteredTracks}
              />
            ))}
          </Flex>
        )}
      </Flex>

      {/* Recommended Category Pills (only visible when not searching) */}
      {!localQuery && (
        <Flex direction="col" gap={3} className="pt-4">
          <Heading level={3} size="sm" className="font-semibold text-white px-1">
            Browse Categories
          </Heading>
          <Flex gap={3} wrap="wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setLocalQuery(cat);
                  setSearchQuery(cat);
                }}
                className="px-5 py-2.5 rounded-full text-sm font-semibold border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] text-gray-300 hover:text-emerald-400 hover:border-emerald-500 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)]"
              >
                #{cat}
              </button>
            ))}
          </Flex>
        </Flex>
      )}
    </Container>
  );
}
