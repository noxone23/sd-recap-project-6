import { filterArtPieces } from "../filterArtPieces";
import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";

interface GalleryProps {
  artPieces: ArtPiece[];
  query: string;
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
}

export default function Gallery({
  artPieces,
  query,
  isFavorite,
  onToggleFavorite,
}: GalleryProps) {
  const filteredArtPieces = filterArtPieces(artPieces, query);

  if (filteredArtPieces.length === 0) {
    return <p role="status">No art pieces found</p>;
  }

  return (
    <ArtPieceList
      artPieces={filteredArtPieces}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    />
  );
}
