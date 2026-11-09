import { getRandomArtPiece } from "./getRandomArtPiece";
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
  {
    slug: "the-night-watch",
    name: "The Night Watch",
    artist: "Rembrandt van Rijn",
    imageSource: "https://example.com/the-night-watch.jpg",
    year: "1642",
    genre: "Baroque",
    colors: ["#37412E", "#8D7332"],
  },
];

function mockRandom(fraction: number) {
  return vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = Math.floor(fraction * 2 ** 32);
    return array;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getRandomArtPiece", () => {
  it("returns the first art piece when the random value is 0", () => {
    mockRandom(0);

    expect(getRandomArtPiece(artPieces)).toBe(artPieces[0]);
  });

  it("returns the middle art piece when the random value is 0.5", () => {
    mockRandom(0.5);

    expect(getRandomArtPiece(artPieces)).toBe(artPieces[1]);
  });

  it("returns the last art piece when the random value is 0.999", () => {
    mockRandom(0.999);

    expect(getRandomArtPiece(artPieces)).toBe(artPieces[2]);
  });

  it("always returns the only art piece of a list with one element", () => {
    mockRandom(0.999);

    expect(getRandomArtPiece([artPieces[0]])).toBe(artPieces[0]);
  });
});
