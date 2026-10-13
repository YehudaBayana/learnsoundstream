import { uploadParts, type PartUploadDeps } from "@/features/videos/api/uploadParts";

const PART_SIZE = 4;

// jsdom's Blob has no text().
function readText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function makeDeps(putPart: PartUploadDeps["putPart"]): PartUploadDeps {
  return {
    getPartUrl: async (partNumber) => ({ part_number: partNumber, url: `https://r2.test/part/${partNumber}` }),
    putPart,
  };
}

describe("uploadParts", () => {
  it("slices the file by part size and returns ETags ordered by part number", async () => {
    const received: Record<string, string> = {};
    const deps = makeDeps(async (url, blob) => {
      received[url] = await readText(blob);
      return `"etag-${url.split("/").pop()}"`;
    });

    const parts = await uploadParts(new Blob(["aaaabbbbcc"]), deps, {
      partSize: PART_SIZE,
      partCount: 3,
      retryDelayMs: 0,
    });

    expect(received).toEqual({
      "https://r2.test/part/1": "aaaa",
      "https://r2.test/part/2": "bbbb",
      "https://r2.test/part/3": "cc",
    });
    expect(parts).toEqual([
      { part_number: 1, etag: '"etag-1"' },
      { part_number: 2, etag: '"etag-2"' },
      { part_number: 3, etag: '"etag-3"' },
    ]);
  });

  it("retries a failed part with a fresh URL", async () => {
    let attempts = 0;
    const getPartUrl = jest.fn(async (partNumber: number) => ({ part_number: partNumber, url: "https://r2.test/part/1" }));
    const deps: PartUploadDeps = {
      getPartUrl,
      putPart: async () => {
        attempts += 1;
        if (attempts < 3) throw new Error("network");
        return '"etag"';
      },
    };

    const parts = await uploadParts(new Blob(["aaaa"]), deps, { partSize: PART_SIZE, partCount: 1, retryDelayMs: 0 });

    expect(parts).toEqual([{ part_number: 1, etag: '"etag"' }]);
    expect(getPartUrl).toHaveBeenCalledTimes(3);
  });

  it("gives up after the maximum attempts", async () => {
    const deps = makeDeps(async () => {
      throw new Error("storage down");
    });

    await expect(
      uploadParts(new Blob(["aaaa"]), deps, { partSize: PART_SIZE, partCount: 1, maxAttempts: 2, retryDelayMs: 0 }),
    ).rejects.toThrow("storage down");
  });

  it("stops without retrying when cancelled", async () => {
    const controller = new AbortController();
    const putPart = jest.fn(async () => {
      controller.abort();
      throw new DOMException("Upload cancelled", "AbortError");
    });

    await expect(
      uploadParts(new Blob(["aaaabbbb"]), makeDeps(putPart), {
        partSize: PART_SIZE,
        partCount: 2,
        concurrency: 1,
        retryDelayMs: 0,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(putPart).toHaveBeenCalledTimes(1);
  });

  it("reports the total number of bytes sent", async () => {
    const progress: number[] = [];
    const deps = makeDeps(async (_url, blob, onProgress) => {
      onProgress(blob.size);
      return '"etag"';
    });

    await uploadParts(new Blob(["aaaabbbb"]), deps, {
      partSize: PART_SIZE,
      partCount: 2,
      concurrency: 1,
      retryDelayMs: 0,
      onProgress: (loaded) => progress.push(loaded),
    });

    expect(progress[progress.length - 1]).toBe(8);
  });
});
