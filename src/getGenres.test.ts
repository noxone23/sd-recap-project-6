import { getGenres } from "./getGenres";
import type { ArtPiece } from "./types";

function createArtPiece(slug: string, genre: string): ArtPiece {
  return {
    slug,
    name: slug,
    artist: "Artist",
    imageSource: `https://example.com/${slug}.jpg`,
    year: "1900",
    genre,
    colors: ["#37412E"],
  };
}

describe("getGenres", () => {
  it("returns every genre of the art pieces", () => {
    const artPieces = [
      createArtPiece("a", "Baroque"),
      createArtPiece("b", "Renaissance"),
    ];

    expect(getGenres(artPieces)).toEqual(["Baroque", "Renaissance"]);
  });

  it("returns every genre only once", () => {
    const artPieces = [
      createArtPiece("a", "Baroque"),
      createArtPiece("b", "Baroque"),
      createArtPiece("c", "Baroque"),
    ];

    expect(getGenres(artPieces)).toEqual(["Baroque"]);
  });

  it("sorts the genres alphabetically", () => {
    const artPieces = [
      createArtPiece("a", "Renaissance"),
      createArtPiece("b", "Baroque"),
      createArtPiece("c", "Post-Impressionism"),
    ];

    expect(getGenres(artPieces)).toEqual([
      "Baroque",
      "Post-Impressionism",
      "Renaissance",
    ]);
  });

  it("returns no genres for no art pieces", () => {
    expect(getGenres([])).toEqual([]);
  });
});
