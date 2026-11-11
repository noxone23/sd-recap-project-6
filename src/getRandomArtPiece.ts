import type { ArtPiece } from "./types";

export function getRandomArtPiece(
  artPieces: ArtPiece[],
  exclude?: ArtPiece
): ArtPiece {
  const others = artPieces.filter((artPiece) => artPiece !== exclude);
  const candidates = others.length > 0 ? others : artPieces;
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return candidates[Math.floor((value / 2 ** 32) * candidates.length)];
}
