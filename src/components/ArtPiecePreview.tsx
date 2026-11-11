import { Link, useLocation } from "react-router";

import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";

interface ArtPiecePreviewProps {
  artPiece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function ArtPiecePreview({
  artPiece,
  isFavorite,
  onToggleFavorite,
}: ArtPiecePreviewProps) {
  const { pathname, search } = useLocation();

  return (
    <li className="art-piece">
      <Link
        to={`/art-pieces/${artPiece.slug}`}
        state={{ from: pathname + search }}
      >
        <img src={artPiece.imageSource} alt={artPiece.name} />
        <h2>{artPiece.name}</h2>
      </Link>
      <p>{artPiece.artist}</p>
      <FavoriteButton
        name={artPiece.name}
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
      />
    </li>
  );
}
