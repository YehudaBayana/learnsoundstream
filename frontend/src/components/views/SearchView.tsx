"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Input from "@/components/ui/Input";
import Flex from "@/components/ui/layout/Flex";
import Box from "@/components/ui/layout/Box";
import Container from "@/components/ui/layout/Container";
import TrackItem from "@/components/TrackItem";
import { usePlayback } from "@/context/PlaybackContext";
import { apiUrl } from "@/constants";
import { Track, SearchApiResponse } from "@/types";

const SKELETON_WIDTHS = [
  { title: "72%", subtitle: "50%" },
  { title: "64%", subtitle: "40%" },
  { title: "78%", subtitle: "52%" },
  { title: "70%", subtitle: "45%" },
  { title: "66%", subtitle: "48%" },
];

export default function SearchView() {
  const { searchQuery, setSearchQuery } = usePlayback();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // API search state
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // AbortController ref for cancelling in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (query: string) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `${apiUrl}/api/search?q=${encodeURIComponent(query.trim())}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Search failed (${response.status})`);
      }

      const data: SearchApiResponse = await response.json();
      setSearchResults(data.results);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Request was cancelled, ignore
      }
      console.error("Search error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to search. Is the backend server running?",
      );
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    setSearchQuery(val);

    // Debounce API calls — wait 500ms after user stops typing
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      performSearch(val);
    }, 500);
  };

  const handleClear = () => {
    setLocalQuery("");
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    setHasSearched(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const handleCategoryClick = (category: string) => {
    setLocalQuery(category);
    setSearchQuery(category);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    performSearch(category);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const categories: string[] = [];

  return (
    <Container className="px-6 py-8 max-w-[1000px] space-y-8 animate-[fadeIn_0.4s_ease_forwards]">
      {/* Search Header Container */}
      <Box className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] p-6 rounded-2xl">
        <Flex direction="col" gap={3}>
          <Heading
            level={2}
            size="md"
            className="font-semibold text-[var(--text-primary)]"
          >
            Search YouTube
          </Heading>
          <Text variant="body-sm" color="muted" className="text-[13px] -mt-1">
            Search real YouTube videos powered by the Go backend
          </Text>
          <Box className="relative w-full">
            <Input
              type="text"
              placeholder="Search for any song, artist, or genre..."
              value={localQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
            />
            {/* Search Icon */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-lg select-none pointer-events-none">
              🔍
            </span>
            {localQuery && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-xs bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] px-1.5 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </Box>
        </Flex>
      </Box>

      {/* Results View */}
      <Flex direction="col" gap={4}>
        {/* Loading State */}
        {isLoading && (
          <Flex
            direction="col"
            gap={3}
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-6 rounded-2xl"
          >
            <Flex align="center" gap={3} className="px-1">
              <Box className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <Text variant="body-sm" color="muted">
                Searching YouTube for &quot;{localQuery}&quot;...
              </Text>
            </Flex>
            {/* Skeleton Rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <Flex
                key={i}
                align="center"
                gap={4}
                className="w-full p-3 rounded-xl animate-pulse"
              >
                <Box className="w-10 h-10 rounded-lg bg-[var(--bg-surface-hover)] flex-shrink-0" />
                <Flex direction="col" gap={2} className="flex-1 min-w-0">
                  <Box
                    className="h-3.5 rounded-md bg-[var(--bg-surface-active)]"
                    style={{ width: SKELETON_WIDTHS[i].title }}
                  />
                  <Box
                    className="h-2.5 rounded-md bg-[var(--bg-surface-hover)]"
                    style={{ width: SKELETON_WIDTHS[i].subtitle }}
                  />
                </Flex>
                <Box className="w-10 h-3 rounded-md bg-[var(--bg-surface-hover)] flex-shrink-0" />
              </Flex>
            ))}
          </Flex>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Box className="w-full text-center py-12 rounded-2xl bg-red-500/[0.03] border border-red-500/10">
            <span className="text-4xl mb-4 block">⚠️</span>
            <Heading
              level={4}
              size="sm"
              className="text-[var(--text-primary)] font-semibold mb-2"
            >
              Search Failed
            </Heading>
            <Text
              variant="body-sm"
              color="muted"
              className="max-w-[400px] mx-auto"
            >
              {error}
            </Text>
            <button
              onClick={() => performSearch(localQuery)}
              className="mt-4 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-full"
            >
              Retry Search
            </button>
          </Box>
        )}

        {/* Results */}
        {!isLoading && !error && hasSearched && (
          <>
            <Heading
              level={3}
              size="sm"
              className="font-semibold text-[var(--text-primary)] px-1"
            >
              Search Results ({searchResults.length})
            </Heading>

            {searchResults.length === 0 ? (
              <Box className="w-full text-center py-16 rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)]">
                <span className="text-4xl mb-4 block">🎧</span>
                <Heading
                  level={4}
                  size="sm"
                  className="text-[var(--text-primary)] font-semibold mb-1"
                >
                  No results found for &quot;{localQuery}&quot;
                </Heading>
                <Text variant="body-sm" color="muted">
                  Try checking the spelling or searching for another keyword.
                </Text>
              </Box>
            ) : (
              <Flex
                direction="col"
                gap={2}
                className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-4 rounded-2xl"
              >
                {searchResults.map((track, idx) => (
                  <TrackItem key={track.id} track={track} index={idx} />
                ))}
              </Flex>
            )}
          </>
        )}
      </Flex>

      {/* Category Pills (rendered only when server categories exist) */}
      {categories.length > 0 && (
        <Flex direction="col" gap={3} className="pt-4">
          <Heading
            level={3}
            size="sm"
            className="font-semibold text-[var(--text-primary)] px-1"
          >
            Quick Search
          </Heading>
          <Flex gap={3} wrap="wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-surface-hover)] to-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500 hover:bg-[var(--bg-surface-active)] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)]"
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
