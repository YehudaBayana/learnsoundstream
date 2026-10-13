import {
  completeVideoUpload,
  deleteVideo,
  getUploadPartUrls,
  initVideoUpload,
  type Video,
} from "@/features/videos/api/videos";
import { uploadParts } from "@/features/videos/api/uploadParts";

export interface UploadVideoInput {
  file: File;
  title: string;
  notes: string;
  recordedAt?: string;
  signal?: AbortSignal;
  /** Fraction of bytes sent, between 0 and 1. */
  onProgress?: (fraction: number) => void;
}

// XMLHttpRequest is used because fetch cannot report upload progress.
function putPartWithXhr(
  url: string,
  blob: Blob,
  onProgress: (loadedBytes: number) => void,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.upload.onprogress = (event) => onProgress(event.loaded);
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Part upload failed with status ${request.status}`));
        return;
      }
      const etag = request.getResponseHeader("ETag");
      if (!etag) {
        reject(new Error("Storage did not return an ETag; check the bucket CORS rules."));
        return;
      }
      resolve(etag);
    };
    request.onerror = () => reject(new Error("Network error while uploading a part"));
    signal.addEventListener(
      "abort",
      () => {
        request.abort();
        reject(new DOMException("Upload cancelled", "AbortError"));
      },
      { once: true },
    );
    request.send(blob);
  });
}

/**
 * Uploads straight from the browser to storage with presigned multipart URLs;
 * the API only authorizes and records the upload. A cancelled or failed upload is deleted server-side.
 */
export async function uploadVideo(input: UploadVideoInput): Promise<Video> {
  const { file, signal } = input;
  const session = await initVideoUpload({
    filename: file.name,
    size_bytes: file.size,
    content_type: file.type,
    title: input.title,
    notes: input.notes,
    recorded_at: input.recordedAt || undefined,
  });
  if (!session) throw new Error("You need to sign in to upload videos.");
  const videoId = session.video.id;

  let parts;
  try {
    parts = await uploadParts(
      file,
      {
        getPartUrl: async (partNumber) => {
          const urls = await getUploadPartUrls(videoId, [partNumber]);
          if (!urls?.[0]) throw new Error("Could not get an upload URL.");
          return urls[0];
        },
        putPart: putPartWithXhr,
      },
      {
        partSize: session.part_size,
        partCount: session.part_count,
        signal,
        onProgress: (loadedBytes) => input.onProgress?.(loadedBytes / file.size),
      },
    );
  } catch (error) {
    // Best effort: the server also discards abandoned uploads after a day.
    await deleteVideo(videoId).catch(() => undefined);
    throw error;
  }

  // A failure here is not cleaned up: the server may already have completed the upload.
  const video = await completeVideoUpload(videoId, parts);
  if (!video) throw new Error("You need to sign in to upload videos.");
  return video;
}
