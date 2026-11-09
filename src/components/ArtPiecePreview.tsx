import { Link } from "react-router";

import type { ArtPiece } from "../types";

interface ArtPiecePreviewProps {
  artPiece: ArtPiece;
}

export default function ArtPiecePreview({ artPiece }: ArtPiecePreviewProps) {
  return (
    <li className="art-piece">
      <Link to={`/art-pieces/${artPiece.slug}`}>
        <img src={artPiece.imageSource} alt={artPiece.name} />
        <h2>{artPiece.name}</h2>
      </Link>
      <p>{artPiece.artist}</p>
    </li>
  );
}
