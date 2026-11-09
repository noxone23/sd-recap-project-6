import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

interface ArtPieceListProps {
  artPieces: ArtPiece[];
}

export default function ArtPieceList({ artPieces }: ArtPieceListProps) {
  return (
    <ul className="art-list">
      {artPieces.map((artPiece) => (
        <ArtPiecePreview key={artPiece.slug} artPiece={artPiece} />
      ))}
    </ul>
  );
}
