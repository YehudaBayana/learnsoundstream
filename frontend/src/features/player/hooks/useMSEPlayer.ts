import { useEffect, useRef } from "react";
import { apiUrl } from "@/config/constants";

interface Segment {
  url: string;
  duration: number;
  start: number;
  end: number;
  fetched: boolean;
}

interface ParsedManifest {
  initUrl: string | null;
  segments: Segment[];
  codec: string;
}

export function useMSEPlayer(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  trackId: string | undefined,
) {
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const segmentsRef = useRef<Segment[]>([]);
  const isFetchingRef = useRef(false);
  const queueRef = useRef<ArrayBuffer[]>([]);
  const isAppendingRef = useRef(false);
  const initFetchedRef = useRef(false);

  useEffect(() => {
    if (!trackId || !audioRef.current) return;

    if (!window.MediaSource) {
      console.error("MediaSource API is not supported in this browser");
      return;
    }

    const audioEl = audioRef.current;
    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;
    audioEl.src = URL.createObjectURL(mediaSource);

    const checkBuffer = async (time: number, manifest: ParsedManifest) => {
      if (
        isFetchingRef.current ||
        !segmentsRef.current.length ||
        !sourceBufferRef.current
      )
        return;

      // Fetch init segment first
      if (manifest.initUrl && !initFetchedRef.current) {
        isFetchingRef.current = true;
        try {
          const res = await fetch(manifest.initUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = await res.arrayBuffer();
          queueRef.current.push(buf);
          initFetchedRef.current = true;
          processQueue();
        } catch (e) {
          console.error("Failed to fetch init segment", e);
        } finally {
          isFetchingRef.current = false;
        }
        if (!initFetchedRef.current) return; // Wait until init is fetched
      }

      // Find segments around 'time' that need fetching
      for (let i = 0; i < segmentsRef.current.length; i++) {
        const seg = segmentsRef.current[i];
        if (seg.end > time && seg.start <= time + 3000 && !seg.fetched) {
          isFetchingRef.current = true;
          seg.fetched = true;
          try {
            const res = await fetch(seg.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = await res.arrayBuffer();
            console.log("stringify buffer:", JSON.stringify(buf));
            console.log(
              `Buffer fetched : ${buf.byteLength} bytes for segment ${seg.url}`,
            );
            queueRef.current.push(buf);
            processQueue();
          } catch (e) {
            console.error("Failed to fetch segment", e);
            seg.fetched = false;
          } finally {
            isFetchingRef.current = false;
            if (audioEl) checkBuffer(audioEl.currentTime, manifest);
          }
          break;
        }
      }
    };

    const processQueue = () => {
      if (
        isAppendingRef.current ||
        queueRef.current.length === 0 ||
        !sourceBufferRef.current ||
        mediaSourceRef.current?.readyState !== "open"
      )
        return;
      isAppendingRef.current = true;
      const buf = queueRef.current.shift();
      if (buf) {
        try {
          sourceBufferRef.current.appendBuffer(buf);
        } catch (e) {
          console.error("Append error", e);
          isAppendingRef.current = false;
        }
      }
    };

    let manifestData: ParsedManifest | null = null;

    const onSourceOpen = async () => {
      try {
        const manifestUrl = `${apiUrl}/api/stream/manifest?v=${trackId}`;
        const res = await fetch(manifestUrl);
        console.log("Manifest response:", res);
        if (!res.ok) throw new Error(`Failed to fetch manifest: ${res.status}`);
        const text = await res.text();
        console.log("Manifest text:", text);

        manifestData = parseM3U8(text);
        console.log("Parsed manifest:", manifestData);
        segmentsRef.current = manifestData.segments;

        const sourceBuffer = mediaSource.addSourceBuffer(manifestData.codec);
        sourceBufferRef.current = sourceBuffer;

        sourceBuffer.addEventListener("updateend", () => {
          isAppendingRef.current = false;
          processQueue();
        });

        checkBuffer(0, manifestData);
      } catch (e) {
        console.error("MSE setup error:", e);
      }
    };

    mediaSource.addEventListener("sourceopen", onSourceOpen);

    const onTimeUpdate = () => {
      if (audioEl && manifestData)
        checkBuffer(audioEl.currentTime, manifestData);
    };

    const onSeeking = () => {
      if (audioEl && manifestData) {
        checkBuffer(audioEl.currentTime, manifestData);
      }
    };

    audioEl.addEventListener("timeupdate", onTimeUpdate);
    audioEl.addEventListener("seeking", onSeeking);

    return () => {
      if (audioEl) {
        audioEl.removeEventListener("timeupdate", onTimeUpdate);
        audioEl.removeEventListener("seeking", onSeeking);
      }
      mediaSource.removeEventListener("sourceopen", onSourceOpen);
      if (mediaSource.readyState === "open") {
        try {
          mediaSource.endOfStream();
        } catch (e) {}
      }
      segmentsRef.current = [];
      queueRef.current = [];
      isFetchingRef.current = false;
      isAppendingRef.current = false;
      initFetchedRef.current = false;
    };
  }, [trackId, audioRef]);
}

function parseM3U8(text: string): ParsedManifest {
  const lines = text.split("\n");
  const segments: Segment[] = [];
  let initUrl: string | null = null;
  let currentDuration = 0;
  let currentTime = 0;
  const codec = 'audio/mp4; codecs="mp4a.40.2"';

  for (const line of lines) {
    if (line.startsWith("#EXT-X-MAP:URI=")) {
      const parts = line.split('"');
      if (parts.length >= 2) {
        initUrl = parts[1];
      }
    } else if (line.startsWith("#EXTINF:")) {
      const val = line.split(":")[1].split(",")[0];
      currentDuration = parseFloat(val);
    } else if (line.trim() && !line.startsWith("#")) {
      const url = line.trim();
      segments.push({
        url,
        duration: currentDuration,
        start: currentTime,
        end: currentTime + currentDuration,
        fetched: false,
      });
      currentTime += currentDuration;
    }
  }

  return { initUrl, segments, codec };
}
