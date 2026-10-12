"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useCreateVideo, useVideos } from "@/features/videos/query/useVideos";

export default function VideoLibraryView({
  dataHook = "video-library-view",
}: {
  dataHook?: string;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: videos = [], isLoading, isError, error: listError } = useVideos();
  const createVideoMutation = useCreateVideo();

  const stats = useMemo(() => {
    const total = videos.length;
    const processing = videos.filter((video) => video.status === "processing").length;
    return { total, processing };
  }, [videos]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    if (event.target.files?.[0]) {
      setTitle((current) => current || event.target.files![0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Select a video file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (notes) formData.append("notes", notes);

    setError(null);
    try {
      await createVideoMutation.mutateAsync(formData);
      setTitle("");
      setNotes("");
      setFile(null);
      const input = document.getElementById("video-upload-input") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Upload failed.");
    }
  };

  return (
    <div data-hook={dataHook} className="mx-auto max-w-5xl px-6 py-8">
      <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-sm">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Private archive
            </p>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Your dance videos</h2>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] md:col-span-2">
              Video file
              <input
                id="video-upload-input"
                type="file"
                accept="video/*,.mp4,.mov,.avi,.webm,.mkv,.m4v"
                onChange={handleFileChange}
                className="mt-2 block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Sunrise drill"
                className="mt-2 block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Recorded date
              <input
                type="date"
                className="mt-2 block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--text-primary)] md:col-span-2">
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="What improved today?"
                className="mt-2 block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)]"
              />
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--text-secondary)]">
              {file ? `Selected: ${file.name}` : "No file selected"}
            </span>
            <button
              type="submit"
              disabled={!file || createVideoMutation.isPending}
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createVideoMutation.isPending ? "Uploading..." : "Upload video"}
            </button>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5">
            <p className="text-sm text-[var(--text-secondary)]">Sessions</p>
            <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5">
            <p className="text-sm text-[var(--text-secondary)]">Processing</p>
            <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">{stats.processing}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5">
            <p className="text-sm text-[var(--text-secondary)]">Ready</p>
            <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
              {videos.filter((video) => video.status === "ready").length}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
          {isLoading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading videos...</p>
          ) : isError ? (
            <p className="text-sm text-red-400">
              {listError instanceof Error ? listError.message : "Unable to load videos."}
            </p>
          ) : videos.length === 0 ? (
            <div className="text-center">
              <div className="mb-4 text-5xl">🎥</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                No videos uploaded yet
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Add your first clip to start building a private progress journal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4 transition hover:border-emerald-500/80"
                >
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {video.title || video.original_name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">Status: {video.status}</p>
                  </div>
                  <span className="rounded-full bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                    {video.size_bytes
                      ? `${(video.size_bytes / (1024 * 1024)).toFixed(1)} MB`
                      : "New"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
