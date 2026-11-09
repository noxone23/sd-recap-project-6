import type { ArtPiece } from "./types";

export function getRandomArtPiece(artPieces: ArtPiece[]): ArtPiece {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return artPieces[Math.floor((value / 2 ** 32) * artPieces.length)];
}
