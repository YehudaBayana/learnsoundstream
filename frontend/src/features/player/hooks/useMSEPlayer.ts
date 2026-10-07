import { useEffect } from "react";
import { apiUrl } from "@/config/constants";

export function useMSEPlayer(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  trackId: string | undefined,
) {
  useEffect(() => {
    if (!trackId || !audioRef.current) return;

    const audioEl = audioRef.current;
    audioEl.crossOrigin = "use-credentials";
    // We now stream the audio directly using HTTP Range requests
    // instead of HLS. This allows instant playback and seeking anywhere.
    const streamUrl = `${apiUrl}/api/stream/manifest?v=${encodeURIComponent(trackId)}`;

    audioEl.src = streamUrl;
    audioEl.load();

    return () => {
      audioEl.removeAttribute("src");
      audioEl.load();
    };
  }, [trackId, audioRef]);
}
