import type { ArtPiece } from "../types";

interface ArtPiecePreviewProps {
  artPiece: ArtPiece;
}

export default function ArtPiecePreview({ artPiece }: ArtPiecePreviewProps) {
  return (
    <li className="art-piece">
      <img src={artPiece.imageSource} alt={artPiece.name} />
      <h2>{artPiece.name}</h2>
      <p>{artPiece.artist}</p>
    </li>
  );
}
