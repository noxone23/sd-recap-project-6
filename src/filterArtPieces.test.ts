import { filterArtPieces } from "./filterArtPieces";
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
  {
    slug: "wheat-field-with-cypresses",
    name: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    imageSource: "https://example.com/wheat-field-with-cypresses.jpg",
    year: "1889",
    genre: "Post-Impressionism",
    colors: ["#37412E", "#8D7332"],
  },
];

describe("filterArtPieces", () => {
  it("keeps the art pieces whose title contains the text", () => {
    expect(filterArtPieces(artPieces, "wheat")).toEqual([artPieces[1]]);
  });

  it("keeps the art pieces whose artist contains the text", () => {
    expect(filterArtPieces(artPieces, "bruegel")).toEqual([artPieces[0]]);
  });

  it("returns no art pieces when nothing matches", () => {
    expect(filterArtPieces(artPieces, "monet")).toEqual([]);
  });

  it("ignores upper and lower case", () => {
    expect(filterArtPieces(artPieces, "VAN GOGH")).toEqual([artPieces[1]]);
  });

  it("ignores spaces at the start and the end of the text", () => {
    expect(filterArtPieces(artPieces, "  van gogh  ")).toEqual([artPieces[1]]);
  });

  it.each([
    ["empty", ""],
    ["only spaces", "   "],
  ])("returns all art pieces when the text is %s", (_description, query) => {
    expect(filterArtPieces(artPieces, query)).toEqual(artPieces);
  });
});
