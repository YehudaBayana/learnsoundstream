import Box from "@/components/ui/layout/Box";
import Flex from "@/components/ui/layout/Flex";
import Text from "@/components/ui/Text";
import type { Track } from "@/types/global.types";

interface AudioPlayerTrackInfoProps {
  track: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
}

export default function AudioPlayerTrackInfo({
  track,
  isPlaying,
  isLoading,
  hasError,
}: AudioPlayerTrackInfoProps) {
  return (
    <Flex
      align="center"
      gap={4}
      className="w-[30%] min-w-[200px] overflow-hidden"
    >
      <Flex
        align="end"
        gap={1}
        className="gap-[3px] h-5 w-6 select-none flex-shrink-0"
      >
        <span
          className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
            isPlaying
              ? "animate-[bounce-bar_0.8s_ease_infinite_alternate] h-5"
              : "h-1"
          }`}
        />
        <span
          className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
            isPlaying
              ? "animate-[bounce-bar_0.5s_ease_infinite_alternate_0.15s] h-5"
              : "h-1"
          }`}
        />
        <span
          className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
            isPlaying
              ? "animate-[bounce-bar_0.7s_ease_infinite_alternate_0.3s] h-5"
              : "h-1"
          }`}
        />
        <span
          className={`w-[3px] bg-emerald-500 rounded-full transition-all duration-300 ${
            isPlaying
              ? "animate-[bounce-bar_0.6s_ease_infinite_alternate_0.05s] h-5"
              : "h-1"
          }`}
        />
      </Flex>
      <Flex direction="col" className="min-w-0 select-none">
        <Box className="overflow-hidden text-ellipsis whitespace-nowrap">
          <Text
            variant="body-sm"
            weight="semibold"
            color="default"
            truncate
            className="text-[var(--text-primary)]"
          >
            {track?.title || "No track playing"}
          </Text>
        </Box>
        <Text variant="caption" color="muted" truncate>
          {isLoading
            ? "Streaming from Go API..."
            : hasError
              ? "Error"
              : "YouTube Soundstream"}
        </Text>
      </Flex>
    </Flex>
  );
}
