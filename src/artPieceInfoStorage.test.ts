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
});

describe("saveArtPiecesInfo", () => {
  it("saves the art pieces info as JSON in the local storage", () => {
    saveArtPiecesInfo(artPiecesInfo);

    expect(localStorage.getItem("art-pieces-info")).toBe(
      JSON.stringify(artPiecesInfo)
    );
  });
});
