import { loadArtPiecesInfo, saveArtPiecesInfo } from "./artPieceInfoStorage";
import type { ArtPieceInfo } from "./types";

const artPiecesInfo: ArtPieceInfo[] = [
  {
    slug: "the-harvesters",
    isFavorite: true,
    comments: [{ text: "Beautiful colors", date: "2026-11-10T09:00:00.000Z" }],
  },
  { slug: "wheat-field-with-cypresses", isFavorite: false, comments: [] },
];

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("loadArtPiecesInfo", () => {
  it("returns an empty array without saved data", () => {
    expect(loadArtPiecesInfo()).toEqual([]);
  });

  it("returns the saved art pieces info", () => {
    localStorage.setItem("art-pieces-info", JSON.stringify(artPiecesInfo));

    expect(loadArtPiecesInfo()).toEqual(artPiecesInfo);
  });

  it("returns an empty array for invalid JSON", () => {
    localStorage.setItem("art-pieces-info", "{not json");

    expect(loadArtPiecesInfo()).toEqual([]);
  });

  it("returns an empty array when the saved value is not an array", () => {
    localStorage.setItem("art-pieces-info", JSON.stringify({ slug: "x" }));

    expect(loadArtPiecesInfo()).toEqual([]);
  });

  it("returns an empty array when the local storage cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });

    expect(loadArtPiecesInfo()).toEqual([]);
  });

  it("skips saved entries that are not valid art piece infos", () => {
    localStorage.setItem(
      "art-pieces-info",
      JSON.stringify([
        null,
        1,
        { slug: "no-flag", comments: [] },
        { slug: "no-comments", isFavorite: true },
        ...artPiecesInfo,
      ])
    );

    expect(loadArtPiecesInfo()).toEqual(artPiecesInfo);
  });
});

describe("saveArtPiecesInfo", () => {
  it("does not throw when the local storage cannot be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(() => saveArtPiecesInfo(artPiecesInfo)).not.toThrow();
  });

  it("saves the art pieces info as JSON in the local storage", () => {
    saveArtPiecesInfo(artPiecesInfo);

    expect(localStorage.getItem("art-pieces-info")).toBe(
      JSON.stringify(artPiecesInfo)
    );
  });
});
