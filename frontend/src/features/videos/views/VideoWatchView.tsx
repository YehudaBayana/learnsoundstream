"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getVideo, type Video } from "@/features/videos/api/videos";
import { usePlaybackUrl } from "@/features/videos/query/useVideos";

const MAX_PLAYBACK_RECOVERIES = 3;

export default function VideoWatchView() {
  const params = useParams<{ id: string }>();
  const videoId = params?.id;
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const resumeRef = useRef<{ time: number; paused: boolean } | null>(null);
  const recoveriesRef = useRef(0);
  const { data: playback, refetch: refetchPlayback } = usePlaybackUrl(
    videoId ?? "",
    Boolean(videoId) && video?.status === "ready",
  );

  // An expired signed URL makes the player fail on the next range request: fetch a new one and resume.
  const handlePlaybackError = () => {
    const element = videoElementRef.current;
    if (!element || recoveriesRef.current >= MAX_PLAYBACK_RECOVERIES) return;
    recoveriesRef.current += 1;
    resumeRef.current = { time: element.currentTime, paused: element.paused };
    void refetchPlayback();
  };

  const handleLoadedMetadata = () => {
    recoveriesRef.current = 0;
    const element = videoElementRef.current;
    const resume = resumeRef.current;
    if (!element || !resume) return;
    resumeRef.current = null;
    element.currentTime = resume.time;
    if (!resume.paused) void element.play().catch(() => undefined);
  };

  useEffect(() => {
    if (!videoId) {
      return;
    }

    let isMounted = true;

    getVideo(videoId)
      .then((data) => {
        if (!isMounted) return;
        setVideo(data);
        setError(null);
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load video.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-red-400">Missing video id.</p>
        <Link href="/videos" className="mt-4 inline-block text-sm text-emerald-400">
          ← Back to library
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-[var(--text-secondary)]">
        Loading video…
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-red-400">{error ?? "Video not found."}</p>
        <Link href="/videos" className="mt-4 inline-block text-sm text-emerald-400">
          ← Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/videos" className="text-sm text-emerald-400">
          ← Back to library
        </Link>
        <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
          {video.status}
        </span>
      </div>

      <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-sm">
        {playback ? (
          <video
            key={video.id}
            ref={videoElementRef}
            controls
            playsInline
            preload="metadata"
            src={playback.url}
            onError={handlePlaybackError}
            onLoadedMetadata={handleLoadedMetadata}
            className="aspect-video w-full rounded-2xl bg-black"
          />
        ) : (
          <p className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black px-6 text-center text-sm text-[var(--text-secondary)]">
            {video.status === "ready" && "Loading video…"}
            {video.status === "uploading" && "This video is still uploading."}
            {video.status === "processing" && "This video is being prepared for playback."}
            {video.status === "failed" &&
              `Processing failed${video.failure_reason ? `: ${video.failure_reason}` : "."}`}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {video.title || video.original_name}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {video.recorded_at
            ? new Date(video.recorded_at).toLocaleDateString()
            : "Recorded date unavailable"}
        </p>

        {video.notes ? (
          <p className="mt-5 whitespace-pre-wrap text-[var(--text-primary)]">{video.notes}</p>
        ) : (
          <p className="mt-5 text-sm text-[var(--text-secondary)]">
            No notes recorded for this video.
          </p>
        )}
      </div>
    </div>
  );
}
