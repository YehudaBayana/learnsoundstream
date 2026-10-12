"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getVideo, getVideoStreamUrl, type Video } from "@/features/videos/api/videos";

export default function VideoWatchView() {
  const params = useParams<{ id: string }>();
  const videoId = params?.id;
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <video
          key={video.id}
          controls
          playsInline
          preload="metadata"
          src={getVideoStreamUrl(video.id)}
          className="aspect-video w-full rounded-2xl bg-black"
        />
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
