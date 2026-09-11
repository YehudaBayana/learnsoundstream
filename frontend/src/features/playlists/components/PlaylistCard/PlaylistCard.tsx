import Card from "@/components/ui/Card";
import { Playlist } from "@/types/global.types";
import Flex from "@/components/ui/layout/Flex";
import Image from "@/components/ui/Image";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

interface PlaylistCardProps {
  pl: Playlist;
  onClick: (playlist: Playlist) => void;
  className?: string;
}

export const PlaylistCard = ({ onClick, pl: playlist }: PlaylistCardProps) => {
  return (
    <Card
      key={playlist.id}
      clickable
      hoverable
      variant="default"
      onClick={() => onClick(playlist)}
      className="bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-emerald-500/50 transition-all duration-300 group flex flex-col h-full overflow-hidden"
    >
      <Card.Body
        padding="sm"
        className="flex flex-col h-full justify-between gap-3"
      >
        <Flex direction="col" gap={2}>
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
            {playlist.thumbnails.length > 0 ? (
              <Image
                src={playlist.thumbnails[0].url}
                alt={playlist.title}
                fit="cover"
                showSkeleton
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                className="w-full h-full text-2xl"
              >
                🎶
              </Flex>
            )}
            {playlist.playlist_count > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-white z-10">
                {playlist.playlist_count} videos
              </div>
            )}
          </div>

          <Heading
            level={4}
            size="sm"
            className="font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors mt-1"
          >
            {playlist.title}
          </Heading>
        </Flex>

        <Flex
          justify="between"
          align="center"
          className="pt-2 border-t border-[var(--border-subtle)]"
        >
          <Text
            variant="caption"
            color="muted"
            className="truncate max-w-[130px] text-[11px]"
          >
            {playlist.channel || playlist.uploader || "YouTube"}
          </Text>
          <Text
            variant="caption"
            className="text-emerald-400 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform"
          >
            View →
          </Text>
        </Flex>
      </Card.Body>
    </Card>
  );
};
