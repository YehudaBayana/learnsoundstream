export interface PartUrl {
  part_number: number;
  url: string;
}

export interface UploadedPart {
  part_number: number;
  etag: string;
}

export interface PartUploadDeps {
  getPartUrl: (partNumber: number) => Promise<PartUrl>;
  /** Sends one slice to its presigned URL and resolves with the ETag R2 returned. */
  putPart: (
    url: string,
    blob: Blob,
    onProgress: (loadedBytes: number) => void,
    signal: AbortSignal,
  ) => Promise<string>;
}

export interface UploadPartsOptions {
  partSize: number;
  partCount: number;
  concurrency?: number;
  maxAttempts?: number;
  retryDelayMs?: number;
  signal?: AbortSignal;
  onProgress?: (loadedBytes: number) => void;
}

const DEFAULT_CONCURRENCY = 3;
const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_RETRY_DELAY_MS = 1000;

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function delay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Upload cancelled", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, milliseconds);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Upload cancelled", "AbortError"));
      },
      { once: true },
    );
  });
}

/**
 * Uploads every slice of the file with a few parts in flight at once.
 * Each attempt asks for a fresh presigned URL, so a retry after expiry still works.
 */
export async function uploadParts(
  file: Blob,
  deps: PartUploadDeps,
  options: UploadPartsOptions,
): Promise<UploadedPart[]> {
  const {
    partSize,
    partCount,
    concurrency = DEFAULT_CONCURRENCY,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    onProgress,
  } = options;

  // A failure in one worker stops the others instead of letting them upload on.
  const workerAbort = new AbortController();
  const stopOnOuterAbort = () => workerAbort.abort();
  options.signal?.addEventListener("abort", stopOnOuterAbort, { once: true });
  if (options.signal?.aborted) workerAbort.abort();

  const loadedByPart = new Map<number, number>();
  const reportProgress = (partNumber: number, loadedBytes: number) => {
    loadedByPart.set(partNumber, loadedBytes);
    let total = 0;
    loadedByPart.forEach((loaded) => (total += loaded));
    onProgress?.(total);
  };

  const uploaded: UploadedPart[] = [];
  let nextPart = 1;

  const uploadOnePart = async (partNumber: number): Promise<UploadedPart> => {
    const blob = file.slice((partNumber - 1) * partSize, partNumber * partSize);
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (workerAbort.signal.aborted) {
        throw new DOMException("Upload cancelled", "AbortError");
      }
      try {
        const { url } = await deps.getPartUrl(partNumber);
        const etag = await deps.putPart(
          url,
          blob,
          (loaded) => reportProgress(partNumber, loaded),
          workerAbort.signal,
        );
        reportProgress(partNumber, blob.size);
        return { part_number: partNumber, etag };
      } catch (error) {
        if (isAbortError(error)) throw error;
        lastError = error;
        reportProgress(partNumber, 0);
        if (attempt < maxAttempts - 1) {
          await delay(retryDelayMs * 2 ** attempt, workerAbort.signal);
        }
      }
    }
    throw lastError;
  };

  const worker = async () => {
    while (nextPart <= partCount) {
      const partNumber = nextPart++;
      uploaded.push(await uploadOnePart(partNumber));
    }
  };

  try {
    await Promise.all(
      Array.from({ length: Math.min(concurrency, partCount) }, () =>
        worker().catch((error) => {
          workerAbort.abort();
          throw error;
        }),
      ),
    );
  } finally {
    options.signal?.removeEventListener("abort", stopOnOuterAbort);
  }

  return uploaded.sort((a, b) => a.part_number - b.part_number);
}
