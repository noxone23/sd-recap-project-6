import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

interface ArtPieceListProps {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
}

export default function ArtPieceList({
  artPieces,
  isFavorite,
  onToggleFavorite,
}: ArtPieceListProps) {
  return (
    <ul className="art-list">
      {artPieces.map((artPiece) => (
        <ArtPiecePreview
          key={artPiece.slug}
          artPiece={artPiece}
          isFavorite={isFavorite(artPiece.slug)}
          onToggleFavorite={() => onToggleFavorite(artPiece.slug)}
        />
      ))}
    </ul>
  );
}
