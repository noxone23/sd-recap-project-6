import { getPageTitle } from "./getPageTitle";
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

describe("getPageTitle", () => {
  it.each([
    ["/", "Art Gallery"],
    ["/art-pieces", "Gallery – Art Gallery"],
    ["/art-pieces/", "Gallery – Art Gallery"],
    ["/favorites", "Favorites – Art Gallery"],
    ["/art-pieces/the-harvesters", "The Harvesters – Art Gallery"],
    ["/art-pieces/unknown", "Art piece not found – Art Gallery"],
    ["/does-not-exist", "Page not found – Art Gallery"],
  ])("returns the title for %s", (pathname, title) => {
    expect(getPageTitle(pathname, artPieces)).toBe(title);
  });
});
