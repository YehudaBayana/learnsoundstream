import { useEffect } from "react";
import Hls from "hls.js";
import { apiUrl } from "@/config/constants";

export function useMSEPlayer(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  trackId: string | undefined,
) {
  useEffect(() => {
    if (!trackId || !audioRef.current) return;

    const audioEl = audioRef.current;
    const manifestUrl = `${apiUrl}/api/stream/manifest?v=${encodeURIComponent(trackId)}`;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls?.loadSource(manifestUrl));
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        console.error("Fatal HLS playback error:", data);
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls?.recoverMediaError();
        } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls?.startLoad();
        } else {
          hls?.destroy();
        }
      });
      hls.attachMedia(audioEl);
    } else if (audioEl.canPlayType("application/vnd.apple.mpegurl")) {
      audioEl.src = manifestUrl;
    } else {
      console.error("HLS playback is not supported in this browser");
      return;
    }

    return () => {
      hls?.destroy();
      audioEl.removeAttribute("src");
      audioEl.load();
    };
  }, [trackId, audioRef]);
}
