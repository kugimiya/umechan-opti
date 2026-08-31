import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { MediaType } from "@umechan/shared";
import type { DbConnection } from "../db/connection";
import { syncLocalMedia } from "./syncLocalMedia";

describe("syncLocalMedia skipDownload", () => {
  const originalFetch = global.fetch;

  after(() => {
    global.fetch = originalFetch;
  });

  it("keeps media metadata but does not download files", async () => {
    let fetchCalls = 0;
    global.fetch = (async () => {
      fetchCalls += 1;
      return new Response(null, { status: 404 });
    }) as typeof fetch;

    const db = {
      media: {
        getByPostIds: async () => [],
      },
    } as unknown as DbConnection;

    const result = await syncLocalMedia(
      db,
      [
        {
          postId: 1,
          threadId: 10,
          mediaType: MediaType.Image,
          link: "https://example.com/private.jpg",
          preview: "https://example.com/private_preview.jpg",
          skipDownload: true,
        },
      ],
      [1],
    );

    assert.equal(fetchCalls, 0);
    assert.equal(result.length, 1);
    assert.equal(result[0].link, "https://example.com/private.jpg");
    assert.equal(result[0].preview, "https://example.com/private_preview.jpg");
    assert.equal(result[0].localPath, null);
    assert.equal(result[0].localPreviewPath, null);
  });
});
