import type { ArtPiece } from "./types";

export function filterArtPieces(
  artPieces: ArtPiece[],
  query: string,
  genre = ""
): ArtPiece[] {
  const text = query.trim().toLowerCase();

  return artPieces.filter(
    (artPiece) =>
      (genre === "" || artPiece.genre === genre) &&
      (artPiece.name.toLowerCase().includes(text) ||
        artPiece.artist.toLowerCase().includes(text))
  );
}
