import type { ArtPiece } from "./types";

export function getGenres(artPieces: ArtPiece[]): string[] {
  return [...new Set(artPieces.map(({ genre }) => genre))].sort((a, b) =>
    a.localeCompare(b)
  );
}
