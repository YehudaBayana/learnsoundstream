import type { ChangeEvent } from "react";
import Flex from "@/components/ui/layout/Flex";
import IconButton from "@/components/ui/IconButton";
import Slider from "@/components/ui/Slider";

interface AudioPlayerVolumeProps {
  hasTrack: boolean;
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  dataHook?: string;
}

export default function AudioPlayerVolume({
  hasTrack,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  dataHook,
}: AudioPlayerVolumeProps) {
  return (
    <Flex
      justify="end"
      align="center"
      gap={4}
      className="w-[30%] min-w-[150px]"
      dataHook={dataHook}
    >
      <Flex align="center" gap={2}>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onToggleMute}
          disabled={!hasTrack}
          aria-label={isMuted ? "Unmute" : "Mute"}
          dataHook={dataHook ? `${dataHook}-mute` : undefined}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
        >
          <span>
            {isMuted || volume === 0 ? "🔇" : volume < 0.4 ? "🔈" : volume < 0.7 ? "🔉" : "🔊"}
          </span>
        </IconButton>
        <Slider
          size="sm"
          color="secondary"
          min={0}
          max={1}
          step={0.05}
          value={isMuted ? 0 : volume}
          dataHook={dataHook ? `${dataHook}-volume` : undefined}
          onChange={onVolumeChange}
          disabled={!hasTrack}
          className="w-20"
        />
      </Flex>
    </Flex>
  );
}
