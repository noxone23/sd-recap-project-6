import { fetcher } from "./fetcher";
import type { ArtPiece } from "./types";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    name: "The Harvesters",
    artist: "Pieter Bruegel the Elder",
    imageSource: "https://example.com/the-harvesters.jpg",
    year: "1565",
    genre: "Renaissance",
    colors: ["#37412E", "#8D7332"],
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetcher", () => {
  it("returns the art pieces of a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
    );

    await expect(fetcher("/api/art")).resolves.toEqual(artPieces);
    expect(fetch).toHaveBeenCalledWith("/api/art");
  });

  it("throws an Error when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    await expect(fetcher("/api/art")).rejects.toThrow(Error);
  });
});
