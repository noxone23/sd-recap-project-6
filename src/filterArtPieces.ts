import type { ArtPiece } from "./types";

export function filterArtPieces(
  artPieces: ArtPiece[],
  query: string
): ArtPiece[] {
  const text = query.trim().toLowerCase();

  return artPieces.filter(
    ({ name, artist }) =>
      name.toLowerCase().includes(text) || artist.toLowerCase().includes(text)
  );
}
